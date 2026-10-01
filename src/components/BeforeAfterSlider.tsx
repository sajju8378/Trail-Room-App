import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Minimize2, ShieldCheck, Sparkles } from 'lucide-react';
import { Language, QAMetrics } from '../types/index.js';
import { TRANSLATIONS } from '../utils/translations.js';

interface BeforeAfterSliderProps {
  lang: Language;
  beforeImage: string;
  afterImage: string;
  qaMetrics?: QAMetrics;
  garmentName?: string;
  garmentPrice?: number;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  lang,
  beforeImage,
  afterImage,
  qaMetrics,
  garmentName,
  garmentPrice,
}) => {
  const t = TRANSLATIONS[lang];
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    updateSlider(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      updateSlider(e.clientX);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const updateSlider = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  };

  // Zoom toggling
  const toggleZoom = () => {
    if (isZoomed) {
      setIsZoomed(false);
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
    } else {
      setIsZoomed(true);
      setZoomLevel(2.2);
    }
  };

  return (
    <div className="space-y-3">
      {/* Top QA badge & metadata */}
      <div className="flex items-center justify-between">
        {qaMetrics && (
          <div className="flex items-center gap-2 text-xs bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-full text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold">{t.qaVerified}</span>
            <span className="text-emerald-400/70">·</span>
            <span className="tabular-nums">{t.faceSimScore}: {qaMetrics.faceSimilarity}%</span>
            <span className="text-emerald-400/70">·</span>
            <span className="tabular-nums">{t.garmentFidScore}: {qaMetrics.garmentFidelity}%</span>
          </div>
        )}

        {/* Zoom button */}
        <button
          type="button"
          onClick={toggleZoom}
          className="flex items-center gap-1.5 text-xs text-stone-300 hover:text-white bg-stone-900 border border-stone-800 hover:border-stone-700 px-3 py-1 rounded-full transition-colors ml-auto"
        >
          {isZoomed ? <ZoomOut className="w-3.5 h-3.5 text-amber-500" /> : <ZoomIn className="w-3.5 h-3.5 text-amber-500" />}
          <span>{isZoomed ? t.closeZoom : t.zoomIn}</span>
        </button>
      </div>

      {/* Main Draggable Before / After Canvas Container */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className={`relative aspect-[3/4] w-full max-w-lg mx-auto bg-stone-950 rounded-2xl overflow-hidden border border-stone-800 shadow-2xl select-none cursor-ew-resize touch-none ${
          isZoomed ? 'overflow-auto cursor-grab' : ''
        }`}
      >
        {/* Under layer: After Image (With Garment) */}
        <div
          className="absolute inset-0 w-full h-full transition-transform duration-200"
          style={{
            transform: isZoomed ? `scale(${zoomLevel})` : 'none',
            transformOrigin: 'center center',
          }}
        >
          <img
            src={afterImage}
            alt="Virtual try-on result"
            className="w-full h-full object-cover pointer-events-none"
          />
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-stone-950/80 backdrop-blur-md text-amber-300 text-[11px] font-semibold border border-amber-900/60 shadow">
            {t.afterLabel}
          </div>
        </div>

        {/* Top layer: Before Image (Original Photo) clipped by slider position */}
        <div
          className="absolute inset-0 w-full h-full overflow-hidden transition-transform duration-200"
          style={{
            width: `${sliderPosition}%`,
            transform: isZoomed ? `scale(${zoomLevel})` : 'none',
            transformOrigin: 'left center',
          }}
        >
          <div
            className="relative w-full h-full"
            style={{
              width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
              height: '100%',
            }}
          >
            <img
              src={beforeImage}
              alt="Original customer photo"
              className="w-full h-full object-cover pointer-events-none"
            />
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-stone-950/80 backdrop-blur-md text-stone-300 text-[11px] font-semibold border border-stone-800 shadow">
              {t.beforeLabel}
            </div>
          </div>
        </div>

        {/* Draggable Divider Handle Line */}
        {!isZoomed && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.8)] flex items-center justify-center pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="w-8 h-8 rounded-full bg-amber-500 border-2 border-white shadow-xl flex items-center justify-center text-stone-950">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-stone-950">
                <path d="M8 7l-5 5 5 5V7zm8 0v10l5-5-5-5z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Slider assistance label */}
      <div className="flex items-center justify-between text-xs text-stone-400 px-1">
        <span>{t.sliderHelp}</span>
        {garmentName && (
          <span className="font-serif text-amber-200 truncate max-w-[200px]">
            {garmentName} {garmentPrice ? `(₹${garmentPrice.toLocaleString('en-IN')})` : ''}
          </span>
        )}
      </div>
    </div>
  );
};
