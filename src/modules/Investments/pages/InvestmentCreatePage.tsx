// ==========================================
// Create Investment
// Required (4): Investment Name, Reference Number, Category, Total Required Investment.
// Everything else is optional. Participants (incl. the Somity's own share) are added
// with ParticipantManager. "Save Draft" / "Submit for Review" -> ONE batch in createInvestment().
// No money is paid here: actual payments are recorded later in the Funding tab.
// ==========================================
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronDown } from 'lucide-react';
import '../investments.css';
import { useAuth } from '../../../app/providers/AuthProvider';
import ParticipantManager from '../components/investment/ParticipantManager';
import NumberInput from '../components/investment/NumberInput';
import InfoTip from '../components/investment/InfoTip';
import { createInvestment, investmentService } from '../services';
import { toActor } from '../utils/actor';
import { formatTaka } from '../utils/investmentUtils';
import { validateInvestmentForm } from '../utils/investmentValidation';
import { CATEGORIES, STRUCTURES, ROLES, RISK_LEVELS, RETURN_MODELS } from '../constants/investmentConstants';
import {
  FIELD_HELP as H, STRUCTURE_HELP, ROLE_HELP, RETURN_MODEL_HELP, RISK_HELP, STRUCTURES_WITH_EXTERNAL_LEAD,
} from '../constants/investmentFieldHelp';
import type {
  InvestmentCategory, InvestmentStructure, SomityRole, RiskLevel, ReturnModel, InvestmentParticipant,
} from '../types';

const SOMITY_NAME = 'Al-Amin Somity';

// ---------- small building blocks ----------
function Field(props: {
  id: string; label: string; required?: boolean; tip?: string; hint?: ReactNode; error?: string; warn?: string;
  wide?: boolean; children: ReactNode;
}) {
  const { id, label, required, tip, hint, error, warn, wide, children } = props;
  return (
    <div className={wide ? 'sm:col-span-2 lg:col-span-3' : ''}>
      <label htmlFor={id} className="label-eyebrow">
        {label}
        {required && <span className="text-red-500"> *</span>}
        {tip && <InfoTip text={tip} />}
      </label>
      <div className="mt-1">{children}</div>
      {error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : warn ? (
        <p className="mt-1 text-xs text-amber-600">{warn}</p>
      ) : (
        hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
}

function Collapsible({ title, note, open, onToggle, children }: {
  title: string; note?: string; open: boolean; onToggle: () => void; children: ReactNode;
}) {
  return (
    <div className="rounded-md border border-slate-200">
      <button type="button" onClick={onToggle} aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-slate-700">
        <span>{title} {note && <span className="font-normal text-slate-400">— {note}</span>}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="border-t border-slate-200 p-4">{children}</div>}
    </div>
  );
}

const section = 'rounded-lg border border-slate-200 bg-white p-5 space-y-4';
const grid = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3';

export default function InvestmentCreatePage() {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [refDuplicate, setRefDuplicate] = useState(false);
  const [openMore, setOpenMore] = useState(false);
  const [openRisk, setOpenRisk] = useState(false);

  const [f, setF] = useState({
    investment_name: '',
    reference_number: '',
    category: '' as InvestmentCategory | '',
    location: '',
    purpose: '',
    description: '',
    investment_structure: 'Somity Only' as InvestmentStructure,
    somity_role: 'Sole Investor' as SomityRole,
    lead_investor_name: '',
    total_required_investment: 0,
    return_model: 'Fixed Return' as ReturnModel,
    return_rate: 0,
    return_duration: '',
    expected_return_amount: 0,
    risk_level: 'Low' as RiskLevel,
    risk_description: '',
    mitigation_plan: '',
    collateral_security: '',
    start_date: '',
    maturity_date: '',
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));
  const touch = (k: string) => setTouched((t) => ({ ...t, [k]: true }));

  // The Somity row is pre-filled; the user sets its committed amount.
  const [participants, setParticipants] = useState<Partial<InvestmentParticipant>[]>([
    {
      name: SOMITY_NAME, participant_type: 'Somity', role: 'Sole Investor',
      committed_amount: 0, funded_amount: 0, participation_pct: 0, return_share_pct: 0, status: 'Active',
    },
  ]);

  // ---------- validation ----------
  const errors = useMemo(() => validateInvestmentForm(f), [f]);
  const shown = (k: string) => ((submitted || touched[k]) ? errors[k] : undefined);
  const hasSomity = participants.some((p) => p.participant_type === 'Somity');

  const committed = participants.reduce((s, p) => s + (p.committed_amount || 0), 0);
  const gap = f.total_required_investment - committed;
  const showLead = STRUCTURES_WITH_EXTERNAL_LEAD.includes(f.investment_structure);

  const checkReference = async () => {
    touch('reference_number');
    try {
      setRefDuplicate(await investmentService.referenceExists(f.reference_number));
    } catch {
      setRefDuplicate(false); // a failed check must never block saving
    }
  };

  const goToFirstError = (errs: Record<string, string>) => {
    const first = Object.keys(errs)[0];
    const el = first ? document.getElementById(`f-${first}`) : null;
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    (el as HTMLElement | null)?.focus?.();
  };

  const submit = async (submitForReview: boolean) => {
    setSubmitted(true);
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the highlighted fields');
      goToFirstError(errors);
      return;
    }
    if (!hasSomity) {
      toast.error('The Somity must be listed under "Who is investing"');
      return;
    }
    setSaving(true);
    try {
      // Fresh duplicate check at the moment of saving (warn + ask, never silently block).
      let dup = false;
      try { dup = await investmentService.referenceExists(f.reference_number); } catch { dup = false; }
      if (dup && !window.confirm('This reference number is already used by another investment.\n\nSave anyway?')) {
        setSaving(false);
        return;
      }
      const id = await createInvestment({
        investment: {
          investment_name: f.investment_name.trim(),
          reference_number: f.reference_number.trim(),
          category: f.category as InvestmentCategory,
          location: f.location.trim() || undefined,
          purpose: f.purpose.trim() || undefined,
          description: f.description.trim() || undefined,
          investment_structure: f.investment_structure,
          has_lead_investor: showLead && !!f.lead_investor_name.trim(),
          lead_investor_name: showLead ? f.lead_investor_name.trim() || undefined : undefined,
          somity_role: f.somity_role,
          total_required_investment: f.total_required_investment,
          return_model: f.return_model,
          return_rate: f.return_rate || undefined,
          return_duration: f.return_duration.trim() || undefined,
          expected_return_amount: f.expected_return_amount,
          risk_level: f.risk_level,
          risk_description: f.risk_description.trim() || undefined,
          mitigation_plan: f.mitigation_plan.trim() || undefined,
          collateral_security: f.collateral_security.trim() || undefined,
          start_date: f.start_date || undefined,
          maturity_date: f.maturity_date || undefined,
        },
        participants: participants.map((p) => (p.participant_type === 'Somity' ? { ...p, role: f.somity_role } : p)),
        submit: submitForReview,
        actor: toActor(user, userData),
      });
      toast.success(submitForReview ? 'Submitted for review' : 'Draft saved');
      navigate(`/investments/${id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const bad = (k: string) => (shown(k) ? { borderColor: '#ef4444' } : undefined);

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-4 pb-24 md:p-6 md:pb-24">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">New Investment</h1>
        <p className="text-sm text-slate-500">
          Fields marked <span className="text-red-500">*</span> are required. No money moves here — payments are
          recorded later in the Funding tab.
        </p>
      </div>

      {/* ---------- Basics ---------- */}
      <section className={section}>
        <h2 className="font-semibold text-slate-800">Basics</h2>
        <div className={grid}>
          <Field id="f-investment_name" label={H.investment_name.label} required hint={H.investment_name.hint} error={shown('investment_name')}>
            <input id="f-investment_name" className="inp" style={bad('investment_name')} value={f.investment_name}
              placeholder={H.investment_name.placeholder}
              onChange={(e) => set('investment_name', e.target.value)} onBlur={() => touch('investment_name')} />
          </Field>
          <Field id="f-reference_number" label={H.reference_number.label} required hint={H.reference_number.hint}
            error={shown('reference_number')}
            warn={refDuplicate ? 'This reference number is already used by another investment. Please check.' : undefined}>
            <input id="f-reference_number" className="inp" style={bad('reference_number')} value={f.reference_number}
              placeholder={H.reference_number.placeholder}
              onChange={(e) => { set('reference_number', e.target.value); setRefDuplicate(false); }}
              onBlur={checkReference} />
          </Field>
          <Field id="f-category" label={H.category.label} required hint={H.category.hint} error={shown('category')}>
            <select id="f-category" className="inp" style={bad('category')} value={f.category}
              onChange={(e) => set('category', e.target.value as InvestmentCategory)} onBlur={() => touch('category')}>
              <option value="" disabled>{H.category.placeholder}</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field id="f-start_date" label={H.start_date.label} hint={H.start_date.hint}>
            <input id="f-start_date" type="date" className="inp" value={f.start_date}
              onChange={(e) => set('start_date', e.target.value)} />
          </Field>
          <Field id="f-maturity_date" label={H.maturity_date.label} hint={H.maturity_date.hint} error={shown('maturity_date')}>
            <input id="f-maturity_date" type="date" className="inp" style={bad('maturity_date')} value={f.maturity_date}
              min={f.start_date || undefined}
              onChange={(e) => { set('maturity_date', e.target.value); touch('maturity_date'); }} />
          </Field>
        </div>
        <Collapsible title="More details" note="optional: location, purpose, description" open={openMore} onToggle={() => setOpenMore((o) => !o)}>
          <div className={grid}>
            <Field id="f-location" label={H.location.label}>
              <input id="f-location" className="inp" value={f.location} placeholder={H.location.placeholder} onChange={(e) => set('location', e.target.value)} />
            </Field>
            <Field id="f-purpose" label={H.purpose.label}>
              <input id="f-purpose" className="inp" value={f.purpose} placeholder={H.purpose.placeholder} onChange={(e) => set('purpose', e.target.value)} />
            </Field>
            <Field id="f-description" label={H.description.label} wide>
              <textarea id="f-description" className="inp" rows={2} value={f.description} placeholder={H.description.placeholder} onChange={(e) => set('description', e.target.value)} />
            </Field>
          </div>
        </Collapsible>
      </section>

      {/* ---------- Structure & Amount ---------- */}
      <section className={section}>
        <h2 className="font-semibold text-slate-800">Structure & Amount</h2>
        <div className={grid}>
          <Field id="f-investment_structure" label={H.investment_structure.label} tip={H.investment_structure.tip} hint={STRUCTURE_HELP[f.investment_structure]}>
            <select id="f-investment_structure" className="inp" value={f.investment_structure}
              onChange={(e) => set('investment_structure', e.target.value as InvestmentStructure)}>
              {STRUCTURES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field id="f-somity_role" label={H.somity_role.label} tip={H.somity_role.tip} hint={ROLE_HELP[f.somity_role]}>
            <select id="f-somity_role" className="inp" value={f.somity_role} onChange={(e) => set('somity_role', e.target.value as SomityRole)}>
              {ROLES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          {showLead && (
            <Field id="f-lead_investor_name" label={H.lead_investor_name.label} tip={H.lead_investor_name.tip}>
              <input id="f-lead_investor_name" className="inp" value={f.lead_investor_name}
                placeholder={H.lead_investor_name.placeholder} onChange={(e) => set('lead_investor_name', e.target.value)} />
            </Field>
          )}
          <Field id="f-total_required_investment" label={H.total_required_investment.label} required tip={H.total_required_investment.tip}
            error={shown('total_required_investment')}>
            <NumberInput id="f-total_required_investment" value={f.total_required_investment}
              placeholder={H.total_required_investment.placeholder} invalid={!!shown('total_required_investment')}
              onChange={(n) => set('total_required_investment', n)} onBlur={() => touch('total_required_investment')} />
          </Field>
        </div>
      </section>

      {/* ---------- Expected Return ---------- */}
      <section className={section}>
        <h2 className="font-semibold text-slate-800">Expected Return</h2>
        <div className={grid}>
          <Field id="f-return_model" label={H.return_model.label} tip={H.return_model.tip} hint={RETURN_MODEL_HELP[f.return_model]}>
            <select id="f-return_model" className="inp" value={f.return_model} onChange={(e) => set('return_model', e.target.value as ReturnModel)}>
              {RETURN_MODELS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field id="f-return_rate" label={H.return_rate.label} hint={H.return_rate.hint} error={shown('return_rate')}>
            <NumberInput id="f-return_rate" kind="percent" value={f.return_rate} placeholder={H.return_rate.placeholder}
              invalid={!!shown('return_rate')} onChange={(n) => set('return_rate', n)} />
          </Field>
          <Field id="f-return_duration" label={H.return_duration.label} hint={H.return_duration.hint}>
            <input id="f-return_duration" className="inp" value={f.return_duration} placeholder={H.return_duration.placeholder}
              onChange={(e) => set('return_duration', e.target.value)} />
          </Field>
          <Field id="f-expected_return_amount" label={H.expected_return_amount.label} tip={H.expected_return_amount.tip} error={shown('expected_return_amount')}>
            <NumberInput id="f-expected_return_amount" value={f.expected_return_amount} placeholder={H.expected_return_amount.placeholder}
              invalid={!!shown('expected_return_amount')} onChange={(n) => set('expected_return_amount', n)} />
          </Field>
        </div>
      </section>

      {/* ---------- Risk ---------- */}
      <section className={section}>
        <h2 className="font-semibold text-slate-800">Risk</h2>
        <div className={grid}>
          <Field id="f-risk_level" label={H.risk_level.label} tip={H.risk_level.tip} hint={RISK_HELP[f.risk_level]}>
            <select id="f-risk_level" className="inp" value={f.risk_level} onChange={(e) => set('risk_level', e.target.value as RiskLevel)}>
              {RISK_LEVELS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
        </div>
        <Collapsible title="Risk details" note="optional: description, mitigation, collateral" open={openRisk} onToggle={() => setOpenRisk((o) => !o)}>
          <div className={grid}>
            <Field id="f-collateral_security" label={H.collateral_security.label} tip={H.collateral_security.tip}>
              <input id="f-collateral_security" className="inp" value={f.collateral_security}
                placeholder={H.collateral_security.placeholder} onChange={(e) => set('collateral_security', e.target.value)} />
            </Field>
            <Field id="f-risk_description" label={H.risk_description.label} wide>
              <textarea id="f-risk_description" className="inp" rows={2} value={f.risk_description}
                placeholder={H.risk_description.placeholder} onChange={(e) => set('risk_description', e.target.value)} />
            </Field>
            <Field id="f-mitigation_plan" label={H.mitigation_plan.label} tip={H.mitigation_plan.tip} wide>
              <textarea id="f-mitigation_plan" className="inp" rows={2} value={f.mitigation_plan}
                placeholder={H.mitigation_plan.placeholder} onChange={(e) => set('mitigation_plan', e.target.value)} />
            </Field>
          </div>
        </Collapsible>
      </section>

      {/* ---------- Participants ---------- */}
      <section className={section}>
        <h2 className="font-semibold text-slate-800">Who is investing</h2>
        <ParticipantManager participants={participants} onChange={setParticipants} totalRequired={f.total_required_investment} />
        {!hasSomity && <p className="text-sm text-red-600">The Somity must be listed as a participant.</p>}
        <p className={`text-sm ${gap < 0 ? 'text-red-600' : 'text-slate-600'}`}>
          Committed ৳{formatTaka(committed)} of ৳{formatTaka(f.total_required_investment)}
          {gap > 0 && ` — ৳${formatTaka(gap)} still unassigned`}
          {gap < 0 && ` — over-committed by ৳${formatTaka(-gap)}`}
        </p>
      </section>

      {/* ---------- Actions (stay visible at the bottom, also on phones) ---------- */}
      <div className="sticky bottom-0 z-10 -mx-4 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        <div className="mx-auto flex max-w-5xl flex-wrap justify-end gap-2 sm:gap-3">
          <button disabled={saving} onClick={() => navigate('/investments')}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm">Cancel</button>
          <button disabled={saving} onClick={() => submit(false)}
            className="rounded-md border border-emerald-700 px-4 py-2 text-sm font-semibold text-emerald-700 disabled:opacity-50">Save Draft</button>
          <button disabled={saving} onClick={() => submit(true)}
            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {saving ? 'Saving…' : 'Submit for Review'}
          </button>
        </div>
      </div>
    </div>
  );
}
