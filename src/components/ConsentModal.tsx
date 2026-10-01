import React from 'react';
import { ShieldCheck, Lock, Trash2, UserCheck, AlertTriangle } from 'lucide-react';
import { Language } from '../types/index.js';
import { TRANSLATIONS } from '../utils/translations.js';

interface ConsentModalProps {
  lang: Language;
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({
  lang,
  isOpen,
  onAccept,
  onDecline,
}) => {
  if (!isOpen) return null;
  const t = TRANSLATIONS[lang];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-800/60 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-amber-100">
              {t.privacyTitle}
            </h3>
            <span className="text-xs text-stone-400">
              Showroom Confidentiality Standard
            </span>
          </div>
        </div>

        <p className="text-sm text-stone-300 leading-relaxed">
          {t.privacyBody1}
        </p>

        {/* Guarantees List */}
        <div className="space-y-3 bg-stone-950/60 border border-stone-800/80 rounded-xl p-4 text-xs text-stone-300">
          <div className="flex items-start gap-2.5">
            <Trash2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>{t.privacyPoint1}</span>
          </div>
          <div className="flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>{t.privacyPoint2}</span>
          </div>
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{t.privacyPoint3}</span>
          </div>
          <div className="flex items-start gap-2.5">
            <UserCheck className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <span>{t.privacyPoint4}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onDecline}
            className="flex-1 py-2.5 px-4 rounded-xl border border-stone-700 hover:bg-stone-800 text-stone-300 text-sm font-medium transition-colors"
          >
            {t.privacyDecline}
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="flex-1 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold shadow-md shadow-amber-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {t.privacyAccept}
          </button>
        </div>
      </div>
    </div>
  );
};
