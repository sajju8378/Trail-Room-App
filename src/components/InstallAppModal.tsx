import React, { useState, useEffect } from 'react';
import { X, Smartphone, Download, CheckCircle2, Play, ExternalLink, Terminal, ShieldCheck } from 'lucide-react';
import { Language } from '../types/index.js';

interface InstallAppModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallPwa = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5 text-xs text-stone-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-serif font-bold text-lg text-amber-100">
                Install Android App & Build APK
              </h3>
              <p className="text-xs text-stone-400">
                Deploy TrialRoom to Android tablets, kiosks, and customer phones
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Option 1: Automated GitHub Actions APK Build (Recommended) */}
        <div className="p-4 bg-stone-950/70 border border-amber-900/60 rounded-2xl space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-serif font-bold text-sm text-amber-200 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-amber-400" />
              <span>1. Download Cloud-Built APK (GitHub Actions)</span>
            </span>
            <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800">
              Automated
            </span>
          </div>
          <p className="text-stone-400 leading-relaxed text-[11px]">
            The repository includes a dedicated workflow (<code className="text-amber-300 font-mono">.github/workflows/build-apk.yml</code>) that automatically compiles the native Android APK in the cloud whenever you push to GitHub.
          </p>
          <div className="space-y-1.5 pt-1">
            <p className="text-stone-300 font-medium">How to get the APK:</p>
            <ol className="list-decimal list-inside space-y-1 text-stone-400 pl-1">
              <li>Push your code to GitHub (<code className="text-amber-300 font-mono">git push origin main</code>).</li>
              <li>Open your repository on GitHub and click the <strong className="text-stone-200">Actions</strong> tab.</li>
              <li>Click on the running or completed <strong className="text-amber-300">Build &amp; Deploy Android APK</strong> workflow.</li>
              <li>Under <strong className="text-stone-200">Artifacts</strong>, click <strong className="text-emerald-400">TrialRoom-Showroom-Android-APK</strong> to download <code className="text-stone-200 font-mono">app-debug.apk</code>.</li>
            </ol>
          </div>
        </div>

        {/* Option 2: Instant PWA Install on Android */}
        <div className="p-4 bg-stone-950/70 border border-stone-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-serif font-bold text-sm text-stone-100 flex items-center gap-1.5">
              <Play className="w-4 h-4 text-emerald-400" />
              <span>2. Install Directly from Mobile Browser (PWA)</span>
            </span>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
              No APK Needed
            </span>
          </div>
          <p className="text-stone-400 leading-relaxed text-[11px]">
            Open your showroom web URL (<code className="text-amber-300 font-mono">https://sajju8378.github.io/Trail-Room-App/</code>) in Chrome on any Android tablet or phone:
          </p>
          <ul className="list-disc list-inside space-y-1 text-stone-400 pl-1 text-[11px]">
            <li>Tap the browser menu <strong className="text-stone-200">(⋮)</strong> and select <strong className="text-amber-300 font-medium">"Install app"</strong> or <strong className="text-amber-300 font-medium">"Add to Home screen"</strong>.</li>
            <li>Launches in immersive standalone full-screen with full camera mirror support.</li>
          </ul>

          {isInstallable && (
            <button
              type="button"
              onClick={handleInstallPwa}
              className="mt-2 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow"
            >
              <Smartphone className="w-4 h-4" />
              <span>Install TrialRoom App on this Device</span>
            </button>
          )}
        </div>

        {/* Option 3: Local Android Studio Build */}
        <div className="p-4 bg-stone-950/70 border border-stone-800 rounded-2xl space-y-2">
          <div className="flex items-center gap-1.5 font-serif font-bold text-sm text-stone-100">
            <Terminal className="w-4 h-4 text-sky-400" />
            <span>3. Build Locally on Your Computer (Command Line)</span>
          </div>
          <p className="text-stone-400 text-[11px]">
            The native Capacitor Android project is already initialized in <code className="text-amber-300 font-mono">/android</code>.
          </p>
          <pre className="p-2.5 bg-stone-950 rounded-xl border border-stone-800 font-mono text-[11px] text-stone-300 overflow-x-auto">
{`# 1. Build web assets and sync with native Android
npm run build
npx cap sync android

# 2. Build Debug APK using Gradle
cd android
./gradlew assembleDebug

# Output APK location:
# android/app/build/outputs/apk/debug/app-debug.apk`}
          </pre>
        </div>

        {/* Close Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
