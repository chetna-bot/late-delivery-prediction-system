import { getTargetUrl, setInMemoryUrl, handleCors } from './_utils';

export default async function handler(req: any, res: any) {
  if (handleCors(req, res)) return;

  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { mlApiUrl } = body;
    if (typeof mlApiUrl !== 'string') {
      res.status(400).json({ error: 'mlApiUrl must be a string' });
      return;
    }
    setInMemoryUrl(mlApiUrl);
    res.status(200).json({
      success: true,
      mlApiUrl: getTargetUrl(req),
      isConfigured: Boolean(getTargetUrl(req)),
    });
    return;
  }

  // GET
  const activeUrl = getTargetUrl(req);
  res.status(200).json({
    mlApiUrl: activeUrl,
    hasEnvUrl: Boolean(process.env.ML_API_URL && process.env.ML_API_URL.trim()),
    isConfigured: Boolean(activeUrl),
  });
}
