import React, { useState, useEffect } from 'react';
import {
  Activity,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Zap,
  Sliders,
  Sparkles,
  Server,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { api } from '../services/api';
import {
  NormalizedFeature,
  PredictionPayload,
  PredictionResponse,
  HealthResponse,
} from '../types';
import { PredictionResultCard } from './PredictionResultCard';

interface PredictionDashboardProps {
  onOpenConnectionModal: () => void;
  health: HealthResponse | null;
}

export const PredictionDashboard: React.FC<PredictionDashboardProps> = ({
  onOpenConnectionModal,
  health,
}) => {
  const [features, setFeatures] = useState<NormalizedFeature[]>([]);
  const [loadingFeatures, setLoadingFeatures] = useState(false);
  const [featuresError, setFeaturesError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<PredictionResponse | null>(null);
  const [submittedPayload, setSubmittedPayload] = useState<PredictionPayload | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [inlineUrl, setInlineUrl] = useState('');
  const [savingInline, setSavingInline] = useState(false);

  // Fetch features on mount
  useEffect(() => {
    fetchFeatures();
    // Pre-populate inlineUrl from current stored config
    api.getConfig().then((cfg) => {
      if (cfg.mlApiUrl) setInlineUrl(cfg.mlApiUrl);
    }).catch(() => {});
  }, []);

  const handleInlineConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineUrl.trim()) return;
    setSavingInline(true);
    setFeaturesError(null);
    try {
      await api.setConfig(inlineUrl.trim());
      await fetchFeatures();
    } catch (err: any) {
      setFeaturesError(err.message || 'Failed to connect to backend URL');
    } finally {
      setSavingInline(false);
    }
  };

  const fetchFeatures = async () => {
    setLoadingFeatures(true);
    setFeaturesError(null);
    setPredictionResult(null);
    try {
      const res = await api.getFeatures();
      setFeatures(res.normalized);

      // Initialize form fields with empty strings or default select options
      const initialForm: Record<string, string> = {};
      for (const feat of res.normalized) {
        if (feat.type === 'categorical' && feat.options && feat.options.length > 0) {
          initialForm[feat.name] = feat.options[0];
        } else {
          initialForm[feat.name] = '';
        }
      }
      setFormData(initialForm);
    } catch (err: any) {
      setFeaturesError(
        err.message || 'Unable to fetch features from FastAPI /features endpoint'
      );
    } finally {
      setLoadingFeatures(false);
    }
  };

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    if (validationErrors[fieldName]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    for (const feat of features) {
      const val = formData[feat.name];
      if (val === undefined || val === null || String(val).trim() === '') {
        errors[feat.name] = 'This feature field is required';
      } else if (feat.type === 'numerical') {
        const num = Number(val);
        if (isNaN(num)) {
          errors[feat.name] = 'Must be a valid numerical value';
        }
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      setSubmitError('Please complete all required feature inputs before submitting.');
      return;
    }

    // Convert values according to requirements:
    // "Convert numerical values into numbers. Keep categorical values as strings."
    const payload: PredictionPayload = {};
    for (const feat of features) {
      const val = formData[feat.name];
      if (feat.type === 'numerical') {
        payload[feat.name] = Number(val);
      } else {
        payload[feat.name] = String(val);
      }
    }

    setSubmitting(true);
    setPredictionResult(null);

    try {
      const response = await api.predict(payload);
      setPredictionResult(response);
      setSubmittedPayload(payload);
    } catch (err: any) {
      setSubmitError(err.message || 'FastAPI model prediction request failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setPredictionResult(null);
    setSubmittedPayload(null);
    setSubmitError(null);
    setValidationErrors({});
  };

  // Quick helper to fill typical sample values for quick testing if requested
  const handleLoadSample = (preset: 'on-time' | 'late' = 'on-time') => {
    const isLatePreset = preset === 'late';
    const sampleDefaults: Record<string, string> = {
      'Type': isLatePreset ? 'TRANSFER' : 'PAYMENT',
      'Days for shipment (scheduled)': isLatePreset ? '1' : '4',
      'Sales per customer': '314.98',
      'Category Name': 'Sporting Goods',
      'Customer City': 'Caguas',
      'Customer Country': 'Puerto Rico',
      'Customer Segment': 'Consumer',
      'Customer State': 'PR',
      'Department Name': 'Fitness',
      'Latitude': '18.251453',
      'Longitude': '-66.037056',
      'Market': 'Pacific Asia',
      'Order City': 'Bekasi',
      'Order Country': 'Indonesia',
      'Order Item Discount': '13.11',
      'Order Item Discount Rate': '0.04',
      'Order Item Product Price': '327.75',
      'Order Item Quantity': '1',
      'Sales': '327.75',
      'Order Item Total': '314.64',
      'Order Region': 'Southeast Asia',
      'Order State': 'Java Occidental',
      'Order Status': isLatePreset ? 'PENDING' : 'COMPLETE',
      'Product Name': 'Smart watch',
      'Product Price': '327.75',
      'Product Status': '0',
      'Shipping Mode': isLatePreset ? 'First Class' : 'Standard Class',
    };

    const sample: Record<string, string> = { ...formData };
    for (const feat of features) {
      if (sampleDefaults[feat.name] !== undefined) {
        sample[feat.name] = sampleDefaults[feat.name];
      } else if (feat.type === 'numerical') {
        const nameLower = feat.name.toLowerCase();
        if (nameLower.includes('scheduled')) sample[feat.name] = isLatePreset ? '1' : '4';
        else if (nameLower.includes('sales') || nameLower.includes('price')) sample[feat.name] = '150.0';
        else if (nameLower.includes('quantity')) sample[feat.name] = '1';
        else if (nameLower.includes('discount')) sample[feat.name] = '0.05';
        else sample[feat.name] = '10';
      } else if (feat.type === 'categorical') {
        if (feat.options && feat.options.length > 0) {
          sample[feat.name] = feat.options[0];
        } else {
          sample[feat.name] = 'Standard';
        }
      }
    }
    setFormData(sample);
    setValidationErrors({});
  };

  const numericalFeatures = features.filter((f) => f.type === 'numerical');
  const categoricalFeatures = features.filter((f) => f.type === 'categorical');

  return (
    <div className="space-y-8 py-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Inference Dashboard
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              Live REST API
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Dynamically introspecting model features from{' '}
            <code className="text-blue-600 font-mono text-xs bg-blue-50 px-1 py-0.5 rounded">
              GET /features
            </code>{' '}
            and executing XGBoost inference.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={fetchFeatures}
            disabled={loadingFeatures}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
            title="Reload features from FastAPI"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingFeatures ? 'animate-spin' : ''}`} />
            <span>Reload Features</span>
          </button>

          <button
            type="button"
            onClick={onOpenConnectionModal}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-medium transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Connection</span>
          </button>
        </div>
      </div>

      {/* Backend Disconnected Notice */}
      {health && !health.ok && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start space-x-3 text-amber-900 text-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="font-bold text-amber-950">FastAPI Backend is currently not reachable</p>
            <p className="text-amber-800 leading-relaxed">
              Ensure your Google Colab notebook is running the FastAPI application and your ngrok tunnel is live.
              Click <button onClick={onOpenConnectionModal} className="underline font-semibold text-amber-950 hover:text-black">Connection Settings</button> to configure or verify your <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">ML_API_URL</code>.
            </p>
          </div>
        </div>
      )}

      {/* Loading features state */}
      {loadingFeatures && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <div className="space-y-1">
            <p className="font-semibold text-slate-800 text-base">
              Fetching Model Features from FastAPI...
            </p>
            <p className="text-xs text-slate-500">
              Querying <code className="font-mono text-blue-600">GET /features</code> to introspect required numerical and categorical inputs.
            </p>
          </div>
        </div>
      )}

      {/* Features Error State */}
      {!loadingFeatures && featuresError && (
        <div className="p-6 sm:p-8 bg-white rounded-3xl border border-rose-200 shadow-sm space-y-5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-base">
                FastAPI Backend Not Connected or Reached
              </h3>
              <p className="text-xs text-rose-700 leading-relaxed font-mono">
                {featuresError}
              </p>
            </div>
          </div>

          {/* Quick Connect URL Input Box */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="quick-url-input" className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Connect FastAPI Backend (e.g. from Google Colab / Ngrok)
              </label>
              <span className="text-[11px] text-blue-600 font-medium">Saved in browser & server</span>
            </div>
            <form onSubmit={handleInlineConnect} className="flex flex-col sm:flex-row gap-2.5">
              <input
                id="quick-url-input"
                type="text"
                value={inlineUrl}
                onChange={(e) => setInlineUrl(e.target.value)}
                placeholder="https://your-ngrok-tunnel.ngrok-free.dev or http://localhost:8000"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs text-slate-900 bg-white"
              />
              <button
                type="submit"
                disabled={savingInline || !inlineUrl.trim()}
                className="inline-flex items-center justify-center space-x-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-60 cursor-pointer"
              >
                {savingInline ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>Connect & Load Features</span>
                  </>
                )}
              </button>
            </form>
            <p className="text-[11px] text-slate-500">
              Paste your active Colab ngrok tunnel URL above. The app will immediately introspect your model's 27 features and enable live XGBoost inference.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Want to set it permanently on Vercel? Add <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">ML_API_URL</code> in Vercel Project Settings.
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={fetchFeatures}
                className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Retry GET /features
              </button>
              <button
                type="button"
                onClick={onOpenConnectionModal}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors cursor-pointer"
              >
                Connection Modal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Prediction Result View */}
      {predictionResult && submittedPayload && (
        <PredictionResultCard
          result={predictionResult}
          inputPayload={submittedPayload}
          onReset={handleReset}
        />
      )}

      {/* Feature Input Form */}
      {!loadingFeatures && !featuresError && features.length > 0 && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
        >
          {/* Form Header */}
          <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span className="font-bold text-sm text-slate-900">
                Shipment Parameters Form
              </span>
              <span className="text-xs font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                {features.length} model features
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleLoadSample('on-time')}
                className="text-xs text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 px-2.5 py-1.5 rounded-lg border border-emerald-200 font-medium transition-colors flex items-center space-x-1 cursor-pointer"
                title="Fill sample values expected to result in On-Time Delivery"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sample (On-Time)</span>
              </button>

              <button
                type="button"
                onClick={() => handleLoadSample('late')}
                className="text-xs text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100/80 px-2.5 py-1.5 rounded-lg border border-amber-200 font-medium transition-colors flex items-center space-x-1 cursor-pointer"
                title="Fill sample values expected to result in Late Delivery"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Sample (Late)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const cleared: Record<string, string> = {};
                  features.forEach((f) => (cleared[f.name] = ''));
                  setFormData(cleared);
                  setValidationErrors({});
                }}
                className="text-xs text-slate-600 hover:text-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Numerical Features Section */}
            {numericalFeatures.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Numerical Attributes (StandardScaler Pipeline)
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    ({numericalFeatures.length} features)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {numericalFeatures.map((feat) => {
                    const hasError = Boolean(validationErrors[feat.name]);
                    return (
                      <div key={feat.name} className="space-y-1.5">
                        <label
                          htmlFor={`field-${feat.name}`}
                          className="flex items-center justify-between text-xs font-semibold text-slate-800"
                        >
                          <span className="truncate" title={feat.name}>
                            {feat.name.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 uppercase">
                            Number
                          </span>
                        </label>
                        <input
                          id={`field-${feat.name}`}
                          type="number"
                          step="any"
                          required
                          value={formData[feat.name] ?? ''}
                          onChange={(e) => handleInputChange(feat.name, e.target.value)}
                          placeholder={`Enter ${feat.name.replace(/_/g, ' ')}`}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono text-slate-900 transition-all focus:outline-none focus:ring-2 ${
                            hasError
                              ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-400 focus:border-rose-400'
                              : 'border-slate-300 bg-white hover:border-slate-400 focus:ring-blue-500 focus:border-blue-500'
                          }`}
                        />
                        {hasError && (
                          <p className="text-[11px] text-rose-600 font-medium">
                            {validationErrors[feat.name]}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Categorical Features Section */}
            {categoricalFeatures.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Categorical Attributes (OneHotEncoder Pipeline)
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    ({categoricalFeatures.length} features)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {categoricalFeatures.map((feat) => {
                    const hasError = Boolean(validationErrors[feat.name]);
                    const hasOptions = feat.options && feat.options.length > 0;

                    return (
                      <div key={feat.name} className="space-y-1.5">
                        <label
                          htmlFor={`field-${feat.name}`}
                          className="flex items-center justify-between text-xs font-semibold text-slate-800"
                        >
                          <span className="truncate" title={feat.name}>
                            {feat.name.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 uppercase">
                            {hasOptions ? 'Select' : 'String'}
                          </span>
                        </label>

                        {hasOptions ? (
                          <select
                            id={`field-${feat.name}`}
                            required
                            value={formData[feat.name] ?? ''}
                            onChange={(e) => handleInputChange(feat.name, e.target.value)}
                            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 bg-white transition-all focus:outline-none focus:ring-2 ${
                              hasError
                                ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-400'
                                : 'border-slate-300 hover:border-slate-400 focus:ring-blue-500 focus:border-blue-500'
                            }`}
                          >
                            <option value="" disabled>
                              Select {feat.name.replace(/_/g, ' ')}...
                            </option>
                            {feat.options!.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            id={`field-${feat.name}`}
                            type="text"
                            required
                            value={formData[feat.name] ?? ''}
                            onChange={(e) => handleInputChange(feat.name, e.target.value)}
                            placeholder={`Enter ${feat.name.replace(/_/g, ' ')} string`}
                            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 transition-all focus:outline-none focus:ring-2 ${
                              hasError
                                ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-400'
                                : 'border-slate-300 bg-white hover:border-slate-400 focus:ring-blue-500 focus:border-blue-500'
                            }`}
                          />
                        )}

                        {hasError && (
                          <p className="text-[11px] text-rose-600 font-medium">
                            {validationErrors[feat.name]}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Error Message if submit failed */}
            {submitError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Inference Error</p>
                  <p className="leading-relaxed font-mono">{submitError}</p>
                </div>
              </div>
            )}

            {/* Form Footer / Submit Action */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Payload Destination:</span>{' '}
                <code className="text-blue-600 font-mono">POST /predict</code>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Clear Values
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all cursor-pointer disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Running XGBoost Model...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Predict Late Delivery Risk</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Empty features but not loading and no error */}
      {!loadingFeatures && !featuresError && features.length === 0 && (
        <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <p className="text-slate-700 font-semibold text-sm">
            No features returned by the backend yet.
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Please make sure your FastAPI backend at <code className="text-blue-600">GET /features</code> returns a list or object of model feature names.
          </p>
          <button
            onClick={fetchFeatures}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-medium"
          >
            Refresh /features
          </button>
        </div>
      )}
    </div>
  );
};
