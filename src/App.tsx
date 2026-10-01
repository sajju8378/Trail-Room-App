/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header.js';
import { CameraCapture } from './components/CameraCapture.js';
import { GarmentPicker } from './components/GarmentPicker.js';
import { TryOnProgress } from './components/TryOnProgress.js';
import { BeforeAfterSlider } from './components/BeforeAfterSlider.js';
import { ResultActions } from './components/ResultActions.js';
import { ConsentModal } from './components/ConsentModal.js';
import { AddGarmentModal } from './components/AddGarmentModal.js';
import { ReserveModal } from './components/ReserveModal.js';
import { ContinueOnPhoneModal } from './components/ContinueOnPhoneModal.js';
import { SideBySideCompareModal } from './components/SideBySideCompareModal.js';
import { AdminDashboardModal } from './components/AdminDashboardModal.js';
import { ArchitectureInfoModal } from './components/ArchitectureInfoModal.js';
import {
  CatalogueGarment,
  GarmentCategory,
  Language,
  PhotoValidationResult,
  ShowroomConfig,
  TryOnJob,
} from './types/index.js';
import { TRANSLATIONS } from './utils/translations.js';
import { apiService } from './services/apiService.js';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const t = TRANSLATIONS[lang];

  // Session ID for ephemeral privacy tracking
  const [sessionId] = useState<string>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('session') || 'sess_' + Math.random().toString(36).substring(2, 9);
  });

  // Showroom Configuration
  const [config, setConfig] = useState<ShowroomConfig>({
    name: 'Aura Atelier & Trial Room',
    tagline: 'Luxury Handlooms & Bespoke Bridal Lounge',
    address: 'Heritage Galleria, Road No. 36, Jubilee Hills, Hyderabad',
    phone: '+91 98765 43210',
    brandColor: '#b45309',
    currencySymbol: '₹',
    kioskPin: '1234',
    activeProviderId: 'gemini_vision_vton',
    autoDeleteHours: 24,
  });

  // Kiosk Mode Flag
  const [isKiosk, setIsKiosk] = useState<boolean>(() => {
    return localStorage.getItem('aura_kiosk_mode') === 'true';
  });

  // Flow Step: 1 = Photo, 2 = Garment, 3 = Generating, 4 = Result
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Customer Data
  const [hasConsented, setHasConsented] = useState<boolean>(false);
  const [customerPhoto, setCustomerPhoto] = useState<string | null>(null);
  const [photoValidation, setPhotoValidation] = useState<PhotoValidationResult | null>(null);

  // Garment Selection & Catalogue
  const [catalogue, setCatalogue] = useState<CatalogueGarment[]>([]);
  const [selectedGarment, setSelectedGarment] = useState<{
    imageUrl: string;
    name: string;
    category: GarmentCategory;
    sku?: string;
    price?: number;
    fabric?: string;
  } | null>(null);

  // Active Fitting Job & Session Trials History
  const [currentJob, setCurrentJob] = useState<TryOnJob | null>(null);
  const [sessionTrials, setSessionTrials] = useState<TryOnJob[]>([]);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Modals state
  const [isConsentOpen, setIsConsentOpen] = useState(false);
  const [isAddGarmentOpen, setIsAddGarmentOpen] = useState(false);
  const [isReserveOpen, setIsReserveOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isPhoneQrOpen, setIsPhoneQrOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);

  // Load initial data
  useEffect(() => {
    fetchShowroomConfig();
    fetchCatalogue();
  }, []);

  const fetchShowroomConfig = async () => {
    try {
      const data = await apiService.getShowroomConfig();
      setConfig(data);
    } catch (err) {
      console.warn('Config fetch fallback:', err);
    }
  };

  const fetchCatalogue = async () => {
    try {
      const data = await apiService.getCatalogue();
      setCatalogue(data);
    } catch (err) {
      console.warn('Catalogue fetch error:', err);
    }
  };

  // Toggle Kiosk mode with PIN check
  const handleToggleKiosk = () => {
    if (isKiosk) {
      const pin = window.prompt('Enter Staff PIN to exit Kiosk mode:');
      if (pin === config.kioskPin) {
        setIsKiosk(false);
        localStorage.setItem('aura_kiosk_mode', 'false');
      } else if (pin !== null) {
        alert('Incorrect PIN');
      }
    } else {
      setIsKiosk(true);
      localStorage.setItem('aura_kiosk_mode', 'true');
    }
  };

  // Quick reset after each customer session
  const handleQuickReset = async () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    try {
      await apiService.resetSession(sessionId);
    } catch (e) {
      console.error(e);
    }

    setCustomerPhoto(null);
    setPhotoValidation(null);
    setSelectedGarment(null);
    setCurrentJob(null);
    setSessionTrials([]);
    setCurrentStep(1);
  };

  // Step 1: Customer Photo confirmed
  const handlePhotoConfirmed = (image: string, validation: PhotoValidationResult) => {
    setCustomerPhoto(image);
    setPhotoValidation(validation);
    setCurrentStep(2); // Move to Garment Selection
  };

  // Step 2 -> Step 3: Trigger virtual try-on fitting
  const handleProceedToTrial = async () => {
    if (!customerPhoto || !selectedGarment) return;

    setCurrentStep(3); // Show Progress
    try {
      const data = await apiService.submitTryOn({
        sessionId,
        customerImage: customerPhoto,
        garmentImage: selectedGarment.imageUrl,
        garmentName: selectedGarment.name,
        garmentCategory: selectedGarment.category,
        garmentSku: selectedGarment.sku,
        garmentPrice: selectedGarment.price,
        providerId: config.activeProviderId,
      });

      const initialJob: TryOnJob = {
        id: data.jobId,
        sessionId,
        status: (data.status as any) || 'queued',
        progress: data.progress || 10,
        currentStepText: data.currentStepText || 'Starting virtual try-on...',
        customerImage: customerPhoto,
        garmentImage: selectedGarment.imageUrl,
        garmentName: selectedGarment.name,
        garmentCategory: selectedGarment.category,
        garmentSku: selectedGarment.sku,
        garmentPrice: selectedGarment.price,
        providerUsed: config.activeProviderId,
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };

      setCurrentJob(initialJob);
      startPollingJob(data.jobId);
    } catch (err: any) {
      console.error('Failed to submit job:', err);
      setCurrentStep(2);
      alert('Could not connect to try-on server. Please retry.');
    }
  };

  // Job Status Polling Loop
  const startPollingJob = (jobId: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const jobData = await apiService.getJobStatus(jobId);
        if (!jobData) return;

        setCurrentJob({ ...jobData });

        if (jobData.status === 'completed') {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setSessionTrials((prev) => {
            const exists = prev.some((t) => t.id === jobData.id);
            if (exists) return prev;
            return [jobData, ...prev];
          });
          setCurrentStep(4); // Move to Result Screen
        } else if (jobData.status === 'failed') {
          if (pollingRef.current) clearInterval(pollingRef.current);
          alert(jobData.error || 'Fitting process encountered an issue. Please retry.');
          setCurrentStep(2);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 1200);
  };

  // Clean polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        lang={lang}
        onLanguageChange={setLang}
        config={config}
        isKiosk={isKiosk}
        onToggleKiosk={handleToggleKiosk}
        onQuickReset={handleQuickReset}
        onOpenPhoneQr={() => setIsPhoneQrOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        currentStep={currentStep}
      />

      {/* Step Indicator Navigation Bar */}
      <nav aria-label="Fitting progress" className="bg-stone-900/50 border-b border-stone-800/80 px-4 py-2 text-xs">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`flex items-center gap-2 py-1 px-2.5 rounded-lg transition-colors ${
              currentStep === 1
                ? 'bg-amber-950/80 text-amber-200 border border-amber-800/80 font-semibold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-stone-800 text-[10px] flex items-center justify-center font-bold text-amber-400">
              1
            </span>
            <span>{t.step1Title}</span>
          </button>

          <span className="text-stone-700" aria-hidden="true">→</span>

          <button
            type="button"
            onClick={() => customerPhoto && setCurrentStep(2)}
            disabled={!customerPhoto}
            className={`flex items-center gap-2 py-1 px-2.5 rounded-lg transition-colors ${
              currentStep === 2
                ? 'bg-amber-950/80 text-amber-200 border border-amber-800/80 font-semibold'
                : customerPhoto
                ? 'text-stone-400 hover:text-stone-200'
                : 'text-stone-700 cursor-not-allowed'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-stone-800 text-[10px] flex items-center justify-center font-bold text-amber-400">
              2
            </span>
            <span>{t.step2Title}</span>
          </button>

          <span className="text-stone-700" aria-hidden="true">→</span>

          <button
            type="button"
            disabled={currentStep < 3}
            className={`flex items-center gap-2 py-1 px-2.5 rounded-lg transition-colors ${
              currentStep >= 3
                ? 'bg-amber-950/80 text-amber-200 border border-amber-800/80 font-semibold'
                : 'text-stone-700 cursor-not-allowed'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-stone-800 text-[10px] flex items-center justify-center font-bold text-amber-400">
              3
            </span>
            <span>{t.step3Title}</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        {/* Step 1: Customer Photo Capture */}
        {currentStep === 1 && (
          <CameraCapture
            lang={lang}
            onPhotoConfirmed={handlePhotoConfirmed}
            onOpenConsent={() => setIsConsentOpen(true)}
            hasConsented={hasConsented}
          />
        )}

        {/* Step 2: Garment Selection */}
        {currentStep === 2 && (
          <GarmentPicker
            lang={lang}
            catalogue={catalogue}
            selectedGarment={selectedGarment}
            onSelectGarment={(g) => setSelectedGarment(g)}
            onOpenAddGarment={() => setIsAddGarmentOpen(true)}
            onProceedToTrial={handleProceedToTrial}
          />
        )}

        {/* Step 3: Virtual Trial Progress Screen (< 30s target) */}
        {currentStep === 3 && currentJob && (
          <TryOnProgress lang={lang} job={currentJob} />
        )}

        {/* Step 4: Try-On Result Screen with Before/After Slider */}
        {currentStep === 4 && currentJob && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h2 className="font-serif font-bold text-xl text-amber-100">
                {t.resultTitle}
              </h2>
              <p className="text-xs text-stone-400">
                {currentJob.garmentName} · Exact face & skin tone preserved
              </p>
            </div>

            {/* Split before / after interactive slider */}
            <BeforeAfterSlider
              lang={lang}
              beforeImage={currentJob.customerImage}
              afterImage={currentJob.resultImageUrl || currentJob.customerImage}
              qaMetrics={currentJob.qaMetrics}
              garmentName={currentJob.garmentName}
              garmentPrice={currentJob.garmentPrice}
            />

            {/* Action buttons (Reserve, WhatsApp, Save, Compare) */}
            <ResultActions
              lang={lang}
              job={currentJob}
              onTryAnother={() => setCurrentStep(2)}
              onRetryPhoto={() => setCurrentStep(1)}
              onOpenReserve={() => setIsReserveOpen(true)}
              onOpenCompare={() => setIsCompareOpen(true)}
              totalSessionTrials={sessionTrials.length}
            />
          </div>
        )}
      </main>

      {/* Footer info bar */}
      <footer className="border-t border-stone-900 px-4 py-3 bg-stone-950 text-center text-xs text-stone-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {config.name} · {config.address}
          </span>
          <span className="text-[11px] text-stone-600">
            Ephemeral fitting session: Auto-deleted after trial. No images stored or trained on.
          </span>
        </div>
      </footer>

      {/* Modals */}
      <ConsentModal
        lang={lang}
        isOpen={isConsentOpen}
        onAccept={() => {
          setHasConsented(true);
          setIsConsentOpen(false);
        }}
        onDecline={() => setIsConsentOpen(false)}
      />

      <AddGarmentModal
        lang={lang}
        isOpen={isAddGarmentOpen}
        onClose={() => setIsAddGarmentOpen(false)}
        onGarmentAdded={(newGarment) => {
          setCatalogue((prev) => [newGarment, ...prev]);
        }}
      />

      {currentJob && (
        <ReserveModal
          lang={lang}
          isOpen={isReserveOpen}
          onClose={() => setIsReserveOpen(false)}
          job={currentJob}
        />
      )}

      <ContinueOnPhoneModal
        lang={lang}
        isOpen={isPhoneQrOpen}
        onClose={() => setIsPhoneQrOpen(false)}
        sessionId={sessionId}
      />

      <SideBySideCompareModal
        lang={lang}
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        trials={sessionTrials}
        onSelectForReserve={(trial) => {
          setCurrentJob(trial);
          setIsReserveOpen(true);
        }}
        onRemoveTrial={(id) => {
          setSessionTrials((prev) => prev.filter((t) => t.id !== id));
        }}
      />

      <AdminDashboardModal
        lang={lang}
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        config={config}
        onUpdateConfig={(newCfg) => setConfig((prev) => ({ ...prev, ...newCfg }))}
      />

      <ArchitectureInfoModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />
    </div>
  );
}
