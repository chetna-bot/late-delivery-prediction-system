import {
  BackendFeaturesResponse,
  NormalizedFeature,
  PredictionPayload,
  PredictionResponse,
  HealthResponse,
  ConfigResponse,
} from '../types';

const DEFAULT_ML_API_URL = 'https://renewable-ultra-underfed.ngrok-free.dev';
const URL_STORAGE_KEY = 'ml_backend_api_url';

export function getStoredUrl(): string {
  try {
    const stored = localStorage.getItem(URL_STORAGE_KEY);
    if (stored && stored.trim()) return stored.trim();
  } catch {
    // ignore
  }
  return DEFAULT_ML_API_URL;
}

export function setStoredUrl(url: string) {
  try {
    if (url && url.trim()) {
      localStorage.setItem(URL_STORAGE_KEY, url.trim());
    } else {
      localStorage.removeItem(URL_STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

function getRequestHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...extra };
  const stored = getStoredUrl();
  if (stored) {
    headers['x-ml-api-url'] = stored;
  }
  return headers;
}

async function safeJsonParse(res: Response): Promise<any> {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return await res.json();
    } catch {
      // fallback to text
    }
  }
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export const api = {
  // Check backend health via GET /api/health
  async checkHealth(): Promise<HealthResponse> {
    try {
      const res = await fetch('/api/health', {
        headers: getRequestHeaders(),
      });
      const data = await safeJsonParse(res);
      if (!res.ok) {
        return {
          ok: false,
          error: data.error || data.details?.cleanError || `HTTP ${res.status}: ${res.statusText}`,
          targetUrl: data.targetUrl || getStoredUrl(),
          latencyMs: data.latencyMs,
          status: res.status,
          code: data.code,
        };
      }
      // If health succeeded, persist the confirmed target URL in localStorage
      if (data.targetUrl) {
        setStoredUrl(data.targetUrl);
      }
      return data;
    } catch (err: any) {
      return {
        ok: false,
        error: err.message || 'Network request failed',
        code: 'NETWORK_ERROR',
      };
    }
  },

  // Get active config via GET /api/config
  async getConfig(): Promise<ConfigResponse> {
    const res = await fetch('/api/config', {
      headers: getRequestHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Failed to get config: ${res.statusText}`);
    }
    const data = await safeJsonParse(res);
    const stored = getStoredUrl();
    const effectiveUrl = data.mlApiUrl || stored;
    return {
      mlApiUrl: effectiveUrl,
      hasEnvUrl: data.hasEnvUrl,
      isConfigured: Boolean(effectiveUrl),
    };
  },

  // Update active backend URL via POST /api/config
  async setConfig(mlApiUrl: string): Promise<ConfigResponse> {
    setStoredUrl(mlApiUrl);
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: getRequestHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ mlApiUrl }),
    });
    const data = await safeJsonParse(res);
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update backend URL');
    }
    return {
      mlApiUrl: data.mlApiUrl || mlApiUrl,
      hasEnvUrl: data.hasEnvUrl ?? false,
      isConfigured: Boolean(data.mlApiUrl || mlApiUrl),
    };
  },

  // Fetch features via GET /api/features
  async getFeatures(): Promise<{ raw: BackendFeaturesResponse; normalized: NormalizedFeature[] }> {
    const res = await fetch('/api/features', {
      headers: getRequestHeaders(),
    });
    const data = await safeJsonParse(res);

    if (!res.ok) {
      const errorMsg =
        data.error ||
        data.details?.summary ||
        data.details?.cleanError ||
        `Failed to fetch features (HTTP ${res.status}: ${res.statusText})`;
      throw new Error(errorMsg);
    }

    const raw: BackendFeaturesResponse = data;
    const normalized = normalizeFeatures(raw);
    return { raw, normalized };
  },

  // Submit prediction via POST /api/predict
  async predict(payload: PredictionPayload): Promise<PredictionResponse> {
    const res = await fetch('/api/predict', {
      method: 'POST',
      headers: getRequestHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(payload),
    });

    const data = await safeJsonParse(res);

    if (!res.ok) {
      const errorMsg =
        data?.error ||
        data?.detail ||
        (typeof data?.details === 'string'
          ? data.details
          : data?.details?.cleanError || JSON.stringify(data?.details)) ||
        `Prediction failed with status ${res.status}`;
      throw new Error(errorMsg);
    }

    // Validate expected fields
    if (data.prediction === undefined && data.result === undefined) {
      throw new Error('API response missing "prediction" or "result" field from FastAPI model.');
    }

    // Parse late probability (could be 0-1 scale e.g. 0.4004 or percentage scale e.g. 40.04)
    const rawProb =
      typeof data.late_probability === 'number'
        ? data.late_probability
        : parseFloat(String(data.late_probability)) || 0;

    return {
      prediction: data.prediction,
      result: data.result,
      late_probability: rawProb,
      confidence: data.confidence,
      timestamp: new Date().toISOString(),
      raw: data,
    };
  },

  // Get sample Colab template script
  async getColabTemplate(): Promise<string> {
    const res = await fetch('/api/colab-template', {
      headers: getRequestHeaders(),
    });
    const data = await safeJsonParse(res);
    return data.template || '';
  },
};

/**
 * Normalizes any format returned by the FastAPI /features endpoint
 */
export function normalizeFeatures(raw: any): NormalizedFeature[] {
  if (!raw) return [];

  const normalized: NormalizedFeature[] = [];
  const seen = new Set<string>();

  // Extract explicit numerical and categorical lists if available
  const numericalList: string[] = Array.isArray(raw.numeric_features)
    ? raw.numeric_features
    : Array.isArray(raw.numerical_features)
    ? raw.numerical_features
    : Array.isArray(raw.numerical)
    ? raw.numerical
    : [];

  const categoricalList: string[] = Array.isArray(raw.categorical_features)
    ? raw.categorical_features
    : Array.isArray(raw.categorical)
    ? raw.categorical
    : [];

  const categoricalOptions: Record<string, string[]> =
    raw.categorical_options || raw.options || {};

  // Check if raw is a plain array
  const allFeatures: string[] = Array.isArray(raw)
    ? raw
    : Array.isArray(raw.features)
    ? raw.features
    : Array.isArray(raw.all_features)
    ? raw.all_features
    : [...numericalList, ...categoricalList];

  // 1. Add all numerical features
  for (const feat of numericalList) {
    if (typeof feat === 'string' && !seen.has(feat)) {
      seen.add(feat);
      normalized.push({
        name: feat,
        type: 'numerical',
      });
    }
  }

  // 2. Add all categorical features
  for (const feat of categoricalList) {
    if (typeof feat === 'string' && !seen.has(feat)) {
      seen.add(feat);
      normalized.push({
        name: feat,
        type: 'categorical',
        options: Array.isArray(categoricalOptions[feat]) ? categoricalOptions[feat] : undefined,
      });
    }
  }

  // 3. For any remaining features in allFeatures not already classified
  for (const feat of allFeatures) {
    if (typeof feat === 'string' && !seen.has(feat)) {
      seen.add(feat);
      const hasOptions = Array.isArray(categoricalOptions[feat]);
      const isLikelyCategorical =
        hasOptions ||
        /mode|status|type|category|segment|region|country|city|dept|department|class|state|name/i.test(
          feat
        );

      normalized.push({
        name: feat,
        type: isLikelyCategorical ? 'categorical' : 'numerical',
        options: hasOptions ? categoricalOptions[feat] : undefined,
      });
    }
  }

  return normalized;
}
