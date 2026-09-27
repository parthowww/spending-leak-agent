import Link from 'next/link';
import {
  ShieldAlert,
  UploadCloud,
  Sparkles,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  PiggyBank,
  Layers,
  Lock,
  Zap,
  BarChart3,
  FileText,
} from 'lucide-react';

const features = [
  {
    icon: UploadCloud,
    title: 'CSV Bank Statement Upload',
    description:
      'Works with any Indian bank — HDFC, SBI, ICICI, Axis, Kotak. Just export your statement as CSV and upload.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Zap,
    title: 'Instant Recurrence Detection',
    description:
      'Our deterministic engine detects monthly, quarterly, and annual recurring charges with a confidence score and full evidence trail.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: PiggyBank,
    title: 'Savings Estimation',
    description:
      "See the exact annual rupee cost of every subscription you've forgotten. Know exactly what you'd save by cancelling.",
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: Layers,
    title: 'Verified Cancellation Guides',
    description:
      'Official step-by-step instructions for Netflix, Spotify, Adobe, ChatGPT, Google One, and more — no fake links.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Lock,
    title: 'Zero Credential Storage',
    description:
      'We never ask for bank passwords, UPI PINs, or OTPs. Statements are parsed in memory — nothing is stored as plain text.',
    color: 'bg-rose-50 text-rose-600',
  },
  {
    icon: BarChart3,
    title: 'Explainable AI',
    description:
      'Every detection is backed by math, not a black box. Gemini AI only writes plain-language summaries — it never calculates money.',
    color: 'bg-indigo-50 text-indigo-600',
  },
];

const howItWorks = [
  {
    step: '01',
    title: 'Upload or Demo',
    description: 'Upload your bank statement CSV, or hit "Load Demo" to instantly see what the app does.',
  },
  {
    step: '02',
    title: 'AI Detects Leaks',
    description: 'Our engine scans for recurring debits, scores them by confidence, and groups them into streams.',
  },
  {
    step: '03',
    title: 'Review & Decide',
    description: 'For each detected subscription: Keep, Cancel, Dismiss, or Remind me later.',
  },
  {
    step: '04',
    title: 'Cancel Safely',
    description: 'Get official step-by-step cancellation guides with verified merchant links — no automation risk.',
  },
];

const sampleSubscriptions = [
  { name: 'Netflix', amount: '₹499', period: '/mo', color: 'bg-red-500' },
  { name: 'Spotify', amount: '₹119', period: '/mo', color: 'bg-green-500' },
  { name: 'Adobe CC', amount: '₹1,675', period: '/mo', color: 'bg-red-600' },
  { name: 'ChatGPT Plus', amount: '₹1,999', period: '/mo', color: 'bg-emerald-500' },
  { name: 'Google One', amount: '₹130', period: '/mo', color: 'bg-blue-500' },
  { name: 'Cult.fit', amount: '₹1,499', period: '/qtr', color: 'bg-orange-500' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── NAVBAR ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <span className="font-bold text-base text-slate-900 tracking-tight whitespace-nowrap">
                Spending-Leak Agent
              </span>
            </div>

            {/* CTA buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/app"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition-all"
              >
                <Sparkles className="h-4 w-4" />
                <span>Try Free Demo</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white pt-16 pb-20 sm:pt-24 sm:pb-28">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-br from-emerald-100/60 via-teal-50/40 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative w-full px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            100% Free · No Bank Password Required · India-First
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
            Stop Paying for
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              Subscriptions You Forgot
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed mb-10">
            Upload your bank statement and our AI agent instantly finds every recurring charge — Netflix,
            Spotify, Adobe, unused SaaS tools — and shows you exactly how to cancel them.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/app"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-emerald-600 text-white font-bold text-base hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 transition-all"
            >
              <Sparkles className="h-5 w-5" />
              Load Demo — See It in Action
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/app"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-slate-900 font-bold text-base border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm transition-all"
            >
              <UploadCloud className="h-5 w-5 text-slate-500" />
              Upload My Statement
            </Link>
          </div>

          <p className="mt-4 text-xs text-slate-400">
            No sign-up required for demo · Your data is never stored in plain text
          </p>
        </div>

        {/* Preview Card Cluster */}
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 mt-16">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/60 p-5 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Detected Leaks</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-0.5">₹5,921 <span className="text-sm font-medium text-slate-500">/ month</span></p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 font-medium">Potential Savings</p>
                <p className="text-xl font-extrabold text-emerald-600 mt-0.5">₹71,052/yr</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {sampleSubscriptions.map((sub) => (
                <div
                  key={sub.name}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className={`h-8 w-8 rounded-lg ${sub.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {sub.name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-slate-900 truncate">{sub.name}</p>
                    <p className="text-xs text-slate-500 whitespace-nowrap">
                      {sub.amount}<span className="text-slate-400">{sub.period}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">6 recurring streams detected with 94% avg. confidence</span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Verified
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How It Works
            </h2>
            <p className="mt-3 text-slate-500 text-base max-w-xl mx-auto">
              From zero to knowing all your recurring charges — in under 60 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step, i) => (
              <div key={step.step} className="relative">
                {i < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-slate-200 to-transparent z-0" />
                )}
                <div className="relative z-10 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow h-full">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-sm mb-4">
                    {step.step}
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ────────────────────────────────────────── */}
      <section className="py-20 bg-slate-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Everything You Need
            </h2>
            <p className="mt-3 text-slate-500 text-base max-w-xl mx-auto">
              A complete toolkit to audit, understand, and reduce your recurring expenses.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className={`w-10 h-10 rounded-xl ${feat.color} flex items-center justify-center mb-4`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{feat.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ──────────────────────────────────────────── */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400 mb-8">
            Security &amp; Privacy Guarantees
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { icon: Lock, label: 'No Bank Credentials', sub: 'We never ask for passwords or PINs' },
              { icon: FileText, label: 'In-Memory Parsing', sub: 'CSVs processed, never stored' },
              { icon: ShieldAlert, label: 'Row-Level Isolation', sub: 'Your data stays strictly yours' },
              { icon: TrendingDown, label: 'Formula-Based AI', sub: 'Math, not black-box decisions' },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <div key={t.label} className="space-y-2">
                  <div className="mx-auto w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-slate-600" />
                  </div>
                  <p className="font-semibold text-sm text-slate-900">{t.label}</p>
                  <p className="text-xs text-slate-500">{t.sub}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Ready to Stop the Leaks?
          </h2>
          <p className="text-slate-400 text-base mb-8 leading-relaxed">
            Load the demo in 1 click — no sign-up, no card, no bank password. Just instant clarity on where your money goes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/app"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-base shadow-lg shadow-emerald-900/40 transition-all"
            >
              <Sparkles className="h-5 w-5" />
              Launch Demo Now
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-base border border-white/20 transition-all"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="bg-slate-900 py-8">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white">
            <ShieldAlert className="h-4 w-4 text-emerald-400" />
            <span className="font-semibold text-sm">Spending-Leak Agent</span>
          </div>
          <p className="text-xs text-slate-500 text-center">
            Transparent Mathematical Intelligence · Zero credential storage · Bank-agnostic CSV ingestion
          </p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-xs text-slate-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/app" className="text-xs text-slate-400 hover:text-white transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
