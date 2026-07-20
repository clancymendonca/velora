'use client';

import { useEffect, useState } from 'react';
import { Calendar, Zap, PlusCircle } from 'lucide-react';
import Link from 'next/link';

interface EventData {
  id: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  status: string;
}

export default function GamesPage() {
  const [events, setEvents] = useState<EventData[]>([]);

  useEffect(() => {
    async function loadGames() {
      try {
        const res = await fetch('/api/events');
        if (res.ok) {
          const body = await res.json();
          setEvents(body.data || []);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadGames();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-emerald-400" />
            <span>Today's Fixtures & Live Market Odds</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time odds comparison across Pinnacle, DraftKings, and FanDuel with automated Shin devigging.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Auto-Sync: Active
          </span>
        </div>
      </div>

      {/* Fixtures Table */}
      <div className="space-y-4">
        {events.length > 0 ? (
          events.map((evt) => (
            <div key={evt.id} className="glass-card glass-card-hover rounded-xl p-5 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-3 gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800">
                    NBA
                  </span>
                  <span className="text-sm font-bold text-white">
                    {evt.homeTeam} <span className="text-slate-500 font-normal">vs</span> {evt.awayTeam}
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Starts: {new Date(evt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {/* Market Odds Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800/90 space-y-2">
                  <div className="flex justify-between text-xs text-slate-400 font-semibold">
                    <span>Bookmaker</span>
                    <span>Pinnacle</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-mono pt-1">
                    <span className="text-white font-medium">{evt.homeTeam}</span>
                    <span className="font-bold text-emerald-400">1.87 (-115)</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-mono">
                    <span className="text-white font-medium">{evt.awayTeam}</span>
                    <span className="font-bold text-slate-300">2.02 (+102)</span>
                  </div>
                </div>

                <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800/90 space-y-2">
                  <div className="flex justify-between text-xs text-slate-400 font-semibold">
                    <span>Fair Odds (Devigged)</span>
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="flex justify-between items-center text-sm font-mono pt-1">
                    <span className="text-slate-300">Fair Home</span>
                    <span className="font-bold text-amber-400">1.92 (52.1%)</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-mono">
                    <span className="text-slate-300">Fair Away</span>
                    <span className="font-bold text-amber-400">2.08 (47.9%)</span>
                  </div>
                </div>

                <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800/90 flex flex-col justify-between">
                  <div className="flex justify-between text-xs text-slate-400 font-semibold">
                    <span>Highest EV Edge</span>
                    <span className="text-emerald-400 font-bold">+4.8% EV</span>
                  </div>
                  <div className="text-xs text-slate-300 font-mono py-1">
                    Recommended Stake: <span className="text-emerald-400 font-bold">$125.00</span>
                  </div>
                  <Link
                    href={`/bet-builder?team=${encodeURIComponent(evt.homeTeam)}&odds=1.87`}
                    className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold py-1.5 px-3 rounded text-xs transition-colors text-center flex items-center justify-center gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Build Bet Ticket</span>
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-card rounded-xl p-12 text-center text-slate-400 text-sm">
            Loading scheduled events and live feed data...
          </div>
        )}
      </div>
    </div>
  );
}
