import './globals.css';
import type { ReactNode } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

export const metadata = {
  title: 'Velora | Sports Analytics & Portfolio Management',
  description: 'Production-grade sports betting analytics engine with expected value, Kelly criterion, market devigging, and Monte Carlo simulation.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0b0f17] text-slate-100 min-h-screen antialiased">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Header />
            <main className="flex-1 p-8 overflow-y-auto">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
