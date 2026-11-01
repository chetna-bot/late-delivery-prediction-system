import { handleCors } from './_utils';

export default async function handler(req: any, res: any) {
  if (handleCors(req, res)) return;

  res.setHeader('Content-Type', 'application/json');
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
