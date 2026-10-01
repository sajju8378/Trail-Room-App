import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, Clock, ShieldCheck, Scissors, UserCheck, Layers, Eye } from 'lucide-react';
import { Language, TryOnJob } from '../types/index.js';
import { TRANSLATIONS } from '../utils/translations.js';

interface TryOnProgressProps {
  lang: Language;
  job: TryOnJob;
}

const STAGES = [
  { key: 'segmenting', label: 'Human Segmentation', icon: Scissors, pct: 15 },
  { key: 'pose_estimation', label: 'Pose & Shoulder Alignment', icon: UserCheck, pct: 30 },
  { key: 'garment_warping', label: 'Fabric Drape & Zari Warping', icon: Layers, pct: 50 },
  { key: 'tryon_diffusion', label: 'Diffusion Inpainting', icon: Sparkles, pct: 75 },
  { key: 'face_restoration', label: 'Face & Likeness Restoration', icon: Eye, pct: 88 },
  { key: 'qa_check', label: 'Automated Identity QA Check', icon: ShieldCheck, pct: 96 },
];

export const TryOnProgress: React.FC<TryOnProgressProps> = ({ lang, job }) => {
  const t = TRANSLATIONS[lang];
  const [elapsedSec, setElapsedSec] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-md mx-auto p-6 bg-stone-900/90 border border-stone-800 rounded-3xl shadow-2xl space-y-6 animate-fadeIn">
      {/* Visual Avatar / Fitting Ring */}
      <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
        {/* Glowing circular progress ring */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="44"
            className="stroke-stone-800 stroke-[5] fill-none"
          />
          <circle
            cx="50"
            cy="50"
            r="44"
            className="stroke-amber-500 stroke-[5] fill-none transition-all duration-500 ease-out"
            strokeDasharray={276.4}
            strokeDashoffset={276.4 - (276.4 * job.progress) / 100}
            strokeLinecap="round"
          />
        </svg>

        {/* Thumbnail Preview in the middle */}
        <div className="absolute inset-3 rounded-full overflow-hidden border-2 border-stone-800 shadow-inner flex items-center justify-center bg-stone-950">
          <img
            src={job.garmentImage}
            alt="Garment"
            className="w-full h-full object-cover animate-pulse"
          />
        </div>

        <div className="absolute -bottom-2 px-2.5 py-0.5 rounded-full bg-amber-600 text-stone-950 text-[11px] font-bold tracking-wider shadow">
          {job.progress}%
        </div>
      </div>

      {/* Main Status Text */}
      <div className="text-center space-y-1">
        <h3 className="font-serif font-bold text-lg text-amber-100">
          {t.generatingTrial}
        </h3>
        <p className="text-xs text-amber-300 font-medium animate-pulse min-h-[20px]">
          {job.currentStepText || t.step_diffusion}
        </p>
        <div className="flex items-center justify-center gap-3 pt-1 text-xs text-stone-400">
          <span className="flex items-center gap-1 tabular-nums">
            <Clock className="w-3.5 h-3.5 text-stone-500" />
            {elapsedSec}s elapsed
          </span>
          <span>·</span>
          <span>{t.progressTarget}</span>
        </div>
      </div>

      {/* Pipeline 6-Stage Checklist */}
      <div className="space-y-2 bg-stone-950/60 border border-stone-800/80 rounded-2xl p-4">
        {STAGES.map((stage, idx) => {
          const isDone = job.progress >= stage.pct;
          const isCurrent =
            job.progress < stage.pct &&
            (idx === 0 || job.progress >= STAGES[idx - 1].pct);
          const Icon = stage.icon;

          return (
            <div
              key={stage.key}
              className={`flex items-center justify-between text-xs py-1.5 px-2 rounded-lg transition-colors ${
                isCurrent
                  ? 'bg-amber-950/40 text-amber-200 border border-amber-900/50'
                  : isDone
                  ? 'text-stone-300'
                  : 'text-stone-600'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isDone ? 'text-amber-500' : isCurrent ? 'text-amber-400 animate-spin' : 'text-stone-700'
                  }`}
                />
                <span className="font-medium text-[11px]">{stage.label}</span>
              </div>

              {isDone ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : isCurrent ? (
                <span className="text-[10px] text-amber-400 font-mono animate-pulse">Running</span>
              ) : (
                <span className="text-[10px] text-stone-700 font-mono">Pending</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Identity Guarantee Badge */}
      <div className="flex items-center justify-center gap-2 text-xs text-stone-400">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span className="text-[11px]">100% Face & Skin Tone Preservation Guarantee</span>
      </div>
    </div>
  );
};
