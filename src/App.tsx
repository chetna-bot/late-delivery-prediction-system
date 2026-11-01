import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { PredictionDashboard } from './components/PredictionDashboard';
import { PerformanceDashboard } from './components/PerformanceDashboard';
import { ColabGuideModal } from './components/ColabGuideModal';
import { ConnectionModal } from './components/ConnectionModal';
import { api } from './services/api';
import { HealthResponse } from './types';
import {
  Truck,
  ShieldCheck,
  Server,
  Terminal,
  ExternalLink,
  Cpu,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'predict' | 'performance' | 'colab-guide'>('home');
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [checkingHealth, setCheckingHealth] = useState<boolean>(true);
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState<boolean>(false);

  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    setCheckingHealth(true);
    try {
      const res = await api.checkHealth();
      setHealth(res);
    } catch {
      setHealth({ ok: false, error: 'Failed to contact proxy' });
    } finally {
      setCheckingHealth(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        health={health}
        checkingHealth={checkingHealth}
        onOpenConnectionModal={() => setIsConnectionModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {activeTab === 'home' && (
          <LandingPage
            onStartPrediction={() => setActiveTab('predict')}
            onOpenColabGuide={() => setActiveTab('colab-guide')}
            onOpenSettings={() => setIsConnectionModalOpen(true)}
            isBackendConnected={Boolean(health?.ok)}
          />
        )}

        {activeTab === 'predict' && (
          <PredictionDashboard
            onOpenConnectionModal={() => setIsConnectionModalOpen(true)}
            health={health}
          />
        )}

        {activeTab === 'performance' && <PerformanceDashboard />}

        {activeTab === 'colab-guide' && (
          <ColabGuideModal
            onStartPrediction={() => setActiveTab('predict')}
            onOpenSettings={() => setIsConnectionModalOpen(true)}
          />
        )}
      </main>

      {/* Connection & Configuration Modal */}
      <ConnectionModal
        isOpen={isConnectionModalOpen}
        onClose={() => setIsConnectionModalOpen(false)}
        currentHealth={health}
        onRefreshHealth={checkBackendHealth}
        onConnectionSuccess={() => {
          // If the user was on home or predict, they are ready
        }}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center text-white">
                <Truck className="w-3 h-3" />
              </div>
              <span className="font-semibold text-slate-700">
                Late Delivery Prediction System
              </span>
              <span>•</span>
              <span>XGBoost + Scikit-Learn Pipeline</span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1 text-slate-600">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Node.js Secure Proxy (ngrok bypass enabled)</span>
              </span>
              <button
                onClick={() => setIsConnectionModalOpen(true)}
                className="text-blue-600 hover:text-blue-800 font-medium underline"
              >
                Backend Connection Settings
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
