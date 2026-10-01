import React from 'react';
import { X, Cpu, DollarSign, Layers, ShieldCheck, CheckCircle2, ArrowRight, Code } from 'lucide-react';
import { Language } from '../types/index.js';

interface ArchitectureInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureInfoModal: React.FC<ArchitectureInfoModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-serif font-bold text-lg text-amber-100">
                Virtual Try-On Pipeline & Architecture
              </h3>
              <p className="text-xs text-stone-400">
                High-fidelity identity preservation and provider cost analysis
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

        {/* 1. Multi-Stage Pipeline */}
        <div className="space-y-3">
          <h4 className="font-serif font-bold text-sm text-amber-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-500" />
            <span>Dedicated 6-Stage Virtual Fitting Pipeline</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-3 bg-stone-950/70 border border-stone-800/80 rounded-xl space-y-1">
              <span className="font-bold text-amber-300">1. Person Segmentation & Pose</span>
              <p className="text-stone-400 text-[11px] leading-relaxed">
                Extracts human agnostic mask, shoulder keypoints, torso angle, and leg silhouettes. Prevents garment bleed into background.
              </p>
            </div>
            <div className="p-3 bg-stone-950/70 border border-stone-800/80 rounded-xl space-y-1">
              <span className="font-bold text-amber-300">2. Garment Drape & Border Warping</span>
              <p className="text-stone-400 text-[11px] leading-relaxed">
                For sarees, arranges pleats and pallu over left shoulder. For kurtas/sherwanis, aligns collar plackets and hem boundaries.
              </p>
            </div>
            <div className="p-3 bg-stone-950/70 border border-stone-800/80 rounded-xl space-y-1">
              <span className="font-bold text-amber-300">3. Inpainting / Diffusion Engine</span>
              <p className="text-stone-400 text-[11px] leading-relaxed">
                Applies cross-attention condition guidance from garment texture, zari embroidery, and weaves to generate realistic cloth folds.
              </p>
            </div>
            <div className="p-3 bg-stone-950/70 border border-stone-800/80 rounded-xl space-y-1">
              <span className="font-bold text-amber-300">4. Face & Identity Restoration</span>
              <p className="text-stone-400 text-[11px] leading-relaxed">
                Pastes the ORIGINAL face, eyes, smile, skin tone, hair, and neck back with feathered edge blending to guarantee 100% zero identity drift.
              </p>
            </div>
            <div className="p-3 bg-stone-950/70 border border-stone-800/80 rounded-xl space-y-1">
              <span className="font-bold text-amber-300">5. Automated QA Auditor</span>
              <p className="text-stone-400 text-[11px] leading-relaxed">
                Evaluates Face Identity Similarity and Garment Color/Weave Fidelity scores. Rejects or warns if overall score &lt; 80%.
              </p>
            </div>
            <div className="p-3 bg-stone-950/70 border border-stone-800/80 rounded-xl space-y-1">
              <span className="font-bold text-amber-300">6. Privacy & Auto-Delete Purge</span>
              <p className="text-stone-400 text-[11px] leading-relaxed">
                Photos are stored strictly in-memory with session TTL (24 hours). Staff 1-click Quick Reset erases customer portraits instantly.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Provider Comparison & Cost Analysis */}
        <div className="space-y-3">
          <h4 className="font-serif font-bold text-sm text-amber-200 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-500" />
            <span>Model / API Options & Cost Per Try-On</span>
          </h4>
          <div className="bg-stone-950/70 border border-stone-800 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-stone-900/80 text-stone-400 text-[11px] border-b border-stone-800">
                <tr>
                  <th className="py-2.5 px-3">Provider / Model</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Avg Latency</th>
                  <th className="py-2.5 px-3">Cost / Try-On</th>
                  <th className="py-2.5 px-3">Identity Lock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60 text-stone-300">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-amber-200">
                    Gemini Neural Try-On (Flash Image)
                  </td>
                  <td className="py-2.5 px-3 text-stone-400">Multimodal Conditioning</td>
                  <td className="py-2.5 px-3 tabular-nums">12 - 16s</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-amber-400">~$0.039</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-medium">100% (Face Patch)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-amber-200">
                    IDM-VTON / CatVTON (Hosted Replicate/Fal)
                  </td>
                  <td className="py-2.5 px-3 text-stone-400">Garment UNet Diffusion</td>
                  <td className="py-2.5 px-3 tabular-nums">16 - 22s</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-amber-400">~$0.028</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-medium">100% (Face Patch)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-amber-200">
                    Self-Hosted GPU Worker (AWS L4 / RunPod)
                  </td>
                  <td className="py-2.5 px-3 text-stone-400">Diffusers FastAPI Queue</td>
                  <td className="py-2.5 px-3 tabular-nums">8 - 12s</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">~$0.008</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-medium">100% (Face Patch)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-amber-200">
                    Aura High-Speed Warp Engine (Edge)
                  </td>
                  <td className="py-2.5 px-3 text-stone-400">Deterministic Mesh Warp</td>
                  <td className="py-2.5 px-3 tabular-nums">4 - 6s</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">&lt; $0.005</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-medium">100% (Exact Face)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Swappable Backend Interface snippet */}
        <div className="space-y-2">
          <h4 className="font-serif font-bold text-sm text-amber-200 flex items-center gap-2">
            <Code className="w-4 h-4 text-amber-500" />
            <span>Swappable Provider Interface Pattern</span>
          </h4>
          <pre className="bg-stone-950 border border-stone-800 rounded-xl p-3 text-[11px] font-mono text-stone-300 overflow-x-auto">
{`// server/tryon/providers.ts
export interface IVirtualTryOnProvider {
  id: string;
  name: string;
  costPerTryOnUSD: number;
  averageLatencySec: number;
  execute(params: {
    customerImageBase64: string;
    garmentImageBase64: string;
    garmentCategory: GarmentCategory;
    onProgress: (status, stepText, progressPct) => void;
  }): Promise<TryOnGenerationResult>;
}`}
          </pre>
          <p className="text-[11px] text-stone-400">
            Showroom administrators can switch active engines on the fly in Admin Settings without altering client code.
          </p>
        </div>

        {/* Close Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
