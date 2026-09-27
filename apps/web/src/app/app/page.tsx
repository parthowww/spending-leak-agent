'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import {
  DashboardSummary as DashboardSummaryType,
  RecurringStream,
  Transaction,
} from '../../types';

import { Navbar } from '../../components/Navbar';
import { DashboardSummaryView } from '../../components/DashboardSummary';
import { SubscriptionCard } from '../../components/SubscriptionCard';
import { CancellationModal } from '../../components/CancellationModal';
import { SubscriptionEvidenceModal } from '../../components/SubscriptionEvidenceModal';
import { CSVUploadModal } from '../../components/CSVUploadModal';
import { TransactionsTable } from '../../components/TransactionsTable';
import { ManualTransactionModal } from '../../components/ManualTransactionModal';
import { AuthModal } from '../../components/AuthModal';

export default function AppPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'subscriptions' | 'transactions'>('dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardSummaryType | null>(null);
  const [streams, setStreams] = useState<RecurringStream[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('Parthasarathi');
  const [isDemoMode, setIsDemoMode] = useState(true);

  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [txnSearch, setTxnSearch] = useState('');
  const [txnCategoryFilter, setTxnCategoryFilter] = useState('All');

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isManualTxnOpen, setIsManualTxnOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedStreamForCancel, setSelectedStreamForCancel] = useState<RecurringStream | null>(null);
  const [selectedStreamForEvidence, setSelectedStreamForEvidence] = useState<RecurringStream | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const [summary, streamList, txnList] = await Promise.all([
        api.getDashboardSummary(),
        api.getRecurringStreams(),
        api.getTransactions(1, 100),
      ]);
      setDashboardData(summary);
      setStreams(streamList);
      setTransactions(txnList);
    } catch {
      setApiError(
        'Cannot connect to backend at http://localhost:8000. Make sure the FastAPI server is running.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initUser = async () => {
      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            api.setAuthToken(session.access_token);
            setIsDemoMode(false);
            const userEmail = session.user.email || '';
            const fullName = session.user.user_metadata?.full_name || session.user.user_metadata?.name;
            setUserName(fullName || userEmail.split('@')[0] || 'User');
            return;
          }
        } catch (err) {
          console.error('Error fetching Supabase session:', err);
        }
      }

      const token = api.getAuthToken();
      if (token) {
        setIsDemoMode(false);
      } else {
        setIsDemoMode(true);
        const demoName = api.getDemoUserName();
        if (demoName) setUserName(demoName);
      }
    };

    initUser();
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleKeep = async (streamId: string) => {
    try { await api.submitStreamDecision(streamId, 'keep'); fetchData(); } catch {}
  };
  const handleNotSubscription = async (streamId: string) => {
    try { await api.submitStreamDecision(streamId, 'not_subscription'); fetchData(); } catch {}
  };
  const handleRemindLater = async (streamId: string) => {
    const d = new Date(); d.setDate(d.getDate() + 7);
    try { await api.submitStreamDecision(streamId, 'remind_later', undefined, d.toISOString().split('T')[0]); fetchData(); } catch {}
  };
  const handleCancelOrReview = (stream: RecurringStream) => setSelectedStreamForCancel(stream);
  const handleLoadDemo = async () => {
    setIsLoading(true);
    try { await api.loadDemoData(); await fetchData(); } catch {} finally { setIsLoading(false); }
  };
  const handleReset = async () => {
    if (!confirm('Reset all transactions and subscription data for this account?')) return;
    setIsLoading(true);
    try { await api.resetData(); await fetchData(); } catch {} finally { setIsLoading(false); }
  };

  const handleSignOut = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    api.setAuthToken(null);
    setIsDemoMode(true);
    router.push('/login');
  };

  const categories = Array.from(new Set(streams.map((s) => s.category).filter(Boolean)));
  const txnCategories = Array.from(new Set(transactions.map((t) => t.category).filter(Boolean)));

  const filteredStreams = streams.filter((s) => {
    if (statusFilter === 'review' && s.user_status !== 'detected' && s.user_status !== 'review') return false;
    if (statusFilter === 'keep' && s.user_status !== 'keep') return false;
    if (statusFilter === 'cancel' && s.user_status !== 'cancel' && s.user_status !== 'cancelled') return false;
    if (statusFilter === 'not_subscription' && s.user_status !== 'not_subscription') return false;
    if (categoryFilter !== 'All' && s.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpload={() => setIsUploadOpen(true)}
        onLoadDemo={handleLoadDemo}
        onReset={handleReset}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={handleSignOut}
        userName={userName}
        isDemoMode={isDemoMode}
        isLoading={isLoading}
      />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Backend error banner */}
        {apiError && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2 min-w-0">
              <span className="shrink-0 text-yellow-700 font-bold text-sm mt-0.5">!</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-yellow-900">Backend Offline</p>
                <p className="text-xs text-yellow-700 mt-0.5 break-words">{apiError}</p>
              </div>
            </div>
            <button
              onClick={fetchData}
              className="shrink-0 px-3 py-1.5 rounded bg-yellow-800 text-white text-xs font-medium hover:bg-yellow-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && transactions.length === 0 && !apiError && (
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1.5 max-w-xl">
                <h1 className="text-xl font-semibold text-gray-900">Find your recurring charges</h1>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Upload a bank statement CSV or try the demo to detect forgotten subscriptions and recurring payments.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full md:w-auto">
                <button
                  onClick={handleLoadDemo}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded bg-gray-900 hover:bg-gray-700 text-white font-medium text-sm transition-colors"
                >
                  <Sparkles className="h-4 w-4" />
                  Load Demo
                </button>
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded text-gray-700 font-medium text-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Upload CSV
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── DASHBOARD TAB ─────────────────────────────────── */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <DashboardSummaryView
              data={dashboardData}
              onNavigateToSubscriptions={() => setActiveTab('subscriptions')}
              onReviewCharge={(streamId) => {
                const s = streams.find((item) => item.id === streamId);
                if (s) setSelectedStreamForCancel(s);
              }}
            />

            {isLoading && streams.length === 0 ? (
              <div className="space-y-3">
                <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-44 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              </div>
            ) : streams.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-900">
                    Detected subscriptions
                  </h2>
                  <button
                    onClick={() => setActiveTab('subscriptions')}
                    className="inline-flex items-center gap-1 text-xs text-green-700 hover:text-green-800 font-medium"
                  >
                    View all ({streams.length})
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {streams.slice(0, 4).map((s) => (
                    <SubscriptionCard
                      key={s.id}
                      stream={s}
                      onKeep={handleKeep}
                      onCancelOrReview={handleCancelOrReview}
                      onNotSubscription={handleNotSubscription}
                      onRemindLater={handleRemindLater}
                      onOpenEvidence={(st) => setSelectedStreamForEvidence(st)}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* ── SUBSCRIPTIONS TAB ─────────────────────────────── */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Subscriptions</h1>
                <p className="text-xs text-gray-500 mt-0.5">Keep, cancel, or dismiss each detected charge</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded border border-gray-200 bg-white text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="all">All ({streams.length})</option>
                  <option value="review">Needs Review</option>
                  <option value="keep">Kept</option>
                  <option value="cancel">Cancelled</option>
                  <option value="not_subscription">Dismissed</option>
                </select>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 rounded border border-gray-200 bg-white text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="All">All Categories</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-48 bg-slate-200/70 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filteredStreams.length === 0 ? (
              <div className="bg-white rounded border border-gray-200 p-12 text-center text-gray-400 text-sm">
                No subscriptions match the selected filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredStreams.map((s) => (
                  <SubscriptionCard
                    key={s.id}
                    stream={s}
                    onKeep={handleKeep}
                    onCancelOrReview={handleCancelOrReview}
                    onNotSubscription={handleNotSubscription}
                    onRemindLater={handleRemindLater}
                    onOpenEvidence={(st) => setSelectedStreamForEvidence(st)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TRANSACTIONS TAB ──────────────────────────────── */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Transactions</h1>
              <p className="text-xs text-gray-500 mt-0.5">All imported rows with merchant and description</p>
            </div>
            <TransactionsTable
              transactions={transactions.filter((t) => {
                if (txnSearch) {
                  const q = txnSearch.toLowerCase();
                  if (!t.merchant_name.toLowerCase().includes(q) && !t.raw_description.toLowerCase().includes(q))
                    return false;
                }
                if (txnCategoryFilter !== 'All' && t.category !== txnCategoryFilter) return false;
                return true;
              })}
              onOpenManualModal={() => setIsManualTxnOpen(true)}
              onDeleteTransaction={async (id) => {
                if (confirm('Delete this transaction?')) { await api.deleteTransaction(id); fetchData(); }
              }}
              search={txnSearch}
              setSearch={setTxnSearch}
              categoryFilter={txnCategoryFilter}
              setCategoryFilter={setTxnCategoryFilter}
              categories={txnCategories}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-4 mt-8">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-3.5 w-3.5 text-green-600" />
            <span className="text-sm font-medium text-gray-700">SpendingLeak</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
            <span>·</span>
            <span>No credential storage</span>
            <span>·</span>
            <span>Bank-agnostic CSV</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CSVUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={fetchData}
        onLoadDemo={handleLoadDemo}
      />
      <CancellationModal
        stream={selectedStreamForCancel}
        isOpen={Boolean(selectedStreamForCancel)}
        onClose={() => setSelectedStreamForCancel(null)}
        onCancellationSubmitted={() => fetchData()}
      />
      <SubscriptionEvidenceModal
        stream={selectedStreamForEvidence}
        isOpen={Boolean(selectedStreamForEvidence)}
        onClose={() => setSelectedStreamForEvidence(null)}
      />
      <ManualTransactionModal
        isOpen={isManualTxnOpen}
        onClose={() => setIsManualTxnOpen(false)}
        onSuccess={fetchData}
      />
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={userName}
        onUserChanged={(name) => { setUserName(name); fetchData(); }}
      />
    </div>
  );
}
