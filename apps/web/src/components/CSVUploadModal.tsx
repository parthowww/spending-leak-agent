'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle,
  Sparkles,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { api } from '../lib/api';

interface CSVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  onLoadDemo: () => void;
}

export const CSVUploadModal: React.FC<CSVUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  onLoadDemo,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadStats, setUploadStats] = useState<{
    imported_rows: number;
    duplicate_rows: number;
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.toLowerCase().endsWith('.csv') && !selected.name.toLowerCase().endsWith('.txt')) {
        setErrorMsg('Please select a valid CSV (.csv) statement file.');
        return;
      }
      setFile(selected);
      setErrorMsg(null);
      setUploadStats(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      if (!dropped.name.toLowerCase().endsWith('.csv') && !dropped.name.toLowerCase().endsWith('.txt')) {
        setErrorMsg('Please upload a valid CSV file.');
        return;
      }
      setFile(dropped);
      setErrorMsg(null);
      setUploadStats(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setErrorMsg('Please select a CSV statement to upload.');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);

    try {
      const res = await api.uploadCSV(file);
      setUploadStats({
        imported_rows: res.imported_rows,
        duplicate_rows: res.duplicate_rows,
        message: res.message,
      });
      setTimeout(() => {
        onUploadSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to parse and upload CSV.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              Upload Bank / Card CSV Statement
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Secure, client-scoped transaction ingestion & recurrence scanning
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-slate-800 text-xs">
          {/* Privacy & Safety Callout */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-start space-x-2.5 text-emerald-900">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Zero Credential Policy: </span>
              We do NOT store bank credentials, full card numbers, UPI PINs, or OTPs.
              Transactions are normalized deterministically. Duplicate rows are skipped automatically.
            </div>
          </div>

          {/* Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
              file
                ? 'border-emerald-400 bg-emerald-50/30'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv,.txt"
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200 text-emerald-600">
                <UploadCloud className="h-6 w-6" />
              </div>
              {file ? (
                <div>
                  <p className="font-bold text-sm text-slate-900">{file.name}</p>
                  <p className="text-slate-500 text-[11px]">
                    {(file.size / 1024).toFixed(1)} KB • Ready to analyze
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-bold text-sm text-slate-900">
                    Click to browse or drag and drop your CSV here
                  </p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Supports HDFC, ICICI, SBI, Chase, Amex, BoA, or standard CSV exports
                  </p>
                </div>
              )}
            </div>
          </div>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {uploadStats && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{uploadStats.message}</span>
            </div>
          )}

          {/* Quick Demo Statement Alternative */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900 text-xs">
                Don't have a statement on hand?
              </p>
              <p className="text-slate-500 text-[11px]">
                Load our portfolio demo scenario with Netflix, Spotify, Adobe, Rent, etc.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onLoadDemo();
                onClose();
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-900 font-semibold hover:bg-amber-200 transition-colors text-xs shrink-0"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-700" />
              <span>Use Demo CSV</span>
            </button>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              onClick={handleSubmit}
              disabled={!file || isUploading}
              className="w-full py-3 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2"
            >
              <UploadCloud className="h-4 w-4" />
              <span>
                {isUploading ? 'Parsing & Scanning Recurrences...' : 'Analyze Statement'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
