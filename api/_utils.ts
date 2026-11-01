import dotenv from 'dotenv';

dotenv.config();

let inMemoryMlApiUrl: string = (process.env.ML_API_URL || '').trim();

export function getNormalizedUrl(url: string): string {
  let cleaned = (url || '').trim();
  if (!cleaned) return '';
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = 'https://' + cleaned;
  }
  return cleaned.replace(/\/+$/, '');
}

export function setInMemoryUrl(url: string) {
  inMemoryMlApiUrl = getNormalizedUrl(url);
}

export function getTargetUrl(req: any): string {
  // 1. Check custom header sent from frontend (stored in localStorage)
  const headerUrl = req?.headers?.['x-ml-api-url'];
  if (typeof headerUrl === 'string' && headerUrl.trim()) {
    return getNormalizedUrl(headerUrl);
  }

  // 2. Check query param ?mlApiUrl=... if applicable
  const queryUrl = req?.query?.mlApiUrl;
  if (typeof queryUrl === 'string' && queryUrl.trim()) {
    return getNormalizedUrl(queryUrl);
  }

  // 3. Check in-memory URL
  if (inMemoryMlApiUrl) {
    return inMemoryMlApiUrl;
  }

  // 4. Check server-side environment variable ML_API_URL
  const envUrl = process.env.ML_API_URL || '';
  if (envUrl.trim()) {
    return getNormalizedUrl(envUrl);
  }

  return '';
}

export function handleCors(req: any, res: any): boolean {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-ml-api-url, Authorization, ngrok-skip-browser-warning');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

export function parseBackendResponse(text: string, status: number): { data: any; cleanError?: string } {
  try {
    const json = JSON.parse(text);
    return { data: json };
  } catch {
    if (text.includes('ERR_NGROK_8012') || text.includes('connect: connection refused')) {
      return {
        data: {
          code: 'ERR_NGROK_8012',
          summary: 'FastAPI not listening on port 8000 in Colab',
        },
        cleanError:
          'Ngrok tunnel is online, but your FastAPI application (uvicorn) is not currently running on port 8000 inside Google Colab (ERR_NGROK_8012: Connection Refused). Please execute the cell starting uvicorn in your Colab notebook: uvicorn.run(app, host="0.0.0.0", port=8000)',
      };
    }
    if (text.includes('ERR_NGROK_3200') || text.includes('endpoint offline')) {
      return {
        data: {
          code: 'ERR_NGROK_3200',
          summary: 'Ngrok tunnel offline',
        },
        cleanError:
          'Ngrok tunnel is offline (ERR_NGROK_3200). The Colab runtime may have stopped. Please re-run the ngrok tunnel cell in Colab to obtain a new URL.',
      };
    }

    const clean = text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      data: { rawText: clean.slice(0, 500) },
      cleanError: clean ? clean.slice(0, 300) : `Upstream returned non-JSON HTTP ${status}`,
    };
  }
}
