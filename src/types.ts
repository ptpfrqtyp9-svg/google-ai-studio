export interface TouchPoint {
  x: number;
  y: number;
  force: number;
  timestamp: number;
}

export interface CanvasStroke {
  id: string;
  points: TouchPoint[];
  colorHex: string;
  baseLineWidth: number;
  tool: 'pencil' | 'pen' | 'brush' | 'eraser';
}

export interface LessonStep {
  id: number;
  title: string;
  instructionText: string;
  referenceSvg: string; // SVG path data or full SVG markups
  targetGuidePathData: string; // SVG path definition for overlay tracing
  aiEvaluationCriteria: string;
  draftingTip: string;
}

export interface DrawingLesson {
  id: number;
  title: string;
  subtitle: string;
  category: 'Foundations' | 'Form & Perspective' | 'Applied Drawing';
  levelNumber: number;
  estimatedMinutes: number;
  steps: LessonStep[];
}

export type CoachingStrictness = 'encouraging' | 'balanced' | 'atelier';

export interface TechniquePillarScore {
  flowAndRhythm: number; // 0-100 (smoothness vs hesitation)
  formAccuracy: number; // 0-100 (accuracy against template)
  lineConfidence: number; // 0-100 (stroke speed and decisiveness)
  proportions: number; // 0-100 (spacing and scale)
}

export interface ArtAssessment {
  score: number;
  passed: boolean;
  compliment: string;
  coreFlaw: string;
  actionableAdvice: string;
  drawingTypeDetected: string;
  notice?: string;
  coachingMode?: CoachingStrictness;
  pillars?: TechniquePillarScore;
  earnedBadge?: {
    name: string;
    icon: string;
    description: string;
  };
  techniqueMetrics?: {
    straightnessPct: number;
    wavinessCount: number;
    maxDeviation: number;
    algorithmicScore: number;
    flaws: string[];
    strengths: string[];
  };
}

export interface CanvasExportData {
  imageBase64: string;
  strokes: CanvasStroke[];
}


export interface UserProgressRecord {
  completedStepIds: Record<string, boolean>; // `${lessonId}-${stepId}`
  lessonScores: Record<number, number>; // lessonId -> best score
  savedSketches: {
    id: string;
    lessonTitle: string;
    stepTitle: string;
    score: number;
    passed: boolean;
    date: string;
    thumbnail: string;
  }[];
}

export type LearningMode = 'digital-trace' | 'digital-side' | 'paper-camera';
