// src/modules/members/utils/memberExport.ts
import { buildXlsx, downloadXlsx } from '../../../shared/export/xlsxWriter';
import type { XlsxColumn } from '../../../shared/export/xlsxWriter';
import type { SimpleMember } from '../../../types';

export const MEMBER_EXPORT_COLUMNS: XlsxColumn<SimpleMember>[] = [
  { header: 'Member ID', width: 16, value: (m) => m.memberId },
  { header: 'Full Name', width: 28, value: (m) => m.fullName },
  { header: 'Phone', width: 18, value: (m) => m.phone || '' },
  { header: 'Email', width: 24, value: (m) => m.email || '' },
  { header: 'Role', width: 14, value: (m) => m.role || 'member' },
  { header: 'Status', width: 14, value: (m) => m.status || 'pending' },
  { header: 'Join Date', width: 14, kind: 'date', value: (m) => m.dateOfJoin || '' },
  { header: 'Shares', width: 10, kind: 'integer', value: (m) => m.shareCount ?? 0 },
  { header: 'Fees Paid (৳)', width: 14, kind: 'money', value: (m) => m.totalFeesPaid ?? 0 },
  { header: 'Pending (৳)', width: 14, kind: 'money', value: (m) => m.totalPendingAmount ?? 0 },
];

export function buildMembersWorkbook(rows: SimpleMember[]): Uint8Array {
  return buildXlsx('Members', MEMBER_EXPORT_COLUMNS, rows);
}

export function exportMembersToExcel(rows: SimpleMember[]): void {
  const day = new Date().toLocaleDateString('en-CA');
  downloadXlsx(`Members_${day}.xlsx`, buildMembersWorkbook(rows));
}
