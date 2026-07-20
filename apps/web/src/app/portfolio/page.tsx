'use client';

import { PieChart, Shield, TrendingUp, Layers } from 'lucide-react';

export default function PortfolioPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <PieChart className="w-6 h-6 text-emerald-400" />
          <span>Portfolio Exposure & Asset Allocation</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Diversification analytics across sports leagues, market types, and bookmakers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-xl p-6 border border-slate-800 space-y-3">
          <div className="text-xs text-slate-400 uppercase font-semibold">Active Exposure</div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">$450.00</div>
          <div className="text-xs text-slate-500">4.5% of total bankroll</div>
        </div>

        <div className="glass-card rounded-xl p-6 border border-slate-800 space-y-3">
          <div className="text-xs text-slate-400 uppercase font-semibold">Tracked Bookmakers</div>
          <div className="text-2xl font-extrabold text-white font-mono">4 Active</div>
          <div className="text-xs text-slate-500">Pinnacle, DraftKings, FanDuel, BetMGM</div>
        </div>

        <div className="glass-card rounded-xl p-6 border border-slate-800 space-y-3">
          <div className="text-xs text-slate-400 uppercase font-semibold">Primary Sport</div>
          <div className="text-2xl font-extrabold text-cyan-400 font-mono">NBA (65%)</div>
          <div className="text-xs text-slate-500">Highest historical ROI</div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6 border border-slate-800 space-y-4">
        <h3 className="font-bold text-base text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Asset Allocation Breakdown</span>
        </h3>
        <div className="h-4 bg-slate-900 rounded-full overflow-hidden flex">
          <div className="bg-emerald-500 w-[65%]" title="NBA (65%)"></div>
          <div className="bg-cyan-500 w-[20%]" title="NFL (20%)"></div>
          <div className="bg-amber-500 w-[15%]" title="Soccer (15%)"></div>
        </div>
        <div className="flex justify-between text-xs text-slate-400 font-mono pt-2">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> NBA (65%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span> NFL (20%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Soccer (15%)
          </span>
        </div>
      </div>
    </div>
  );
}
