'use client';

import React from 'react';
import {
  CheckCircle,
  XCircle,
  HelpCircle,
  Bell,
  ExternalLink,
  ChevronRight,
  Info,
  Calendar,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { RecurringStream } from '../types';

interface SubscriptionCardProps {
  stream: RecurringStream;
  onKeep: (streamId: string) => void;
  onCancelOrReview: (stream: RecurringStream) => void;
  onNotSubscription: (streamId: string) => void;
  onRemindLater: (streamId: string) => void;
  onOpenEvidence: (stream: RecurringStream) => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  stream,
  onKeep,
  onCancelOrReview,
  onNotSubscription,
  onRemindLater,
  onOpenEvidence,
}) => {
  const currencySymbol = stream.currency_code === 'INR' ? '₹' : '$';
  const confidencePct = Math.round(stream.confidence_score * 100);

  // Confidence styling
  const confidenceColor =
    confidencePct >= 80
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : confidencePct >= 60
      ? 'bg-blue-50 text-blue-700 border-blue-200'
      : 'bg-amber-50 text-amber-700 border-amber-200';

  // Status styling
  const statusStyles: Record<string, { label: string; badgeClass: string }> = {
    detected: { label: 'Review Needed', badgeClass: 'bg-amber-100 text-amber-800' },
    keep: { label: 'Kept (Approved)', badgeClass: 'bg-emerald-100 text-emerald-800' },
    review: { label: 'Flagged for Review', badgeClass: 'bg-purple-100 text-purple-800' },
    cancel: { label: 'Marked for Cancellation', badgeClass: 'bg-rose-100 text-rose-800' },
    cancelled: { label: 'Cancellation Submitted', badgeClass: 'bg-rose-100 text-rose-800 font-bold' },
    not_subscription: { label: 'Dismissed', badgeClass: 'bg-slate-100 text-slate-600' },
    remind_later: { label: 'Remind Later', badgeClass: 'bg-blue-100 text-blue-800' },
  };

  const statusInfo = statusStyles[stream.user_status] || {
    label: stream.user_status,
    badgeClass: 'bg-slate-100 text-slate-700',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-4 sm:p-6 relative">
      {/* Top Header: Merchant, Category, Status badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <h3 className="font-bold text-base sm:text-lg text-slate-900 tracking-tight truncate max-w-[200px] sm:max-w-xs" title={stream.merchant_name}>
              {stream.merchant_name}
            </h3>
            <span
              className={`text-[11px] sm:text-xs px-2 py-0.5 rounded-full font-semibold border shrink-0 ${confidenceColor}`}
              title={`Confidence score based on ${stream.occurrence_count} occurrences and interval consistency`}
            >
              {confidencePct}% confidence
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate">
            {stream.category} • <span className="capitalize">{stream.frequency}</span>
          </p>
        </div>

        <span className={`text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap ${statusInfo.badgeClass}`}>
          {statusInfo.label}
        </span>
      </div>

      {/* Middle Financial Summary & Cadence */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4 py-3 border-y border-slate-100 text-sm">
        <div>
          <span className="text-xs text-slate-500 block">Cycle Amount</span>
          <span className="font-bold text-slate-900 text-base">
            {currencySymbol}
            {stream.amount_display.toFixed(2)}
          </span>
          <span className="text-xs text-slate-400 block capitalize">
            per {stream.frequency === 'annual' ? 'year' : stream.frequency === 'quarterly' ? 'quarter' : 'month'}
          </span>
        </div>

        <div>
          <span className="text-xs text-slate-500 block">Annual Impact</span>
          <span className="font-bold text-emerald-700 text-base">
            {currencySymbol}
            {stream.annualized_cost_display.toFixed(2)}
          </span>
          <span className="text-xs text-slate-400 block">per year</span>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <span className="text-xs text-slate-500 block">Next Expected Charge</span>
          <span className="font-medium text-slate-900 flex items-center space-x-1">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>
              {new Date(stream.predicted_next_charge_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </span>
        </div>
      </div>

      {/* Plain Language Detection Reason */}
      <div className="bg-slate-50 rounded-xl p-3 mb-4 text-xs text-slate-700 border border-slate-100 leading-relaxed">
        <div className="font-semibold text-slate-900 flex items-center space-x-1 mb-1">
          <Info className="h-3 w-3 text-slate-500" />
          <span>Why this was detected:</span>
        </div>
        <p>{stream.detection_reason}</p>
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Keep */}
          <button
            onClick={() => onKeep(stream.id)}
            className={`inline-flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              stream.user_status === 'keep'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <CheckCircle className="h-3.5 w-3.5 shrink-0" />
            <span>Keep</span>
          </button>

          {/* Cancel / Review */}
          <button
            onClick={() => onCancelOrReview(stream)}
            className={`inline-flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              stream.user_status === 'cancel' || stream.user_status === 'cancelled'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <XCircle className="h-3.5 w-3.5 shrink-0" />
            <span>Cancel / Review</span>
          </button>

          {/* Not a Subscription */}
          <button
            onClick={() => onNotSubscription(stream.id)}
            className="inline-flex items-center space-x-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Mark as ordinary one-time purchase or false positive"
          >
            <HelpCircle className="h-3.5 w-3.5 shrink-0" />
            <span>Not a sub</span>
          </button>

          {/* Remind Later */}
          <button
            onClick={() => onRemindLater(stream.id)}
            className="inline-flex items-center space-x-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Snooze and remind before next cycle"
          >
            <Bell className="h-3.5 w-3.5 shrink-0" />
            <span>Remind</span>
          </button>
        </div>

        {/* Evidence & AI Drawer Trigger */}
        <button
          onClick={() => onOpenEvidence(stream)}
          className="self-end sm:self-auto inline-flex items-center space-x-1 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors py-1 px-2 rounded-md hover:bg-slate-100 shrink-0"
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
          <span>Evidence &amp; AI</span>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        </button>
      </div>
    </div>
  );
};
