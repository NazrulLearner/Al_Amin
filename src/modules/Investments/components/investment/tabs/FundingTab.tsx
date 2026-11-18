// ==========================================
// Funding Tab
// ==========================================

import React, { useState } from 'react';
import { BDT, formatDate, computeTotals } from '../../../utils/investmentUtils';
import { ProgressBar } from '../Charts';
import { Plus, X, Wallet } from 'lucide-react';
import { useAuth } from '../../../../../app/providers/AuthProvider';
import { recordFunding } from '../../../services';
import NumberInput from '../NumberInput';
import { formatTaka } from '../../../utils/investmentUtils';
import { toActor } from '../../../utils/actor';
import { toast } from 'sonner';
import type { Investment, InvestmentParticipant, FundingRecord } from '../../../types/investment.types';

const METHODS = ['Bank Transfer', 'Cash', 'Cheque', 'Mobile Banking', 'Other'];

interface Props {
  investment: Investment;
  participants: InvestmentParticipant[];
  funding: FundingRecord[];
  onReload: () => void;
}

export default function FundingTab({ investment, participants, funding, onReload }: Props) {
  const { user, userData } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    participant_id: '',
    investor_name: '',
    amount: 0,
    funding_date: new Date().toLocaleDateString('en-CA'),
    payment_method: 'Bank Transfer',
    account: '',
    reference: '',
    remarks: '',
  });

  const t = computeTotals(investment, participants);
  const remaining = (investment.total_required_investment || 0) - t.totalFunded;

  const submit = async () => {
    if (!form.participant_id || !(Number(form.amount) > 0)) {
      toast.error('Select an investor and enter an amount');
      return;
    }

    setSaving(true);
    try {
      await recordFunding(
        {
          investment_id: investment.id,
          participant_id: form.participant_id,
          amount: Number(form.amount),
          funding_date: form.funding_date,
          payment_method: form.payment_method as FundingRecord['payment_method'],
          account: form.account || undefined,
          reference: form.reference || undefined,
          remarks: form.remarks || undefined,
        },
        toActor(user, userData)
      );
      toast.success(`Funding recorded: ${BDT(form.amount)}`);

      setShowForm(false);
      setForm({
        ...form,
        amount: 0,
        reference: '',
        remarks: '',
      });
      onReload();
    } catch (e) {
      toast.error('Error: ' + (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Funding progress */}
      <div className="rounded-lg border border-border p-5">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Required" value={BDT(investment.total_required_investment || 0)} />
          <Stat label="Committed" value={BDT(t.totalCommitted)} />
          <Stat label="Funded" value={BDT(t.totalFunded)} tone="emerald" />
          <Stat
            label="Remaining"
            value={BDT(remaining)}
            tone={remaining > 0 ? 'amber' : 'default'}
          />
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="label-eyebrow">Funding Progress</span>
            <span className="font-medium">
              {(
                (t.totalFunded / (investment.total_required_investment || 1)) *
                100
              ).toFixed(1)}
              %
            </span>
          </div>
          <ProgressBar
            value={t.totalFunded}
            max={investment.total_required_investment || 1}
            barClass="bg-emerald-600"
            height="h-3"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold">Funding Records</h3>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {showForm ? (
            <>
              <X className="h-4 w-4" /> Cancel
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> Record Funding
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Investor">
              <select
                className="inp"
                value={form.participant_id}
                onChange={(e) => {
                  const p = participants.find((x) => x.id === e.target.value);
                  setForm({
                    ...form,
                    participant_id: e.target.value,
                    investor_name: p?.name || '',
                  });
                }}
              >
                <option value="">Select investor…</option>
                {participants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Amount (৳)">
              <NumberInput
                value={form.amount}
                onChange={(n) => setForm({ ...form, amount: n })}
              />
              {(() => {
                // Shows how much this investor promised vs. has paid. Warning only — nothing is blocked.
                const sel = participants.find((x) => x.id === form.participant_id);
                if (!sel) return null;
                const left = (sel.committed_amount || 0) - (sel.funded_amount || 0);
                return (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Committed ৳{formatTaka(sel.committed_amount || 0)} · Funded so far ৳{formatTaka(sel.funded_amount || 0)} ·{' '}
                    {left >= 0 ? `Remaining ৳${formatTaka(left)}` : `Over by ৳${formatTaka(-left)}`}
                    {Number(form.amount) > Math.max(left, 0) && (
                      <span className="text-amber-600"> — this is more than the remaining committed amount.</span>
                    )}
                  </p>
                );
              })()}
            </Field>
            <Field label="Funding Date">
              <input
                type="date"
                className="inp"
                value={form.funding_date}
                onChange={(e) =>
                  setForm({ ...form, funding_date: e.target.value })
                }
              />
            </Field>
            <Field label="Payment Method">
              <select
                className="inp"
                value={form.payment_method}
                onChange={(e) =>
                  setForm({ ...form, payment_method: e.target.value })
                }
              >
                {METHODS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </Field>
            <Field label="Account">
              <input
                className="inp"
                value={form.account}
                onChange={(e) =>
                  setForm({ ...form, account: e.target.value })
                }
                placeholder="Bank / cash account"
              />
            </Field>
            <Field label="Reference">
              <input
                className="inp"
                value={form.reference}
                onChange={(e) =>
                  setForm({ ...form, reference: e.target.value })
                }
                placeholder="Txn ref"
              />
            </Field>
            <Field label="Remarks" full>
              <input
                className="inp"
                value={form.remarks}
                onChange={(e) =>
                  setForm({ ...form, remarks: e.target.value })
                }
              />
            </Field>
          </div>
          <div className="mt-3 flex justify-end">
            <button
              onClick={submit}
              disabled={saving}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              Save Funding Record
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left">
              <th className="px-4 py-2.5 label-eyebrow">Date</th>
              <th className="px-4 py-2.5 label-eyebrow">Investor</th>
              <th className="px-4 py-2.5 label-eyebrow text-right">Amount</th>
              <th className="px-4 py-2.5 label-eyebrow">Payment Method</th>
              <th className="px-4 py-2.5 label-eyebrow">Account</th>
              <th className="px-4 py-2.5 label-eyebrow">Reference</th>
              <th className="px-4 py-2.5 label-eyebrow">Status</th>
            </tr>
          </thead>
          <tbody>
            {funding.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  <Wallet className="mx-auto mb-2 h-6 w-6 opacity-40" />
                  No funding records yet.
                </td>
              </tr>
            ) : (
              funding.map((f) => (
                <tr key={f.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{formatDate(f.funding_date)}</td>
                  <td className="px-4 py-3 font-medium">{f.investor_name}</td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">
                    {BDT(f.amount)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {f.payment_method}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {f.account || '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {f.reference || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      {f.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'emerald' | 'amber';
}) {
  const tones = {
    default: 'text-foreground',
    emerald: 'text-emerald-700',
    amber: 'text-amber-700',
  };
  return (
    <div>
      <p className="label-eyebrow">{label}</p>
      <p className={`mt-0.5 font-display text-lg font-bold ${tones[tone]}`}>
        {value}
      </p>
    </div>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? 'sm:col-span-2 lg:col-span-3' : ''}>
      <label className="label-eyebrow">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}