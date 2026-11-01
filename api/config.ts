const DEFAULT_ML_API_URL = 'https://renewable-ultra-underfed.ngrok-free.dev';

let activeUrlOverride = '';

function getTargetUrl(req: any): string {
  const fromHeader = req?.headers?.['x-ml-api-url'];
  if (typeof fromHeader === 'string' && fromHeader.trim()) {
    return cleanUrl(fromHeader);
  }
  if (activeUrlOverride) {
    return activeUrlOverride;
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

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { mlApiUrl } = body;
    if (typeof mlApiUrl === 'string' && mlApiUrl.trim()) {
      activeUrlOverride = cleanUrl(mlApiUrl);
    }
    const current = getTargetUrl(req);
    res.status(200).json({
      success: true,
      mlApiUrl: current,
      isConfigured: true,
    });
    return;
  }

  // GET
  const current = getTargetUrl(req);
  res.status(200).json({
    mlApiUrl: current,
    hasEnvUrl: Boolean(process.env.ML_API_URL && process.env.ML_API_URL.trim()),
    isConfigured: true,
  });
}
