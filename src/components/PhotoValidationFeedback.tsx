import React from 'react';
import { AlertCircle, CheckCircle2, RefreshCw, ArrowRight } from 'lucide-react';
import { PhotoValidationResult, Language } from '../types/index.js';
import { TRANSLATIONS } from '../utils/translations.js';

interface PhotoValidationFeedbackProps {
  lang: Language;
  validation: PhotoValidationResult;
  onRetake: () => void;
  onContinue: () => void;
}

export const PhotoValidationFeedback: React.FC<PhotoValidationFeedbackProps> = ({
  lang,
  validation,
  onRetake,
  onContinue,
}) => {
  const t = TRANSLATIONS[lang];

  const getMessage = () => {
    switch (validation.feedbackKey) {
      case 'blurry':
        return t.validationBlurry;
      case 'multiple_people':
        return t.validationMulti;
      case 'no_person':
        return t.validationNoPerson;
      case 'bad_lighting':
        return t.validationDim;
      case 'minor_detected':
        return t.validationMinor;
      default:
        return validation.feedbackText || t.validationSuccess;
    }
  };

  return (
    <div
      className={`rounded-xl p-4 border transition-all ${
        validation.isValid
          ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
          : 'bg-amber-950/40 border-amber-800/80 text-amber-200'
      }`}
    >
      <div className="flex items-start gap-3">
        {validation.isValid ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        )}
        <div className="space-y-1 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-stone-100">
              {validation.isValid ? t.validationSuccess : t.retakeRecommended}
            </span>
            <span className="text-xs text-stone-400 tabular-nums">
              Sharpness {validation.blurScore}% · {validation.personCount} Person
            </span>
          </div>
          <p className="text-xs text-stone-300 leading-relaxed">
            {getMessage()}
          </p>
        </div>
      </div>

      {/* Action buttons if warning */}
      {!validation.isValid && (
        <div className="flex gap-2 mt-3 pt-2 border-t border-amber-900/40">
          <button
            type="button"
            onClick={onRetake}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-amber-700 hover:bg-amber-600 text-white text-xs font-semibold shadow transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t.retake}</span>
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="py-2 px-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition-colors"
          >
            <span>{t.continueAnyway}</span>
          </button>
        </div>
      )}
    </div>
  );
};
