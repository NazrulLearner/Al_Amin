// ==========================================
// Investment Badges
// ==========================================

import React from 'react';
import {
  STATUS_STYLES,
  RISK_STYLES,
  ROLE_STYLES,
  STRUCTURE_STYLES,
} from '../../constants/investmentConstants';

// ===== Helper =====
const baseClass =
  'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold whitespace-nowrap';

// ===== StatusBadge =====
export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || 'bg-slate-100 text-slate-600 border-slate-200';
  return <span className={`${baseClass} ${style}`}>{status}</span>;
}

// ===== RiskBadge =====
export function RiskBadge({ level }: { level: string }) {
  const style = RISK_STYLES[level] || 'bg-slate-100 text-slate-600 border-slate-200';
  return <span className={`${baseClass} ${style}`}>{level} Risk</span>;
}

// ===== RoleBadge =====
export function RoleBadge({ role, lead }: { role: string; lead?: boolean }) {
  const style = ROLE_STYLES[role] || 'bg-slate-100 text-slate-600 border-slate-200';
  return (
    <span className={`${baseClass} ${style}`}>
      {lead && '⭐ '}
      {role}
    </span>
  );
}

// ===== StructureBadge =====
export function StructureBadge({ structure }: { structure: string }) {
  const style = STRUCTURE_STYLES[structure] || 'bg-slate-100 text-slate-600 border-slate-200';
  return <span className={`${baseClass} ${style}`}>{structure}</span>;
}