import React, { useEffect, useState } from 'react';
import { X, QrCode, Smartphone, Copy, Check } from 'lucide-react';
import { generateQrDataUrl } from '../utils/qr.js';
import { Language } from '../types/index.js';
import { TRANSLATIONS } from '../utils/translations.js';

interface ContinueOnPhoneModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
}

export const ContinueOnPhoneModal: React.FC<ContinueOnPhoneModalProps> = ({
  lang,
  isOpen,
  onClose,
  sessionId,
}) => {
  if (!isOpen) return null;
  const t = TRANSLATIONS[lang];

  const [qrUrl, setQrUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Build target URL
  const sessionUrl = `${window.location.origin}/?session=${sessionId}`;

  useEffect(() => {
    generateQrDataUrl(sessionUrl).then((url) => setQrUrl(url));
  }, [sessionUrl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(sessionUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-amber-500" />
            <h3 className="font-serif font-bold text-base text-amber-100">
              Continue on Your Phone
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-stone-300 leading-relaxed">
          Scan this QR code with your smartphone camera to access your trial outfits, compare looks, or share with family.
        </p>

        {/* QR Code Container */}
        <div className="p-4 bg-stone-100 rounded-2xl mx-auto w-fit shadow-inner border border-stone-800">
          {qrUrl ? (
            <img src={qrUrl} alt="Session QR" className="w-48 h-48 mx-auto" />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-stone-500 text-xs">
              Generating QR...
            </div>
          )}
        </div>

        {/* Copy Link Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handleCopy}
            className="w-full py-2 px-3 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-white text-xs flex items-center justify-center gap-2 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-stone-400" />}
            <span>{copied ? t.copied : 'Copy Private Session Link'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
