'use client';

import { useEffect, useState } from 'react';
import { Ticket } from 'lucide-react';

interface BetData {
  id: string;
  status: 'pending' | 'won' | 'lost' | 'push' | 'void';
  stake: number;
  oddsDecimal: number;
  expectedValue: number;
  kellyApplied: number;
  placedAt: string;
  isParlay: boolean;
}

export default function BetsPage() {
  const [bets, setBets] = useState<BetData[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const fetchBets = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/bets${filter !== 'all' ? `?status=${filter}` : ''}`);
      if (res.ok) {
        const body = await res.json();
        setBets(body.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBets();
  }, [filter]);

  const handleSettle = async (betId: string, status: string) => {
    try {
      const res = await fetch(`/api/bets/${betId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchBets();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Ticket className="w-6 h-6 text-emerald-400" />
            <span>My Bets & Trade History</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete audit record of placed wagers, expected value edge, and manual/auto settlement triggers.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
          {['all', 'pending', 'won', 'lost', 'push'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${
                filter === tab
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Bets Table */}
      <div className="glass-card rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Bet ID</th>
                <th className="px-6 py-3.5">Placed At</th>
                <th className="px-6 py-3.5">Stake</th>
                <th className="px-6 py-3.5">Odds</th>
                <th className="px-6 py-3.5">Expected Value</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {bets.length > 0 ? (
                bets.map((bet) => (
                  <tr key={bet.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">#{bet.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(bet.placedAt).toLocaleDateString()} {new Date(bet.placedAt).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-white">${bet.stake.toFixed(2)}</td>
                    <td className="px-6 py-4 text-emerald-400 font-bold">{bet.oddsDecimal.toFixed(2)}</td>
                    <td className="px-6 py-4 text-amber-400 font-bold">
                      +{(bet.expectedValue * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold uppercase ${
                          bet.status === 'won'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                            : bet.status === 'lost'
                            ? 'bg-rose-950/80 text-rose-400 border border-rose-800'
                            : bet.status === 'pending'
                            ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {bet.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {bet.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleSettle(bet.id, 'won')}
                            className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 px-2.5 py-1 rounded text-xs font-bold transition-colors"
                          >
                            Won
                          </button>
                          <button
                            onClick={() => handleSettle(bet.id, 'lost')}
                            className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 px-2.5 py-1 rounded text-xs font-bold transition-colors"
                          >
                            Lost
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 text-sm font-sans">
                    {loading ? 'Fetching bet records...' : 'No bets matching selected status.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
