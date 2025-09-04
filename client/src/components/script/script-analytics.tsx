import React from 'react';
import { AppIcon } from '@/components/ui/icon-registry';
import { Badge } from '@/components/ui/badge';

interface Metric {
  key: string;
  label: string;
  value: number; // 0-100
  trend?: number[]; // spark values 0-100
  tone: 'success' | 'warning' | 'critical' | 'info' | 'default';
  description?: string;
}

interface ScriptAnalyticsProps {
  metrics: Metric[];
}

// Phase 6: Mini analytics sidebar with spark bars & colored score dots
export const ScriptAnalytics: React.FC<ScriptAnalyticsProps> = ({ metrics }) => {
  return (
    <aside aria-label="Script analytics" className="w-64 shrink-0 border-l border-[var(--semantic-border)] bg-[var(--semantic-surface-alt)]/40 backdrop-blur-sm p-4 hidden xl:flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold tracking-wide text-[var(--semantic-text-muted)] uppercase">Analytics</h2>
        <Badge variant="outline" density="compact">Beta</Badge>
      </div>
      <ul className="flex flex-col gap-3">
        {metrics.map(m => {
          const barHeights = (m.trend?.length ? m.trend : Array.from({length: 8}, (_,i)=> Math.round(m.value * (0.8 + (i/16)))))
            .slice(-12)
            .map(v=> Math.max(4, Math.min(100, v)));
          const toneClass = {
            success: 'bg-[var(--semantic-success)]',
            warning: 'bg-[var(--semantic-warning)]',
            critical: 'bg-[var(--semantic-critical)]',
            info: 'bg-[var(--semantic-info)]',
            default: 'bg-[var(--brand-accent)]'
          }[m.tone];
          return (
            <li key={m.key} className="group rounded-md p-2 border border-[var(--semantic-border)] bg-[var(--semantic-surface)] hover:border-[var(--accent-subtle-border)] transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="micro text-[10px] tracking-wide text-[var(--semantic-text-secondary)]">{m.label}</span>
                    <span className={`w-2.5 h-2.5 rounded-full ${toneClass}`} aria-hidden />
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm font-semibold tabular-nums text-[var(--semantic-text-primary)]">{m.value}</span>
                    <div className="spark" aria-hidden>
                      {barHeights.map((h,i)=> (
                        <span key={i} style={{ height: h/100 * 14 + 'px', animationDelay: (i*40)+'ms' }} />
                      ))}
                    </div>
                  </div>
                  {m.description && <p className="mt-1 text-[10px] leading-snug text-[var(--semantic-text-muted)] line-clamp-2">{m.description}</p>}
                </div>
                <AppIcon name="stats" className="w-4 h-4 text-[var(--semantic-text-muted)] opacity-70 group-hover:opacity-100" />
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};
