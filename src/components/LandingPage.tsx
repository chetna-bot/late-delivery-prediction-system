import React from 'react';
import {
  Truck,
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  SlidersHorizontal,
  CheckCircle2,
  Clock,
  Sparkles,
  Server,
  FileCode2,
} from 'lucide-react';

interface LandingPageProps {
  onStartPrediction: () => void;
  onOpenColabGuide: () => void;
  onOpenSettings: () => void;
  isBackendConnected: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartPrediction,
  onOpenColabGuide,
  onOpenSettings,
  isBackendConnected,
}) => {
  return (
    <div className="space-y-16 py-6 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white p-8 sm:p-12 lg:p-16 shadow-2xl shadow-blue-900/30">
        {/* Subtle decorative background shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-blue-100">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Trained XGBoost Classifier • Scikit-Learn Pipeline • FastAPI</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Late Delivery <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-cyan-200 to-white">
              Prediction System
            </span>
          </h1>

          <p className="text-base sm:text-xl text-blue-100/90 max-w-2xl font-normal leading-relaxed">
            Enterprise Machine Learning web interface connected directly to your existing
            FastAPI model. Dynamically pulls model feature schemas, transforms numerical and categorical
            inputs through your Scikit-Learn preprocessing pipeline, and predicts shipment delay risks in real time.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={onStartPrediction}
              className="inline-flex items-center space-x-2.5 px-6 py-3.5 rounded-xl bg-white hover:bg-blue-50 text-blue-900 font-bold text-sm transition-all shadow-lg shadow-black/10 hover:shadow-xl hover:translate-y-[-1px] cursor-pointer"
            >
              <span>Start Prediction</span>
              <ArrowRight className="w-4 h-4 text-blue-700" />
            </button>

            <button
              onClick={onOpenSettings}
              className="inline-flex items-center space-x-2 px-5 py-3.5 rounded-xl bg-blue-600/60 hover:bg-blue-600 border border-white/20 text-white font-medium text-sm backdrop-blur-sm transition-colors cursor-pointer"
            >
              <Server className="w-4 h-4 text-blue-200" />
              <span>
                {isBackendConnected ? 'Backend Connected' : 'Configure Colab FastAPI'}
              </span>
            </button>

            <button
              onClick={onOpenColabGuide}
              className="inline-flex items-center space-x-2 px-4 py-3.5 rounded-xl text-blue-200 hover:text-white font-medium text-sm transition-colors"
            >
              <FileCode2 className="w-4 h-4" />
              <span>View API Spec</span>
            </button>
          </div>

          {/* Architecture Badges */}
          <div className="pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-blue-200">
            <div>
              <p className="text-white font-bold text-base">XGBoost</p>
              <p className="text-blue-200/80">Gradient Boosted Trees</p>
            </div>
            <div>
              <p className="text-white font-bold text-base">Scikit-Learn</p>
              <p className="text-blue-200/80">StandardScaler + OHE</p>
            </div>
            <div>
              <p className="text-white font-bold text-base">FastAPI REST</p>
              <p className="text-blue-200/80">Low-latency Inference</p>
            </div>
            <div>
              <p className="text-white font-bold text-base">100% Real Model</p>
              <p className="text-blue-200/80">Zero Simulation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            System Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Engineered for Production Machine Learning
          </h2>
          <p className="text-sm text-slate-600">
            Seamlessly bridges your trained Colab model with an intuitive logistics operator interface.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Dynamic Feature Schema</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Dynamically fetches feature definitions via <code className="text-blue-600 font-mono text-xs bg-blue-50 px-1 py-0.5 rounded">GET /features</code>.
              Numerical features are automatically rendered as validated number fields, and categorical attributes map to corresponding select dropdowns.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-2 border-t border-slate-100">
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Zero invented categories</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Strict type conversion (float & string)</span>
              </li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Authentic XGBoost Inference</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every prediction is computed exclusively by your trained XGBoost model hosted on FastAPI.
              Outputs continuous probability distributions alongside binary classification (<code className="text-indigo-600 font-mono text-xs bg-indigo-50 px-1 py-0.5 rounded">1 = Late</code>, <code className="text-indigo-600 font-mono text-xs bg-indigo-50 px-1 py-0.5 rounded">0 = On-Time</code>).
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-2 border-t border-slate-100">
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Late probability gauge & risk levels</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Full payload & response inspection</span>
              </li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Secure Node.js Proxy</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Never exposes your private Colab tunnel to browser-side code. The Node.js server proxies requests, attaches authentication, and applies <code className="text-cyan-700 font-mono text-xs bg-cyan-50 px-1 py-0.5 rounded">ngrok-skip-browser-warning: true</code>.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-2 border-t border-slate-100">
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
                <span>Bypasses ngrok interstitial warnings</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
                <span>Server-side ML_API_URL security</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* End-to-End Pipeline Visualization */}
      <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            Inference Pipeline Architecture
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            How data flows from the logistics operator form to your trained XGBoost classifier and back.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-blue-600">Step 1</span>
            <p className="font-semibold text-sm text-slate-900">Shipment Details</p>
            <p className="text-xs text-slate-500">
              Operator inputs shipment days, shipping mode, region, order price & quantity.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2">
            <span className="text-xs font-bold text-blue-600">Step 2</span>
            <p className="font-semibold text-sm text-slate-900">Scikit-Learn Pipeline</p>
            <p className="text-xs text-slate-600">
              StandardScaler normalizes numerical scales; OneHotEncoder transforms categories.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-2">
            <span className="text-xs font-bold text-indigo-600">Step 3</span>
            <p className="font-semibold text-sm text-slate-900">XGBoost Evaluation</p>
            <p className="text-xs text-slate-600">
              Trained gradient boosting tree ensemble estimates delay risk probability.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
            <span className="text-xs font-bold text-emerald-700">Step 4</span>
            <p className="font-semibold text-sm text-slate-900">Risk Intelligence</p>
            <p className="text-xs text-slate-600">
              Dashboard renders Late (1) / On-Time (0) status, probability meter, and diagnostics.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
