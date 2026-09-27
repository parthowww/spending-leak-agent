'use client';

import React, { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

interface ManualTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ManualTransactionModal: React.FC<ManualTransactionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [dateVal, setDateVal] = useState(new Date().toISOString().split('T')[0]);
  const [amountVal, setAmountVal] = useState('');
  const [descriptionVal, setDescriptionVal] = useState('');
  const [categoryVal, setCategoryVal] = useState('Streaming & Entertainment');
  const [directionVal, setDirectionVal] = useState<'debit' | 'credit'>('debit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amountVal);
    if (!parsedAmount || parsedAmount <= 0) {
      setErrorMsg('Please enter a valid amount greater than 0.');
      return;
    }
    if (!descriptionVal.trim()) {
      setErrorMsg('Please enter a transaction description or merchant name.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await api.createManualTransaction({
        transaction_date: dateVal,
        amount: parsedAmount,
        raw_description: descriptionVal.trim(),
        category: categoryVal,
        direction: directionVal,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add manual transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Add Manual Transaction</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-xl flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Transaction Date
            </label>
            <input
              type="date"
              value={dateVal}
              onChange={(e) => setDateVal(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Amount (₹ or $)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 499.00"
              value={amountVal}
              onChange={(e) => setAmountVal(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Description / Merchant
            </label>
            <input
              type="text"
              placeholder="e.g. Netflix, Spotify, Gym Membership"
              value={descriptionVal}
              onChange={(e) => setDescriptionVal(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Category
              </label>
              <select
                value={categoryVal}
                onChange={(e) => setCategoryVal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                <option value="Streaming & Entertainment">Streaming</option>
                <option value="Software & SaaS">Software & SaaS</option>
                <option value="Cloud & Storage">Cloud & Storage</option>
                <option value="Fitness & Wellness">Fitness</option>
                <option value="Utilities">Utilities</option>
                <option value="Housing & Rent">Housing</option>
                <option value="Other Recurring">Other</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Direction
              </label>
              <select
                value={directionVal}
                onChange={(e) => setDirectionVal(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                <option value="debit">Debit (Expense)</option>
                <option value="credit">Credit (Income)</option>
              </select>
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl font-bold text-sm bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center space-x-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>{isSubmitting ? 'Saving...' : 'Add Transaction'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
