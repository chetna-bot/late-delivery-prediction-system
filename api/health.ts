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
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const backendRes = await fetch(`${targetUrl}/`, {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'Accept': 'application/json',
        'User-Agent': 'LateDeliveryApp/1.0',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const latencyMs = Date.now() - startTime;
    const text = await backendRes.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text.slice(0, 500) };
    }

    if (backendRes.ok) {
      res.status(200).json({
        ok: true,
        status: backendRes.status,
        statusText: backendRes.statusText,
        data,
        targetUrl,
        latencyMs,
      });
    } else {
      res.status(backendRes.status).json({
        ok: false,
        status: backendRes.status,
        statusText: backendRes.statusText,
        data,
        targetUrl,
        latencyMs,
        error: `FastAPI responded with HTTP ${backendRes.status}`,
      });
    }
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    const isTimeout = err.name === 'AbortError';
    res.status(502).json({
      ok: false,
      error: isTimeout
        ? 'Connection timed out after 12s. Check if your Colab notebook is active.'
        : (err.message || 'Failed to reach FastAPI backend'),
      targetUrl,
      latencyMs,
    });
  }
}
