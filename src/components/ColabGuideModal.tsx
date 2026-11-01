import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api';

interface ColabGuideModalProps {
  onStartPrediction: () => void;
  onOpenSettings: () => void;
}

export const ColabGuideModal: React.FC<ColabGuideModalProps> = ({
  onStartPrediction,
  onOpenSettings,
}) => {
  const [templateCode, setTemplateCode] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTemplate();
  }, []);

  const loadTemplate = async () => {
    setLoading(true);
    try {
      const code = await api.getColabTemplate();
      setTemplateCode(code);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(templateCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8 py-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              FastAPI & Colab Backend Guide
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              API Contract
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Complete integration specification for connecting your trained XGBoost model to this frontend.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenSettings}
            className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
          >
            Configure ML_API_URL
          </button>
          <button
            onClick={onStartPrediction}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            Go to Predictor
          </button>
        </div>
      </div>

      {/* 3 Step Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <h3 className="font-bold text-slate-900 text-base">Train & Export Model</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Train your XGBoost Classifier in Google Colab with a Scikit-learn Pipeline (StandardScaler for numerical, OneHotEncoder for categorical) and save it using <code className="text-blue-600 bg-blue-50 px-1 py-0.5 rounded font-mono">joblib.dump(pipeline, 'model.pkl')</code>.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <h3 className="font-bold text-slate-900 text-base">Permanent 24/7 Cloud Host</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Deploy the <code className="text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded font-mono">backend/</code> folder to Render or Hugging Face Spaces for free. It stays online 24/7 forever with no Colab disconnects.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <h3 className="font-bold text-slate-900 text-base">Permanent Connection</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Set your permanent cloud URL or keep your reserved ngrok domain (<code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-mono">https://renewable-ultra-underfed.ngrok-free.dev</code>).
          </p>
        </div>
      </div>

      {/* Permanent 24/7 Uptime Guide Banner */}
      <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-3xl p-6 sm:p-8 text-white space-y-4 border border-blue-900/50 shadow-xl">
        <div className="flex items-center space-x-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <h2 className="text-lg font-bold text-white">
            How to Keep Your Backend Permanently Online (Never Sleep)
          </h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Google Colab free sessions automatically sleep after ~60-90 minutes of idle time. To keep your FastAPI backend permanently online 24/7 without needing to open Colab:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
              Option A: Free 24/7 Hosting on Render
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              We created a <code className="bg-white/10 px-1 py-0.5 rounded font-mono">backend/</code> folder in this repo with <code className="font-mono">main.py</code> and <code className="font-mono">requirements.txt</code>. Connect your GitHub repo to Render.com and deploy the web service. It gives you a permanent 24/7 URL like <code className="text-cyan-200 font-mono">https://late-delivery-api.onrender.com</code>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              Option B: Colab Anti-Sleep Script
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              If running in Colab, open Chrome DevTools (F12) → Console tab and paste this script:
            </p>
            <pre className="text-[10px] bg-black/40 p-2 rounded text-emerald-300 font-mono overflow-x-auto">
{`setInterval(() => {
  document.querySelector("colab-connect-button")?.click();
}, 60000);`}
            </pre>
          </div>
        </div>
      </div>

      {/* Endpoint Specifications */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900">
          Required FastAPI Endpoints & JSON Contracts
        </h2>

        <div className="space-y-4">
          {/* Endpoint 1 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800 font-mono">
                GET
              </span>
              <code className="text-sm font-bold text-slate-900">/</code>
              <span className="text-xs text-slate-500">• Health check</span>
            </div>
            <p className="text-xs text-slate-600">
              Called to verify server connectivity and latency.
            </p>
            <pre className="text-xs font-mono bg-white p-3 rounded border border-slate-200 text-slate-800 overflow-x-auto">
{`{
  "status": "online",
  "service": "Late Delivery Prediction System",
  "framework": "XGBoost + Scikit-Learn"
}`}
            </pre>
          </div>

          {/* Endpoint 2 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800 font-mono">
                GET
              </span>
              <code className="text-sm font-bold text-slate-900">/features</code>
              <span className="text-xs text-slate-500">• Model feature metadata</span>
            </div>
            <p className="text-xs text-slate-600">
              The frontend dynamically pulls this list to generate the exact input form fields.
            </p>
            <pre className="text-xs font-mono bg-white p-3 rounded border border-slate-200 text-slate-800 overflow-x-auto">
{`{
  "features": ["Days_for_shipping_real", "Days_for_shipment_scheduled", "Shipping_Mode", ...],
  "numerical_features": ["Days_for_shipping_real", "Days_for_shipment_scheduled", "Benefit_per_order"],
  "categorical_features": ["Shipping_Mode", "Order_Region", "Customer_Segment"],
  "categorical_options": {
    "Shipping_Mode": ["Standard Class", "First Class", "Second Class", "Same Day"],
    "Customer_Segment": ["Consumer", "Corporate", "Home Office"]
  }
}`}
            </pre>
          </div>

          {/* Endpoint 3 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 font-mono">
                POST
              </span>
              <code className="text-sm font-bold text-slate-900">/predict</code>
              <span className="text-xs text-slate-500">• Model inference</span>
            </div>
            <p className="text-xs text-slate-600">
              Accepts shipment features as JSON, runs the trained XGBoost model, and returns delay prediction and probability.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <p className="font-semibold text-slate-700 mb-1">Request Payload Body:</p>
                <pre className="font-mono bg-white p-2.5 rounded border border-slate-200 text-slate-800 overflow-x-auto">
{`{
  "Days_for_shipping_real": 4,
  "Days_for_shipment_scheduled": 2,
  "Benefit_per_order": 28.5,
  "Shipping_Mode": "Standard Class"
}`}
                </pre>
              </div>
              <div>
                <p className="font-semibold text-slate-700 mb-1">Response JSON:</p>
                <pre className="font-mono bg-white p-2.5 rounded border border-slate-200 text-emerald-900 overflow-x-auto">
{`{
  "prediction": 1,
  "result": "Late Delivery",
  "late_probability": 0.8421
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyable Colab Script */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Terminal className="w-5 h-5 text-blue-400" />
              <h2 className="font-bold text-base text-white">
                Complete Colab FastAPI Server Script
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Copy and execute this cell in your Google Colab notebook alongside your trained model.
            </p>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer self-start sm:self-auto"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Python Script</span>
              </>
            )}
          </button>
        </div>

        <pre className="font-mono text-xs text-cyan-200 bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto max-h-96 leading-relaxed">
          {templateCode || 'Loading Colab template...'}
        </pre>
      </div>
    </div>
  );
};
