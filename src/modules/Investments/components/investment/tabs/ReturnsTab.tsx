// ==========================================
// Returns Tab
// ==========================================

import React, { useState, useMemo } from 'react';
import { BDT, formatDate } from '../../../utils/investmentUtils';
import { PARTICIPANT_COLORS } from '../../../constants/investmentConstants';
import { Plus, X, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../../../../app/providers/AuthProvider';
import { recordReturn } from '../../../services';
import NumberInput from '../NumberInput';
import { toActor } from '../../../utils/actor';
import type { Investment, InvestmentParticipant, ReturnRecord } from '../../../types/investment.types';

const RETURN_TYPES = ['Profit', 'Principal', 'Profit + Principal', 'Partial Return'];

interface Props {
  investment: Investment;
  participants: InvestmentParticipant[];
  returns: ReturnRecord[];
  onReload: () => void;
}

export default function ReturnsTab({ investment, participants, returns, onReload }: Props) {
  const { user, userData } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    participant_id: '',
    investor_name: '',
    return_type: 'Profit',
    expected_amount: 0,
    received_amount: 0,
    return_date: new Date().toLocaleDateString('en-CA'),
    reference: '',
    remarks: '',
  });

  const expected = investment.expected_return_amount || 0;
  const received = investment.actual_return_amount || 0;
  const outstanding = expected - received;

  // Profit distribution by participant return share
  const distribution = useMemo(() => {
    if (received <= 0) return [];
    return participants
      .map((p, i) => ({
        label: p.name,
        share: p.return_share_pct || 0,
        amount: (received * (p.return_share_pct || 0)) / 100,
        color: PARTICIPANT_COLORS[i % PARTICIPANT_COLORS.length],
      }))
      .filter((d) => d.share > 0);
  }, [participants, received]);

  const submit = async () => {
    if (!(Number(form.expected_amount) > 0) && !(Number(form.received_amount) > 0)) {
      toast.error('Enter an expected or a received amount');
      return;
    }

    setSaving(true);
    try {
      await recordReturn(
        {
          investment_id: investment.id,
          participant_id: form.participant_id || undefined,
          return_type: form.return_type as ReturnRecord['return_type'],
          expected_amount: Number(form.expected_amount) || 0,
          received_amount: Number(form.received_amount) || 0,
          return_date: form.return_date,
          reference: form.reference || undefined,
          remarks: form.remarks || undefined,
        },
        toActor(user, userData)
      );
      toast.success(`Return recorded: ${BDT(form.received_amount)}`);

      setShowForm(false);
      setForm({
        ...form,
        expected_amount: 0,
        received_amount: 0,
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border p-4">
          <p className="label-eyebrow">Expected Profit</p>
          <p className="mt-1 font-display text-xl font-bold text-emerald-700">
            {BDT(expected)}
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="label-eyebrow">Received Profit</p>
          <p className="mt-1 font-display text-xl font-bold text-teal-700">
            {BDT(received)}
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="label-eyebrow">Outstanding Profit</p>
          <p className="mt-1 font-display text-xl font-bold text-amber-700">
            {BDT(outstanding)}
          </p>
        </div>
      </div>

      {distribution.length > 0 && (
        <div className="rounded-lg border border-border p-5">
          <h3 className="font-display text-sm font-semibold">
            Profit Distribution (Actual Received: {BDT(received)})
          </h3>
          <p className="text-xs text-muted-foreground">
            Distributed per each investor's return share — distinct from participation share.
          </p>
          <div className="mt-4 space-y-3">
            {distribution.map((d, i) => (
              <div key={i} className="flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: d.color }}
                />
                <span className="flex-1 text-sm font-medium">{d.label}</span>
                <span className="text-sm text-muted-foreground">{d.share}%</span>
                <span className="w-28 text-right font-semibold tabular-nums">
                  {BDT(d.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold">Return Records</h3>
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
              <Plus className="h-4 w-4" /> Record Return
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
            <Field label="Return Type">
              <select
                className="inp"
                value={form.return_type}
                onChange={(e) =>
                  setForm({ ...form, return_type: e.target.value })
                }
              >
                {RETURN_TYPES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </Field>
            <Field label="Date">
              <input
                type="date"
                className="inp"
                value={form.return_date}
                onChange={(e) =>
                  setForm({ ...form, return_date: e.target.value })
                }
              />
            </Field>
            <Field label="Expected Amount (৳)">
              <NumberInput
                value={form.expected_amount}
                onChange={(n) => setForm({ ...form, expected_amount: n })}
              />
            </Field>
            <Field label="Received Amount (৳)">
              <NumberInput
                value={form.received_amount}
                onChange={(n) => setForm({ ...form, received_amount: n })}
              />
            </Field>
            <Field label="Reference">
              <input
                className="inp"
                value={form.reference}
                onChange={(e) =>
                  setForm({ ...form, reference: e.target.value })
                }
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
              Save Return Record
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left">
              <th className="px-4 py-2.5 label-eyebrow">Date</th>
              <th className="px-4 py-2.5 label-eyebrow">Return Type</th>
              <th className="px-4 py-2.5 label-eyebrow text-right">Expected</th>
              <th className="px-4 py-2.5 label-eyebrow text-right">Received</th>
              <th className="px-4 py-2.5 label-eyebrow text-right">Outstanding</th>
              <th className="px-4 py-2.5 label-eyebrow">Investor</th>
              <th className="px-4 py-2.5 label-eyebrow">Status</th>
            </tr>
          </thead>
          <tbody>
            {returns.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  <TrendingUp className="mx-auto mb-2 h-6 w-6 opacity-40" />
                  No return records yet.
                </td>
              </tr>
            ) : (
              returns.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{formatDate(r.return_date)}</td>
                  <td className="px-4 py-3">{r.return_type}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {BDT(r.expected_amount || 0)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-emerald-700">
                    {BDT(r.received_amount || 0)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-amber-700">
                    {BDT((r.expected_amount || 0) - (r.received_amount || 0))}
                  </td>
                  <td className="px-4 py-3">{r.investor_name}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium">
                      {r.status}
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