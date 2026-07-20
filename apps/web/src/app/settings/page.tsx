'use client';

import { useState } from 'react';
import { Settings, Save, Check } from 'lucide-react';

export default function SettingsPage() {
  const [oddsFormat, setOddsFormat] = useState<'decimal' | 'american' | 'fractional'>('decimal');
  const [defaultStake, setDefaultStake] = useState<number>(50);
  const [riskTolerance, setRiskTolerance] = useState<number>(5.0);
  const [kellyFraction, setKellyFraction] = useState<number>(0.25);

  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-emerald-400" />
          <span>Engine Settings & Preferences</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure default odds format, risk tolerance caps, and Kelly sizing parameters.
        </p>
      </div>

      <form onSubmit={handleSave} className="glass-card rounded-xl p-6 border border-slate-800 space-y-6">
        {/* Odds Format */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Preferred Odds Format
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['decimal', 'american', 'fractional'] as const).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setOddsFormat(fmt)}
                className={`py-2.5 rounded text-xs font-bold capitalize transition-colors border ${
                  oddsFormat === fmt
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        {/* Default Stake & Risk */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 font-mono text-xs">
          <div className="space-y-1 font-sans">
            <label className="text-slate-400 block font-semibold">Default Unit Stake ($)</label>
            <input
              type="number"
              value={defaultStake}
              onChange={(e) => setDefaultStake(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white font-bold font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1 font-sans">
            <label className="text-slate-400 block font-semibold">Max Risk Tolerance (% of Bankroll)</label>
            <input
              type="number"
              step="0.5"
              value={riskTolerance}
              onChange={(e) => setRiskTolerance(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white font-bold font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Kelly Sizing Multiplier */}
        <div className="space-y-1 font-sans text-xs">
          <label className="text-slate-400 block font-semibold">
            Kelly Criterion Fraction (Current: {kellyFraction}x)
          </label>
          <input
            type="range"
            min="0.05"
            max="1.0"
            step="0.05"
            value={kellyFraction}
            onChange={(e) => setKellyFraction(parseFloat(e.target.value))}
            className="w-full accent-emerald-500"
          />
          <div className="flex justify-between text-[11px] text-slate-500 font-mono">
            <span>0.05x (Micro)</span>
            <span>0.25x (Quarter-Kelly)</span>
            <span>0.50x (Half-Kelly)</span>
            <span>1.0x (Full-Kelly)</span>
          </div>
        </div>

        <button
          type="submit"
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-6 py-2.5 rounded text-xs transition-colors flex items-center gap-2 uppercase tracking-wider shadow-md"
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'Settings Saved' : 'Save Engine Preferences'}</span>
        </button>
      </form>
    </div>
  );
}
