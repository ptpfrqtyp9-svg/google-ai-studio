import React, { useState } from 'react';
import { SWIFT_PLAYGROUND_FILES, SwiftCodeFile } from '../data/swiftCodeFiles';
import { Code, Copy, Check, FileCode, Terminal, Sparkles, Download, ExternalLink } from 'lucide-react';

interface SwiftCodeStudioProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDownloadModal?: () => void;
}

export const SwiftCodeStudio: React.FC<SwiftCodeStudioProps> = ({ isOpen, onClose, onOpenDownloadModal }) => {
  const [selectedFile, setSelectedFile] = useState<SwiftCodeFile>(SWIFT_PLAYGROUND_FILES[1]); // CanvasView.swift by default
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = (file: SwiftCodeFile) => {
    const blob = new Blob([file.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/75 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-5xl h-[90vh] bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden text-slate-100">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Swift Playgrounds iPadOS Studio
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  Swift 5.9+ / Swift 6
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  📁 In Repo: /SwiftPlayground
                </span>
              </div>
              <p className="text-xs text-slate-400">
                100% Native Apple Swift & CoreGraphics code saved directly in project files
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onOpenDownloadModal && (
              <button
                type="button"
                onClick={onOpenDownloadModal}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-900 bg-amber-300 hover:bg-amber-200 shadow-md transition-all"
              >
                <span>📥</span>
                <span>Download Files Separately</span>
              </button>
            )}

            <a
              id="btn-download-all-swift-zip"
              href="/SwiftFiles.zip"
              download="SwiftFiles.zip"
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Full Project (.zip)</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Close Studio
            </button>
          </div>
        </div>

        {/* Disk Location Notice Bar */}
        <div className="px-6 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-orange-400">Filesystem Location:</span>
            <code className="px-2 py-0.5 rounded bg-slate-950 font-mono text-[11px] text-slate-200 border border-slate-800">
              /SwiftPlayground/
            </code>
            <span className="text-slate-400 text-[11px]">
              (Package.swift, App.swift, CanvasView.swift, AIArtCoachController.swift, etc.)
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Open in Xcode or Swift Playgrounds on iPad
          </span>
        </div>

        {/* Content Body: Left File List + Right Code View */}
        <div className="flex flex-1 overflow-hidden">
          {/* File Explorer Sidebar */}
          <div className="w-64 border-r border-slate-800 bg-slate-950/60 p-3 space-y-1.5 overflow-y-auto">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Swift Project Files
            </span>

            {SWIFT_PLAYGROUND_FILES.map((file) => {
              const active = file.filename === selectedFile.filename;
              return (
                <div
                  key={file.filename}
                  className={`group flex items-center justify-between px-2 py-1.5 rounded-xl text-xs transition-all ${
                    active
                      ? 'bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/30'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <button
                    id={`tab-${file.filename.replace('.', '-')}`}
                    type="button"
                    onClick={() => setSelectedFile(file)}
                    className="flex-1 flex items-center space-x-2 text-left truncate mr-1"
                  >
                    <FileCode className={`w-4 h-4 shrink-0 ${active ? 'text-blue-400' : 'text-slate-500'}`} />
                    <span className="truncate">{file.filename}</span>
                  </button>

                  <a
                    href={`/swift/${file.filename}`}
                    download={file.filename}
                    className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-orange-500 hover:text-white text-slate-400 transition-all shrink-0"
                    title={`Download ${file.filename} directly`}
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              );
            })}

            {/* Quick Setup Guide on iPad */}
            <div className="pt-4 px-2 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Playgrounds Setup
              </span>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 space-y-1.5 leading-relaxed">
                <p className="font-semibold text-white">How to run on iPad:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[10px]">
                  <li>Open Swift Playgrounds on your iPad.</li>
                  <li>Tap <strong className="text-slate-200">+ App</strong> at the bottom left.</li>
                  <li>Add SPM: <code className="text-orange-300 font-mono text-[9px]">generative-ai-swift</code></li>
                  <li>Create and paste these 6 source files.</li>
                  <li>Tap the play button to launch live!</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Main Code Viewer */}
          <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
            {/* File Info & Action Bar */}
            <div className="flex items-center justify-between px-6 py-2.5 bg-slate-950/80 border-b border-slate-800">
              <div>
                <span className="font-mono text-xs font-bold text-white">
                  {selectedFile.filename}
                </span>
                <p className="text-[11px] text-slate-400">{selectedFile.description}</p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => downloadFile(selectedFile)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>

                <button
                  id="btn-copy-swift-code"
                  type="button"
                  onClick={handleCopy}
                  className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy Swift Code'}</span>
                </button>
              </div>
            </div>

            {/* Code Body */}
            <div className="flex-1 p-4 overflow-auto bg-[#0d1117] font-mono text-xs text-slate-200 leading-relaxed">
              <pre className="whitespace-pre">
                <code>{selectedFile.code}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
