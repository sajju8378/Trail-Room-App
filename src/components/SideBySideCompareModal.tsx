import React from 'react';
import { X, Columns3, CheckCircle, BellRing, Trash2 } from 'lucide-react';
import { Language, TryOnJob } from '../types/index.js';
import { TRANSLATIONS } from '../utils/translations.js';

interface SideBySideCompareModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  trials: TryOnJob[];
  onSelectForReserve: (job: TryOnJob) => void;
  onRemoveTrial: (jobId: string) => void;
}

export const SideBySideCompareModal: React.FC<SideBySideCompareModalProps> = ({
  lang,
  isOpen,
  onClose,
  trials,
  onSelectForReserve,
  onRemoveTrial,
}) => {
  if (!isOpen) return null;
  const t = TRANSLATIONS[lang];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <Columns3 className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-amber-100">
                {t.compareTitle}
              </h3>
              <p className="text-xs text-stone-400">
                {t.compareSubtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {trials.length === 0 ? (
          <div className="py-12 text-center text-xs text-stone-400">
            {t.emptyCompare}
          </div>
        ) : (
          <div className={`grid grid-cols-1 ${trials.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'} gap-4`}>
            {trials.map((trial, index) => {
              const displayImg = trial.resultImageUrl || trial.customerImage;
              return (
                <div
                  key={trial.id}
                  className="bg-stone-950/70 border border-stone-800 rounded-2xl overflow-hidden flex flex-col group hover:border-amber-700/60 transition-colors"
                >
                  {/* Photo Container */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-stone-950">
                    <img
                      src={displayImg}
                      alt={trial.garmentName}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />

                    {/* Top badging */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-stone-300 bg-stone-950/80 backdrop-blur-md px-2 py-0.5 rounded border border-stone-800">
                        Look #{index + 1} · {trial.garmentSku}
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveTrial(trial.id)}
                        className="p-1 rounded bg-stone-950/80 hover:bg-rose-950 text-stone-400 hover:text-rose-400 border border-stone-800 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Bottom overlay info */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 space-y-0.5">
                      <span className="text-[11px] text-amber-400 font-bold block">
                        ₹{(trial.garmentPrice || 0).toLocaleString('en-IN')}
                      </span>
                      <h4 className="font-serif font-bold text-sm text-stone-100 line-clamp-1">
                        {trial.garmentName}
                      </h4>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="p-3 bg-stone-900/60 border-t border-stone-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-stone-400">
                      <span>Face match: {trial.qaMetrics?.faceSimilarity || 96}%</span>
                      <span>Fabric: {trial.qaMetrics?.garmentFidelity || 94}%</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectForReserve(trial);
                      }}
                      className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-colors"
                    >
                      <BellRing className="w-3.5 h-3.5" />
                      <span>{t.askStaff}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
