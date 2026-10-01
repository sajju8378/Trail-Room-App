import React, { useState } from 'react';
import { Sparkles, QrCode, RotateCcw, Shield, BarChart3, Info, Lock, Globe, Smartphone } from 'lucide-react';
import { Language, ShowroomConfig } from '../types/index.js';
import { TRANSLATIONS } from '../utils/translations.js';

interface HeaderProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  config: ShowroomConfig;
  isKiosk: boolean;
  onToggleKiosk: () => void;
  onQuickReset: () => void;
  onOpenPhoneQr: () => void;
  onOpenAdmin: () => void;
  onOpenArchitecture: () => void;
  onOpenInstallApp?: () => void;
  currentStep: number;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onLanguageChange,
  config,
  isKiosk,
  onToggleKiosk,
  onQuickReset,
  onOpenPhoneQr,
  onOpenAdmin,
  onOpenArchitecture,
  onOpenInstallApp,
}) => {
  const t = TRANSLATIONS[lang];
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleResetClick = () => {
    if (showResetConfirm) {
      onQuickReset();
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 5000);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-950/90 backdrop-blur-md border-b border-stone-800/80 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white shadow-md shadow-amber-900/20">
            <span className="font-serif font-bold text-lg tracking-wider">A</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-bold text-base sm:text-lg text-amber-100 tracking-wide leading-none">
                {config.name || t.appName}
              </h1>
              {isKiosk && (
                <span className="text-[11px] font-medium text-amber-400 bg-amber-950/60 border border-amber-800/50 px-2 py-0.5 rounded">
                  Kiosk
                </span>
              )}
            </div>
            <p className="text-xs text-stone-400 truncate max-w-[200px] sm:max-w-xs">
              {config.tagline || t.tagline}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Language Switcher */}
          <div className="flex items-center bg-stone-900 border border-stone-800 rounded-lg p-0.5 text-xs">
            <button
              type="button"
              onClick={() => onLanguageChange('en')}
              className={`px-2 py-1 rounded transition-colors ${
                lang === 'en' ? 'bg-amber-600 text-white font-medium shadow-sm' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('hi')}
              className={`px-2 py-1 rounded transition-colors ${
                lang === 'hi' ? 'bg-amber-600 text-white font-medium shadow-sm' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              हिन्दी
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('te')}
              className={`px-2 py-1 rounded transition-colors ${
                lang === 'te' ? 'bg-amber-600 text-white font-medium shadow-sm' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              తెలుగు
            </button>
          </div>

          {/* Continue on phone QR */}
          <button
            type="button"
            onClick={onOpenPhoneQr}
            title={t.continueOnPhone}
            className="hidden sm:flex items-center gap-1.5 text-xs text-stone-300 hover:text-amber-300 bg-stone-900 hover:bg-stone-800 border border-stone-800 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-500" />
            <span>{t.continueOnPhone}</span>
          </button>

          {/* Android APK / App Install */}
          {onOpenInstallApp && (
            <button
              type="button"
              onClick={onOpenInstallApp}
              title="Install Android App / Download APK"
              className="flex items-center gap-1 text-xs text-emerald-300 bg-emerald-950/60 hover:bg-emerald-950 border border-emerald-800/80 px-2 py-1.5 rounded-lg transition-colors font-medium shadow-xs"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>APK</span>
            </button>
          )}

          {/* Quick Reset (Staff / Next customer button) */}
          <button
            type="button"
            onClick={handleResetClick}
            title={t.quickReset}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
              showResetConfirm
                ? 'bg-rose-900/80 text-rose-100 border-rose-600 animate-pulse font-medium'
                : 'bg-stone-900 text-stone-300 hover:text-amber-300 border-stone-800 hover:border-stone-700'
            }`}
          >
            <RotateCcw className={`w-3.5 h-3.5 ${showResetConfirm ? 'text-white' : 'text-stone-400'}`} />
            <span className="hidden sm:inline">
              {showResetConfirm ? 'Confirm Reset?' : t.quickReset}
            </span>
          </button>

          {/* Architecture / Cost modal */}
          <button
            type="button"
            onClick={onOpenArchitecture}
            title="Try-On Architecture & Provider Cost"
            className="p-1.5 text-stone-400 hover:text-amber-300 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-lg transition-colors"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Admin & Showroom analytics */}
          <button
            type="button"
            onClick={onOpenAdmin}
            title={t.adminDashboard}
            className="p-1.5 text-stone-400 hover:text-amber-300 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-lg transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
          </button>

          {/* Kiosk Mode Toggle */}
          <button
            type="button"
            onClick={onToggleKiosk}
            title={isKiosk ? t.exitKiosk : t.kioskMode}
            className={`p-1.5 rounded-lg border transition-colors ${
              isKiosk
                ? 'bg-amber-950/80 border-amber-700/80 text-amber-300'
                : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
