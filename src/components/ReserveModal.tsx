import React, { useState } from 'react';
import { X, BellRing, CheckCircle2, Ticket, User, Phone, Sparkles } from 'lucide-react';
import { Language, TryOnJob } from '../types/index.js';
import { TRANSLATIONS } from '../utils/translations.js';
import { apiService } from '../services/apiService.js';

interface ReserveModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  job: TryOnJob;
}

export const ReserveModal: React.FC<ReserveModalProps> = ({
  lang,
  isOpen,
  onClose,
  job,
}) => {
  if (!isOpen) return null;
  const t = TRANSLATIONS[lang];

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [size, setSize] = useState('Medium / Free Size');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reservationTicket, setReservationTicket] = useState<{
    id: string;
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) return;

    setIsSubmitting(true);
    try {
      const data = await apiService.reserveItem({
        sessionId: job.sessionId,
        customerName,
        customerPhone,
        garmentSku: job.garmentSku || 'SKU-CUSTOM',
        garmentName: job.garmentName,
        garmentPrice: job.garmentPrice || 0,
        size,
      });
      setReservationTicket({
        id: data.reservationId,
        message: data.message || t.reserveSuccessMsg,
      });
    } catch (err) {
      console.error('Reservation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <BellRing className="w-5 h-5 text-amber-500" />
            <h3 className="font-serif font-bold text-base text-amber-100">
              {t.reserveTitle}
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

        {reservationTicket ? (
          /* Confirmation Ticket Card */
          <div className="space-y-4 py-2 text-center animate-slideUp">
            <div className="w-14 h-14 rounded-full bg-emerald-950/80 border border-emerald-700 flex items-center justify-center mx-auto text-emerald-400 shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="font-serif font-bold text-lg text-emerald-300">
                {t.reserveSuccess}
              </h4>
              <p className="text-xs text-stone-300 max-w-xs mx-auto">
                {reservationTicket.message}
              </p>
            </div>

            <div className="bg-stone-950 border border-amber-900/60 rounded-xl p-4 text-xs space-y-2 text-left">
              <div className="flex items-center justify-between text-amber-400 font-mono font-bold text-sm border-b border-stone-800 pb-2">
                <span>TOKEN: {reservationTicket.id}</span>
                <span>COUNTER ALERTED</span>
              </div>
              <div className="space-y-1 text-stone-300 pt-1">
                <p><span className="text-stone-500">Customer:</span> {customerName} ({customerPhone})</p>
                <p><span className="text-stone-500">Item:</span> {job.garmentName}</p>
                <p><span className="text-stone-500">SKU:</span> {job.garmentSku || 'N/A'}</p>
                <p><span className="text-stone-500">Size:</span> {size}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          /* Input Form */
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Garment summary badge */}
            <div className="flex items-center gap-3 bg-stone-950/80 border border-stone-800 rounded-xl p-2.5">
              <img
                src={job.garmentImage}
                alt="Garment"
                className="w-12 h-12 rounded-lg object-cover border border-stone-800 shrink-0"
              />
              <div className="truncate">
                <span className="text-[10px] text-amber-400 font-mono block">
                  {job.garmentSku}
                </span>
                <p className="font-serif font-bold text-stone-200 truncate">
                  {job.garmentName}
                </p>
                <span className="text-stone-400 tabular-nums">
                  ₹{(job.garmentPrice || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <p className="text-stone-400 leading-relaxed">
              {t.reserveSubtitle}
            </p>

            <div className="space-y-3">
              <div>
                <label className="block font-medium text-stone-300 mb-1">
                  {t.custName} *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-300 mb-1">
                  {t.custPhone} *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-300 mb-1">
                  {t.selectedSize}
                </label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="Free Size (Saree / Unstitched)">Free Size (Saree / Unstitched)</option>
                  <option value="Small (36)">Small (36)</option>
                  <option value="Medium (38)">Medium (38)</option>
                  <option value="Large (40)">Large (40)</option>
                  <option value="X-Large (42)">X-Large (42)</option>
                  <option value="Custom Tailored Fitting">Custom Tailored Fitting</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-stone-700 hover:bg-stone-800 text-stone-300 font-medium transition-colors"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !customerName || !customerPhone}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold shadow-md shadow-amber-950/40 transition-all"
              >
                {isSubmitting ? 'Alerting...' : t.confirmReserve}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
