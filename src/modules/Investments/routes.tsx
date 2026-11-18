import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';

const InvestmentListPage = lazy(() => import('./pages/InvestmentListPage'));
const InvestmentCreatePage = lazy(() => import('./pages/InvestmentCreatePage'));
const InvestmentDetailPage = lazy(() => import('./pages/InvestmentDetailPage'));

export const investmentRoutes: RouteObject[] = [
  {
    path: 'investments', // NO leading slash
    children: [
      { index: true, element: <InvestmentListPage /> },
      { path: 'list', element: <Navigate to="/investments" replace /> },
      { path: 'create', element: <InvestmentCreatePage /> },
      { path: ':id', element: <InvestmentDetailPage /> },
    ],
  },
];
