import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const InvestmentDashboardPage = lazy(() => import('./pages/InvestmentDashboardPage'));
const InvestmentListPage = lazy(() => import('./pages/InvestmentListPage'));
const InvestmentCreatePage = lazy(() => import('./pages/InvestmentCreatePage'));
const InvestmentPendingPage = lazy(() => import('./pages/InvestmentPending'));
const InvestmentDetailPage = lazy(() => import('./pages/InvestmentDetailPage'));
const InvestmentUpdatePage = lazy(() => import('./pages/InvestmentUpdatePage'));
const InvestmentHistoryPage = lazy(() => import('./pages/InvestmentHistoryPage'));
const InvestmentReportsPage = lazy(() => import('./pages/InvestmentReportsPage'));
const InvestmentRepaymentPage = lazy(() => import('./pages/InvestmentRepaymentPage'));

export const investmentRoutes: RouteObject[] = [
  {
    path: 'investments',  // NO leading slash
    children: [
      // Default to dashboard page when visiting /investments
      { index: true, element: <InvestmentDashboardPage /> },

      // Main routes
      { path: 'list', element: <InvestmentListPage /> },
      { path: 'create', element: <InvestmentCreatePage /> },
      { path: 'pending', element: <InvestmentPendingPage /> },
      { path: ':id', element: <InvestmentDetailPage /> },
      { path: ':id/edit', element: <InvestmentUpdatePage /> },
      { path: 'history', element: <InvestmentHistoryPage /> },
      { path: 'reports', element: <InvestmentReportsPage /> },
      { path: ':id/repayment', element: <InvestmentRepaymentPage /> },
    ],
  },
];