import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const ReportsPage = lazy(() => import('./pages/index'));
const FinanceReport = lazy(() => import('./pages/financeReport'));
const LoanReports = lazy(() => import('./pages/loanReports'));
const MemberReport = lazy(() => import('./pages/memberReport'));
const ExportData = lazy(() => import('./pages/exportData'));

export const reportsRoutes: RouteObject[] = [
  {
    path: 'reports',
    children: [
      { index: true, element: <ReportsPage /> },
      { path: 'finance', element: <FinanceReport /> },
      { path: 'loans', element: <LoanReports /> },
      { path: 'members', element: <MemberReport /> },
      { path: 'export', element: <ExportData /> },
    ],
  },
];