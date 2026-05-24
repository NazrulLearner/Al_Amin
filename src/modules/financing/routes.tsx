import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

// Lazy load all pages for better performance
const FinancingDashboardPage = lazy(() => import('./pages/FinancingDashboardPage'));
const FinancingListPage = lazy(() => import('./pages/FinancingListPage'));
const CreateFinancingPage = lazy(() => import('./pages/CreateFinancingPage'));
const FinancingDetailsPage = lazy(() => import('./pages/FinancingDetailsPage'));
const ActiveFinancingPage = lazy(() => import('./pages/ActiveFinancingPage'));
const CompletedFinancingPage = lazy(() => import('./pages/CompletedFinancingPage'));
const PendingFinancingPage = lazy(() => import('./pages/PendingFinancingPage'));
const FinancingHistoryPage = lazy(() => import('./pages/FinancingHistoryPage'));
const FinancingReportPage = lazy(() => import('./pages/FinancingReportPage'));
const FinancingApplicationDetailsPage = lazy(() => import('./pages/FinancingApplicationDetailsPage'));
const PendingFinancingApplicationsPage = lazy(() => import('./pages/PendingFinancingApplicationsPage'));

export const financingRoutes: RouteObject[] = [
  {
    path: 'financing',
    children: [
      // Overview/Dashboard - index like behavior
      { index: true, element: <FinancingDashboardPage /> },
      
      // Main financing routes
      { path: 'list', element: <FinancingListPage /> },
      { path: 'create', element: <CreateFinancingPage /> },
      { path: ':id', element: <FinancingDetailsPage /> },
      
      // Status based routes
      { path: 'active', element: <ActiveFinancingPage /> },
      { path: 'completed', element: <CompletedFinancingPage /> },
      { path: 'pending', element: <PendingFinancingPage /> },
      
      // History and Reports
      { path: 'history', element: <FinancingHistoryPage /> },
      { path: 'reports', element: <FinancingReportPage /> },
      
      // Applications
      { path: 'applications/pending', element: <PendingFinancingApplicationsPage /> },
      { path: 'applications/:id', element: <FinancingApplicationDetailsPage /> },
    ],
  },
];