'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Layers,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  HelpCircle,
} from 'lucide-react';
import { RecurringStream } from '../types';
import { api } from '../lib/api';

interface SubscriptionEvidenceModalProps {
  stream: RecurringStream | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionEvidenceModal: React.FC<SubscriptionEvidenceModalProps> = ({
  stream,
  isOpen,
  onClose,
}) => {
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  if (!isOpen || !stream) return null;

  const currencySymbol = stream.currency_code === 'INR' ? '₹' : '$';
  const evidence = stream.evidence || {};
  const breakdown = evidence.scoring_breakdown || {
    occurrences: stream.occurrence_count,
    interval_score: 0.9,
    amount_consistency: 0.95,
    merchant_confidence: 1.0,
    recency: 1.0,
  };

  const handleFetchAiExplanation = async () => {
    setIsLoadingAi(true);
    try {
      const res = await api.getAIExplanation(stream.id);
      setAiExplanation(res.explanation);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Mathematical Transparency
            </span>
            <h2 className="text-xl font-bold tracking-tight">
              Evidence Ledger: {stream.merchant_name}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Deterministic rule-based recurrence breakdown
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6 text-slate-800 text-xs">
          {/* AI Plain Language Assistant */}
          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <span className="font-bold text-sm text-slate-900">
                  AI Plain-Language Explanation
                </span>
              </div>
              <button
                onClick={handleFetchAiExplanation}
                disabled={isLoadingAi}
                className="text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                {isLoadingAi ? 'Consulting AI...' : aiExplanation ? 'Refresh' : 'Explain with AI'}
              </button>
            </div>
            <p className="text-slate-700 leading-relaxed text-xs">
              {aiExplanation ||
                stream.detection_reason ||
                'Deterministic rule engine matched regular recurrence patterns.'}
            </p>
          </div>

          {/* Mathematical Confidence Breakdown */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3">
            <h4 className="font-bold text-sm text-slate-900">
              Confidence Score Formula Breakdown (Score: {Math.round(stream.confidence_score * 100)}%)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase">Occurrences</span>
                <span className="font-bold text-sm text-slate-900">
                  {breakdown.occurrences} charges
                </span>
                <span className="text-slate-500 text-[11px] block mt-0.5">30% weight</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase">Interval Fit</span>
                <span className="font-bold text-sm text-slate-900">
                  {Math.round(breakdown.interval_score * 100)}% consistency
                </span>
                <span className="text-slate-500 text-[11px] block mt-0.5">30% weight</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase">Amount Spread</span>
                <span className="font-bold text-sm text-slate-900">
                  {Math.round(breakdown.amount_consistency * 100)}% consistency
                </span>
                <span className="text-slate-500 text-[11px] block mt-0.5">20% weight</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase">Merchant Known</span>
                <span className="font-bold text-sm text-slate-900">
                  {Math.round(breakdown.merchant_confidence * 100)}% match
                </span>
                <span className="text-slate-500 text-[11px] block mt-0.5">10% weight</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase">Recency</span>
                <span className="font-bold text-sm text-slate-900">
                  {Math.round(breakdown.recency * 100)}% active
                </span>
                <span className="text-slate-500 text-[11px] block mt-0.5">10% weight</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase">Cadence Cadre</span>
                <span className="font-bold text-sm text-slate-900 capitalize">
                  {stream.frequency}
                </span>
                <span className="text-slate-500 text-[11px] block mt-0.5">
                  ~{Math.round(stream.expected_interval_days)} days
                </span>
              </div>
            </div>
          </div>

          {/* Supporting Transactions Ledger */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-slate-900 flex items-center space-x-1.5">
              <FileSpreadsheet className="h-4 w-4 text-slate-500" />
              <span>Supporting Bank Transactions ({stream.transactions?.length || stream.occurrence_count})</span>
            </h4>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Raw Bank Description</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stream.transactions && stream.transactions.length > 0 ? (
                    stream.transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-medium text-slate-700 whitespace-nowrap">
                          {new Date(t.transaction_date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-600 break-all">
                          {t.raw_description}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                          {currencySymbol}
                          {t.amount_display.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-slate-400">
                        {stream.occurrence_count} transaction instances matched.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
