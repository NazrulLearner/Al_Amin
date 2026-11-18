// ==========================================
// Participant Manager
// (কে কত টাকা committed করলো - form)
// ==========================================

import React, { useState } from 'react';
import { BDT, PCT } from '../../utils/investmentUtils';
import { RoleBadge } from './Badges';
import { Star, Plus, Pencil, Trash2, X } from 'lucide-react';
import type { InvestmentParticipant } from '../../types/investment.types';
import NumberInput from './NumberInput';
import InfoTip from './InfoTip';
import { validateParticipantForm } from '../../utils/investmentValidation';
import { FIELD_HELP, ROLE_HELP } from '../../constants/investmentFieldHelp';

const PARTICIPANT_TYPES = [
  'Somity', 'Lead Investor', 'Co-Investor',
  'Individual Investor', 'Organization', 'Partner', 'Other',
];
const ROLES = ['Lead Investor', 'Co-Investor', 'Sole Investor', 'Participant'];

interface Props {
  participants: Partial<InvestmentParticipant>[];
  onChange: (participants: Partial<InvestmentParticipant>[]) => void;
  totalRequired?: number;
}

export default function ParticipantManager({ participants, onChange, totalRequired }: Props) {
  const [editing, setEditing] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const addOrUpdate = (p: Partial<InvestmentParticipant>) => {
    if (editing !== null) {
      const next = [...participants];
      next[editing] = p;
      onChange(next);
    } else {
      onChange([...participants, p]);
    }
    setEditing(null);
    setShowForm(false);
  };

  const remove = (i: number) => {
    onChange(participants.filter((_, idx) => idx !== i));
  };

  const startEdit = (i: number) => {
    setEditing(i);
    setShowForm(true);
  };

  const totalCommitted = participants.reduce(
    (s, p) => s + (p.committed_amount || 0),
    0
  );
  // Participation % is calculated, never typed: Committed ÷ Total required investment.
  const pctOf = (amount?: number) =>
    totalRequired && totalRequired > 0 ? ((amount || 0) / totalRequired) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Define every investor in this investment. Somity is added by default
          based on the structure.
        </p>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium hover:bg-muted"
        >
          <Plus className="h-4 w-4" /> Add Participant
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left">
              <th className="px-4 py-2.5 label-eyebrow">Participant</th>
              <th className="px-4 py-2.5 label-eyebrow">Role</th>
              <th className="px-4 py-2.5 label-eyebrow text-right">Committed</th>
              <th className="px-4 py-2.5 label-eyebrow text-right">
                Participation %
              </th>
              <th className="px-4 py-2.5 label-eyebrow text-right">
                Return Share %
              </th>
              <th className="px-4 py-2.5 label-eyebrow text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {participants.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No participants added yet.
                </td>
              </tr>
            ) : (
              participants.map((p, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.participant_type}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <RoleBadge
                      role={p.role || 'Participant'}
                      lead={p.role === 'Lead Investor'}
                    />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {BDT(p.committed_amount || 0)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {PCT(pctOf(p.committed_amount))}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {PCT(p.return_share_pct || 0)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(i)}
                        className="rounded p-1.5 text-muted-foreground hover:bg-muted"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(i)}
                        className="rounded p-1.5 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {participants.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-border bg-muted/30 font-semibold">
                <td className="px-4 py-2.5" colSpan={2}>
                  Total
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">
                  {BDT(totalCommitted)}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">
                  {PCT(pctOf(totalCommitted))}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">
                  {PCT(
                    participants.reduce(
                      (s, p) => s + (p.return_share_pct || 0),
                      0
                    )
                  )}
                </td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {showForm && (
        <ParticipantForm
          initial={editing !== null ? participants[editing] : null}
          totalRequired={totalRequired}
          onSave={addOrUpdate}
          onCancel={() => {
            setEditing(null);
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}

// ===== Participant Form =====
function ParticipantForm({
  initial,
  totalRequired,
  onSave,
  onCancel,
}: {
  initial: Partial<InvestmentParticipant> | null;
  totalRequired?: number;
  onSave: (p: Partial<InvestmentParticipant>) => void;
  onCancel: () => void;
}) {
  // NOTE: funded_amount stays in the data (0 for a new participant, untouched when editing).
  // It is NOT typed here — real payments are recorded in the Funding tab.
  const [form, setForm] = useState<Partial<InvestmentParticipant>>(
    initial || {
      name: '',
      participant_type: 'Co-Investor',
      role: 'Co-Investor',
      contact: '',
      committed_amount: 0,
      funded_amount: 0,
      participation_pct: 0,
      return_share_pct: 0,
      return_terms: '',
      agreement: '',
      status: 'Active',
    }
  );
  const [tried, setTried] = useState(false);

  const set = (k: keyof InvestmentParticipant, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  const errors = validateParticipantForm(form);
  const err = (k: string) => (tried ? errors[k] : undefined);
  const participationPct =
    totalRequired && totalRequired > 0
      ? Math.round(((form.committed_amount || 0) / totalRequired) * 10000) / 100
      : 0;

  const save = () => {
    setTried(true);
    if (Object.keys(errors).length > 0) return;
    onSave({ ...form, name: (form.name || '').trim(), participation_pct: participationPct });
  };

  const H = FIELD_HELP;

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="font-display text-sm font-semibold">
          {initial ? 'Edit Participant' : 'Add Participant'}
        </h4>
        <button
          type="button"
          onClick={onCancel}
          className="rounded p-1 text-muted-foreground hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label={H.p_name.label} required error={err('name')}>
          <input
            className="inp"
            style={err('name') ? { borderColor: '#ef4444' } : undefined}
            value={form.name || ''}
            onChange={(e) => set('name', e.target.value)}
            placeholder={H.p_name.placeholder}
          />
        </Field>
        <Field label={H.p_participant_type.label} tip={H.p_participant_type.tip}>
          <select
            className="inp"
            value={form.participant_type || ''}
            onChange={(e) => set('participant_type', e.target.value)}
          >
            {PARTICIPANT_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label={H.p_role.label} tip={H.p_role.tip} hint={ROLE_HELP[form.role || '']}>
          <select
            className="inp"
            value={form.role || ''}
            onChange={(e) => set('role', e.target.value)}
          >
            {ROLES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </Field>
        <Field label={H.p_contact.label}>
          <input
            className="inp"
            value={form.contact || ''}
            onChange={(e) => set('contact', e.target.value)}
            placeholder={H.p_contact.placeholder}
          />
        </Field>
        <Field label={H.p_committed_amount.label} tip={H.p_committed_amount.tip} error={err('committed_amount')}>
          <NumberInput
            value={form.committed_amount}
            onChange={(n) => set('committed_amount', n)}
            placeholder={H.p_committed_amount.placeholder}
            invalid={!!err('committed_amount')}
          />
        </Field>
        <Field
          label={H.p_participation_pct.label}
          hint={totalRequired && totalRequired > 0 ? H.p_participation_pct.hint : 'Enter Total Required Investment first.'}
        >
          <div className="inp bg-slate-50 text-slate-600" aria-readonly="true">
            {participationPct}%
          </div>
        </Field>
        <Field label={H.p_return_share_pct.label} tip={H.p_return_share_pct.tip} error={err('return_share_pct')}>
          <NumberInput
            kind="percent"
            value={form.return_share_pct}
            onChange={(n) => set('return_share_pct', n)}
            placeholder={H.p_return_share_pct.placeholder}
            invalid={!!err('return_share_pct')}
          />
        </Field>
        <Field label={H.p_status.label}>
          <select
            className="inp"
            value={form.status || 'Active'}
            onChange={(e) => set('status', e.target.value)}
          >
            <option>Active</option>
            <option>Pending</option>
            <option>Settled</option>
            <option>Withdrawn</option>
          </select>
        </Field>
        <Field label={H.p_return_terms.label} full>
          <input
            className="inp"
            value={form.return_terms || ''}
            onChange={(e) => set('return_terms', e.target.value)}
            placeholder={H.p_return_terms.placeholder}
          />
        </Field>
        <Field label={H.p_agreement.label} full>
          <input
            className="inp"
            value={form.agreement || ''}
            onChange={(e) => set('agreement', e.target.value)}
            placeholder={H.p_agreement.placeholder}
          />
        </Field>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={save}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground"
        >
          Save Participant
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  full,
  required,
  tip,
  hint,
  error,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
  required?: boolean;
  tip?: string;
  hint?: string;
  error?: string;
}) {
  return (
    <div className={full ? 'sm:col-span-2 lg:col-span-3' : ''}>
      <label className="label-eyebrow">
        {label}
        {required && <span className="text-red-500"> *</span>}
        {tip && <InfoTip text={tip} />}
      </label>
      <div className="mt-1">{children}</div>
      {error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : (
        hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
