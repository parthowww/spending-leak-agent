'use client';

import React, { useState } from 'react';
import {
  X,
  Lock,
  User,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { api } from '../lib/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: string;
  onUserChanged: (username: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChanged,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [demoSwitchName, setDemoSwitchName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSupabaseAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setErrorMsg('Supabase is not configured yet. Use Demo User mode below.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('Sign-up successful! Check your email to confirm or sign in.');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.session) {
          api.setAuthToken(data.session.access_token);
          onUserChanged(data.user.email || 'Supabase User');
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchDemoUser = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    api.setAuthToken(null);
    api.setDemoUserId(`usr_demo_${slug}`, name);
    onUserChanged(name);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Account & Security</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Strict multi-tenant financial data isolation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs text-slate-800">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start space-x-2 text-emerald-900">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Active User: </span>
              <span className="font-mono text-emerald-700">{currentUser}</span>.
              All bank data and detected subscriptions are private and isolated to this user ID.
            </div>
          </div>

          {/* Test Multi-Tenant Data Isolation */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3">
            <h4 className="font-bold text-sm text-slate-900">
              Test Tenant Isolation (Switch User)
            </h4>
            <p className="text-slate-500 text-[11px]">
              Switch user identity to verify that financial data remains completely isolated:
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSwitchDemoUser('Parthasarathi')}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 font-semibold text-slate-900 text-left transition-colors"
              >
                <div>Parthasarathi</div>
                <div className="text-[10px] text-slate-400">Primary Demo</div>
              </button>
              <button
                onClick={() => handleSwitchDemoUser('Alice Chen')}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 font-semibold text-slate-900 text-left transition-colors"
              >
                <div>Alice Chen</div>
                <div className="text-[10px] text-slate-400">Isolated Tenant B</div>
              </button>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="text"
                placeholder="Or custom user name..."
                value={demoSwitchName}
                onChange={(e) => setDemoSwitchName(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white"
              />
              <button
                onClick={() => demoSwitchName && handleSwitchDemoUser(demoSwitchName)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800"
              >
                Switch
              </button>
            </div>
          </div>

          {/* Supabase Auth Form */}
          <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900">
                Supabase Auth (Cloud)
              </h4>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                {isSupabaseConfigured ? 'Connected' : 'Dev Ready'}
              </span>
            </div>

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-xl flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {message && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-xl flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleSupabaseAuth} className="space-y-3">
              <div>
                <label className="font-medium text-slate-700 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-xs text-slate-500 hover:text-slate-800 underline"
                >
                  {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-50"
                >
                  {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
