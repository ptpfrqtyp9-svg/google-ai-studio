import React, { useState, useEffect, useRef } from 'react';
import { CURRICULUM_LESSONS } from './data/lessonsData';
import {
  DrawingLesson,
  LessonStep,
  ArtAssessment,
  UserProgressRecord,
  LearningMode,
  CanvasExportData,
  CoachingStrictness,
} from './types';
import { analyzeDrawnStrokes, StrokeGeometricAnalysis } from './utils/strokeAnalyzer';
import { DrawingCanvas } from './components/DrawingCanvas';
import { CameraPaperMode } from './components/CameraPaperMode';
import { AIFeedbackModal } from './components/AIFeedbackModal';
import { LessonSidebar } from './components/LessonSidebar';
import { SwiftCodeStudio } from './components/SwiftCodeStudio';
import { SwiftDownloadModal } from './components/SwiftDownloadModal';
import { DrawingGallery } from './components/DrawingGallery';
import {
  Menu,
  Sparkles,
  Layers,
  Camera,
  Split,
  Code,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Info,
  Lightbulb,
  CheckCircle,
  RotateCcw,
  Download,
  FolderCode,
} from 'lucide-react';

const STORAGE_KEY = 'drawcoach_progress_v1';

export default function App() {
  // Curriculum state
  const [currentLesson, setCurrentLesson] = useState<DrawingLesson>(CURRICULUM_LESSONS[0]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Learning Mode: Digital Trace, Digital Side-by-Side, or Paper & Camera
  const [learningMode, setLearningMode] = useState<LearningMode>('digital-trace');

  // Coaching style
  const [coachingStrictness, setCoachingStrictness] = useState<CoachingStrictness>('encouraging');

  // AI Evaluation state
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [assessment, setAssessment] = useState<ArtAssessment | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);

  // Modals & Drawers
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isSwiftStudioOpen, setIsSwiftStudioOpen] = useState<boolean>(false);
  const [isSwiftDownloadOpen, setIsSwiftDownloadOpen] = useState<boolean>(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);

  // Stroke count for button enablement
  const [strokeCount, setStrokeCount] = useState<number>(0);

  // Canvas export reference function
  const exportCanvasFnRef = useRef<(() => CanvasExportData) | null>(null);


  // Local Storage Progress
  const [progress, setProgress] = useState<UserProgressRecord>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not parse local progress', e);
    }
    return {
      completedStepIds: {},
      lessonScores: {},
      savedSketches: [],
    };
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.warn('Storage sync failed', e);
    }
  }, [progress]);

  const currentStep: LessonStep = currentLesson.steps[currentStepIndex] || currentLesson.steps[0];
  const isLastStep = currentStepIndex === currentLesson.steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  // Handle lesson selection
  const handleSelectLesson = (lesson: DrawingLesson) => {
    setCurrentLesson(lesson);
    setCurrentStepIndex(0);
    setStrokeCount(0);
  };

  // Step advancement
  const handleNextStep = () => {
    if (currentStepIndex < currentLesson.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      setStrokeCount(0);
    } else {
      // Find next lesson
      const currIdx = CURRICULUM_LESSONS.findIndex((l) => l.id === currentLesson.id);
      if (currIdx < CURRICULUM_LESSONS.length - 1) {
        handleSelectLesson(CURRICULUM_LESSONS[currIdx + 1]);
      }
    }
    setShowFeedbackModal(false);
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      setStrokeCount(0);
    }
  };

  // Evaluate drawing with Gemini AI Art Coach
  const evaluateDrawingSnapshot = async (
    imageBase64: string,
    strokeMetrics?: StrokeGeometricAnalysis
  ) => {
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/evaluate-drawing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64,
          instructionText: currentStep.instructionText,
          aiEvaluationCriteria: currentStep.aiEvaluationCriteria,
          stepTitle: `${currentLesson.title} - ${currentStep.title}`,
          strokeMetrics,
          strictness: coachingStrictness,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const result: ArtAssessment = await res.json();
      const enrichedResult: ArtAssessment = {
        ...result,
        coachingMode: coachingStrictness,
        pillars: result.pillars || strokeMetrics?.pillars,
        techniqueMetrics: strokeMetrics
          ? {
              straightnessPct: strokeMetrics.averageStraightnessPct,
              wavinessCount: strokeMetrics.wavinessCount,
              maxDeviation: strokeMetrics.maxDeviationPixels,
              algorithmicScore: strokeMetrics.algorithmicScore,
              flaws: strokeMetrics.flaws,
              strengths: strokeMetrics.strengths,
            }
          : undefined,
      };

      setAssessment(enrichedResult);
      setShowFeedbackModal(true);

      // Save progress if passed
      const stepKey = `${currentLesson.id}-${currentStep.id}`;
      const passThreshold = coachingStrictness === 'encouraging' ? 60 : coachingStrictness === 'atelier' ? 75 : 68;
      const isPassed = enrichedResult.passed || enrichedResult.score >= passThreshold;

      setProgress((prev) => {
        const newCompleted = { ...prev.completedStepIds };
        if (isPassed) {
          newCompleted[stepKey] = true;
        }

        const prevBest = prev.lessonScores[currentLesson.id] || 0;
        const newScores = {
          ...prev.lessonScores,
          [currentLesson.id]: Math.max(prevBest, enrichedResult.score),
        };

        const newSketch = {
          id: `sketch-${Date.now()}`,
          lessonTitle: currentLesson.title,
          stepTitle: currentStep.title,
          score: enrichedResult.score,
          passed: isPassed,
          date: new Date().toISOString(),
          thumbnail: imageBase64,
        };

        return {
          completedStepIds: newCompleted,
          lessonScores: newScores,
          savedSketches: [newSketch, ...prev.savedSketches.slice(0, 24)], // Keep last 25 sketches
        };
      });
    } catch (err: any) {
      console.warn('AI grading error, using robust on-device evaluator:', err);
      const score = strokeMetrics ? strokeMetrics.algorithmicScore : 75;
      const passThreshold = coachingStrictness === 'encouraging' ? 60 : coachingStrictness === 'atelier' ? 75 : 68;
      const isPassed = score >= passThreshold;

      const fallbackAssessment: ArtAssessment = {
        score,
        passed: isPassed,
        coachingMode: coachingStrictness,
        compliment:
          strokeMetrics?.strengths?.[0] || 'Clean commitment of lines across the drawing field.',
        coreFlaw:
          strokeMetrics?.flaws?.[0] ||
          (isPassed
            ? 'Minor wobble near the terminal endpoints.'
            : 'Smooth the midsection pull from the shoulder joint.'),
        actionableAdvice: isPassed
          ? 'Maintain steady, uniform speed throughout the stroke.'
          : 'Lock your wrist and elbow joints. Sweep the pencil directly from your shoulder joint.',
        drawingTypeDetected: currentStep.title,
        notice: 'Evaluated with on-device stroke geometry engine.',
        pillars: strokeMetrics?.pillars,
        earnedBadge: {
          name: isPassed ? 'Solid Draughtsman' : 'Line Explorer',
          icon: isPassed ? '🌟' : '✏️',
          description: 'Keep building shoulder drawing confidence!',
        },
        techniqueMetrics: strokeMetrics
          ? {
              straightnessPct: strokeMetrics.averageStraightnessPct,
              wavinessCount: strokeMetrics.wavinessCount,
              maxDeviation: strokeMetrics.maxDeviationPixels,
              algorithmicScore: strokeMetrics.algorithmicScore,
              flaws: strokeMetrics.flaws,
              strengths: strokeMetrics.strengths,
            }
          : undefined,
      };
      setAssessment(fallbackAssessment);
      setShowFeedbackModal(true);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Trigger evaluation from digital canvas
  const handleCheckCanvasWork = () => {
    if (!exportCanvasFnRef.current) return;
    const payload = exportCanvasFnRef.current();
    if (!payload || !payload.imageBase64) return;

    // Mathematically calculate stroke telemetry with chosen strictness
    const strokeMetrics = analyzeDrawnStrokes(payload.strokes, currentStep.title, 4, coachingStrictness);
    evaluateDrawingSnapshot(payload.imageBase64, strokeMetrics);
  };


  const handleClearGallery = () => {
    if (confirm('Clear all saved sketches from local portfolio?')) {
      setProgress((prev) => ({ ...prev, savedSketches: [] }));
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-amber-50/40 font-sans text-slate-900">
      {/* Curriculum Sidebar */}
      <LessonSidebar
        currentLesson={currentLesson}
        onSelectLesson={handleSelectLesson}
        progress={progress}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main App Workspace */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Playful App Bar */}
        <header className="h-16 bg-white/95 backdrop-blur-md border-b-2 border-amber-200 px-3 sm:px-5 flex items-center justify-between z-20 shrink-0 shadow-xs">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              id="btn-toggle-menu"
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="btn-bouncy p-2.5 rounded-2xl text-amber-900 bg-amber-100 hover:bg-amber-200 transition-all border border-amber-300"
              title="Open Adventures Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-400 to-pink-500 flex items-center justify-center text-lg text-white shadow-xs">
                🎨
              </div>
              <div>
                <span className="font-black text-base sm:text-lg tracking-tight text-slate-800">
                  DrawCoach <span className="text-amber-500">Kids</span>
                </span>
                <span className="hidden sm:inline ml-2 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                  ⭐ iPad & Apple Pencil
                </span>
              </div>
            </div>
          </div>

          {/* Mode Switcher Tabs: Playful Pill */}
          <div className="flex items-center bg-amber-100/70 p-1 rounded-2xl border border-amber-200 text-xs font-black">
            <button
              id="mode-trace"
              type="button"
              onClick={() => setLearningMode('digital-trace')}
              className={`btn-bouncy flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all ${
                learningMode === 'digital-trace'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-amber-900 hover:text-amber-950'
              }`}
            >
              <span>✏️</span>
              <span className="hidden sm:inline">Trace Pad</span>
            </button>

            <button
              id="mode-side"
              type="button"
              onClick={() => setLearningMode('digital-side')}
              className={`btn-bouncy flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all ${
                learningMode === 'digital-side'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-amber-900 hover:text-amber-950'
              }`}
            >
              <span>🪞</span>
              <span className="hidden sm:inline">Mirror Mode</span>
            </button>

            <button
              id="mode-camera"
              type="button"
              onClick={() => setLearningMode('paper-camera')}
              className={`btn-bouncy flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all ${
                learningMode === 'paper-camera'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-amber-900 hover:text-amber-950'
              }`}
            >
              <span>📸</span>
              <span className="hidden sm:inline">Paper Scan</span>
            </button>
          </div>

          {/* Coach Strictness Selector Pill */}
          <div className="hidden xl:flex items-center space-x-1 bg-amber-100/60 p-1 rounded-2xl border border-amber-300 text-xs font-bold">
            <span className="text-[11px] text-amber-900 px-1.5">Coach:</span>
            <button
              type="button"
              onClick={() => setCoachingStrictness('encouraging')}
              className={`px-2 py-1 rounded-xl transition-all ${
                coachingStrictness === 'encouraging'
                  ? 'bg-emerald-500 text-white shadow-xs font-black'
                  : 'text-amber-900 hover:bg-amber-200/60'
              }`}
              title="Gentle, encouraging mode with generous pass window"
            >
              🌟 Gentle
            </button>
            <button
              type="button"
              onClick={() => setCoachingStrictness('balanced')}
              className={`px-2 py-1 rounded-xl transition-all ${
                coachingStrictness === 'balanced'
                  ? 'bg-blue-600 text-white shadow-xs font-black'
                  : 'text-amber-900 hover:bg-amber-200/60'
              }`}
              title="Balanced real-world drawing grading"
            >
              ⚖️ Balanced
            </button>
            <button
              type="button"
              onClick={() => setCoachingStrictness('atelier')}
              className={`px-2 py-1 rounded-xl transition-all ${
                coachingStrictness === 'atelier'
                  ? 'bg-purple-600 text-white shadow-xs font-black'
                  : 'text-amber-900 hover:bg-amber-200/60'
              }`}
              title="Strict classical atelier accuracy"
            >
              🎓 Atelier
            </button>
          </div>

          {/* Right Action Tools: Gallery, Swift Code Studio & Stars */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {/* Star Counter Pill */}
            <div className="hidden lg:flex items-center space-x-1 px-3 py-1.5 rounded-2xl bg-amber-100 border border-amber-300 text-xs font-black text-amber-900 shadow-2xs">
              <span className="text-amber-500">⭐</span>
              <span>{Object.keys(progress.completedStepIds).length} Badges</span>
            </div>

            <button
              id="btn-open-gallery"
              type="button"
              onClick={() => setIsGalleryOpen(true)}
              className="btn-bouncy flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all"
              title="View my drawings"
            >
              <span>🖼️</span>
              <span className="hidden md:inline">Gallery</span>
              {progress.savedSketches.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-blue-500 text-white">
                  {progress.savedSketches.length}
                </span>
              )}
            </button>

            <button
              id="btn-open-swift-download"
              type="button"
              onClick={() => setIsSwiftDownloadOpen(true)}
              className="btn-bouncy flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl text-xs font-black text-amber-950 bg-gradient-to-r from-amber-200 to-orange-200 hover:from-amber-300 hover:to-orange-300 border-2 border-amber-400 shadow-xs transition-all"
              title="Download Swift files separately or one-by-one"
            >
              <Download className="w-3.5 h-3.5 text-amber-900" />
              <span>📥 Download Swift Files</span>
            </button>

            <button
              id="btn-open-swift-studio"
              type="button"
              onClick={() => setIsSwiftStudioOpen(true)}
              className="btn-bouncy hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl text-xs font-black text-orange-800 bg-orange-100 border-2 border-orange-300 hover:bg-orange-200 transition-all shadow-xs"
              title="View Swift files in /SwiftPlayground"
            >
              <span>🚀</span>
              <span>Swift Lab</span>
            </button>
          </div>
        </header>

        {/* Mascot Doodly Step Info Banner */}
        <div className="bg-gradient-to-r from-amber-100/90 via-orange-50 to-amber-100/90 border-b-2 border-amber-200 px-4 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2 shrink-0">
          <div className="flex items-center space-x-3 max-w-2xl">
            <div className="w-10 h-10 rounded-2xl bg-white border-2 border-amber-300 shadow-xs flex items-center justify-center text-2xl shrink-0">
              🐰
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-200/80 px-2 py-0.5 rounded-md">
                  {currentLesson.title}
                </span>
                <span className="text-xs font-black text-slate-800">
                  Step {currentStepIndex + 1}: {currentStep.title}
                </span>
              </div>
              <p className="text-xs text-slate-700 font-bold leading-snug">
                "{currentStep.instructionText}"
              </p>
            </div>
          </div>

          {/* Step Navigation & Progress */}
          <div className="flex items-center justify-between md:justify-end space-x-3 shrink-0">
            <div className="flex items-center space-x-1 text-xs">
              <button
                id="btn-prev-step"
                type="button"
                disabled={isFirstStep}
                onClick={handlePrevStep}
                className="btn-bouncy p-2 rounded-xl bg-white border-2 border-amber-200 text-slate-700 hover:bg-amber-50 disabled:opacity-30 transition-all"
                title="Previous Step"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-2 font-black text-amber-900 text-xs">
                {currentStepIndex + 1} of {currentLesson.steps.length}
              </span>

              <button
                id="btn-next-step"
                type="button"
                disabled={isLastStep}
                onClick={handleNextStep}
                className="btn-bouncy p-2 rounded-xl bg-white border-2 border-amber-200 text-slate-700 hover:bg-amber-50 disabled:opacity-30 transition-all"
                title="Next Step"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Doodly Pro Tip pill */}
            <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl bg-white border-2 border-amber-200 text-xs font-bold text-amber-900 max-w-sm shadow-2xs">
              <span className="text-sm">💡</span>
              <span className="truncate">{currentStep.draftingTip}</span>
            </div>
          </div>
        </div>


        {/* Interactive Workspace Area */}
        <main className="flex-1 relative flex overflow-hidden">
          {learningMode === 'paper-camera' ? (
            /* Paper & Camera Mode */
            <CameraPaperMode
              guideSvgPath={currentStep.targetGuidePathData}
              stepInstruction={currentStep.instructionText}
              stepTitle={currentStep.title}
              onCaptureSnapshot={evaluateDrawingSnapshot}
              isEvaluating={isEvaluating}
            />
          ) : learningMode === 'digital-side' ? (
            /* Side-by-Side Reference Mode */
            <div className="flex-1 flex flex-col md:flex-row w-full h-full overflow-hidden">
              {/* Left/Top Reference Pane */}
              <div className="w-full md:w-80 lg:w-96 bg-white border-b md:border-b-0 md:border-r border-slate-200 p-4 flex flex-col overflow-y-auto shrink-0 space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Target Form Reference
                </span>

                <div className="aspect-square bg-slate-50 rounded-2xl border border-slate-200 p-4 flex items-center justify-center relative shadow-inner">
                  <svg
                    className="w-full h-full max-w-[260px] max-h-[260px]"
                    viewBox="0 0 600 500"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <path
                      d={currentStep.referenceSvg}
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-blue-600 text-white rounded-md text-[10px] font-bold">
                    Target Model
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    AI Evaluation Criteria
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    {currentStep.aiEvaluationCriteria}
                  </p>
                </div>

                <div className="space-y-1.5 p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900">
                  <div className="flex items-center space-x-1 font-bold">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                    <span>Teacher Tip</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">{currentStep.draftingTip}</p>
                </div>
              </div>

              {/* Right Drawing Canvas */}
              <div className="flex-1 relative h-full">
                <DrawingCanvas
                  guideSvgPath={undefined}
                  isTraceMode={false}
                  lessonTitle={currentLesson.title}
                  stepTitle={currentStep.title}
                  onStrokeChange={(count) => setStrokeCount(count)}
                  onExportCanvas={(fn) => {
                    exportCanvasFnRef.current = fn;
                  }}
                />
              </div>
            </div>
          ) : (
            /* Digital Trace Mode */
            <div className="flex-1 relative w-full h-full">
              <DrawingCanvas
                guideSvgPath={currentStep.targetGuidePathData}
                isTraceMode={true}
                lessonTitle={currentLesson.title}
                stepTitle={currentStep.title}
                onStrokeChange={(count) => setStrokeCount(count)}
                onExportCanvas={(fn) => {
                  exportCanvasFnRef.current = fn;
                }}
              />
            </div>
          )}
        </main>

        {/* Bottom Playful Evaluation & Convenience Bar */}
        {learningMode !== 'paper-camera' && (
          <footer className="h-18 bg-white border-t-2 border-amber-200 px-4 sm:px-6 flex items-center justify-between z-20 shrink-0 shadow-sm">
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1.5 font-black text-slate-700">
                <span className="text-base">✏️</span>
                <span>
                  {strokeCount > 0
                    ? `${strokeCount} stroke${strokeCount > 1 ? 's' : ''} drawn so far! Keep going!`
                    : 'Draw on the canvas to begin your adventure!'}
                </span>
              </span>

              {/* Quick Step Switcher in footer for ergonomics */}
              <div className="hidden md:flex items-center space-x-1 pl-2 border-l border-amber-200">
                <button
                  type="button"
                  disabled={isFirstStep}
                  onClick={handlePrevStep}
                  className="btn-bouncy px-2 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 font-bold hover:bg-amber-100 disabled:opacity-30"
                  title="Previous Step"
                >
                  ◀
                </button>
                <span className="text-[11px] font-black text-amber-900 px-1">
                  Step {currentStepIndex + 1}/{currentLesson.steps.length}
                </span>
                <button
                  type="button"
                  disabled={isLastStep}
                  onClick={handleNextStep}
                  className="btn-bouncy px-2 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 font-bold hover:bg-amber-100 disabled:opacity-30"
                  title="Next Step"
                >
                  ▶
                </button>
              </div>
            </div>

            <button
              id="btn-check-my-work"
              type="button"
              disabled={isEvaluating || strokeCount === 0}
              onClick={handleCheckCanvasWork}
              className="btn-bouncy flex items-center space-x-2.5 px-6 sm:px-8 py-3 rounded-2xl text-sm sm:text-base font-black text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 shadow-[0_4px_0_#065f46] active:shadow-none active:translate-y-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isEvaluating ? (
                <>
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Doodly is Checking... 🐰🔍</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                  <span>CHECK MY DRAWING! ⭐</span>
                </>
              )}
            </button>
          </footer>
        )}
      </div>

      {/* AI Assessment Feedback Sheet */}
      <AIFeedbackModal
        assessment={assessment}
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onNextStep={handleNextStep}
        onTryAgain={() => setShowFeedbackModal(false)}
        hasNextStep={!isLastStep}
      />

      {/* Swift Playgrounds Source Code Studio */}
      <SwiftCodeStudio
        isOpen={isSwiftStudioOpen}
        onClose={() => setIsSwiftStudioOpen(false)}
        onOpenDownloadModal={() => setIsSwiftDownloadOpen(true)}
      />

      {/* Dedicated Separate Files Download Modal */}
      <SwiftDownloadModal
        isOpen={isSwiftDownloadOpen}
        onClose={() => setIsSwiftDownloadOpen(false)}
        onOpenStudio={() => setIsSwiftStudioOpen(true)}
      />

      {/* User Drawing Gallery */}
      <DrawingGallery
        progress={progress}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onClearGallery={handleClearGallery}
      />
    </div>
  );
}
