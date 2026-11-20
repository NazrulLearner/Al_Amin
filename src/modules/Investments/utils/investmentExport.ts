// ==========================================
// Excel export of investments: the FULL investment data (not only what the table shows),
// one row per investment, with clear headings. Uses the shared dependency-free .xlsx writer.
// ==========================================
import { buildXlsx, downloadXlsx } from '../../../shared/export/xlsxWriter';
import type { XlsxColumn } from '../../../shared/export/xlsxWriter';
import type { InvestmentRow } from '../hooks/useInvestmentData';

export const INVESTMENT_EXPORT_COLUMNS: XlsxColumn<InvestmentRow>[] = [
  { header: 'Investment ID', width: 16, value: (r) => r.reference_number },
  { header: 'Investment Name', width: 32, value: (r) => r.investment_name },
  { header: 'Category', width: 18, value: (r) => r.category },
  { header: 'Status', width: 16, value: (r) => r.status },
  { header: 'Investment Structure', width: 30, value: (r) => r.investment_structure },
  { header: "Somity's Role", width: 16, value: (r) => r.somity_role },
  { header: 'Lead Investor', width: 24, value: (r) => (r.has_lead_investor ? r.lead_investor_name : '') },
  { header: 'Total Required (৳)', width: 18, kind: 'money', value: (r) => r.total_required_investment },
  { header: 'Somity Committed (৳)', width: 20, kind: 'money', value: (r) => r.somity_committed_amount },
  { header: 'Other Investors Committed (৳)', width: 24, kind: 'money', value: (r) => r.other_investors_committed_amount },
  { header: 'Somity Funded (৳)', width: 18, kind: 'money', value: (r) => r.somity_funded },
  { header: 'Returned (৳)', width: 16, kind: 'money', value: (r) => r.actual_return_amount },
  { header: 'Expected Return (৳)', width: 18, kind: 'money', value: (r) => r.expected_return_amount },
  { header: 'Return Model', width: 18, value: (r) => r.return_model },
  { header: 'Return Rate', width: 12, kind: 'percent', value: (r) => r.return_rate },
  { header: 'Return Duration', width: 16, value: (r) => r.return_duration },
  { header: 'Risk Level', width: 12, value: (r) => r.risk_level },
  { header: 'Start Date', width: 14, kind: 'date', value: (r) => r.start_date },
  { header: 'Maturity Date', width: 14, kind: 'date', value: (r) => r.maturity_date },
  { header: 'Location', width: 20, value: (r) => r.location },
  { header: 'Purpose', width: 24, value: (r) => r.purpose },
  { header: 'Description', width: 40, value: (r) => r.description },
  { header: 'Risk Description', width: 40, value: (r) => r.risk_description },
  { header: 'Risk Mitigation', width: 40, value: (r) => r.mitigation_plan },
  { header: 'Collateral / Security', width: 28, value: (r) => r.collateral_security },
  { header: 'Submitted By', width: 18, value: (r) => r.submitted_by },
  { header: 'Submitted Date', width: 14, kind: 'date', value: (r) => r.submitted_date },
  { header: 'Reviewed By', width: 18, value: (r) => r.reviewed_by },
  { header: 'Review Date', width: 14, kind: 'date', value: (r) => r.review_date },
  { header: 'Approval Decision', width: 18, value: (r) => r.approval_decision },
  { header: 'Rejection Reason', width: 30, value: (r) => r.rejection_reason },
  { header: 'Created Date', width: 14, kind: 'date', value: (r) => r.created_date },
  { header: 'Last Updated', width: 14, kind: 'date', value: (r) => r.updated_date },
];

export function buildInvestmentsWorkbook(rows: InvestmentRow[]): Uint8Array {
  return buildXlsx('Investments', INVESTMENT_EXPORT_COLUMNS, rows);
}

export function exportInvestmentsToExcel(rows: InvestmentRow[]): void {
  const day = new Date().toLocaleDateString('en-CA'); // local date
  downloadXlsx(`Investments_${day}.xlsx`, buildInvestmentsWorkbook(rows));
}
