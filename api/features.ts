const DEFAULT_ML_API_URL = 'https://renewable-ultra-underfed.ngrok-free.dev';

const VERIFIED_MODEL_FEATURES = {
  features: [
    'Type', 'Days for shipment (scheduled)', 'Sales per customer',
    'Category Name', 'Customer City', 'Customer Country',
    'Customer Segment', 'Customer State', 'Department Name',
    'Latitude', 'Longitude', 'Market', 'Order City', 'Order Country',
    'Order Item Discount', 'Order Item Discount Rate',
    'Order Item Product Price', 'Order Item Quantity', 'Sales',
    'Order Item Total', 'Order Region', 'Order State', 'Order Status',
    'Product Name', 'Product Price', 'Product Status', 'Shipping Mode'
  ],
  numeric_features: [
    'Days for shipment (scheduled)', 'Sales per customer', 'Latitude',
    'Longitude', 'Order Item Discount', 'Order Item Discount Rate',
    'Order Item Product Price', 'Order Item Quantity', 'Sales',
    'Order Item Total', 'Product Price', 'Product Status'
  ],
  categorical_features: [
    'Type', 'Category Name', 'Customer City', 'Customer Country',
    'Customer Segment', 'Customer State', 'Department Name', 'Market',
    'Order City', 'Order Country', 'Order Region', 'Order State',
    'Order Status', 'Product Name', 'Shipping Mode'
  ],
  categorical_options: {
    'Type': ['PAYMENT', 'TRANSFER', 'DEBIT', 'CASH'],
    'Shipping Mode': ['Standard Class', 'First Class', 'Second Class', 'Same Day'],
    'Customer Segment': ['Consumer', 'Corporate', 'Home Office'],
    'Order Status': ['COMPLETE', 'PENDING', 'PROCESSING', 'CLOSED', 'ON_HOLD', 'CANCELED'],
    'Market': ['Pacific Asia', 'USCA', 'Africa', 'Europe', 'LATAM']
  }
};

function getTargetUrl(req: any): string {
  const fromHeader = req?.headers?.['x-ml-api-url'];
  if (typeof fromHeader === 'string' && fromHeader.trim()) {
    return cleanUrl(fromHeader);
  }
  const fromEnv = process.env.ML_API_URL;
  if (typeof fromEnv === 'string' && fromEnv.trim()) {
    return cleanUrl(fromEnv);
  }
  return DEFAULT_ML_API_URL;
}

function cleanUrl(url: string): string {
  let cleaned = (url || '').trim();
  if (!cleaned) return DEFAULT_ML_API_URL;
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = 'https://' + cleaned;
  }
  return cleaned.replace(/\/+$/, '');
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const targetUrl = getTargetUrl(req);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const backendRes = await fetch(`${targetUrl}/features`, {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (backendRes.ok) {
      const text = await backendRes.text();
      try {
        const liveData = JSON.parse(text);
        if (liveData && (liveData.features || liveData.numeric_features || Array.isArray(liveData))) {
          res.status(200).json({
            ...liveData,
            targetUrl,
            isLive: true,
          });
          return;
        }
      } catch {
        // Fall back to verified features
      }
    }
  } catch {
    // If connection failed, timed out, or Colab is sleeping
  }

  // Always return the verified 27 model features so the form NEVER breaks
  res.status(200).json({
    ...VERIFIED_MODEL_FEATURES,
    targetUrl,
    isCached: true,
    note: 'Permanently connected to model feature schema. Colab backend will execute predictions when live.',
  });
}
