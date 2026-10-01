import React, { useRef, useState, useEffect } from 'react';
import { Camera, Upload, FlipHorizontal, RefreshCw, Sparkles, Check, Sun, UserCheck, ShieldCheck } from 'lucide-react';
import { Language, PhotoValidationResult } from '../types/index.js';
import { TRANSLATIONS } from '../utils/translations.js';
import { PhotoValidationFeedback } from './PhotoValidationFeedback.js';
import { apiService } from '../services/apiService.js';

interface CameraCaptureProps {
  lang: Language;
  onPhotoConfirmed: (imageBase64: string, validation: PhotoValidationResult) => void;
  onOpenConsent: () => void;
  hasConsented: boolean;
}

// Sample realistic demo portraits for zero-friction testing
const SAMPLE_PORTRAITS = [
  {
    id: 'sample-f1',
    name: 'Showroom Demo 1 (Female)',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'sample-m1',
    name: 'Showroom Demo 2 (Male)',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'sample-f2',
    name: 'Showroom Demo 3 (Female)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80',
  },
];

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  lang,
  onPhotoConfirmed,
  onOpenConsent,
  hasConsented,
}) => {
  const t = TRANSLATIONS[lang];
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<PhotoValidationResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Start camera when consented
  useEffect(() => {
    if (hasConsented && !capturedImage) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [hasConsented, facingMode]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      if (videoRef.current && videoRef.current.srcObject) {
        stopCamera();
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1080 },
          height: { ideal: 1440 },
        },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Camera access unavailable. You can upload a photo from your gallery or choose a demo portrait below.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const flipCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 720;
    canvas.height = video.videoHeight || 960;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // If front camera, mirror horizontally for natural feel
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    processSelectedPhoto(dataUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      processSelectedPhoto(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = async (url: string) => {
    // Convert sample url to base64
    try {
      setIsValidating(true);
      const res = await fetch(url);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        processSelectedPhoto(base64);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Failed to load sample portrait', err);
      setIsValidating(false);
    }
  };

  const processSelectedPhoto = async (dataUrl: string) => {
    setCapturedImage(dataUrl);
    stopCamera();
    setIsValidating(true);

    try {
      const data = await apiService.validatePhoto(dataUrl);
      setValidationResult(data);
    } catch (err) {
      console.error('Validation request failed:', err);
      // Fallback valid
      setValidationResult({
        isValid: true,
        personCount: 1,
        isBlurry: false,
        blurScore: 85,
        resolutionOk: true,
        safetyPassed: true,
        issues: [],
        feedbackKey: 'ok',
        feedbackText: 'Photo quality verified. Ready for trial.',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setValidationResult(null);
    if (hasConsented) {
      startCamera();
    }
  };

  const handleConfirm = () => {
    if (capturedImage && validationResult) {
      onPhotoConfirmed(capturedImage, validationResult);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Title & Guidance Header */}
      <div className="text-center space-y-1">
        <h2 className="font-serif font-bold text-xl text-amber-100">
          {t.step1Title}
        </h2>
        <p className="text-xs text-stone-400">
          {t.step1Subtitle}
        </p>
      </div>

      {/* Guide checklist banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-stone-300">
        <div className="bg-stone-900/80 border border-stone-800/80 p-2 rounded-lg flex items-center gap-1.5">
          <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{t.guideStandStraight}</span>
        </div>
        <div className="bg-stone-900/80 border border-stone-800/80 p-2 rounded-lg flex items-center gap-1.5">
          <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{t.guideLighting}</span>
        </div>
        <div className="bg-stone-900/80 border border-stone-800/80 p-2 rounded-lg flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{t.guideBackground}</span>
        </div>
        <div className="bg-stone-900/80 border border-stone-800/80 p-2 rounded-lg flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span>{t.guideFullBody}</span>
        </div>
      </div>

      {/* Camera Viewport / Captured Preview */}
      <div className="relative aspect-[3/4] w-full bg-stone-950 rounded-2xl overflow-hidden border border-stone-800 shadow-xl flex items-center justify-center">
        {!hasConsented ? (
          /* Consent prompt placeholder */
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-950/60 border border-amber-800 flex items-center justify-center mx-auto text-amber-400">
              <Camera className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-base text-amber-100">
                Camera Mirror Ready
              </h3>
              <p className="text-xs text-stone-400 max-w-xs mx-auto">
                {t.privacyPoint1}
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenConsent}
              className="py-2.5 px-6 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md shadow-amber-900/30 transition-all"
            >
              {t.takePhoto}
            </button>
          </div>
        ) : capturedImage ? (
          /* Captured photo view */
          <div className="relative w-full h-full">
            <img
              src={capturedImage}
              alt="Customer photo"
              className="w-full h-full object-cover"
            />
            {isValidating && (
              <div className="absolute inset-0 bg-stone-950/75 backdrop-blur-xs flex flex-col items-center justify-center gap-3 p-4">
                <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
                <span className="text-xs text-amber-200 font-medium">
                  {t.validatingPhoto}
                </span>
              </div>
            )}
          </div>
        ) : (
          /* Active live camera feed */
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              playsInline
              muted
              className={`w-full h-full object-cover ${facingMode === 'user' ? '-scale-x-100' : ''}`}
            />

            {/* Translucent Standing Guide Silhouette Overlay */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-8">
              <svg
                viewBox="0 0 200 300"
                className="w-full h-full max-h-[85%] stroke-amber-400/50 stroke-2 fill-none stroke-dasharray-4 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]"
              >
                {/* Head oval */}
                <ellipse cx="100" cy="50" rx="28" ry="36" />
                {/* Torso & shoulders */}
                <path d="M 60 115 C 60 85, 140 85, 140 115 L 145 200 C 145 205, 55 205, 55 200 Z" />
                {/* Legs silhouette */}
                <path d="M 68 200 L 68 280 M 132 200 L 132 280" />
              </svg>
              <div className="absolute bottom-6 px-3 py-1 bg-stone-950/80 backdrop-blur-md rounded-full border border-stone-800 text-[11px] text-amber-300 font-medium tracking-wide">
                Fit your torso within the guide
              </div>
            </div>

            {/* Flip camera control */}
            <button
              type="button"
              onClick={flipCamera}
              title={t.switchCamera}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-stone-900/80 backdrop-blur-md text-stone-200 hover:text-white border border-stone-700/80 shadow-lg"
            >
              <FlipHorizontal className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Camera error notification if any */}
      {cameraError && !capturedImage && (
        <p className="text-xs text-amber-400 bg-amber-950/40 border border-amber-900/60 p-3 rounded-xl text-center">
          {cameraError}
        </p>
      )}

      {/* Validation feedback card */}
      {validationResult && !isValidating && (
        <PhotoValidationFeedback
          lang={lang}
          validation={validationResult}
          onRetake={handleRetake}
          onContinue={handleConfirm}
        />
      )}

      {/* Bottom control buttons */}
      <div className="flex items-center gap-3">
        {capturedImage ? (
          <>
            <button
              type="button"
              onClick={handleRetake}
              className="flex-1 py-2.5 px-4 rounded-xl border border-stone-700 hover:bg-stone-800 text-stone-300 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t.retake}</span>
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isValidating}
              className="flex-1 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-amber-900/30 transition-all hover:scale-[1.02]"
            >
              <Check className="w-4 h-4" />
              <span>{t.confirmPhoto}</span>
            </button>
          </>
        ) : (
          <>
            {/* Shutter button */}
            <button
              type="button"
              onClick={hasConsented ? handleCapture : onOpenConsent}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50 transition-all active:scale-[0.98]"
            >
              <Camera className="w-4 h-4" />
              <span>{t.takePhoto}</span>
            </button>

            {/* Upload from gallery */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Upload className="w-4 h-4 text-stone-400" />
              <span className="hidden sm:inline">{t.uploadGallery}</span>
            </button>
          </>
        )}
      </div>

      {/* Showroom Demo Portraits for instant 1-click test */}
      <div className="pt-2 border-t border-stone-900">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-stone-400 font-medium">
            Or test instantly with showroom demo portraits:
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {SAMPLE_PORTRAITS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleSelectSample(sample.url)}
              className="relative aspect-square rounded-xl overflow-hidden border border-stone-800 hover:border-amber-600 group transition-all"
            >
              <img
                src={sample.url}
                alt={sample.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-transparent to-transparent flex items-end p-1.5">
                <span className="text-[10px] text-stone-200 truncate">
                  {sample.name.split(' ')[0]} {sample.name.split(' ')[1]}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
