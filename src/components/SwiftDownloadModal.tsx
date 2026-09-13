import React, { useState } from 'react';
import { Download, Copy, Check, FileCode, Sparkles, X, Apple, ArrowRight, FolderDown } from 'lucide-react';
import { SWIFT_PLAYGROUND_FILES, SwiftCodeFile } from '../data/swiftCodeFiles';

interface SwiftDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenStudio?: () => void;
}

export const SwiftDownloadModal: React.FC<SwiftDownloadModalProps> = ({
  isOpen,
  onClose,
  onOpenStudio,
}) => {
  const [copiedFilename, setCopiedFilename] = useState<string | null>(null);
  const [downloadingFilename, setDownloadingFilename] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = async (file: SwiftCodeFile) => {
    try {
      await navigator.clipboard.writeText(file.code);
      setCopiedFilename(file.filename);
      setTimeout(() => setCopiedFilename(null), 2500);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = file.code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedFilename(file.filename);
      setTimeout(() => setCopiedFilename(null), 2500);
    }
  };

  const handleDownload = (file: SwiftCodeFile) => {
    setDownloadingFilename(file.filename);
    try {
      const blob = new Blob([file.code], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download error:', e);
      window.location.href = `/swift/${file.filename}`;
    }
    setTimeout(() => setDownloadingFilename(null), 1500);
  };

  const handleDownloadAllIndividually = () => {
    SWIFT_PLAYGROUND_FILES.forEach((file, index) => {
      setTimeout(() => {
        handleDownload(file);
      }, index * 300);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-100 via-orange-100 to-amber-200 border-b-2 border-amber-300">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center text-2xl shadow-md border-2 border-orange-400">
              📥
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Download Swift Files Separately
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500 text-white shadow-2xs">
                  iPad Ready
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Tap any file below to download it directly as a separate <code className="font-mono font-bold text-orange-700">.swift</code> file onto your iPad or Mac.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl bg-white/80 hover:bg-white text-slate-500 hover:text-slate-800 border border-amber-300 shadow-xs transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Batch Actions */}
        <div className="px-6 py-3 bg-amber-50/60 border-b border-amber-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-900">
            <span>✨ {SWIFT_PLAYGROUND_FILES.length} Native Swift Source Files</span>
            <span className="text-amber-400">•</span>
            <span>Including ContentView.swift for Swift Playgrounds</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleDownloadAllIndividually}
              className="btn-bouncy flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-white bg-orange-500 hover:bg-orange-600 shadow-xs transition-all"
              title="Triggers download for each file one by one"
            >
              <FolderDown className="w-3.5 h-3.5" />
              <span>Download All {SWIFT_PLAYGROUND_FILES.length} Files One-By-One</span>
            </button>

            {onOpenStudio && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenStudio();
                }}
                className="btn-bouncy flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-xs transition-all"
              >
                <span>🚀 Open Code Viewer</span>
              </button>
            )}
          </div>
        </div>

        {/* Files List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50/50">
          {SWIFT_PLAYGROUND_FILES.map((file) => {
            const isCopied = copiedFilename === file.filename;
            const isDownloading = downloadingFilename === file.filename;

            return (
              <div
                key={file.filename}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white rounded-2xl border-2 border-slate-200 hover:border-orange-300 hover:shadow-md transition-all gap-3"
              >
                {/* File Details */}
                <div className="flex items-start space-x-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0 text-orange-600 font-bold">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-black text-sm text-slate-900 truncate">
                        {file.filename}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                        {Math.round(file.code.length / 1024 * 10) / 10} KB
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium line-clamp-1">
                      {file.description}
                    </p>
                  </div>
                </div>

                {/* Individual Action Buttons */}
                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleCopy(file)}
                    className={`btn-bouncy flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      isCopied
                        ? 'bg-emerald-500 text-white border-emerald-600'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    }`}
                    title="Copy full Swift source code to clipboard"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownload(file)}
                    className="btn-bouncy flex items-center space-x-1 px-3.5 py-1.5 rounded-xl text-xs font-black text-white bg-blue-600 hover:bg-blue-700 shadow-sm border border-blue-700 transition-all"
                    title={`Download ${file.filename} directly to device`}
                  >
                    <Download className={`w-3.5 h-3.5 ${isDownloading ? 'animate-bounce' : ''}`} />
                    <span>Download File</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Instructions Footer for Swift Playgrounds on iPad */}
        <div className="p-4 bg-amber-50 border-t-2 border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-amber-900">
            <span className="text-base">💡</span>
            <span>
              <strong>iPad Tip:</strong> Download the files to your <strong>Files app</strong>, open <strong>Swift Playgrounds</strong>, tap <strong>+ App</strong>, and drag the files in!
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors shrink-0"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
