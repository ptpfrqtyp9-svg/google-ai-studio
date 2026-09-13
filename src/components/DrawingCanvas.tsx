import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CanvasStroke, TouchPoint, CanvasExportData } from '../types';
import { soundEffects } from '../utils/audioFeedback';
import {
  Undo2,
  Redo2,
  Trash2,
  Eye,
  EyeOff,
  PenTool,
  Eraser,
  Brush,
  Ghost,
  Volume2,
  VolumeX,
  Grid,
  Download,
  Play,
  Pause,
  Sliders,
  Keyboard,
} from 'lucide-react';

interface DrawingCanvasProps {
  guideSvgPath?: string;
  isTraceMode: boolean;
  lessonTitle?: string;
  stepTitle?: string;
  onStrokeChange?: (strokeCount: number) => void;
  onExportCanvas: (getter: () => CanvasExportData) => void;
}

type GridMode = 'dots' | 'squares' | 'isometric' | 'none';

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  guideSvgPath,
  isTraceMode,
  lessonTitle = 'Art Lesson',
  stepTitle = 'Step',
  onStrokeChange,
  onExportCanvas,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [strokes, setStrokes] = useState<CanvasStroke[]>([]);
  const [redoStack, setRedoStack] = useState<CanvasStroke[]>([]);
  const [activePoints, setActivePoints] = useState<TouchPoint[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  // Tools & Styling
  const [selectedTool, setSelectedTool] = useState<'pencil' | 'pen' | 'brush' | 'eraser'>('pencil');
  const [strokeColor, setStrokeColor] = useState<string>('#2563eb');
  const [lineWidth, setLineWidth] = useState<number>(6);

  // Convenience features state
  const [showGuide, setShowGuide] = useState<boolean>(true);
  const [guideOpacity, setGuideOpacity] = useState<number>(0.4);
  const [gridMode, setGridMode] = useState<GridMode>('dots');
  const [pencilOnlyMode, setPencilOnlyMode] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isDemoPlaying, setIsDemoPlaying] = useState<boolean>(false);
  const [demoProgress, setDemoProgress] = useState<number>(0);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState<boolean>(false);

  const demoAnimRef = useRef<number | null>(null);

  const kidColors = [
    { name: 'Electric Blue', hex: '#2563eb', border: 'border-blue-700' },
    { name: 'Space Black', hex: '#18181b', border: 'border-zinc-800' },
    { name: 'Graphite Gray', hex: '#475569', border: 'border-slate-700' },
    { name: 'Grape Purple', hex: '#9333ea', border: 'border-purple-700' },
    { name: 'Bubblegum Pink', hex: '#ec4899', border: 'border-pink-600' },
    { name: 'Cherry Red', hex: '#ef4444', border: 'border-red-600' },
    { name: 'Sunny Orange', hex: '#f97316', border: 'border-orange-600' },
    { name: 'Forest Green', hex: '#16a34a', border: 'border-green-700' },
  ];

  const sizePresets = [
    { label: 'Fine (2px)', size: 3, icon: '✏️' },
    { label: 'Medium (6px)', size: 6, icon: '🖋️' },
    { label: 'Broad (12px)', size: 12, icon: '🖍️' },
  ];

  // Resize canvas according to display DPI & container size
  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
    redrawAll(strokes, activePoints);
  }, [strokes, activePoints, gridMode]);

  useEffect(() => {
    updateCanvasSize();
    const handleResize = () => updateCanvasSize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateCanvasSize]);

  // Midpoint Quadratic Bézier curve rendering
  const renderSmoothedStroke = (
    ctx: CanvasRenderingContext2D,
    points: TouchPoint[],
    color: string,
    baseWidth: number,
    tool: string
  ) => {
    if (points.length < 2) return;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = baseWidth * 3.5;
    } else {
      ctx.strokeStyle = color;
      ctx.globalAlpha = tool === 'brush' ? 0.65 : tool === 'pencil' ? 0.92 : 1.0;
      ctx.lineWidth = Math.max(1.5, baseWidth);
    }

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    if (points.length === 2) {
      ctx.lineTo(points[1].x, points[1].y);
      ctx.stroke();
      ctx.restore();
      return;
    }

    for (let i = 1; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const midX = (p0.x + p1.x) / 2;
      const midY = (p0.y + p1.y) / 2;
      const pressure = p0.force || 1.0;
      ctx.lineWidth = Math.max(1.5, baseWidth * pressure);
      ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
    }

    const last = points[points.length - 1];
    ctx.lineTo(last.x, last.y);
    ctx.stroke();
    ctx.restore();
  };

  const drawCanvasGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (gridMode === 'none') return;

    ctx.save();
    if (gridMode === 'dots') {
      ctx.fillStyle = '#cbd5e1';
      const gap = 32;
      for (let x = gap; x < width; x += gap) {
        for (let y = gap; y < height; y += gap) {
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (gridMode === 'squares') {
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 1;
      const size = 36;
      for (let x = 0; x < width; x += size) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += size) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    } else if (gridMode === 'isometric') {
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 1;
      const diagGap = 45;
      for (let d = -height; d < width + height; d += diagGap) {
        ctx.beginPath();
        ctx.moveTo(d, 0);
        ctx.lineTo(d + height, height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(d, height);
        ctx.lineTo(d + height, 0);
        ctx.stroke();
      }
    }
    ctx.restore();
  };

  const redrawAll = (currentStrokes: CanvasStroke[], active: TouchPoint[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    drawCanvasGrid(ctx, width, height);

    for (const stroke of currentStrokes) {
      renderSmoothedStroke(ctx, stroke.points, stroke.colorHex, stroke.baseLineWidth, stroke.tool);
    }

    if (active.length > 1) {
      renderSmoothedStroke(ctx, active, strokeColor, lineWidth, selectedTool);
    }

    ctx.restore();
  };

  // Export handler for AI assessment
  useEffect(() => {
    onExportCanvas(() => {
      const canvas = canvasRef.current;
      if (!canvas) return { imageBase64: '', strokes: [] };

      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = 800;
      exportCanvas.height = 800;
      const expCtx = exportCanvas.getContext('2d');
      if (!expCtx) return { imageBase64: '', strokes };

      expCtx.fillStyle = '#ffffff';
      expCtx.fillRect(0, 0, 800, 800);
      expCtx.drawImage(canvas, 0, 0, 800, 800);

      return {
        imageBase64: exportCanvas.toDataURL('image/png', 0.95),
        strokes: [...strokes],
      };
    });
  }, [onExportCanvas, strokes]);

  // Pointer event handlers with Apple Pencil palm-rejection filter
  const getPointerPoint = (e: React.PointerEvent<HTMLCanvasElement>): TouchPoint => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, force: 1, timestamp: Date.now() };

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const force = e.pressure && e.pressure > 0 ? e.pressure : 1.0;

    return {
      x,
      y,
      force: Math.max(0.2, force),
      timestamp: Date.now(),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (pencilOnlyMode && e.pointerType === 'touch') {
      return; // Ignore finger if pencil-only palm rejection active
    }
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const pt = getPointerPoint(e);
    setIsDrawing(true);
    setActivePoints([pt]);
    setRedoStack([]);
    if (soundEnabled) soundEffects.playSketchStroke();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    if (pencilOnlyMode && e.pointerType === 'touch') return;

    const pt = getPointerPoint(e);
    const updated = [...activePoints, pt];
    setActivePoints(updated);
    redrawAll(strokes, updated);
  };

  const finishCurrentStroke = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (activePoints.length > 1) {
      const newStroke: CanvasStroke = {
        id: `stroke-${Date.now()}-${Math.random()}`,
        points: activePoints,
        colorHex: strokeColor,
        baseLineWidth: lineWidth,
        tool: selectedTool,
      };
      const updated = [...strokes, newStroke];
      setStrokes(updated);
      onStrokeChange?.(updated.length);
      redrawAll(updated, []);
    }
    setActivePoints([]);
  };

  const handleUndo = () => {
    if (strokes.length === 0) return;
    const last = strokes[strokes.length - 1];
    const remaining = strokes.slice(0, -1);
    setStrokes(remaining);
    setRedoStack([last, ...redoStack]);
    onStrokeChange?.(remaining.length);
    redrawAll(remaining, []);
    if (soundEnabled) soundEffects.playClick();
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    const newRedo = redoStack.slice(1);
    const updated = [...strokes, next];
    setStrokes(updated);
    setRedoStack(newRedo);
    onStrokeChange?.(updated.length);
    redrawAll(updated, []);
    if (soundEnabled) soundEffects.playClick();
  };

  const handleClear = () => {
    if (strokes.length === 0) return;
    setStrokes([]);
    setRedoStack([]);
    setActivePoints([]);
    onStrokeChange?.(0);
    redrawAll([], []);
    if (soundEnabled) soundEffects.playClick();
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key.toLowerCase() === 'c' && !e.metaKey && !e.ctrlKey) {
        handleClear();
      } else if (e.key.toLowerCase() === 'p') {
        setSelectedTool('pencil');
      } else if (e.key.toLowerCase() === 'b') {
        setSelectedTool('brush');
      } else if (e.key.toLowerCase() === 'e') {
        setSelectedTool('eraser');
      } else if (e.key.toLowerCase() === 'g') {
        setShowGuide((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [strokes, redoStack]);

  // Master Demo Animation: visual ghost demonstration of ideal stroke
  const startMasterDemo = () => {
    if (isDemoPlaying) {
      if (demoAnimRef.current) cancelAnimationFrame(demoAnimRef.current);
      setIsDemoPlaying(false);
      setDemoProgress(0);
      return;
    }

    setIsDemoPlaying(true);
    setDemoProgress(0);
    const duration = 2800; // ms
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      setDemoProgress(progress);

      if (progress < 1) {
        demoAnimRef.current = requestAnimationFrame(step);
      } else {
        setIsDemoPlaying(false);
        setDemoProgress(0);
      }
    };

    demoAnimRef.current = requestAnimationFrame(step);
  };

  // Save drawing directly to user's device
  const handleSaveToDevice = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const outCanvas = document.createElement('canvas');
    const dpr = window.devicePixelRatio || 1;
    outCanvas.width = canvas.width;
    outCanvas.height = canvas.height;
    const ctx = outCanvas.getContext('2d');
    if (!ctx) return;

    // White backing
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, outCanvas.width, outCanvas.height);
    ctx.drawImage(canvas, 0, 0);

    // Add signature watermark
    ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`${lessonTitle} • ${stepTitle}`, 30, outCanvas.height - 30);

    const a = document.createElement('a');
    a.href = outCanvas.toDataURL('image/png');
    a.download = `DrawCoach-${stepTitle.replace(/\s+/g, '_')}.png`;
    a.click();
    if (soundEnabled) soundEffects.playClick();
  };

  return (
    <div className="relative flex flex-col h-full w-full select-none bg-amber-50/40 overflow-hidden">
      {/* Top Playful Canvas Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-5 py-2.5 bg-white/95 backdrop-blur-md border-b-2 border-amber-200/80 z-10 shadow-xs">
        {/* Tool Selectors */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            id="tool-pencil"
            type="button"
            onClick={() => {
              setSelectedTool('pencil');
              if (soundEnabled) soundEffects.playClick();
            }}
            className={`btn-bouncy flex items-center space-x-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all shadow-xs ${
              selectedTool === 'pencil'
                ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-500 shadow-sm'
                : 'bg-amber-50/80 text-amber-900 hover:bg-amber-100 border border-amber-200/60'
            }`}
          >
            <span className="text-sm">✏️</span>
            <span>Pencil</span>
          </button>

          <button
            id="tool-pen"
            type="button"
            onClick={() => {
              setSelectedTool('pen');
              if (soundEnabled) soundEffects.playClick();
            }}
            className={`btn-bouncy flex items-center space-x-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all shadow-xs ${
              selectedTool === 'pen'
                ? 'bg-indigo-500 text-white ring-2 ring-indigo-600 shadow-sm'
                : 'bg-indigo-50 text-indigo-900 hover:bg-indigo-100 border border-indigo-200/60'
            }`}
          >
            <span className="text-sm">🖋️</span>
            <span className="hidden sm:inline">Pen</span>
          </button>

          <button
            id="tool-brush"
            type="button"
            onClick={() => {
              setSelectedTool('brush');
              if (soundEnabled) soundEffects.playClick();
            }}
            className={`btn-bouncy flex items-center space-x-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all shadow-xs ${
              selectedTool === 'brush'
                ? 'bg-pink-500 text-white ring-2 ring-pink-600 shadow-sm'
                : 'bg-pink-50 text-pink-900 hover:bg-pink-100 border border-pink-200/60'
            }`}
          >
            <span className="text-sm">🖍️</span>
            <span className="hidden sm:inline">Marker</span>
          </button>

          <button
            id="tool-eraser"
            type="button"
            onClick={() => {
              setSelectedTool('eraser');
              if (soundEnabled) soundEffects.playClick();
            }}
            className={`btn-bouncy flex items-center space-x-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all shadow-xs ${
              selectedTool === 'eraser'
                ? 'bg-emerald-500 text-white ring-2 ring-emerald-600 shadow-sm'
                : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200/60'
            }`}
          >
            <span className="text-sm">🧼</span>
            <span>Eraser</span>
          </button>
        </div>

        {/* Rainbow Color Palette */}
        {selectedTool !== 'eraser' && (
          <div className="flex items-center space-x-1.5 bg-slate-50/90 px-2.5 py-1.5 rounded-2xl border-2 border-slate-200 shadow-2xs">
            <span className="text-xs mr-0.5">🎨</span>
            {kidColors.map((c) => (
              <button
                key={c.hex}
                id={`color-${c.hex.replace('#', '')}`}
                type="button"
                onClick={() => {
                  setStrokeColor(c.hex);
                  if (soundEnabled) soundEffects.playClick();
                }}
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full transition-transform btn-bouncy ${
                  strokeColor === c.hex
                    ? 'ring-3 ring-offset-1 ring-blue-500 scale-110 shadow-md'
                    : 'hover:scale-105 opacity-90 hover:opacity-100'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>
        )}

        {/* History & Action Controls */}
        <div className="flex items-center space-x-1.5">
          <button
            id="btn-undo"
            type="button"
            disabled={strokes.length === 0}
            onClick={handleUndo}
            className="btn-bouncy flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-slate-100 transition-all"
            title="Undo stroke (Cmd+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Undo</span>
          </button>

          <button
            id="btn-redo"
            type="button"
            disabled={redoStack.length === 0}
            onClick={handleRedo}
            className="btn-bouncy p-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-slate-100 transition-all"
            title="Redo stroke (Cmd+Shift+Z)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>

          <button
            id="btn-clear-canvas"
            type="button"
            disabled={strokes.length === 0}
            onClick={handleClear}
            className="btn-bouncy flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 disabled:opacity-30 disabled:hover:bg-rose-50 transition-all"
            title="Clear and reset paper (C)"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>

          {/* Quick Download Image */}
          <button
            id="btn-download-image"
            type="button"
            onClick={handleSaveToDevice}
            className="btn-bouncy p-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
            title="Save drawing PNG to device"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Interactive Drawing Stage */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full h-full touch-none overflow-hidden cursor-crosshair bg-white"
      >
        {/* SVG Guideline Layer (Trace Mode with playful friendly dashed strokes) */}
        {isTraceMode && guideSvgPath && showGuide && (
          <div className="absolute inset-0 pointer-events-none z-5 flex items-center justify-center">
            <svg
              className="w-full h-full max-w-[620px] max-h-[520px]"
              viewBox="0 0 600 500"
              preserveAspectRatio="xMidYMid meet"
              style={{ opacity: guideOpacity }}
            >
              <path
                d={guideSvgPath}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="5"
                strokeDasharray="8 6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}

        {/* Master Demo Animated Ghost Cursor */}
        {isDemoPlaying && guideSvgPath && (
          <div className="absolute inset-0 pointer-events-none z-15 flex items-center justify-center">
            <svg
              className="w-full h-full max-w-[620px] max-h-[520px]"
              viewBox="0 0 600 500"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Traced master line */}
              <path
                d={guideSvgPath}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray="1000"
                strokeDashoffset={1000 * (1 - demoProgress)}
                className="transition-all"
              />
            </svg>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold shadow-lg flex items-center space-x-1.5 animate-pulse">
              <span>✏️ Master Stroke Demo: Observe shoulder pull & steady velocity!</span>
            </div>
          </div>
        )}

        {/* Low-Level Drawing HTML5 Canvas */}
        <canvas
          ref={canvasRef}
          id="drawing-surface"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishCurrentStroke}
          onPointerCancel={finishCurrentStroke}
          className="absolute inset-0 w-full h-full touch-none"
        />

        {/* Bottom Quick Controls & Convenience Bar */}
        <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* Left Controls: Brush Size & Opacity & Master Demo */}
          <div className="pointer-events-auto flex flex-wrap items-center gap-2 bg-white/95 backdrop-blur-md p-2 rounded-2xl border-2 border-amber-200/90 shadow-md text-xs">
            {/* Quick Brush Size Presets */}
            <div className="flex items-center space-x-1 pr-1 border-r border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 mr-1 hidden sm:inline">Size:</span>
              {sizePresets.map((preset) => (
                <button
                  key={preset.size}
                  type="button"
                  onClick={() => {
                    setLineWidth(preset.size);
                    if (soundEnabled) soundEffects.playClick();
                  }}
                  className={`btn-bouncy px-2 py-1 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                    lineWidth === preset.size
                      ? 'bg-amber-400 text-amber-950 shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{preset.icon}</span>
                  <span className="hidden md:inline">{preset.label}</span>
                </button>
              ))}
            </div>

            {/* Ghost Guide Toggle & Opacity */}
            {isTraceMode && guideSvgPath && (
              <div className="flex items-center space-x-1.5 border-r border-slate-200 pr-2">
                <button
                  type="button"
                  onClick={() => setShowGuide(!showGuide)}
                  className={`btn-bouncy flex items-center space-x-1 px-2 py-1 rounded-xl font-bold transition-all ${
                    showGuide
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                  title="Toggle Trace Guide (G)"
                >
                  <Ghost className="w-3.5 h-3.5" />
                  <span>Guide</span>
                </button>

                {showGuide && (
                  <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.05"
                    value={guideOpacity}
                    onChange={(e) => setGuideOpacity(parseFloat(e.target.value))}
                    className="w-14 sm:w-16 accent-blue-500 cursor-pointer"
                    title="Guide Opacity"
                  />
                )}
              </div>
            )}

            {/* Master Demo Button */}
            {guideSvgPath && (
              <button
                type="button"
                onClick={startMasterDemo}
                className={`btn-bouncy flex items-center space-x-1 px-2.5 py-1 rounded-xl font-bold transition-all ${
                  isDemoPlaying
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                }`}
                title="Watch master instructor demonstration"
              >
                {isDemoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isDemoPlaying ? 'Watching...' : 'Watch Master Demo'}</span>
              </button>
            )}
          </div>

          {/* Right Controls: Grid, Palm Rejection & Sound */}
          <div className="pointer-events-auto flex items-center space-x-1.5 bg-white/95 backdrop-blur-md p-2 rounded-2xl border-2 border-amber-200/90 shadow-md text-xs">
            {/* Grid Selector */}
            <button
              type="button"
              onClick={() => {
                const nextGrid: Record<GridMode, GridMode> = {
                  dots: 'squares',
                  squares: 'isometric',
                  isometric: 'none',
                  none: 'dots',
                };
                setGridMode(nextGrid[gridMode]);
                if (soundEnabled) soundEffects.playClick();
              }}
              className="btn-bouncy flex items-center space-x-1 px-2 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
              title="Change canvas guide grid (Dots, Squares, Isometric, Clean)"
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="capitalize hidden sm:inline">{gridMode}</span>
            </button>

            {/* Apple Pencil Only / Palm Rejection */}
            <button
              type="button"
              onClick={() => {
                setPencilOnlyMode(!pencilOnlyMode);
                if (soundEnabled) soundEffects.playClick();
              }}
              className={`btn-bouncy flex items-center space-x-1 px-2 py-1 rounded-xl font-bold transition-all ${
                pencilOnlyMode
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title="Palm Rejection: When active, only Apple Pencil / Stylus draws"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span className="hidden md:inline">
                {pencilOnlyMode ? 'Pencil Only ✏️' : 'All Touches 👆'}
              </span>
            </button>

            {/* Sound Mute Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                soundEffects.isMuted = !next;
                if (next) soundEffects.playClick();
              }}
              className="btn-bouncy p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
              title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
