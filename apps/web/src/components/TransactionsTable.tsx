'use client';

import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { Transaction } from '../types';

interface TransactionsTableProps {
  transactions: Transaction[];
  onOpenManualModal: () => void;
  onDeleteTransaction: (id: string) => void;
  search: string;
  setSearch: (s: string) => void;
  categoryFilter: string;
  setCategoryFilter: (c: string) => void;
  categories: string[];
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  onOpenManualModal,
  onDeleteTransaction,
  search,
  setSearch,
  categoryFilter,
  setCategoryFilter,
  categories,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Table Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search merchant or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-2 pl-3 pr-8 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={onOpenManualModal}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto rounded-b-2xl border-t border-slate-100">
        <table className="w-full text-left text-xs sm:text-sm min-w-[640px]">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
            <tr>
              <th className="py-3 px-4 min-w-[100px]">Date</th>
              <th className="py-3 px-4 min-w-[200px]">Merchant / Normalized</th>
              <th className="py-3 px-4 min-w-[120px]">Category</th>
              <th className="py-3 px-4 min-w-[80px]">Rail</th>
              <th className="py-3 px-4 text-right min-w-[110px]">Amount</th>
              <th className="py-3 px-4 text-center min-w-[60px]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <Receipt className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  No transactions found matching your criteria.
                </td>
              </tr>
            ) : (
              transactions.map((t) => {
                const currSymbol = t.currency_code === 'INR' ? '₹' : '$';
                return (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                      {new Date(t.transaction_date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{t.merchant_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono truncate max-w-xs">
                        {t.raw_description}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {t.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {t.payment_rail || 'Direct'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold whitespace-nowrap">
                      <span
                        className={`inline-flex items-center space-x-1 ${
                          t.direction === 'credit' ? 'text-emerald-600' : 'text-slate-900'
                        }`}
                      >
                        {t.direction === 'credit' ? (
                          <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-500" />
                        ) : null}
                        <span>
                          {currSymbol}
                          {t.amount_display.toFixed(2)}
                        </span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onDeleteTransaction(t.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete transaction and recalculate detection"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
