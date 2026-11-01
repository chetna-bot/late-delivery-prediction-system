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
    const timeout = setTimeout(() => controller.abort(), 20000);

    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};

    const backendRes = await fetch(`${targetUrl}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const text = await backendRes.text();
    const { data, cleanError } = parseBackendResponse(text, backendRes.status);

    if (!backendRes.ok) {
      res.status(backendRes.status).json({
        error: cleanError || `ML Backend returned HTTP ${backendRes.status}`,
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
        ? 'Inference request timed out after 20s. Check your Colab GPU/CPU execution.'
        : `Failed to connect to FastAPI /predict: ${err.message}`,
      targetUrl,
    });
  }
}
