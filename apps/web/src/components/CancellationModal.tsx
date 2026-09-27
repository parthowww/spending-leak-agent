'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  Copy,
  Mail,
  Calendar,
  Sparkles,
  Smartphone,
  Globe,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RecurringStream, CancellationGuide, EmailDraft } from '../types';
import { api } from '../lib/api';

interface CancellationModalProps {
  stream: RecurringStream | null;
  isOpen: boolean;
  onClose: () => void;
  onCancellationSubmitted: (streamId: string) => void;
}

export const CancellationModal: React.FC<CancellationModalProps> = ({
  stream,
  isOpen,
  onClose,
  onCancellationSubmitted,
}) => {
  const [guide, setGuide] = useState<CancellationGuide | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reminderDate, setReminderDate] = useState('');
  const [notes, setNotes] = useState('');
  
  // AI Email Drafter state
  const [showEmailDrafter, setShowEmailDrafter] = useState(false);
  const [accountName, setAccountName] = useState('Account Holder');
  const [accountEmail, setAccountEmail] = useState('');
  const [cancelReason, setCancelReason] = useState('No longer using the service');
  const [draftedEmail, setDraftedEmail] = useState<EmailDraft | null>(null);
  const [isDrafting, setIsDrafting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && stream) {
      setIsLoading(true);
      setDraftedEmail(null);
      setShowEmailDrafter(false);
      
      // Default reminder date: day before predicted renewal
      if (stream.predicted_next_charge_at) {
        const d = new Date(stream.predicted_next_charge_at);
        d.setDate(d.getDate() - 1);
        setReminderDate(d.toISOString().split('T')[0]);
      }

      api
        .getCancellationGuide(stream.id)
        .then((data) => setGuide(data))
        .catch((err) => console.error(err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, stream]);

  if (!isOpen || !stream) return null;

  const currencySymbol = stream.currency_code === 'INR' ? '₹' : '$';

  const handleGenerateEmail = async () => {
    if (!stream) return;
    setIsDrafting(true);
    try {
      const draft = await api.draftCancellationEmail(
        stream.id,
        accountName,
        accountEmail || 'user@example.com',
        cancelReason
      );
      setDraftedEmail(draft);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDrafting(false);
    }
  };

  const handleCopyEmail = () => {
    if (!draftedEmail) return;
    navigator.clipboard.writeText(
      `Subject: ${draftedEmail.subject}\n\n${draftedEmail.body_text}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitCancellation = async () => {
    if (!stream) return;
    setIsSubmitting(true);
    try {
      await api.recordCancellationCase(
        stream.id,
        'web',
        notes || 'User confirmed cancellation externally via official guide',
        reminderDate || undefined
      );

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore confetti errors
      }

      onCancellationSubmitted(stream.id);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-rose-600 to-amber-600 px-6 py-5 text-white flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-100">
              Verified Cancellation Navigator
            </span>
            <h2 className="text-xl font-bold tracking-tight">
              Cancel {stream.merchant_name}
            </h2>
            <p className="text-xs text-rose-100 mt-0.5">
              Save {currencySymbol}
              {stream.annualized_cost_display.toFixed(2)}/year by stopping this leak
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6 text-slate-800">
          {/* Important Security Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start space-x-3 text-xs text-amber-900">
            <ShieldCheck className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Official Navigator Security: </span>
              Spending-Leak Agent never asks for your bank passwords, UPI PINs, or credentials.
              Follow the official links below to cancel safely directly with the merchant.
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-slate-400 animate-pulse text-sm">
              Retrieving verified merchant cancellation routes...
            </div>
          ) : (
            <>
              {/* Direct Official Link Button */}
              {guide?.official_url && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">
                      Official Merchant Management Portal
                    </h4>
                    <p className="text-xs text-slate-500">
                      Direct verified settings page for {stream.merchant_name}
                    </p>
                  </div>
                  <a
                    href={guide.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm shrink-0"
                  >
                    <span>Open Official Site</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}

              {/* Step by Step Cancellation Methods */}
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
                  Verified Step-by-Step Instructions
                </h4>

                {guide?.methods.map((method, idx) => (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-2xl p-4 bg-white hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center space-x-2 mb-2 font-semibold text-sm text-slate-900">
                      {method.channel === 'web' ? (
                        <Globe className="h-4 w-4 text-blue-600" />
                      ) : method.channel === 'upi_autopay' ? (
                        <Smartphone className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <CreditCard className="h-4 w-4 text-purple-600" />
                      )}
                      <span>{method.title}</span>
                    </div>

                    <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600 pl-1">
                      {method.steps.map((step, sIdx) => (
                        <li key={sIdx} className="leading-relaxed">
                          <span className="text-slate-800">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>

              {/* Verification Tip */}
              {guide?.verification_tip && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900">
                  <span className="font-bold">Post-Cancellation Tip: </span>
                  {guide.verification_tip}
                </div>
              )}

              {/* AI Cancellation Email Drafter Toggle */}
              <div className="border border-indigo-100 bg-indigo-50/40 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-indigo-600" />
                    <span className="font-bold text-sm text-slate-900">
                      AI Cancellation Email Drafter
                    </span>
                  </div>
                  <button
                    onClick={() => setShowEmailDrafter(!showEmailDrafter)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    {showEmailDrafter ? 'Hide Email Drafter' : 'Draft Formal Email'}
                  </button>
                </div>

                {showEmailDrafter && (
                  <div className="space-y-3 pt-2 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-medium text-slate-700 block mb-1">
                          Subscriber Name
                        </label>
                        <input
                          type="text"
                          value={accountName}
                          onChange={(e) => setAccountName(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="font-medium text-slate-700 block mb-1">
                          Registered Email / Account ID
                        </label>
                        <input
                          type="text"
                          value={accountEmail}
                          placeholder="e.g. your-email@gmail.com"
                          onChange={(e) => setAccountEmail(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-medium text-slate-700 block mb-1">
                        Reason for Cancellation
                      </label>
                      <input
                        type="text"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>

                    <button
                      onClick={handleGenerateEmail}
                      disabled={isDrafting}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{isDrafting ? 'Drafting...' : 'Generate Formal Cancellation Email'}</span>
                    </button>

                    {draftedEmail && (
                      <div className="bg-white rounded-xl border border-indigo-200 p-4 space-y-2 mt-2">
                        <div className="flex items-center justify-between border-b pb-2">
                          <span className="font-bold text-slate-900">
                            {draftedEmail.subject}
                          </span>
                          <button
                            onClick={handleCopyEmail}
                            className="inline-flex items-center space-x-1 text-slate-600 hover:text-slate-900 text-xs font-medium"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            <span>{copied ? 'Copied!' : 'Copy'}</span>
                          </button>
                        </div>
                        <pre className="whitespace-pre-wrap font-sans text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                          {draftedEmail.body_text}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Progress Tracker / Mark as Submitted */}
              <div className="border-t border-slate-200 pt-5 space-y-3">
                <h4 className="font-bold text-sm text-slate-900">
                  Track Your Cancellation Progress
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-medium text-slate-700 block mb-1">
                      Set Renewal Check Reminder
                    </label>
                    <input
                      type="date"
                      value={reminderDate}
                      onChange={(e) => setReminderDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    />
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      We will remind you before the next billing cycle to verify stoppage.
                    </span>
                  </div>
                  <div>
                    <label className="font-medium text-slate-700 block mb-1">
                      Optional Notes (e.g. ticket number)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      placeholder="e.g. Cancelled via web, confirmation #9821"
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSubmitCancellation}
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>
                      {isSubmitting
                        ? 'Saving...'
                        : 'I Have Completed Cancellation — Mark as Submitted'}
                    </span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
