import React, { useState, useEffect } from 'react';
import {
  X,
  Server,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';
import { HealthResponse } from '../types';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionSuccess?: () => void;
  currentHealth: HealthResponse | null;
  onRefreshHealth: () => Promise<void>;
}

export const ConnectionModal: React.FC<ConnectionModalProps> = ({
  isOpen,
  onClose,
  onConnectionSuccess,
  currentHealth,
  onRefreshHealth,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [hasEnvUrl, setHasEnvUrl] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<HealthResponse | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadConfig();
    }
  }, [isOpen]);

  const loadConfig = async () => {
    try {
      const cfg = await api.getConfig();
      setUrlInput(cfg.mlApiUrl || '');
      setHasEnvUrl(cfg.hasEnvUrl);
      if (currentHealth) {
        setTestResult(currentHealth);
      }
    } catch {
      // ignore
    }
  };

  const handleSaveAndTest = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      await api.setConfig(urlInput);
      setSaving(false);
      setTesting(true);
      const res = await api.checkHealth();
      setTestResult(res);
      await onRefreshHealth();
      if (res.ok) {
        setFeedback('Backend connected successfully! Ready to run predictions.');
        if (onConnectionSuccess) onConnectionSuccess();
      } else {
        setFeedback(res.error || 'Connection failed. Please check the URL.');
      }
    } catch (err: any) {
      setFeedback(err.message || 'Error updating configuration');
    } finally {
      setSaving(false);
      setTesting(false);
    }
  };

  const handleTestOnly = async () => {
    setTesting(true);
    setFeedback(null);
    try {
      const res = await api.checkHealth();
      setTestResult(res);
      await onRefreshHealth();
      if (res.ok) {
        setFeedback('Connection active: FastAPI returned HTTP 200.');
      } else {
        setFeedback(res.error || 'Failed to reach FastAPI backend.');
      }
    } catch (err: any) {
      setFeedback(err.message || 'Connection test failed');
    } finally {
      setTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center space-x-2.5">
            <Server className="w-5 h-5 text-blue-200" />
            <h3 className="font-semibold text-lg tracking-tight">FastAPI ML Backend Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Environment Variable Notice */}
          <div className="flex items-start space-x-3 p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-900">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-blue-950">
                Server-Side Proxy with Ngrok Header Support
              </p>
              <p className="text-blue-800 leading-relaxed">
                Frontend requests are securely proxied via Node.js server endpoints (
                <code className="bg-blue-100 px-1 py-0.5 rounded text-blue-900">/api/features</code>{' '}
                and{' '}
                <code className="bg-blue-100 px-1 py-0.5 rounded text-blue-900">/api/predict</code>
                ). The header{' '}
                <code className="bg-blue-100 px-1 py-0.5 rounded text-blue-900">
                  ngrok-skip-browser-warning: true
                </code>{' '}
                is automatically attached to prevent ngrok interstitial blockages.
              </p>
            </div>
          </div>

          {/* URL Input Form */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                FastAPI Base URL (<code className="lowercase">ML_API_URL</code>)
              </label>
              {hasEnvUrl && (
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Set in .env
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://xxxx-xx-xx.ngrok-free.app or http://localhost:8000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono text-slate-800 placeholder-slate-400"
              />
            </div>
            <p className="text-xs text-slate-500">
              Provide your public Colab tunnel URL (e.g. from <code className="text-slate-700">ngrok</code> or <code className="text-slate-700">localtunnel</code>) or a hosted server address.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-3 pt-1">
            <button
              onClick={handleSaveAndTest}
              disabled={saving || testing}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all shadow-sm shadow-blue-500/20 disabled:opacity-60 cursor-pointer"
            >
              {saving || testing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Save & Test Backend</span>
                </>
              )}
            </button>
            <button
              onClick={handleTestOnly}
              disabled={saving || testing}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors cursor-pointer"
            >
              Ping GET /
            </button>
          </div>

          {/* Test Status Card */}
          {testResult && (
            <div
              className={`p-4 rounded-xl border ${
                testResult.ok
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50/70 border-rose-200 text-rose-950'
              }`}
            >
              <div className="flex items-start space-x-3">
                {testResult.ok ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">
                      {testResult.ok ? 'FastAPI Backend Online' : 'Connection Failed'}
                    </p>
                    {testResult.latencyMs !== undefined && (
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/80 border border-slate-200 text-slate-700">
                        {testResult.latencyMs} ms
                      </span>
                    )}
                  </div>
                  {testResult.error ? (
                    <p className="text-xs text-rose-800 leading-relaxed font-mono">
                      {testResult.error}
                    </p>
                  ) : (
                    <pre className="text-xs bg-white/80 p-2 rounded border border-emerald-200 font-mono text-emerald-900 overflow-x-auto">
                      {JSON.stringify(testResult.data, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          )}

          {feedback && !testResult?.error && testResult?.ok && (
            <p className="text-xs text-emerald-600 font-medium">{feedback}</p>
          )}

          {/* Quick Colab Reminder */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="font-semibold text-slate-800 flex items-center justify-between">
              <span>Required FastAPI endpoints in Colab:</span>
              <span className="text-[11px] text-blue-600 font-normal">All 3 required</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 font-mono text-[11px] text-slate-700">
              <li>GET / (Health check)</li>
              <li>GET /features (Numerical & categorical feature names)</li>
              <li>POST /predict (XGBoost inference JSON response)</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
