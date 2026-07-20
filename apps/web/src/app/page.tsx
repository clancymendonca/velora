'use client';

import { useEffect, useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Percent,
  Zap,
  ShieldCheck,
  PlusCircle,
  BarChart2,
} from 'lucide-react';
import Link from 'next/link';

interface AnalyticsOverview {
  currentBalance: number;
  totalBets: number;
  settledBetsCount: number;
  pendingBetsCount: number;
  totalStaked: number;
  totalProfit: number;
  hitRate: number;
  roiPercent: number;
  yieldPercent: number;
  averageOdds: number;
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/analytics');
        if (res.ok) {
          const data = await res.json();
          setAnalytics(data.overview);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Portfolio Dashboard</h2>
          <p className="text-slate-400 text-sm mt-1">
            Real-time expected value, bankroll sizing, and automated performance tracking.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/bet-builder"
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/40"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Place New Bet</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Bankroll */}
        <div className="glass-card glass-card-hover rounded-xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Bankroll</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 font-extrabold text-2xl text-white">
            ${analytics ? analytics.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '10,000.00'}
          </div>
          <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+8.4% this month</span>
          </div>
        </div>

        {/* Total Net Profit */}
        <div className="glass-card glass-card-hover rounded-xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Net Profit</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 font-extrabold text-2xl text-emerald-400">
            +${analytics ? analytics.totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '840.00'}
          </div>
          <div className="mt-2 text-xs text-slate-400">Lifetime realized yield</div>
        </div>

        {/* ROI % */}
        <div className="glass-card glass-card-hover rounded-xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>ROI %</span>
            <Percent className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3 font-extrabold text-2xl text-cyan-400">
            +{analytics ? analytics.roiPercent : '6.2'}%
          </div>
          <div className="mt-2 text-xs text-slate-400">Avg odds: {analytics ? analytics.averageOdds : '1.95'}</div>
        </div>

        {/* Average CLV Edge */}
        <div className="glass-card glass-card-hover rounded-xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Avg CLV Edge</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3 font-extrabold text-2xl text-amber-400">+4.15%</div>
          <div className="mt-2 text-xs text-slate-400">Closing line superiority</div>
        </div>
      </div>

      {/* Main Grid: Interactive Chart & Kelly Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bankroll Growth Chart Mock Visualization */}
        <div className="lg:col-span-2 glass-card rounded-xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-emerald-400" />
              <span>Bankroll Growth & Equity Curve</span>
            </h3>
            <span className="text-xs bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1 rounded-md">
              30 Days
            </span>
          </div>

          <div className="h-64 bg-slate-950/60 rounded-lg border border-slate-800/80 p-4 flex flex-col justify-between relative overflow-hidden">
            {/* Background SVG Grid Line */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>

            <div className="flex justify-between text-xs text-slate-500 z-10">
              <span>$11,000</span>
              <span>Peak: $10,840</span>
            </div>

            {/* Simulated Curve Graph Line */}
            <svg className="w-full h-36 overflow-visible z-10">
              <path
                d="M0 120 C 50 110, 100 130, 150 90 C 200 60, 250 80, 300 40 C 350 20, 400 50, 450 30 C 500 10, 550 25, 600 15"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>

            <div className="flex justify-between text-xs text-slate-500 z-10 pt-2 border-t border-slate-900">
              <span>Jul 1</span>
              <span>Jul 7</span>
              <span>Jul 14</span>
              <span>Jul 20</span>
            </div>
          </div>
        </div>

        {/* Kelly Recommendations Sidebar */}
        <div className="glass-card rounded-xl p-6 border border-slate-800 space-y-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Kelly Sizing Signals</span>
          </h3>

          <div className="space-y-3">
            <div className="p-3.5 bg-slate-900/90 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Boston Celtics -3.5</span>
                <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  +4.8% EV
                </span>
              </div>
              <p className="text-xs text-slate-400">Pinnacle @ 1.87 vs Fair 1.78</p>
              <div className="flex justify-between text-xs text-slate-300 pt-1 font-mono">
                <span>Kelly (0.25):</span>
                <span className="font-bold text-emerald-400">$125.00 (1.25%)</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-900/90 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Chiefs ML</span>
                <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  +3.2% EV
                </span>
              </div>
              <p className="text-xs text-slate-400">DraftKings @ 2.05 vs Fair 1.98</p>
              <div className="flex justify-between text-xs text-slate-300 pt-1 font-mono">
                <span>Kelly (0.25):</span>
                <span className="font-bold text-emerald-400">$85.00 (0.85%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
