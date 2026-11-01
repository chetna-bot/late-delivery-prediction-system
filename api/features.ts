const DEFAULT_ML_API_URL = 'https://renewable-ultra-underfed.ngrok-free.dev';

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
    const timeout = setTimeout(() => controller.abort(), 15000);

    const backendRes = await fetch(`${targetUrl}/features`, {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const text = await backendRes.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text.slice(0, 500) };
    }

    if (!backendRes.ok) {
      res.status(backendRes.status).json({
        error: `FastAPI /features returned HTTP ${backendRes.status}`,
        details: data,
        targetUrl,
      });
      return;
    }

    res.status(200).json(data);
  } catch (err: any) {
    const isTimeout = err.name === 'AbortError';
    res.status(502).json({
      error: isTimeout
        ? 'Timeout while connecting to FastAPI /features. Verify Colab notebook is active.'
        : `Could not connect to FastAPI /features: ${err.message}`,
      targetUrl,
    });
  }
}
