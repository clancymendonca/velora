'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  Calculator,
  BarChart3,
  Wallet,
  PieChart,
  LineChart,
  Settings,
  Flame,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: "Today's Games", href: '/games', icon: Calendar },
  { name: 'My Bets', href: '/bets', icon: Ticket },
  { name: 'Bet Builder', href: '/bet-builder', icon: Calculator },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Bankroll & Ledger', href: '/bankroll', icon: Wallet },
  { name: 'Portfolio', href: '/portfolio', icon: PieChart },
  { name: 'Monte Carlo Sim', href: '/simulation', icon: LineChart },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-950/90 border-r border-slate-800/60 flex flex-col h-screen sticky top-0 z-40 backdrop-blur-xl">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800/60 gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold shadow-lg shadow-emerald-950/50">
          <Flame className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <span className="font-extrabold text-lg text-white tracking-tight">VELORA</span>
          <span className="text-[10px] uppercase tracking-wider block text-emerald-400 font-semibold">QUANT ENGINE</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 gap-3 ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div className="p-4 border-t border-slate-800/60">
        <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-medium">Odds Feed</span>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">LIVE</span>
        </div>
      </div>
    </aside>
  );
}
