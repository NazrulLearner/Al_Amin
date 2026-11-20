// ==========================================
// Investment Constants
// ==========================================

export const CATEGORIES = [
  'FDR', 'Agriculture', 'Real Estate', 'External Business',
  'Project', 'Equity', 'Partnership', 'Other',
];

export const STATUSES = [
  'Draft', 'Pending Review', 'Approved', 'Funding', 'Active',
  'Return Received', 'Matured', 'Settlement', 'Closed',
  'Rejected', 'Withdrawn', 'Cancelled',
];

export const STRUCTURES = [
  'Somity Only', 'Somity as Lead Investor', 'Somity as Co-Investor',
  'External Lead Investor + Somity', 'Multiple Co-Investors',
  'Joint Investment', 'Other',
];

export const ROLES = ['Lead Investor', 'Co-Investor', 'Sole Investor', 'Participant'];
export const RISK_LEVELS = ['Low', 'Medium', 'High', 'Critical'];
export const RETURN_MODELS = [
  'Fixed Return', 'Percentage Return', 'Profit Sharing',
  'Revenue Sharing', 'Equity/Ownership', 'Custom Agreement',
];

export const PARTICIPANT_TYPES = [
  'Somity', 'Lead Investor', 'Co-Investor', 'Individual Investor',
  'Organization', 'Partner', 'Other',
];

export const PAYMENT_METHODS = ['Bank Transfer', 'Cash', 'Cheque', 'Mobile Banking', 'Other'];
export const RETURN_TYPES = ['Profit', 'Principal', 'Profit + Principal', 'Partial Return'];
export const DOC_TYPES = [
  'Investment Proposal', 'Agreement', 'Contract', 'FDR Certificate',
  'Investor Agreement', 'Payment Proof', 'Return Proof',
  'Security/Collateral Document', 'Other',
];

export const HISTORY_EVENTS = [
  'Created', 'Updated', 'Submitted', 'Approved', 'Rejected',
  'Funding Recorded', 'Return Recorded', 'Maturity', 'Settlement',
  'Closed', 'Revision Requested', 'Withdrawn', 'Cancelled', 'Deleted', 'Restored',
];

export const PARTICIPANT_COLORS = [
  '#065F46', '#4F46E5', '#D97706', '#0D9488',
  '#9333EA', '#DC2626', '#0891B2', '#CA8A04',
];

export const CATEGORY_COLORS: Record<string, string> = {
  'FDR': '#065F46',
  'Agriculture': '#0D9488',
  'Real Estate': '#D97706',
  'External Business': '#4F46E5',
  'Project': '#0891B2',
  'Equity': '#9333EA',
  'Partnership': '#DC2626',
  'Other': '#64748B',
};

export const STATUS_STYLES: Record<string, string> = {
  'Draft': 'bg-slate-100 text-slate-600 border-slate-200',
  'Pending Review': 'bg-amber-50 text-amber-700 border-amber-200',
  'Approved': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Funding': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Active': 'bg-emerald-600 text-white border-emerald-700',
  'Return Received': 'bg-teal-50 text-teal-700 border-teal-200',
  'Matured': 'bg-violet-50 text-violet-700 border-violet-200',
  'Settlement': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Closed': 'bg-slate-200 text-slate-600 border-slate-300',
  'Rejected': 'bg-red-50 text-red-700 border-red-200',
  'Withdrawn': 'bg-slate-100 text-slate-500 border-slate-200',
  'Cancelled': 'bg-red-50 text-red-600 border-red-200',
};

export const RISK_STYLES: Record<string, string> = {
  'Low': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Medium': 'bg-amber-50 text-amber-700 border-amber-200',
  'High': 'bg-orange-50 text-orange-700 border-orange-200',
  'Critical': 'bg-red-50 text-red-700 border-red-200',
};

export const ROLE_STYLES: Record<string, string> = {
  'Lead Investor': 'bg-amber-50 text-amber-800 border-amber-300',
  'Co-Investor': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Sole Investor': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Participant': 'bg-slate-100 text-slate-600 border-slate-200',
};

export const STRUCTURE_STYLES: Record<string, string> = {
  'Somity Only': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Somity as Lead Investor': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Somity as Co-Investor': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'External Lead Investor + Somity': 'bg-amber-50 text-amber-700 border-amber-200',
  'Multiple Co-Investors': 'bg-violet-50 text-violet-700 border-violet-200',
  'Joint Investment': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Other': 'bg-slate-100 text-slate-600 border-slate-200',
};