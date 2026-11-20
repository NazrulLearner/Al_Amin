// ==========================================
// Investment Chart Components
// ==========================================

import React from 'react';
import { cn } from '../../../../lib/utils';

// ===== MetricCard =====
export function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = 'default',
  className,
  variant = 'default',
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: 'default' | 'emerald' | 'amber' | 'indigo' | 'red' | 'slate';
  className?: string;
  // 'summary' = rounder card with a solid coloured left edge (used on the list page)
  variant?: 'default' | 'summary';
}) {
  const toneMap: Record<string, string> = {
    default: 'text-foreground',
    emerald: 'text-emerald-700',
    amber: 'text-amber-700',
    indigo: 'text-indigo-700',
    red: 'text-red-700',
    slate: 'text-slate-700',
  };

  const accentMap: Record<string, string> = {
    default: 'border-l-slate-400',
    emerald: 'border-l-emerald-600',
    amber: 'border-l-amber-500',
    indigo: 'border-l-indigo-600',
    red: 'border-l-red-600',
    slate: 'border-l-slate-500',
  };

  if (variant === 'summary') {
    return (
      <div
        className={cn(
          'flex min-w-0 items-start justify-between gap-2 rounded-2xl border border-l-4 border-border bg-card p-3 shadow-sm sm:p-4',
          accentMap[tone],
          className
        )}
      >
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className={cn('mt-1 truncate font-display text-base font-bold tracking-tight sm:text-lg lg:text-xl', toneMap[tone])} title={String(value)}>
            {value}
          </p>
          {sub && <p className="mt-0.5 truncate text-xs text-muted-foreground">{sub}</p>}
        </div>
        {Icon && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted sm:h-9 sm:w-9">
            <Icon className={cn('h-4 w-4 sm:h-[18px] sm:w-[18px]', toneMap[tone])} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-4 shadow-sm',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <p className="label-eyebrow">{label}</p>
        {Icon && (
          <div className="rounded-md bg-muted p-1.5">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>
      <p className={cn('mt-2 font-display text-2xl font-bold tracking-tight', toneMap[tone])}>
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ===== ProgressBar =====
export function ProgressBar({
  value,
  max,
  className,
  barClass = 'bg-primary',
  height = 'h-2',
}: {
  value: number;
  max: number;
  className?: string;
  barClass?: string;
  height?: string;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div
      className={cn('w-full overflow-hidden rounded-full bg-muted', height, className)}
    >
      <div
        className={cn('h-full rounded-full transition-all', barClass)}
        style={{ width: pct + '%' }}
      />
    </div>
  );
}

// ===== Segment type =====
export interface ChartSegment {
  label: string;
  value: number;
  color: string;
  displayValue?: string;
}

// ===== StackedShareBar =====
export function StackedShareBar({
  segments,
  className,
  height = 'h-3',
}: {
  segments: ChartSegment[];
  className?: string;
  height?: string;
}) {
  const total = segments.reduce((s, seg) => s + (seg.value || 0), 0);
  return (
    <div
      className={cn(
        'flex w-full overflow-hidden rounded-full bg-muted',
        height,
        className
      )}
    >
      {segments.map((seg, i) => {
        const pct = total > 0 ? (seg.value / total) * 100 : 0;
        if (pct === 0) return null;
        return (
          <div
            key={i}
            className="h-full transition-all"
            style={{ width: pct + '%', backgroundColor: seg.color }}
            title={`${seg.label}: ${pct.toFixed(1)}%`}
          />
        );
      })}
    </div>
  );
}

// ===== DonutChart =====
export function DonutChart({
  segments,
  size = 140,
  thickness = 22,
  centerLabel,
  centerValue,
}: {
  segments: ChartSegment[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = segments.reduce((s, seg) => s + (seg.value || 0), 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={thickness}
        />
        {segments.map((seg, i) => {
          const pct = total > 0 ? seg.value / total : 0;
          const len = pct * circumference;
          const dash = `${len} ${circumference - len}`;
          const el = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={thickness}
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {centerLabel && (
          <span className="label-eyebrow text-[0.6rem]">{centerLabel}</span>
        )}
        {centerValue && (
          <span className="font-display text-lg font-bold">{centerValue}</span>
        )}
      </div>
    </div>
  );
}

// ===== Legend =====
export function Legend({
  segments,
  className,
}: {
  segments: ChartSegment[];
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {segments.map((seg, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-3 text-sm"
        >
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: seg.color }}
            />
            <span className="truncate text-foreground">{seg.label}</span>
          </div>
          <span className="font-medium text-muted-foreground tabular-nums">
            {seg.displayValue}
          </span>
        </div>
      ))}
    </div>
  );
}