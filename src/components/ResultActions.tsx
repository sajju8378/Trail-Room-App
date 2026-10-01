import React from 'react';
import { Download, Share2, BellRing, Sparkles, RefreshCw, Columns3 } from 'lucide-react';
import { Language, TryOnJob } from '../types/index.js';
import { TRANSLATIONS } from '../utils/translations.js';

interface ResultActionsProps {
  lang: Language;
  job: TryOnJob;
  onTryAnother: () => void;
  onRetryPhoto: () => void;
  onOpenReserve: () => void;
  onOpenCompare: () => void;
  totalSessionTrials: number;
}

export const ResultActions: React.FC<ResultActionsProps> = ({
  lang,
  job,
  onTryAnother,
  onRetryPhoto,
  onOpenReserve,
  onOpenCompare,
  totalSessionTrials,
}) => {
  const t = TRANSLATIONS[lang];

  const handleDownload = () => {
    const imageUrl = job.resultImageUrl || job.customerImage;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `TrialRoom-${job.garmentSku || 'outfit'}-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Look at this outfit I just tried on at Aura Atelier Showroom!\nOutfit: ${job.garmentName} (SKU: ${job.garmentSku || 'N/A'})\nPrice: ₹${(job.garmentPrice || 0).toLocaleString('en-IN')}\nHow does it look on me?`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-3 pt-2 max-w-lg mx-auto">
      {/* Primary Conversion Action: Ask Staff / Reserve item */}
      <button
        type="button"
        onClick={onOpenReserve}
        className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-amber-950/60 transition-all hover:scale-[1.01] active:scale-[0.99]"
      >
        <BellRing className="w-4 h-4 text-amber-200 animate-bounce" />
        <span>{t.askStaff}</span>
      </button>

      {/* Secondary utility actions */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <button
          type="button"
          onClick={handleDownload}
          className="py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 text-stone-200 font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Download className="w-4 h-4 text-amber-500" />
          <span>{t.saveGallery}</span>
        </button>

        <button
          type="button"
          onClick={handleWhatsAppShare}
          className="py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 text-stone-200 font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Share2 className="w-4 h-4 text-emerald-400" />
          <span>{t.shareWhatsApp}</span>
        </button>
      </div>

      {/* Navigation & Comparison actions */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <button
          type="button"
          onClick={onTryAnother}
          className="py-2.5 px-3 rounded-xl bg-amber-950/40 hover:bg-amber-950/60 border border-amber-900/60 text-amber-200 font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{t.tryAnother}</span>
        </button>

        <button
          type="button"
          onClick={onOpenCompare}
          disabled={totalSessionTrials < 2}
          className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 transition-colors ${
            totalSessionTrials >= 2
              ? 'bg-stone-900 hover:bg-stone-800 border-stone-800 text-stone-200'
              : 'bg-stone-950/60 border-stone-900 text-stone-600 cursor-not-allowed'
          }`}
        >
          <Columns3 className="w-4 h-4 text-stone-400" />
          <span>{t.compareOutfits} ({totalSessionTrials})</span>
        </button>
      </div>

      {/* Reset customer photo */}
      <div className="text-center pt-1">
        <button
          type="button"
          onClick={onRetryPhoto}
          className="text-xs text-stone-500 hover:text-stone-300 underline transition-colors"
        >
          Retake or change customer photo
        </button>
      </div>
    </div>
  );
};
