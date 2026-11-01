import { getTargetUrl, handleCors, parseBackendResponse } from './_utils';

export default async function handler(req: any, res: any) {
  if (handleCors(req, res)) return;

  res.setHeader('Content-Type', 'application/json');

  const targetUrl = getTargetUrl(req);
  if (!targetUrl) {
    res.status(400).json({
      error: 'ML_API_URL is not configured yet. Please configure ML_API_URL in Vercel Project Settings or enter your Colab ngrok URL in Connection Settings.',
      code: 'NO_URL_CONFIGURED',
    });
    return;
  }

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
    const { data, cleanError } = parseBackendResponse(text, backendRes.status);

    if (!backendRes.ok) {
      res.status(backendRes.status).json({
        error: cleanError || `Backend error (HTTP ${backendRes.status}) while fetching /features`,
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
