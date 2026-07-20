'use client';

import { useEffect, useState } from 'react';
import { Wallet, TrendingUp, RefreshCw } from 'lucide-react';

export function Header() {
  const [balance, setBalance] = useState<number | null>(null);

  const fetchBankroll = async () => {
    try {
      const res = await fetch('/api/bankroll');
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance);
      }
    } catch (e) {
      console.error('Failed to fetch bankroll balance', e);
    }
  };

  useEffect(() => {
    fetchBankroll();
  }, []);

  return (
    <header className="h-16 border-b border-slate-800/60 bg-slate-950/60 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-slate-100">Velora Sports Portfolio Management</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Bankroll Pill */}
        <div className="bg-slate-900 border border-slate-800 px-4 py-1.5 rounded-full flex items-center gap-3 shadow-inner">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Bankroll:</span>
          </div>
          <span className="font-extrabold text-sm text-emerald-400">
            ${balance !== null ? balance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '10,000.00'}
          </span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={fetchBankroll}
          className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
          title="Refresh Balance"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Pro Account Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-7 h-7 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center justify-center">
            AQ
          </div>
          <span className="text-xs font-medium text-slate-300">Alpha Quant</span>
        </div>
      </div>
    </header>
  );
}
