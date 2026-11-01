import React from 'react';
import {
  Truck,
  Activity,
  Sliders,
  BarChart3,
  BookOpen,
  Wifi,
  WifiOff,
  RefreshCw,
} from 'lucide-react';
import { HealthResponse } from '../types';

interface NavbarProps {
  activeTab: 'home' | 'predict' | 'performance' | 'colab-guide';
  setActiveTab: (tab: 'home' | 'predict' | 'performance' | 'colab-guide') => void;
  health: HealthResponse | null;
  checkingHealth: boolean;
  onOpenConnectionModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  health,
  checkingHealth,
  onOpenConnectionModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setActiveTab('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 tracking-tight text-lg">
                  LATE DELIVERY
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  XGBoost ML
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Prediction System</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'home'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('predict')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'predict'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Predictor Console</span>
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'performance'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Model Performance</span>
            </button>
            <button
              onClick={() => setActiveTab('colab-guide')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'colab-guide'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>FastAPI & Colab</span>
            </button>
          </nav>

          {/* Backend Status Indicator & Setup Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenConnectionModal}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                checkingHealth
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : health?.ok
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70'
                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/70'
              }`}
              title="Click to view/change FastAPI backend connection"
            >
              {checkingHealth ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
                  <span>Checking ML API...</span>
                </>
              ) : health?.ok ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  <span>FastAPI Online ({health.latencyMs}ms)</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-rose-600" />
                  <span>Backend Offline / Unset</span>
                </>
              )}
            </button>

            <button
              onClick={onOpenConnectionModal}
              className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-colors"
              title="Configure ML API Endpoint"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 space-x-2 border-t border-slate-100">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'home' ? 'bg-blue-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('predict')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'predict' ? 'bg-blue-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Predictor
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'performance' ? 'bg-blue-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Metrics
          </button>
          <button
            onClick={() => setActiveTab('colab-guide')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'colab-guide' ? 'bg-blue-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Colab Setup
          </button>
        </div>
      </div>
    </header>
  );
};
