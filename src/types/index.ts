export interface BackendFeaturesResponse {
  features?: string[];
  numeric_features?: string[];
  numerical_features?: string[];
  categorical_features?: string[];
  categorical_options?: Record<string, string[]>;
  all_features?: string[];
  numerical?: string[];
  categorical?: string[];
  options?: Record<string, string[]>;
  [key: string]: any;
}

export interface NormalizedFeature {
  name: string;
  type: 'numerical' | 'categorical';
  options?: string[];
  description?: string;
}

export interface PredictionPayload {
  [featureName: string]: number | string;
}

export interface PredictionResponse {
  prediction: number | string; // 1 or 0 (or '1' / '0')
  result?: string; // 'Late Delivery' or 'On-Time Delivery'
  late_probability: number; // float between 0 and 1
  confidence?: number;
  message?: string;
  timestamp?: string;
  [key: string]: any;
}

export interface HealthResponse {
  ok: boolean;
  status?: number;
  statusText?: string;
  data?: any;
  targetUrl?: string;
  latencyMs?: number;
  error?: string;
  code?: string;
}

export interface ConfigResponse {
  mlApiUrl: string;
  hasEnvUrl: boolean;
  isConfigured: boolean;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  confusionMatrix: {
    trueNegative: number; // Predicted On-Time, Actual On-Time
    falsePositive: number; // Predicted Late, Actual On-Time
    falseNegative: number; // Predicted On-Time, Actual Late
    truePositive: number; // Predicted Late, Actual Late
  };
  sampleSize?: number;
  testSetDate?: string;
  datasetName?: string;
  notes?: string;
}
