'use client';

import { useEffect, useState } from 'react';
import { Wallet, Plus } from 'lucide-react';

interface BankrollEntry {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  timestamp: string;
}

export default function BankrollPage() {
  const [balance, setBalance] = useState<number>(10000);
  const [history, setHistory] = useState<BankrollEntry[]>([]);
  const [amount, setAmount] = useState<string>('500');
  const [type, setType] = useState<'deposit' | 'withdrawal'>('deposit');

  const fetchBankroll = async () => {
    try {
      const res = await fetch('/api/bankroll');
      if (res.ok) {
        const body = await res.json();
        setBalance(body.balance || 10000);
        setHistory(body.history || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBankroll();
  }, []);

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    try {
      const res = await fetch('/api/bankroll', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, amount: numAmount }),
      });
      if (res.ok) {
        fetchBankroll();
        setAmount('500');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Wallet className="w-6 h-6 text-emerald-400" />
            <span>Bankroll Ledger & Cash Flow</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete record of deposits, withdrawals, bet wagers, and settlement payouts.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 px-5 py-2 rounded-xl">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Current Available Funds</div>
          <div className="text-xl font-extrabold text-emerald-400 font-mono">
            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Deposit / Withdrawal Form */}
        <div className="glass-card rounded-xl p-6 border border-slate-800 space-y-4 self-start">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Bankroll Transaction</span>
          </h3>

          <form onSubmit={handleTransaction} className="space-y-4 text-xs font-mono">
            <div className="grid grid-cols-2 gap-2 font-sans">
              <button
                type="button"
                onClick={() => setType('deposit')}
                className={`py-2 rounded font-bold transition-colors border ${
                  type === 'deposit'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                    : 'bg-slate-900 text-slate-300 border-slate-800'
                }`}
              >
                Deposit
              </button>
              <button
                type="button"
                onClick={() => setType('withdrawal')}
                className={`py-2 rounded font-bold transition-colors border ${
                  type === 'withdrawal'
                    ? 'bg-rose-500 text-white border-rose-400'
                    : 'bg-slate-900 text-slate-300 border-slate-800'
                }`}
              >
                Withdrawal
              </button>
            </div>

            <div className="space-y-1 font-sans">
              <label className="text-slate-400 block">Amount ($)</label>
              <input
                type="number"
                step="10"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white font-bold font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-2.5 rounded transition-colors text-xs font-sans uppercase tracking-wider"
            >
              Submit {type}
            </button>
          </form>
        </div>

        {/* Ledger History Table */}
        <div className="lg:col-span-2 glass-card rounded-xl border border-slate-800 overflow-hidden">
          <div className="p-4 bg-slate-950/80 border-b border-slate-800 font-bold text-xs text-white uppercase tracking-wider">
            Ledger History Log
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/40 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3 text-right">Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {history.length > 0 ? (
                  history.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-6 py-3 text-slate-400">
                        {new Date(entry.timestamp).toLocaleDateString()} {new Date(entry.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-3 uppercase font-bold text-white">{entry.type}</td>
                      <td
                        className={`px-6 py-3 font-bold ${
                          entry.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {entry.amount >= 0 ? `+$${entry.amount.toFixed(2)}` : `-$${Math.abs(entry.amount).toFixed(2)}`}
                      </td>
                      <td className="px-6 py-3 text-right font-bold text-slate-200">
                        ${entry.balanceAfter.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500 font-sans">
                      No ledger transactions logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
