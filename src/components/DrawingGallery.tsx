import React from 'react';
import { UserProgressRecord } from '../types';
import { Image as ImageIcon, Calendar, Award, Trash2 } from 'lucide-react';

interface DrawingGalleryProps {
  progress: UserProgressRecord;
  isOpen: boolean;
  onClose: () => void;
  onClearGallery: () => void;
}

export const DrawingGallery: React.FC<DrawingGalleryProps> = ({
  progress,
  isOpen,
  onClose,
  onClearGallery,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Your Drawing Portfolio</h3>
              <p className="text-xs text-slate-500">
                {progress.savedSketches.length} Evaluated Sketches Saved On-Device
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {progress.savedSketches.length > 0 && (
              <button
                type="button"
                onClick={onClearGallery}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Portfolio</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Sketches Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          {progress.savedSketches.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <ImageIcon className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-semibold text-slate-700">No sketches in your portfolio yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Draw on the digital canvas or scan your physical paper drawing, then tap "Check My Work" to have the AI Art Coach grade and save your work!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {progress.savedSketches.map((sketch) => (
                <div
                  key={sketch.id}
                  className="group rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
                >
                  <div className="aspect-square bg-slate-100 overflow-hidden relative">
                    <img
                      src={sketch.thumbnail}
                      alt={sketch.stepTitle}
                      className="w-full h-full object-contain p-2"
                    />
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold shadow-xs ${
                          sketch.passed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {sketch.score}%
                      </span>
                    </div>
                  </div>

                  <div className="p-3 space-y-1">
                    <h5 className="text-xs font-bold text-slate-800 line-clamp-1">
                      {sketch.stepTitle}
                    </h5>
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {sketch.lessonTitle}
                    </p>
                    <div className="flex items-center space-x-1 text-[10px] text-slate-400 pt-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(sketch.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
