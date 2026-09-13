import React from 'react';
import { CURRICULUM_LESSONS } from '../data/lessonsData';
import { DrawingLesson, UserProgressRecord } from '../types';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  ChevronRight,
  Award,
  Sparkles,
  Star,
  Rocket,
  Castle,
  Palette,
} from 'lucide-react';

interface LessonSidebarProps {
  currentLesson: DrawingLesson;
  onSelectLesson: (lesson: DrawingLesson) => void;
  progress: UserProgressRecord;
  isOpen: boolean;
  onClose: () => void;
}

export const LessonSidebar: React.FC<LessonSidebarProps> = ({
  currentLesson,
  onSelectLesson,
  progress,
  isOpen,
  onClose,
}) => {
  // Categories grouping with kid-friendly titles & badges
  const categories = [
    { key: 'Foundations', title: 'Level 1: Line Starter Camp 🚀', icon: '🚀', color: 'text-amber-600' },
    { key: 'Form & Perspective', title: 'Level 2: 3D Shapes & Castles 🏰', icon: '🏰', color: 'text-purple-600' },
    { key: 'Applied Drawing', title: 'Level 3: Master Artist Quests 🎨', icon: '🎨', color: 'text-emerald-600' },
  ] as const;

  const isLessonComplete = (lesson: DrawingLesson) => {
    return lesson.steps.every((step) => progress.completedStepIds[`${lesson.id}-${step.id}`]);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 sm:w-80 bg-amber-50/50 border-r-2 border-amber-200 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b-2 border-amber-200 bg-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-400 flex items-center justify-center text-xl text-white shadow-sm">
              🐰
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 leading-tight">
                Drawing Adventures
              </h2>
              <p className="text-[11px] font-bold text-amber-700">Fun Step-by-Step Lessons</p>
            </div>
          </div>
        </div>

        {/* Lessons List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          {categories.map((cat) => {
            const lessonsInCategory = CURRICULUM_LESSONS.filter((l) => l.category === cat.key);

            return (
              <div key={cat.key} className="space-y-2">
                <div className="flex items-center space-x-1.5 px-2 text-xs font-black text-slate-700">
                  <span>{cat.icon}</span>
                  <span>{cat.title}</span>
                </div>

                <div className="space-y-1.5">
                  {lessonsInCategory.map((lesson) => {
                    const active = lesson.id === currentLesson.id;
                    const complete = isLessonComplete(lesson);
                    const bestScore = progress.lessonScores[lesson.id];

                    return (
                      <button
                        key={lesson.id}
                        id={`nav-lesson-${lesson.id}`}
                        type="button"
                        onClick={() => {
                          onSelectLesson(lesson);
                          onClose();
                        }}
                        className={`w-full text-left p-3 rounded-2xl transition-all border-2 ${
                          active
                            ? 'bg-white border-amber-400 shadow-md ring-2 ring-amber-300/40'
                            : 'bg-white/60 border-amber-100 hover:bg-white hover:border-amber-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-0.5 flex-1 pr-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600">
                              Quest {lesson.levelNumber} • {lesson.id}
                            </span>
                            <h3 className="text-xs font-black text-slate-800 line-clamp-1">
                              {lesson.title}
                            </h3>
                            <p className="text-[11px] font-medium text-slate-500 line-clamp-1">
                              {lesson.subtitle}
                            </p>
                          </div>

                          <div className="flex flex-col items-end space-y-1">
                            {complete ? (
                              <div className="flex items-center space-x-0.5 text-amber-500">
                                <Star className="w-4 h-4 fill-amber-400 stroke-amber-500" />
                              </div>
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            )}
                            {bestScore !== undefined && (
                              <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                ⭐ {bestScore} pts
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 mt-2 text-[10px] text-slate-500 font-bold">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{lesson.estimatedMinutes}m</span>
                          </span>
                          <span>•</span>
                          <span>{lesson.steps.length} Steps</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Storage status footer */}
        <div className="p-3 bg-white border-t-2 border-amber-200 text-[11px] font-bold text-slate-600 flex items-center justify-between">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs animate-pulse" />
            <span>Sketches Saved Safely</span>
          </span>
          <span className="text-xs">🔒 100% On-Device</span>
        </div>
      </aside>
    </>
  );
};

