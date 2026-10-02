import React, { useState, useEffect } from 'react';
import { Server, CheckCircle2, AlertCircle, RefreshCw, X } from 'lucide-react';
import { getApiBaseUrl, setApiBaseUrl, getHealthEndpoint } from '../config/apiConfig.js';
import { apiService } from '../services/apiService.js';

interface BackendConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackendConnectionModal: React.FC<BackendConnectionModalProps> = ({ isOpen, onClose }) => {
  const [urlInput, setUrlInput] = useState(getApiBaseUrl());
  const [isChecking, setIsChecking] = useState(false);
  const [healthStatus, setHealthStatus] = useState<{
    status: string;
    service?: string;
    provider?: string;
    hasApiKey?: boolean;
    uptimeSec?: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUrlInput(getApiBaseUrl());
      checkConnection();
    }
  }, [isOpen]);

  const checkConnection = async (testUrl?: string) => {
    setIsChecking(true);
    setErrorMsg(null);
    try {
      const targetBase = typeof testUrl === 'string' ? testUrl.trim().replace(/\/+$/, '') : getApiBaseUrl();
      const endpoint = `${targetBase}/api/health`;
      const res = await fetch(endpoint, { signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const data = await res.json();
        setHealthStatus(data);
      } else {
        setErrorMsg(`Server responded with HTTP ${res.status}`);
        setHealthStatus(null);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not connect to backend server');
      setHealthStatus(null);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSave = () => {
    setApiBaseUrl(urlInput);
    checkConnection(urlInput);
  };

  const handleResetToSameOrigin = () => {
    setUrlInput('');
    setApiBaseUrl('');
    checkConnection('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-lg w-full p-6 space-y-5 text-stone-200 shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-amber-500" />
            <h3 className="font-serif font-bold text-lg text-amber-100">Backend Server Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-stone-400 leading-relaxed">
          The Android APK and external web clients connect to this backend server URL to run the Gemini AI try-on engine.
        </p>

        {/* Server Health Status Banner */}
        <div
          className={`p-3.5 rounded-xl border flex items-start gap-3 ${
            healthStatus?.status === 'ok'
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
              : errorMsg
              ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
              : 'bg-stone-950 border-stone-800 text-stone-400'
          }`}
        >
          {healthStatus?.status === 'ok' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          )}

          <div className="text-xs space-y-1">
            <div className="font-semibold text-sm">
              {healthStatus?.status === 'ok' ? 'Backend Connected' : 'Status: ' + (errorMsg || 'Checking...')}
            </div>
            {healthStatus?.status === 'ok' && (
              <div className="text-[11px] text-emerald-300/80 space-y-0.5">
                <div>AI Provider: <span className="font-mono font-bold">{healthStatus.provider || 'gemini'}</span></div>
                <div>GEMINI_API_KEY: <span className="font-semibold">{healthStatus.hasApiKey ? 'Configured on Server' : 'Missing on Server'}</span></div>
              </div>
            )}
          </div>
        </div>

        {/* Backend URL Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-stone-300">
            Backend URL (Cloud Run or API Host)
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="e.g. https://your-service.run.app (Leave empty for same origin)"
              className="flex-1 px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={handleSave}
              disabled={isChecking}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition disabled:opacity-50"
            >
              {isChecking && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              Save & Test
            </button>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex justify-between items-center pt-2">
          <button
            onClick={handleResetToSameOrigin}
            className="text-[11px] text-stone-400 hover:text-stone-200 underline"
          >
            Reset to Same-Origin
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
