import { getTargetUrl, handleCors, parseBackendResponse } from './_utils';

export default async function handler(req: any, res: any) {
  if (handleCors(req, res)) return;

  res.setHeader('Content-Type', 'application/json');

  const targetUrl = getTargetUrl(req);
  if (!targetUrl) {
    res.status(400).json({
      ok: false,
      error: 'ML_API_URL is not configured yet. Please configure ML_API_URL in Vercel Project Settings or enter your Colab ngrok URL in Connection Settings.',
      code: 'NO_URL_CONFIGURED',
    });
    return;
  }

  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const backendRes = await fetch(`${targetUrl}/`, {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'Accept': 'application/json',
        'User-Agent': 'LateDeliveryPredictionApp/1.0',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const latencyMs = Date.now() - startTime;
    const text = await backendRes.text();
    const { data, cleanError } = parseBackendResponse(text, backendRes.status);

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
        error: cleanError || `FastAPI backend responded with HTTP ${backendRes.status}`,
      });
    }
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    const isTimeout = err.name === 'AbortError';
    res.status(502).json({
      ok: false,
      error: isTimeout
        ? 'Connection timed out after 12s. Check if your Google Colab notebook is still running and ngrok tunnel is alive.'
        : (err.message || 'Failed to reach FastAPI backend'),
      code: isTimeout ? 'TIMEOUT' : 'FETCH_ERROR',
      targetUrl,
      latencyMs,
    });
  }
}
