import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Code,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { PredictionResponse, PredictionPayload } from '../types';

interface PredictionResultCardProps {
  result: PredictionResponse;
  inputPayload: PredictionPayload;
  onReset: () => void;
}

export const PredictionResultCard: React.FC<PredictionResultCardProps> = ({
  result,
  inputPayload,
  onReset,
}) => {
  const [showRaw, setShowRaw] = useState(false);

  // Normalize prediction value: 1 = Late, 0 = On-Time
  const isLate =
    result.prediction === 1 ||
    result.prediction === '1' ||
    (typeof result.result === 'string' && result.result.toLowerCase().includes('late'));

  // Ensure probability is formatted properly as a percentage
  const probVal =
    typeof result.late_probability === 'number'
      ? result.late_probability
      : parseFloat(String(result.late_probability)) || 0;

  // Normalized probability percentage between 0 and 100
  const normalizedPercentage = probVal <= 1 ? probVal * 100 : Math.min(probVal, 100);
  const probPercent = normalizedPercentage.toFixed(2);
  const decimalScore = (normalizedPercentage / 100).toFixed(4);

  // Determine risk level category
  const numProb = parseFloat(probPercent);
  let riskLevel = 'Low Risk';
  let riskColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  let riskBarColor = 'bg-emerald-500';

  if (numProb >= 70) {
    riskLevel = 'Critical Delay Risk';
    riskColor = 'text-rose-700 bg-rose-50 border-rose-200';
    riskBarColor = 'bg-rose-500';
  } else if (numProb >= 40) {
    riskLevel = 'Moderate Delay Risk';
    riskColor = 'text-amber-700 bg-amber-50 border-amber-200';
    riskBarColor = 'bg-amber-500';
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden transition-all animate-fadeIn">
      {/* Top Banner */}
      <div
        className={`p-6 sm:p-8 text-white ${
          isLate
            ? 'bg-gradient-to-r from-rose-600 via-rose-700 to-amber-700'
            : 'bg-gradient-to-r from-emerald-600 via-teal-700 to-blue-700'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shrink-0 shadow-lg">
              {isLate ? (
                <AlertTriangle className="w-9 h-9 text-white animate-bounce" />
              ) : (
                <CheckCircle2 className="w-9 h-9 text-white" />
              )}
            </div>
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-widest font-semibold px-2.5 py-0.5 rounded-full bg-white/20 text-white/90">
                XGBoost Prediction Result
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {isLate ? 'Late Delivery' : 'On-Time Delivery'}
              </h2>
              <p className="text-xs sm:text-sm text-white/80">
                {isLate
                  ? 'Shipment is predicted to experience logistics delay.'
                  : 'Shipment is predicted to arrive within scheduled delivery window.'}
              </p>
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-white/20 sm:pl-6 space-y-1">
            <span className="text-xs text-white/80 uppercase tracking-wider font-medium">
              Binary Prediction Code
            </span>
            <div className="text-3xl font-mono font-black">{isLate ? '1' : '0'}</div>
            <span className="text-xs px-2 py-0.5 rounded bg-black/20 text-white/90 font-mono">
              {isLate ? 'PRED=1 (Late)' : 'PRED=0 (On-Time)'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Analysis Body */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Late Probability Card */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Late Delivery Probability</span>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-mono">
                {probPercent}%
              </span>
              <span className="text-xs text-slate-500 font-mono">
                ({decimalScore})
              </span>
            </div>
            {/* Visual Probability Progress Bar */}
            <div className="space-y-1">
              <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${riskBarColor}`}
                  style={{ width: `${Math.min(parseFloat(probPercent), 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0% (On-Time)</span>
                <span>50%</span>
                <span>100% (Late)</span>
              </div>
            </div>
          </div>

          {/* Risk Level Assessment */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Delay Severity Tier</span>
              {isLate ? (
                <ShieldAlert className="w-4 h-4 text-rose-600" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              )}
            </div>
            <div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${riskColor}`}
              >
                {riskLevel}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {numProb >= 70
                ? 'High likelihood of delay. Prioritize expedited routing or customer notice.'
                : numProb >= 40
                ? 'Moderate variance expected. Track transit checkpoint timestamps.'
                : 'Favorable logistics margins. High confidence in schedule adherence.'}
            </p>
          </div>

          {/* Inference Model Specs */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Model & Source</span>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Algorithm:</span>
                <span className="font-semibold text-slate-800">XGBoost Classifier</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Pipeline:</span>
                <span className="font-semibold text-slate-800">StandardScaler + OHE</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Inference Origin:</span>
                <span className="font-semibold text-blue-600 font-mono">FastAPI POST /predict</span>
              </div>
            </div>
          </div>
        </div>

        {/* Input Summary Pill Strip */}
        <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
              Evaluated Shipment Attributes
            </span>
            <span className="text-xs text-blue-700 font-mono">
              {Object.keys(inputPayload).length} Features
            </span>
          </div>
          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
            {Object.entries(inputPayload).map(([key, val]) => (
              <span
                key={key}
                className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-xs shadow-xs"
              >
                <span className="font-medium text-slate-600">{key}:</span>
                <span className="font-bold text-slate-900 font-mono">
                  {typeof val === 'number' ? val.toLocaleString() : String(val)}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Toggle Raw JSON Inspector */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Code className="w-4 h-4 text-blue-600" />
              <span>Inspect Raw Payload & FastAPI JSON Response</span>
            </div>
            {showRaw ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showRaw && (
            <div className="p-4 bg-slate-900 text-slate-100 font-mono text-xs space-y-4 overflow-x-auto">
              <div>
                <p className="text-slate-400 text-[11px] mb-1 font-sans font-semibold">
                  Input JSON Payload sent to FastAPI:
                </p>
                <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300">
                  {JSON.stringify(inputPayload, null, 2)}
                </pre>
              </div>
              <div>
                <p className="text-slate-400 text-[11px] mb-1 font-sans font-semibold">
                  FastAPI Response Received:
                </p>
                <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-emerald-300">
                  {JSON.stringify(result.raw || result, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onReset}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition-colors cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Make Another Prediction</span>
          </button>
        </div>
      </div>
    </div>
  );
};
