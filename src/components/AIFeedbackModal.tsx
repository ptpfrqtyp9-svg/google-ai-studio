import React, { useState, useEffect } from 'react';
import { ArtAssessment } from '../types';
import { soundEffects } from '../utils/audioFeedback';
import {
  Sparkles,
  ArrowRight,
  RotateCcw,
  X,
  Award,
  Star,
  ChevronDown,
  ChevronUp,
  Activity,
  Flame,
  CheckCircle2,
} from 'lucide-react';

interface AIFeedbackModalProps {
  assessment: ArtAssessment | null;
  isOpen: boolean;
  onClose: () => void;
  onNextStep: () => void;
  onTryAgain: () => void;
  hasNextStep: boolean;
}

export const AIFeedbackModal: React.FC<AIFeedbackModalProps> = ({
  assessment,
  isOpen,
  onClose,
  onNextStep,
  onTryAgain,
  hasNextStep,
}) => {
  const [showDetailedPillars, setShowDetailedPillars] = useState(true);

  useEffect(() => {
    if (isOpen && assessment) {
      if (assessment.passed || assessment.score >= 68) {
        soundEffects.playSuccessChime();
      } else {
        soundEffects.playEncouragingTone();
      }
    }
  }, [isOpen, assessment]);

  if (!isOpen || !assessment) return null;

  const isPassed = assessment.passed || assessment.score >= 68;
  const starCount = assessment.score >= 85 ? 3 : assessment.score >= 68 ? 2 : 1;

  const pillars = assessment.pillars || {
    flowAndRhythm: 80,
    formAccuracy: 78,
    lineConfidence: 82,
    proportions: 80,
  };

  const badge = assessment.earnedBadge || {
    name: isPassed ? 'Solid Draughtsman' : 'Line Explorer',
    icon: isPassed ? '🌟' : '✏️',
    description: 'Keep drawing with shoulder confidence!',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-4 border-amber-200 overflow-hidden flex flex-col">
        {/* Playful Header Banner */}
        <div
          className={`p-5 text-white flex items-center justify-between transition-colors ${
            isPassed
              ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600'
              : 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500'
          }`}
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-13 h-13 rounded-2xl bg-white/25 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner animate-bounce">
              {badge.icon || (isPassed ? '🏆' : '🎨')}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                  {isPassed ? 'GREAT EXECUTION!' : 'ALMOST THERE!'}
                </h3>
                {assessment.coachingMode && (
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] uppercase font-bold tracking-wider">
                    {assessment.coachingMode}
                  </span>
                )}
              </div>
              <p className="text-xs text-white/95 font-bold">
                {isPassed
                  ? `⭐ Awarded: ${badge.name}`
                  : '🚀 Practice builds muscle memory and stroke rhythm!'}
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/35 flex items-center justify-center transition-all text-white font-bold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[72vh] bg-amber-50/20">
          {/* Big Star Celebration & Score Card */}
          <div className="flex flex-col items-center justify-center p-4 rounded-3xl bg-white border-2 border-amber-200 shadow-xs text-center">
            {/* 3 Playful Stars */}
            <div className="flex items-center space-x-2 mb-1">
              {[1, 2, 3].map((starNum) => (
                <div
                  key={starNum}
                  className={`transition-all duration-300 transform ${
                    starNum <= starCount
                      ? 'scale-110 text-amber-400 drop-shadow-[0_2px_4px_rgba(245,158,11,0.5)]'
                      : 'text-slate-200 scale-95'
                  }`}
                >
                  <Star className="w-9 h-9 fill-current stroke-[2.5]" />
                </div>
              ))}
            </div>

            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-4xl font-black text-slate-800">
                {assessment.score}
              </span>
              <span className="text-sm font-bold text-slate-400">/ 100 Points</span>
            </div>

            <span
              className={`mt-1.5 px-3.5 py-0.5 rounded-full text-xs font-black tracking-wide ${
                isPassed
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              {isPassed ? '🌟 STEP MASTERED!' : '✏️ READY FOR ANOTHER PASS'}
            </span>
          </div>

          {/* Coach Advice Speech Bubble */}
          <div className="flex items-start space-x-3 p-4 rounded-3xl bg-blue-50 border-2 border-blue-200">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl shrink-0 shadow-xs">
              👨‍🎨
            </div>
            <div className="space-y-1 flex-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-blue-700">
                Master Coach Tip
              </span>
              <p className="text-sm font-extrabold text-blue-950 leading-snug">
                "{assessment.actionableAdvice}"
              </p>
            </div>
          </div>

          {/* 4-Pillars Technique Breakdown */}
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-3.5 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-600" />
                <span>4-Pillar Craft Telemetry</span>
              </h4>
              <span className="text-[11px] font-bold text-slate-400">Balanced Grading</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Flow & Rhythm */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-600">
                  <span>🌊 Flow & Rhythm</span>
                  <span className="font-black text-blue-600">{pillars.flowAndRhythm}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${pillars.flowAndRhythm}%` }}
                  />
                </div>
              </div>

              {/* Form Accuracy */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-600">
                  <span>🎯 Form Accuracy</span>
                  <span className="font-black text-emerald-600">{pillars.formAccuracy}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${pillars.formAccuracy}%` }}
                  />
                </div>
              </div>

              {/* Line Confidence */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-600">
                  <span>⚡ Line Confidence</span>
                  <span className="font-black text-amber-600">{pillars.lineConfidence}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${pillars.lineConfidence}%` }}
                  />
                </div>
              </div>

              {/* Proportions & Spacing */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-600">
                  <span>📏 Proportions</span>
                  <span className="font-black text-purple-600">{pillars.proportions}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${pillars.proportions}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Observations Cards */}
          <div className="space-y-2">
            {/* Compliment */}
            <div className="flex items-start space-x-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
              <div className="mt-0.5 p-1 rounded-xl bg-emerald-200 text-emerald-800 font-bold text-xs">
                👍
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800">
                  What Worked Well
                </h4>
                <p className="text-xs sm:text-sm font-bold text-emerald-900 leading-snug">
                  {assessment.compliment}
                </p>
              </div>
            </div>

            {/* Core Flaw */}
            <div className="flex items-start space-x-3 p-3 rounded-2xl bg-amber-50 border border-amber-200">
              <div className="mt-0.5 p-1 rounded-xl bg-amber-200 text-amber-800 font-bold text-xs">
                👀
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-800">
                  Next Step to Polish
                </h4>
                <p className="text-xs sm:text-sm font-bold text-amber-900 leading-snug">
                  {assessment.coreFlaw}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bottom Bar */}
        <div className="p-4 bg-white border-t-2 border-amber-200 flex items-center justify-end space-x-3">
          <button
            id="modal-try-again"
            type="button"
            onClick={onTryAgain}
            className="btn-bouncy flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black text-amber-900 bg-amber-100 hover:bg-amber-200 border-2 border-amber-300 transition-all shadow-xs"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Redo Step ✏️</span>
          </button>

          {isPassed && hasNextStep ? (
            <button
              id="modal-next-step"
              type="button"
              onClick={onNextStep}
              className="btn-bouncy flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black text-white bg-emerald-500 hover:bg-emerald-600 shadow-[0_4px_0_#059669] active:shadow-none active:translate-y-1 transition-all"
            >
              <span>Next Lesson</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="modal-continue"
              type="button"
              onClick={onClose}
              className="btn-bouncy flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black text-white bg-blue-500 hover:bg-blue-600 shadow-[0_4px_0_#2563eb] active:shadow-none active:translate-y-1 transition-all"
            >
              <span>Keep Drawing 🎨</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
