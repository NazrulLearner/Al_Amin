// ==========================================
// Approval Tab
// ==========================================

import React, { useState } from 'react';
import { formatDate } from '../../../utils/investmentUtils';
import { CheckCircle2, XCircle, Clock, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../../../../app/providers/AuthProvider';
import { changeStatus } from '../../../services';
import { toActor } from '../../../utils/actor';
import type { Investment } from '../../../types/investment.types';

interface Props {
  investment: Investment;
  onReload: () => void;
}

export default function ApprovalTab({ investment, onReload }: Props) {
  const { user, userData } = useAuth();
  const [decision, setDecision] = useState<'Approved' | 'Rejected' | null>(null);
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const canApprove =
    investment.status === 'Pending Review';

  const handleDecision = async () => {
    if (!decision) return;

    if (decision === 'Rejected' && !reason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setProcessing(true);
    try {
      await changeStatus(investment.id, decision, toActor(user, userData), { reason });
      toast.success(`Investment ${decision.toLowerCase()}`);

      setDecision(null);
      setReason('');
      onReload();
    } catch (e) {
      toast.error('Error: ' + (e as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-md bg-primary/10 p-2">
            <Info className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold">Approval Workflow</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Investment proposals must be reviewed and approved before funding
              can begin. Approval does not mean money has moved — funding is
              recorded separately.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <p className="label-eyebrow">Current Status</p>
          <p className="mt-1 font-display text-lg font-bold">{investment.status}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="label-eyebrow">Submitted</p>
          <p className="mt-1 text-sm">
            {investment.submitted_date ? formatDate(investment.submitted_date) : 'Not submitted'}
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="label-eyebrow">Reviewed By</p>
          <p className="mt-1 text-sm">{investment.reviewed_by || '—'}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="label-eyebrow">Review Date</p>
          <p className="mt-1 text-sm">
            {investment.review_date ? formatDate(investment.review_date) : '—'}
          </p>
        </div>
      </div>

      {investment.rejection_reason && (
        <div className="rounded-lg border border-red-200 bg-red-50/50 p-4">
          <p className="label-eyebrow text-red-700">Rejection Reason</p>
          <p className="mt-1 text-sm text-red-800">{investment.rejection_reason}</p>
        </div>
      )}

      {canApprove ? (
        <div className="rounded-lg border border-border p-5">
          <h3 className="font-display text-sm font-semibold">Make Decision</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Review all details before approving or rejecting this investment.
          </p>

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setDecision('Approved')}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-md border px-4 py-3 text-sm font-semibold transition-colors ${
                decision === 'Approved'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-border hover:bg-muted'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" /> Approve
            </button>
            <button
              onClick={() => setDecision('Rejected')}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-md border px-4 py-3 text-sm font-semibold transition-colors ${
                decision === 'Rejected'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-border hover:bg-muted'
              }`}
            >
              <XCircle className="h-4 w-4" /> Reject
            </button>
          </div>

          {decision === 'Rejected' && (
            <div className="mt-4">
              <label className="label-eyebrow">Rejection Reason *</label>
              <textarea
                className="inp mt-1"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why is this investment being rejected?"
              />
            </div>
          )}

          {decision && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleDecision}
                disabled={processing}
                className={`rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
                  decision === 'Approved' ? 'bg-emerald-600' : 'bg-red-600'
                }`}
              >
                {processing ? 'Processing…' : `Confirm ${decision}`}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-muted/30 p-5 text-center">
          <Clock className="mx-auto h-6 w-6 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            {investment.status === 'Approved'
              ? 'This investment has been approved.'
              : investment.status === 'Rejected'
                ? 'This investment was rejected.'
                : 'This investment is not pending review.'}
          </p>
        </div>
      )}
    </div>
  );
}