import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Upload, Sparkles, Check, AlertCircle } from 'lucide-react';

interface CameraPaperModeProps {
  guideSvgPath?: string;
  stepInstruction: string;
  stepTitle: string;
  onCaptureSnapshot: (base64Image: string) => void;
  isEvaluating: boolean;
}

export const CameraPaperMode: React.FC<CameraPaperModeProps> = ({
  guideSvgPath,
  stepInstruction,
  stepTitle,
  onCaptureSnapshot,
  isEvaluating,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  // Start Camera Feed
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      const media = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      setStream(media);
      if (videoRef.current) {
        videoRef.current.srcObject = media;
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setCameraError('Camera access unavailable or declined in this browser window. You can upload a photo of your paper drawing below.');
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [facingMode]);

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capture photo from video frame
  const takeSnapshot = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedPhoto(dataUrl);
  };

  // Upload file fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCapturedPhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const submitForAIEvaluation = () => {
    if (!capturedPhoto) return;
    onCaptureSnapshot(capturedPhoto);
  };

  return (
    <div className="relative flex flex-col h-full w-full bg-slate-950 text-white select-none overflow-hidden">
      {/* Top Paper Mode Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 z-10">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Paper & Camera AR Mode
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {!capturedPhoto && stream && (
            <button
              id="btn-switch-camera"
              type="button"
              onClick={toggleFacingMode}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Flip Camera</span>
            </button>
          )}

          <label className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 cursor-pointer transition-colors">
            <Upload className="w-3 h-3" />
            <span>Upload Photo</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden">
        {cameraError && !capturedPhoto ? (
          <div className="max-w-md p-6 m-4 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
            <h4 className="text-base font-semibold text-slate-200">Paper Scanner Standby</h4>
            <p className="text-xs text-slate-400 leading-relaxed">{cameraError}</p>
            <div className="pt-2">
              <label className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer shadow-md transition-all">
                <Upload className="w-4 h-4" />
                <span>Select Drawing Photo from Device</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>
        ) : capturedPhoto ? (
          /* Snapshot Preview */
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <img
              src={capturedPhoto}
              alt="Paper Drawing Attempt"
              className="max-h-full max-w-full rounded-xl object-contain shadow-2xl border border-slate-700"
            />
            <div className="absolute top-6 left-6 bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-medium text-slate-300">
              Snapshot Frozen
            </div>
          </div>
        ) : (
          /* Live Video Stream */
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* AR Framing Guidelines Overlay */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
              {/* Target Document Box */}
              <div className="relative w-full max-w-[540px] aspect-4/3 border-2 border-dashed border-blue-400/70 rounded-2xl flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.2)]">
                {/* Corner Markers */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />

                {/* Step Guide Silhouette */}
                {guideSvgPath && (
                  <svg
                    className="w-full h-full max-w-[420px] max-h-[340px] opacity-35"
                    viewBox="0 0 600 500"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <path
                      d={guideSvgPath}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="5"
                      strokeDasharray="8 6"
                      strokeLinecap="round"
                    />
                  </svg>
                )}

                <div className="absolute bottom-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] text-blue-200">
                  Align your physical paper drawing inside the guide box
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Camera Action Bar */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
        <div className="text-xs text-slate-400 max-w-sm">
          <p className="font-semibold text-slate-200 truncate">{stepTitle}</p>
          <p className="truncate text-slate-400">{stepInstruction}</p>
        </div>

        <div className="flex items-center space-x-3">
          {capturedPhoto ? (
            <>
              <button
                id="btn-retake-photo"
                type="button"
                onClick={() => setCapturedPhoto(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Retake Photo
              </button>

              <button
                id="btn-evaluate-photo"
                type="button"
                disabled={isEvaluating}
                onClick={submitForAIEvaluation}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
              >
                {isEvaluating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Paper...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Evaluate Paper Drawing</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              id="btn-take-snapshot"
              type="button"
              disabled={!stream}
              onClick={takeSnapshot}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-900 shadow-lg transition-all disabled:opacity-40"
            >
              <Camera className="w-4 h-4 text-blue-600" />
              <span>Capture Drawing</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
