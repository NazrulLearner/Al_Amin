import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const InvestmentListPage = lazy(() => import('./pages/InvestmentListPage'));
const InvestmentCreatePage = lazy(() => import('./pages/InvestmentCreatePage'));
const InvestmentDetailPage = lazy(() => import('./pages/InvestmentDetailPage'));
const InvestmentUpdatePage = lazy(() => import('./pages/InvestmentUpdatePage'));
const InvestmentHistoryPage = lazy(() => import('./pages/InvestmentHistoryPage'));
const InvestmentReportsPage = lazy(() => import('./pages/InvestmentReportsPage'));
const InvestmentDashboardPage = lazy(() => import('./pages/InvestmentDashboardPage'));

export const investmentRoutes: RouteObject[] = [
  {
    path: 'investments',  // NO leading slash
    children: [
      { index: true, element: <InvestmentListPage /> },
      { path: 'dashboard', element: <InvestmentDashboardPage /> },
      { path: 'create', element: <InvestmentCreatePage /> },
      { path: ':id', element: <InvestmentDetailPage /> },
      { path: ':id/edit', element: <InvestmentUpdatePage /> },
      { path: 'history', element: <InvestmentHistoryPage /> },
      { path: 'reports', element: <InvestmentReportsPage /> },
    ],
  },
];