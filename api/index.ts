export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  res.status(200).json({
    status: 'online',
    message: 'Late Delivery Prediction System API Gateway is active.',
    endpoints: [
      'GET /api/health',
      'GET /api/features',
      'POST /api/predict',
      'GET /api/config',
      'POST /api/config',
      'GET /api/colab-template'
    ]
  });
}
