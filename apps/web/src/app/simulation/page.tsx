'use client';

import { useState } from 'react';
import { LineChart, Play, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { simulateBankrollPath, Decimal } from '@velora/calculations';

export default function SimulationPage() {
  const [initialBankroll, setInitialBankroll] = useState<number>(10000);
  const [winRate, setWinRate] = useState<number>(0.54);
  const [decimalOdds, setDecimalOdds] = useState<number>(1.95);
  const [kellyFraction, setKellyFraction] = useState<number>(0.25);
  const [numBets, setNumBets] = useState<number>(100);

  const [simResult, setSimResult] = useState<any>(null);

  const runSimulation = () => {
    try {
      const initDec = new Decimal(initialBankroll);
      const probDec = new Decimal(winRate);
      const oddsDec = new Decimal(decimalOdds);
      const fracDec = new Decimal(kellyFraction);

      const path = simulateBankrollPath(initDec, probDec, oddsDec, fracDec, numBets);
      const finalBal = path.balanceHistory[path.balanceHistory.length - 1].toNumber();

      setSimResult({
        finalBalance: finalBal,
        isBroke: path.isBroke,
        history: path.balanceHistory.map((d) => d.toNumber()),
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <LineChart className="w-6 h-6 text-emerald-400" />
          <span>Interactive Monte Carlo Bankroll Simulator</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Stress test bankroll growth paths and ruin probability strictly via @velora/calculations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="glass-card rounded-xl p-6 border border-slate-800 space-y-4 self-start">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
            Simulation Parameters
          </h3>

          <div className="space-y-3 text-xs font-mono">
            <div className="space-y-1 font-sans">
              <label className="text-slate-400 block">Initial Bankroll ($)</label>
              <input
                type="number"
                value={initialBankroll}
                onChange={(e) => setInitialBankroll(parseFloat(e.target.value) || 1000)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1 font-sans">
              <label className="text-slate-400 block">True Win Rate (0 to 1)</label>
              <input
                type="number"
                step="0.01"
                value={winRate}
                onChange={(e) => setWinRate(parseFloat(e.target.value) || 0.5)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1 font-sans">
              <label className="text-slate-400 block">Average Decimal Odds</label>
              <input
                type="number"
                step="0.01"
                value={decimalOdds}
                onChange={(e) => setDecimalOdds(parseFloat(e.target.value) || 1.91)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1 font-sans">
              <label className="text-slate-400 block">Kelly Multiplier (Fraction)</label>
              <input
                type="number"
                step="0.05"
                value={kellyFraction}
                onChange={(e) => setKellyFraction(parseFloat(e.target.value) || 0.25)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1 font-sans">
              <label className="text-slate-400 block">Number of Bets to Simulate</label>
              <input
                type="number"
                value={numBets}
                onChange={(e) => setNumBets(parseInt(e.target.value, 10) || 50)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={runSimulation}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-2.5 rounded transition-colors text-xs font-sans uppercase tracking-wider flex items-center justify-center gap-2 mt-2"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Run Monte Carlo Trial</span>
            </button>
          </div>
        </div>

        {/* Results Graph */}
        <div className="lg:col-span-2 glass-card rounded-xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
            Simulation Path Trajectory
          </h3>

          {simResult ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded border border-slate-900">
                  <span className="text-xs text-slate-400 block">Simulated Final Balance</span>
                  <span className="text-xl font-bold text-emerald-400 font-mono">
                    ${simResult.finalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="bg-slate-950 p-4 rounded border border-slate-900">
                  <span className="text-xs text-slate-400 block">Risk Status</span>
                  <span className={`text-xl font-bold ${simResult.isBroke ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {simResult.isBroke ? 'Broke (Ruin)' : 'Safe (Positive Growth)'}
                  </span>
                </div>
              </div>

              {/* Path Graph Representation */}
              <div className="h-64 bg-slate-950 rounded border border-slate-800 p-4 relative flex items-center justify-center">
                <span className="text-xs text-slate-500 font-mono">
                  Simulated {simResult.history.length - 1} steps from ${initialBankroll} to ${simResult.finalBalance.toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-16 text-center text-slate-500 text-xs">
              Configure parameters on the left and click "Run Monte Carlo Trial".
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
