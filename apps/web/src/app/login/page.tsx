'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  User,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { api } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [demoName, setDemoName] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError('Supabase is not configured. Use Demo mode below.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (tab === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess('Account created! Check your email to confirm, then sign in.');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.session) {
          api.setAuthToken(data.session.access_token);
          router.push('/app');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (name: string) => {
    if (!name.trim()) return;
    const cleanName = name.trim();
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    api.setAuthToken(null);
    api.setDemoUserId(`usr_demo_${slug}`, cleanName);
    router.push('/app');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex flex-col">
      {/* Minimal top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <span className="font-bold text-sm text-slate-900 tracking-tight">Spending-Leak Agent</span>
        </Link>
        <Link href="/" className="text-xs text-slate-500 hover:text-slate-800 transition-colors">
          ← Back to Home
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back</h1>
            <p className="mt-2 text-sm text-slate-500">
              Sign in to access your spending analysis dashboard
            </p>
          </div>

          {/* Auth Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-100/60 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-slate-100">
              <button
                onClick={() => { setTab('signin'); setError(null); setSuccess(null); }}
                className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                  tab === 'signin'
                    ? 'text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50/50'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setTab('signup'); setError(null); setSuccess(null); }}
                className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                  tab === 'signup'
                    ? 'text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50/50'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign Up
              </button>
            </div>

            <div className="p-7 space-y-5">
              {/* Alerts */}
              {error && (
                <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="flex items-start gap-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              {/* Auth Form */}
              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {!isSupabaseConfigured && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                    <strong>Dev Mode:</strong> Supabase not configured. Use the Demo mode below to try the app without an account.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !isSupabaseConfigured}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Please wait...
                    </>
                  ) : (
                    <>
                      {tab === 'signin' ? 'Sign In to Dashboard' : 'Create Account'}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative flex items-center">
                <div className="flex-1 border-t border-slate-100" />
                <span className="mx-3 text-xs text-slate-400 bg-white px-1 shrink-0">or continue with demo</span>
                <div className="flex-1 border-t border-slate-100" />
              </div>

              {/* Demo Mode */}
              <div className="space-y-3">
                <p className="text-xs text-slate-500 text-center">
                  No account needed — pick a demo user and explore instantly
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { name: 'Parthasarathi', label: 'Primary Demo' },
                    { name: 'Alice Chen', label: 'Tenant B' },
                  ].map((u) => (
                    <button
                      key={u.name}
                      onClick={() => handleDemoLogin(u.name)}
                      className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-all text-left"
                    >
                      <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {u.name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">{u.name}</p>
                        <p className="text-[10px] text-slate-400">{u.label}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Custom demo name */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Custom name..."
                      value={demoName}
                      onChange={(e) => setDemoName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleDemoLogin(demoName)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={() => handleDemoLogin(demoName)}
                    disabled={!demoName.trim()}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors shrink-0"
                  >
                    Go →
                  </button>
                </div>

                <Link
                  href="/app"
                  className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-sm hover:opacity-90 transition-all shadow-md shadow-emerald-600/20"
                >
                  <Sparkles className="h-4 w-4" />
                  Jump Straight to Demo Dashboard
                </Link>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-slate-400">
            By continuing you agree to our privacy-first approach — no bank credentials stored.
          </p>
        </div>
      </main>
    </div>
  );
}
