// ==========================================
// Investment Types
// ==========================================

export type InvestmentCategory =
  | 'FDR' | 'Agriculture' | 'Real Estate' | 'External Business'
  | 'Project' | 'Equity' | 'Partnership' | 'Other';

export type InvestmentStatus =
  | 'Draft' | 'Pending Review' | 'Approved' | 'Funding'
  | 'Active' | 'Return Received' | 'Matured' | 'Settlement'
  | 'Closed' | 'Rejected' | 'Withdrawn' | 'Cancelled';

export type InvestmentStructure =
  | 'Somity Only' | 'Somity as Lead Investor' | 'Somity as Co-Investor'
  | 'External Lead Investor + Somity' | 'Multiple Co-Investors'
  | 'Joint Investment' | 'Other';

export type SomityRole = 'Lead Investor' | 'Co-Investor' | 'Sole Investor' | 'Participant';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type ReturnModel =
  | 'Fixed Return' | 'Percentage Return' | 'Profit Sharing'
  | 'Revenue Sharing' | 'Equity/Ownership' | 'Custom Agreement';

export interface Investment {
  id: string;
  investment_name: string;
  reference_number: string;
  category: InvestmentCategory;
  opportunity?: string;
  location?: string;
  purpose?: string;
  description?: string;
  investment_structure: InvestmentStructure;
  has_lead_investor: boolean;
  lead_investor_name?: string;
  somity_role: SomityRole;
  total_required_investment: number;
  somity_committed_amount: number;
  other_investors_committed_amount?: number;
  return_model: ReturnModel;
  return_rate?: number;
  return_duration?: string;
  expected_return_amount: number;
  actual_return_amount: number;
  risk_level: RiskLevel;
  risk_category?: string;
  risk_description?: string;
  mitigation_plan?: string;
  collateral_security?: string;
  status: InvestmentStatus;
  start_date?: string;
  maturity_date?: string;
  submitted_date?: string;
  submitted_by?: string;
  reviewed_by?: string;
  review_date?: string;
  approval_decision?: string;
  rejection_reason?: string;
  createdBy?: string;
  created_date?: string;
  updated_date?: string;
  // Soft delete (the document is never removed; children are never touched)
  is_deleted?: boolean;
  deleted_at?: string;
  deleted_by?: string;
  delete_reason?: string;
  restored_at?: string; // reserved for a future Restore feature
  restored_by?: string;
}

export interface InvestmentParticipant {
  id: string;
  investment_id: string;
  name: string;
  participant_type: 'Somity' | 'Lead Investor' | 'Co-Investor' | 'Individual Investor' | 'Organization' | 'Partner' | 'Other';
  role: SomityRole;
  contact?: string;
  committed_amount: number;
  funded_amount: number;
  participation_pct: number;
  return_share_pct: number;
  return_terms?: string;
  agreement?: string;
  status: 'Active' | 'Settled' | 'Withdrawn' | 'Pending';
  created_date?: string;
}

export interface FundingRecord {
  id: string;
  investment_id: string;
  participant_id?: string;
  investor_name: string;
  amount: number;
  funding_date: string;
  payment_method: 'Bank Transfer' | 'Cash' | 'Cheque' | 'Mobile Banking' | 'Other';
  account?: string;
  reference?: string;
  remarks?: string;
  status: 'Pending' | 'Confirmed' | 'Reversed';
  createdBy?: string;
  created_date?: string;
}

export interface ReturnRecord {
  id: string;
  investment_id: string;
  participant_id?: string;
  investor_name: string;
  return_date: string;
  return_type: 'Profit' | 'Principal' | 'Profit + Principal' | 'Partial Return';
  expected_amount: number;
  received_amount: number;
  reference?: string;
  remarks?: string;
  status: 'Expected' | 'Partially Received' | 'Received' | 'Overdue';
  created_date?: string;
}

export interface InvestmentTransaction {
  id: string;
  investment_id: string;
  investor_name?: string;
  transaction_type: 'Funding' | 'Profit Received' | 'Principal Returned' | 'Partial Return' | 'Settlement' | 'Approval' | 'Submission' | 'Status Change';
  amount: number;
  direction: 'Inflow' | 'Outflow' | 'Neutral';
  reference?: string;
  transaction_date: string;
  status: 'Completed' | 'Pending' | 'Failed';
  description?: string;
  created_date?: string;
}

export interface InvestmentDocument {
  id: string;
  investment_id: string;
  file_name: string;
  document_type: 'Investment Proposal' | 'Agreement' | 'Contract' | 'FDR Certificate' | 'Investor Agreement' | 'Payment Proof' | 'Return Proof' | 'Security/Collateral Document' | 'Other';
  related_investor?: string;
  uploaded_by?: string;
  upload_date: string;
  description?: string;
  file_uri?: string;
  status: 'Active' | 'Archived' | 'Replaced';
  created_date?: string;
}

export interface InvestmentHistory {
  id: string;
  investment_id: string;
  event: 'Created' | 'Updated' | 'Submitted' | 'Approved' | 'Rejected' | 'Funding Recorded' | 'Return Recorded' | 'Maturity' | 'Settlement' | 'Closed' | 'Revision Requested' | 'Withdrawn' | 'Cancelled' | 'Deleted' | 'Restored';
  event_date: string;
  description?: string;
  performed_by?: string;
  details?: string;
  created_date?: string;
}

export interface InvestmentTotals {
  totalCommitted: number;
  totalFunded: number;
  somityFunded: number;
  externalCommitted: number;
  fundingGap: number;
  outstandingReturn: number;
}

// ==========================================
// Input / Filter types (used by services)
// ==========================================

export type InvestmentCreateInput = Omit<Investment, 'id' | 'created_date' | 'updated_date'>;
export type InvestmentUpdateInput = Partial<InvestmentCreateInput>;

export interface InvestmentFilters {
  status?: InvestmentStatus;
  category?: InvestmentCategory;
  search?: string;
  structure?: InvestmentStructure;
  role?: SomityRole;
  risk?: RiskLevel;
}

export type ParticipantCreateInput = Omit<InvestmentParticipant, 'id' | 'created_date'>;
export type ParticipantUpdateInput = Partial<ParticipantCreateInput>;

export type FundingCreateInput = Omit<FundingRecord, 'id' | 'created_date' | 'status'> & {
  status?: FundingRecord['status'];
};
export type FundingUpdateInput = Partial<FundingCreateInput>;

export type ReturnCreateInput = Omit<ReturnRecord, 'id' | 'created_date'>;
export type ReturnUpdateInput = Partial<ReturnCreateInput>;

export type TransactionCreateInput = Omit<InvestmentTransaction, 'id' | 'created_date' | 'status'> & {
  status?: InvestmentTransaction['status'];
};
export type TransactionUpdateInput = Partial<TransactionCreateInput>;

export type DocumentCreateInput = Omit<InvestmentDocument, 'id' | 'created_date' | 'status'> & {
  status?: InvestmentDocument['status'];
};
export type DocumentUpdateInput = Partial<DocumentCreateInput>;

export type HistoryCreateInput = Omit<InvestmentHistory, 'id' | 'created_date'>;
