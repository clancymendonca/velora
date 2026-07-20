'use client';

import { useState } from 'react';
import { Calculator, Plus, Trash2, Zap } from 'lucide-react';
import { BetBuilderService, BetType, BetLegInput } from '@velora/api';

const betBuilderService = new BetBuilderService();

export default function BetBuilderPage() {
  const [betType, setBetType] = useState<BetType>('single');
  const [stake, setStake] = useState<number>(100);
  const bankroll = 10000;
  const kellyFraction = 0.25;
  const [legs, setLegs] = useState<BetLegInput[]>([
    { selectionId: 'sel-1', name: 'Boston Celtics -3.5', priceDecimal: 1.87, estimatedWinProb: 0.55 },
    { selectionId: 'sel-2', name: 'Kansas City Chiefs ML', priceDecimal: 2.02, estimatedWinProb: 0.51 },
  ]);

  const [newSelectionName, setNewSelectionName] = useState('');
  const [newOdds, setNewOdds] = useState('1.91');
  const [newProb] = useState('0.54');

  const addLeg = () => {
    if (!newSelectionName.trim()) return;
    setLegs([
      ...legs,
      {
        selectionId: `sel-${Date.now()}`,
        name: newSelectionName,
        priceDecimal: parseFloat(newOdds) || 1.91,
        estimatedWinProb: parseFloat(newProb) || 0.54,
      },
    ]);
    setNewSelectionName('');
  };

  const removeLeg = (index: number) => {
    setLegs(legs.filter((_, i) => i !== index));
  };

  let calculationResult = null;
  try {
    if (legs.length > 0) {
      calculationResult = betBuilderService.buildBet({
        type: betType,
        legs,
        stake,
        bankroll,
        kellyFraction,
      });
    }
  } catch (e) {
    console.error(e);
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Calculator className="w-6 h-6 text-emerald-400" />
          <span>Bet Builder & Multi-Leg Parlay Engine</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Construct Singles, Parlays, and Round-Robins with real-time EV calculation and Kelly sizing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Builder Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bet Type Selection */}
          <div className="glass-card rounded-xl p-5 border border-slate-800 space-y-3">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Bet Structure Type
            </label>
            <div className="grid grid-cols-5 gap-2">
              {(['single', 'double', 'treble', 'parlay', 'round_robin'] as BetType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setBetType(t)}
                  className={`py-2 rounded text-xs font-bold capitalize transition-colors border ${
                    betType === t
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {t.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Add Leg Form */}
          <div className="glass-card rounded-xl p-5 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Add Leg / Selection</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Selection Name (e.g. Lakers ML)"
                value={newSelectionName}
                onChange={(e) => setNewSelectionName(e.target.value)}
                className="sm:col-span-2 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Decimal Odds (e.g. 1.91)"
                value={newOdds}
                onChange={(e) => setNewOdds(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
              <button
                onClick={addLeg}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2 px-3 rounded flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Leg</span>
              </button>
            </div>
          </div>

          {/* Leg List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Bet Slip Legs</h3>
            {legs.map((leg, idx) => (
              <div
                key={leg.selectionId}
                className="glass-card rounded-lg p-4 border border-slate-800 flex items-center justify-between font-mono"
              >
                <div>
                  <div className="text-sm font-bold text-white">{leg.name}</div>
                  <div className="text-xs text-slate-400">
                    Odds: <span className="text-emerald-400 font-bold">{leg.priceDecimal}</span> | Est Prob:{' '}
                    <span className="text-amber-400 font-bold">{((leg.estimatedWinProb || 0.5) * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <button
                  onClick={() => removeLeg(idx)}
                  className="text-slate-500 hover:text-rose-400 p-1.5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Quantitative Calculation Summary */}
        <div className="glass-card rounded-xl p-6 border border-slate-800 space-y-6 self-start">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Quant Sizing Summary</span>
          </h3>

          <div className="space-y-4 text-xs font-mono">
            <div className="space-y-1">
              <label className="text-slate-400 block font-sans">Stake Amount ($)</label>
              <input
                type="number"
                value={stake}
                onChange={(e) => setStake(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            {calculationResult && (
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-400">Combined Odds:</span>
                  <span className="font-bold text-emerald-400 text-sm">{calculationResult.combinedOddsDecimal}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-400">Joint Win Prob:</span>
                  <span className="font-bold text-amber-400">
                    {(calculationResult.combinedWinProb * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-400">Expected Value:</span>
                  <span className="font-bold text-emerald-400">${calculationResult.expectedValueAmount}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-400">Expected ROI %:</span>
                  <span className="font-bold text-emerald-400">+{calculationResult.roiPercent}%</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-300 font-sans font-bold">Kelly Rec Stake:</span>
                  <span className="font-extrabold text-emerald-400 text-sm">
                    ${calculationResult.recommendedKellyStake}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
