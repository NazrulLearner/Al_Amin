// ==========================================================
// Investment Operations — every multi-document money action
// ==========================================================
// Each function below writes ALL related documents in ONE Firestore
// transaction/batch, so a funding or return can never be half-saved
// (e.g. record saved but participant total not updated).
//
// RULES USED HERE ARE MARKED  [RULE]  — they come from existing UI text or
// are minimal guards. Items marked [CONFIRM] need the owner's decision.
// ==========================================================

import { collection, doc, getDocs, query, runTransaction, serverTimestamp, where, writeBatch } from 'firebase/firestore';
import { db } from '../../../services/firebase/firebase';
import type { Actor } from '../utils/actor';
import { hasInvestmentPermission, investmentPermissions } from '../permissions';
import { firstError, validateInvestmentForm, validateParticipantForm } from '../utils/investmentValidation';
import type {
  Investment,
  InvestmentParticipant,
  InvestmentStatus,
  InvestmentHistory,
  InvestmentTransaction,
  FundingRecord,
  ReturnRecord,
  InvestmentCreateInput,
} from '../types';

const C = {
  investments: 'investments',
  participants: 'investmentParticipants',
  funding: 'fundingRecords',
  returns: 'returnRecords',
  transactions: 'investmentTransactions',
  history: 'investmentHistory',
} as const;

// ---------- helpers ----------
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const isMoney = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n);
// Local calendar date (Bangladesh), NOT UTC — avoids "yesterday" after 6pm.
const todayLocal = () => new Date().toLocaleDateString('en-CA');

// Firestore throws on `undefined` field values — the classic "works once, fails
// next time" bug with optional form fields. Strip them everywhere.
const clean = <T extends object>(o: T): T =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T;

const assertActor = (a: Actor) => {
  if (!a?.uid) throw new Error('You must be signed in to do this');
};

const assertCan = (a: Actor, permission: string, what: string) => {
  if (!hasInvestmentPermission(a.role, permission))
    throw new Error(`Your role "${a.role || 'unknown'}" is not allowed to ${what}`);
};

// A soft-deleted investment must not receive any new money or status change.
const assertNotDeleted = (inv: Investment) => {
  if (inv.is_deleted) throw new Error('This investment has been deleted');
};

type NewHistory = Pick<InvestmentHistory, 'event' | 'description' | 'details'>;

// ---------- status workflow ----------
// [CONFIRM] Order follows the status list already declared in the types.
// Money can only be recorded from 'Approved' onward (rule stated in ApprovalTab).
export const NEXT_STATUS: Record<InvestmentStatus, InvestmentStatus[]> = {
  Draft: ['Pending Review', 'Cancelled'],
  'Pending Review': ['Approved', 'Rejected', 'Draft'],
  Approved: ['Funding', 'Active'],
  Funding: ['Active'],
  Active: ['Return Received', 'Matured'],
  'Return Received': ['Matured'],
  Matured: ['Settlement', 'Closed'],
  Settlement: ['Closed'],
  Closed: [],
  Rejected: [],
  Withdrawn: [],
  Cancelled: [],
};

const EVENT_FOR_STATUS: Partial<Record<InvestmentStatus, InvestmentHistory['event']>> = {
  'Pending Review': 'Submitted',
  Approved: 'Approved',
  Rejected: 'Rejected',
  Draft: 'Revision Requested',
  Cancelled: 'Cancelled',
  Matured: 'Maturity',
  Settlement: 'Settlement',
  Closed: 'Closed',
};

// [RULE] funding allowed only after approval (ApprovalTab text).
const FUNDING_ALLOWED: InvestmentStatus[] = ['Approved', 'Funding', 'Active'];
// [CONFIRM] returns allowed once the investment is running.
const RETURN_ALLOWED: InvestmentStatus[] = ['Active', 'Return Received', 'Matured', 'Settlement'];

// ==========================================================
// 1. Create investment (+ participants + history) — one batch
// ==========================================================
export interface CreateInvestmentArgs {
  investment: Omit<
    InvestmentCreateInput,
    'status' | 'actual_return_amount' | 'somity_committed_amount' | 'other_investors_committed_amount'
  >;
  participants: Partial<InvestmentParticipant>[];
  submit: boolean; // true = 'Pending Review', false = 'Draft'
  actor: Actor;
}

export async function createInvestment({ investment, participants, submit, actor }: CreateInvestmentArgs): Promise<string> {
  assertActor(actor);
  // Same rules the form uses (utils/investmentValidation.ts) — final safety net.
  const formError = firstError(
    validateInvestmentForm({
      investment_name: investment.investment_name,
      reference_number: investment.reference_number,
      category: investment.category,
      total_required_investment: investment.total_required_investment,
      expected_return_amount: investment.expected_return_amount ?? 0,
      return_rate: investment.return_rate ?? 0,
      start_date: investment.start_date ?? '',
      maturity_date: investment.maturity_date ?? '',
    })
  );
  if (formError) throw new Error(formError);

  const somity = participants.find((p) => p.participant_type === 'Somity');
  if (!somity) throw new Error('Somity must be listed as a participant');
  for (const p of participants) {
    const pErr = firstError(validateParticipantForm(p));
    if (pErr) throw new Error(`${p.name || 'Participant'}: ${pErr}`);
  }

  const somityCommitted = round2(somity.committed_amount || 0);
  const othersCommitted = round2(
    participants.filter((p) => p !== somity).reduce((s, p) => s + (p.committed_amount || 0), 0)
  );

  const invRef = doc(collection(db, C.investments));
  const batch = writeBatch(db);
  const status: InvestmentStatus = submit ? 'Pending Review' : 'Draft';

  batch.set(
    invRef,
    clean({
      ...investment,
      somity_committed_amount: somityCommitted,
      other_investors_committed_amount: othersCommitted,
      actual_return_amount: 0,
      status,
      is_deleted: false,
      createdBy: actor.uid,
      submitted_date: submit ? todayLocal() : undefined,
      submitted_by: submit ? actor.name : undefined,
      created_date: serverTimestamp(),
      updated_date: serverTimestamp(),
    })
  );

  for (const p of participants) {
    const committed = round2(p.committed_amount || 0);
    batch.set(
      doc(collection(db, C.participants)),
      clean({
        ...p,
        investment_id: invRef.id,
        committed_amount: committed,
        funded_amount: 0, // money is only counted via recordFunding()
        // Always calculated here (Committed ÷ Total required) so it can never be left at 0 or mistyped.
        participation_pct: round2((committed / investment.total_required_investment) * 100),
        return_share_pct: p.return_share_pct ?? 0,
        status: p.status ?? 'Active',
        created_date: serverTimestamp(),
      })
    );
  }

  const hist = (h: NewHistory) =>
    batch.set(
      doc(collection(db, C.history)),
      clean({ investment_id: invRef.id, event_date: todayLocal(), performed_by: actor.name, ...h, created_date: serverTimestamp() })
    );
  hist({ event: 'Created', description: 'Investment created' });
  if (submit) hist({ event: 'Submitted', description: 'Submitted for review' });

  await batch.commit();
  return invRef.id;
}

// ==========================================================
// 2. Change status (+ history) — one transaction
// ==========================================================
export async function changeStatus(
  investmentId: string,
  to: InvestmentStatus,
  actor: Actor,
  opts: { reason?: string } = {}
): Promise<void> {
  assertActor(actor);
  if (to === 'Rejected' && !opts.reason?.trim()) throw new Error('A rejection reason is required');

  const invRef = doc(db, C.investments, investmentId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(invRef);
    if (!snap.exists()) throw new Error('Investment not found');
    const inv = snap.data() as Investment;
    assertNotDeleted(inv);

    if (!NEXT_STATUS[inv.status]?.includes(to))
      throw new Error(`Cannot move from "${inv.status}" to "${to}"`);

    const patch: Record<string, unknown> = { status: to, updated_date: serverTimestamp() };
    if (to === 'Pending Review') {
      patch.submitted_date = todayLocal();
      patch.submitted_by = actor.name;
    }
    if (to === 'Approved' || to === 'Rejected') {
      patch.reviewed_by = actor.name;
      patch.review_date = todayLocal();
      patch.approval_decision = to;
      if (to === 'Rejected') patch.rejection_reason = opts.reason!.trim();
    }
    tx.update(invRef, patch);

    tx.set(
      doc(collection(db, C.history)),
      clean({
        investment_id: investmentId,
        event: EVENT_FOR_STATUS[to] ?? 'Updated',
        event_date: todayLocal(),
        description: `Status: ${inv.status} → ${to}`,
        performed_by: actor.name,
        details: opts.reason?.trim() || undefined,
        created_date: serverTimestamp(),
      })
    );
  });
}

// ==========================================================
// 3. Record funding — funding row + participant total + ledger + history
// ==========================================================
export interface RecordFundingArgs {
  investment_id: string;
  participant_id: string;
  amount: number;
  funding_date: string;
  payment_method: FundingRecord['payment_method'];
  account?: string;
  reference?: string;
  remarks?: string;
}

export async function recordFunding(input: RecordFundingArgs, actor: Actor): Promise<void> {
  assertActor(actor);
  if (!isMoney(input.amount) || input.amount <= 0) throw new Error('Amount must be greater than 0');
  if (!input.participant_id) throw new Error('Select the investor');
  if (!input.funding_date) throw new Error('Funding date is required');

  const invRef = doc(db, C.investments, input.investment_id);
  const partRef = doc(db, C.participants, input.participant_id);

  await runTransaction(db, async (tx) => {
    const [invSnap, partSnap] = await Promise.all([tx.get(invRef), tx.get(partRef)]);
    if (!invSnap.exists()) throw new Error('Investment not found');
    if (!partSnap.exists()) throw new Error('Investor not found');
    const inv = invSnap.data() as Investment;
    const part = partSnap.data() as InvestmentParticipant;
    assertNotDeleted(inv);

    if (part.investment_id !== input.investment_id) throw new Error('Investor does not belong to this investment');
    if (!FUNDING_ALLOWED.includes(inv.status))
      throw new Error(`Funding cannot be recorded while status is "${inv.status}" (must be Approved, Funding or Active)`);

    const amount = round2(input.amount);

    tx.set(
      doc(collection(db, C.funding)),
      clean({
        ...input,
        amount,
        investor_name: part.name,
        status: 'Confirmed',
        createdBy: actor.uid,
        created_date: serverTimestamp(),
      })
    );
    tx.update(partRef, { funded_amount: round2((part.funded_amount || 0) + amount) });
    tx.update(invRef, { updated_date: serverTimestamp() });

    // [CONFIRM] Only the Somity's own money counts as an outflow of Somity funds.
    const tr: Omit<InvestmentTransaction, 'id' | 'created_date'> = {
      investment_id: input.investment_id,
      investor_name: part.name,
      transaction_type: 'Funding',
      amount,
      direction: part.participant_type === 'Somity' ? 'Outflow' : 'Neutral',
      reference: input.reference,
      transaction_date: input.funding_date,
      status: 'Completed',
      description: `Funding by ${part.name}`,
    };
    tx.set(doc(collection(db, C.transactions)), clean({ ...tr, created_date: serverTimestamp() }));
    tx.set(
      doc(collection(db, C.history)),
      clean({
        investment_id: input.investment_id,
        event: 'Funding Recorded',
        event_date: todayLocal(),
        description: `${part.name} funded ${amount}`,
        performed_by: actor.name,
        created_date: serverTimestamp(),
      })
    );
  });
}

// ==========================================================
// 4. Record return — return row + investment total + ledger + history
// ==========================================================
export interface RecordReturnArgs {
  investment_id: string;
  participant_id?: string;
  return_type: ReturnRecord['return_type'];
  expected_amount: number;
  received_amount: number;
  return_date: string;
  reference?: string;
  remarks?: string;
}

const TX_TYPE: Record<ReturnRecord['return_type'], InvestmentTransaction['transaction_type']> = {
  Profit: 'Profit Received',
  Principal: 'Principal Returned',
  'Profit + Principal': 'Settlement',
  'Partial Return': 'Partial Return',
};

export async function recordReturn(input: RecordReturnArgs, actor: Actor): Promise<void> {
  assertActor(actor);
  const expected = isMoney(input.expected_amount) ? round2(input.expected_amount) : 0;
  const received = isMoney(input.received_amount) ? round2(input.received_amount) : 0;
  if (expected < 0 || received < 0) throw new Error('Amounts cannot be negative');
  if (expected === 0 && received === 0) throw new Error('Enter an expected or a received amount');
  if (!input.return_date) throw new Error('Return date is required');

  const invRef = doc(db, C.investments, input.investment_id);
  const partRef = input.participant_id ? doc(db, C.participants, input.participant_id) : null;

  await runTransaction(db, async (tx) => {
    const invSnap = await tx.get(invRef);
    const partSnap = partRef ? await tx.get(partRef) : null;
    if (!invSnap.exists()) throw new Error('Investment not found');
    const inv = invSnap.data() as Investment;
    const part = partSnap?.exists() ? (partSnap.data() as InvestmentParticipant) : null;
    assertNotDeleted(inv);

    if (partRef && !part) throw new Error('Investor not found');
    if (part && part.investment_id !== input.investment_id) throw new Error('Investor does not belong to this investment');
    if (!RETURN_ALLOWED.includes(inv.status))
      throw new Error(`Returns cannot be recorded while status is "${inv.status}"`);

    const status: ReturnRecord['status'] =
      received > 0 && (expected <= 0 || received >= expected)
        ? 'Received'
        : received > 0
        ? 'Partially Received'
        : 'Expected';

    tx.set(
      doc(collection(db, C.returns)),
      clean({
        ...input,
        investor_name: part?.name ?? 'Investment',
        expected_amount: expected,
        received_amount: received,
        status,
        created_date: serverTimestamp(),
      })
    );

    if (received > 0) {
      // [CONFIRM] actual_return_amount = everything received (profit + principal).
      tx.update(invRef, {
        actual_return_amount: round2((inv.actual_return_amount || 0) + received),
        updated_date: serverTimestamp(),
      });

      const tr: Omit<InvestmentTransaction, 'id' | 'created_date'> = {
        investment_id: input.investment_id,
        investor_name: part?.name,
        transaction_type: TX_TYPE[input.return_type],
        amount: received,
        // [CONFIRM] Inflow to Somity when paid to Somity or to the investment as a whole.
        direction: !part || part.participant_type === 'Somity' ? 'Inflow' : 'Neutral',
        reference: input.reference,
        transaction_date: input.return_date,
        status: 'Completed',
        description: `${input.return_type} received`,
      };
      tx.set(doc(collection(db, C.transactions)), clean({ ...tr, created_date: serverTimestamp() }));
    }

    tx.set(
      doc(collection(db, C.history)),
      clean({
        investment_id: input.investment_id,
        event: 'Return Recorded',
        event_date: todayLocal(),
        description: `${input.return_type}: received ${received} / expected ${expected}`,
        performed_by: actor.name,
        created_date: serverTimestamp(),
      })
    );
  });
}

// ==========================================================
// 5. Soft delete — the investment document stays; only flags are set
// ----------------------------------------------------------
// NEVER touches participants, funding, returns, transactions, documents.
// [RULE confirmed by owner] blocked when any money was funded or returned.
// ==========================================================
export async function softDeleteInvestment(investmentId: string, reason: string, actor: Actor): Promise<void> {
  assertActor(actor);
  assertCan(actor, investmentPermissions.DELETE_INVESTMENT, 'delete investments');
  if (!reason || reason.trim().length < 3) throw new Error('Please write a reason (at least 3 characters)');

  // Money check part 1: any participant already funded? (a query cannot run inside a transaction)
  const partSnap = await getDocs(query(collection(db, C.participants), where('investment_id', '==', investmentId)));
  const funded = partSnap.docs.some((d: { data: () => unknown }) => Number((d.data() as { funded_amount?: number }).funded_amount || 0) > 0);
  if (funded)
    throw new Error('This investment has funded money. It cannot be deleted — use Cancel or Close instead.');

  const invRef = doc(db, C.investments, investmentId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(invRef);
    if (!snap.exists()) throw new Error('Investment not found');
    const inv = snap.data() as Investment;
    if (inv.is_deleted) throw new Error('This investment is already deleted');
    // Money check part 2 (inside the transaction): any return received?
    if (Number(inv.actual_return_amount || 0) > 0)
      throw new Error('This investment has received returns. It cannot be deleted — use Cancel or Close instead.');

    tx.update(invRef, {
      is_deleted: true,
      deleted_at: serverTimestamp(),
      deleted_by: actor.name,
      delete_reason: reason.trim(),
      updated_date: serverTimestamp(),
    });
    tx.set(
      doc(collection(db, C.history)),
      clean({
        investment_id: investmentId,
        event: 'Deleted',
        event_date: todayLocal(),
        description: 'Investment deleted (soft delete)',
        performed_by: actor.name,
        details: reason.trim(),
        created_date: serverTimestamp(),
      })
    );
  });
}
