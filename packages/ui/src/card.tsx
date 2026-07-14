import type { ReactNode } from 'react';

interface CardProps {
  title: string;
  children: ReactNode;
}

export function Card({ title, children }: CardProps) {
  return (
    <section className="rounded-lg border border-slate-200 p-4 shadow-sm">
      <h2 className="mb-2 text-lg font-semibold">{title}</h2>
      <div className="text-sm text-slate-600">{children}</div>
    </section>
  );
}
