'use client';

import React from 'react';
import {
  ShieldAlert,
  UploadCloud,
  Sparkles,
  RotateCcw,
  User,
  LayoutDashboard,
  Layers,
  ReceiptText,
} from 'lucide-react';

import Link from 'next/link';

interface NavbarProps {
  activeTab: 'dashboard' | 'subscriptions' | 'transactions';
  setActiveTab: (tab: 'dashboard' | 'subscriptions' | 'transactions') => void;
  onOpenUpload: () => void;
  onLoadDemo: () => void;
  onReset: () => void;
  onOpenAuth: () => void;
  onSignOut?: () => void;
  userName: string;
  isDemoMode: boolean;
  isLoading: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenUpload,
  onLoadDemo,
  onReset,
  onOpenAuth,
  onSignOut,
  userName,
  isDemoMode,
  isLoading,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-2">
          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-2 min-w-0 shrink hover:opacity-80 transition-opacity"
            title="Return to Home"
          >
            <ShieldAlert className="h-5 w-5 text-green-600 shrink-0" />
            <span className="font-semibold text-sm text-gray-900 truncate">
              SpendingLeak
            </span>
          </Link>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded transition-colors ${
                activeTab === 'subscriptions'
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Subscriptions</span>
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded transition-colors ${
                activeTab === 'transactions'
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <ReceiptText className="h-3.5 w-3.5" />
              <span>Transactions</span>
            </button>
          </nav>

          {/* Actions & User */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onLoadDemo}
              disabled={isLoading}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Demo
            </button>

            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Upload CSV</span>
              <span className="sm:hidden">Upload</span>
            </button>

            <button
              onClick={onReset}
              disabled={isLoading}
              className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
              title="Reset data"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-gray-200 hover:bg-gray-50 transition-colors text-xs text-gray-700"
            >
              <User className="h-3.5 w-3.5 text-gray-400" />
              <span className="max-w-[80px] truncate">{userName || 'Account'}</span>
              {isDemoMode && (
                <span className="hidden sm:inline text-[10px] text-gray-400 font-normal">(demo)</span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden border-t border-gray-100 py-1.5 justify-around">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 py-1 px-3 text-xs rounded ${
              activeTab === 'dashboard' ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-500'
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`flex items-center gap-1.5 py-1 px-3 text-xs rounded ${
              activeTab === 'subscriptions' ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-500'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Subscriptions</span>
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex items-center gap-1.5 py-1 px-3 text-xs rounded ${
              activeTab === 'transactions' ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-500'
            }`}
          >
            <ReceiptText className="h-3.5 w-3.5" />
            <span>Transactions</span>
          </button>
        </div>
      </div>
    </header>
  );
};
