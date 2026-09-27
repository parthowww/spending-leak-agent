'use client';

import React from 'react';
import {
  TrendingUp,
  DollarSign,
  PiggyBank,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { DashboardSummary as DashboardSummaryType } from '../types';

interface DashboardSummaryProps {
  data: DashboardSummaryType | null;
  onNavigateToSubscriptions: () => void;
  onReviewCharge: (streamId: string) => void;
}

export const DashboardSummaryView: React.FC<DashboardSummaryProps> = ({
  data,
  onNavigateToSubscriptions,
  onReviewCharge,
}) => {
  if (!data) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded" />
          ))}
        </div>
        <div className="h-28 bg-gray-100 rounded" />
      </div>
    );
  }

  const currencySymbol = data.currency_code === 'INR' ? '₹' : '$';

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-wide">Monthly</span>
            <TrendingUp className="h-4 w-4 text-gray-300" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {currencySymbol}{data.total_monthly_spend.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <p className="text-xs text-gray-400 mt-1">{data.total_recurring_count} recurring streams</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-wide">Annual</span>
            <DollarSign className="h-4 w-4 text-gray-300" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {currencySymbol}{data.total_annual_spend.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <p className="text-xs text-gray-400 mt-1">projected 12-month spend</p>
        </div>

        <div className="bg-white border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-green-700 uppercase tracking-wide font-medium">Savings</span>
            <PiggyBank className="h-4 w-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-green-700">
            {currencySymbol}{data.potential_annual_savings.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <p className="text-xs text-green-600 mt-1">{data.review_queue_count} flagged leaks</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-wide">Review Queue</span>
            <AlertTriangle className="h-4 w-4 text-gray-300" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{data.review_queue_count}</div>
          <p className="text-xs text-gray-400 mt-1">waiting for your decision</p>
        </div>
      </div>

      {/* AI Summary */}
      {data.ai_summary && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-600 leading-relaxed">
          <p className="text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Summary</p>
          <p>{data.ai_summary}</p>
          <button
            onClick={onNavigateToSubscriptions}
            className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-green-700 hover:text-green-800"
          >
            Review subscriptions <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Upcoming Charges & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Upcoming */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-medium text-gray-900">Upcoming charges</h3>
            </div>
            <span className="text-xs text-gray-400">from recurring cadence</span>
          </div>

          {data.upcoming_charges.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No upcoming charges detected. Upload a CSV to see renewals.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {data.upcoming_charges.map((charge) => {
                const isUrgent = charge.days_until_due <= 5 && charge.days_until_due >= 0;
                return (
                  <div
                    key={charge.stream_id}
                    onClick={() => onReviewCharge(charge.stream_id)}
                    className={`cursor-pointer p-3 rounded border transition-colors ${
                      isUrgent
                        ? 'border-orange-200 bg-orange-50 hover:bg-orange-100'
                        : 'border-gray-100 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{charge.merchant_name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{charge.category} · {charge.frequency}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          {currencySymbol}{charge.amount_display.toFixed(2)}
                        </div>
                        <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded mt-1 font-medium ${
                          isUrgent ? 'text-orange-700 bg-orange-200' : 'text-gray-500 bg-gray-200'
                        }`}>
                          <Clock className="h-2.5 w-2.5" />
                          {charge.days_until_due === 0
                            ? 'Today'
                            : charge.days_until_due === 1
                            ? 'Tomorrow'
                            : charge.days_until_due > 0
                            ? `${charge.days_until_due}d`
                            : `${Math.abs(charge.days_until_due)}d ago`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">By category</h3>
            <span className="text-xs text-gray-400">monthly</span>
          </div>
          <div className="space-y-3">
            {data.category_breakdown.map((cat) => {
              const pct = data.total_monthly_spend > 0
                ? Math.min(100, Math.round((cat.monthly_spend / data.total_monthly_spend) * 100))
                : 0;
              return (
                <div key={cat.category}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600 truncate" title={cat.category}>
                      {cat.category} <span className="text-gray-400">({cat.count})</span>
                    </span>
                    <span className="font-medium text-gray-800 shrink-0 ml-2">
                      {currencySymbol}{cat.monthly_spend.toFixed(0)}/mo
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
