import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

// Lazy load all pages for better performance
const ContributionsOverview = lazy(() => import('./pages/index'));
const ContributionEntry = lazy(() => import('./pages/ContributionEntry'));
const ContributionHistory = lazy(() => import('./pages/ContributionHistory'));
const ContributionReports = lazy(() => import('./pages/ContributionReports'));
const PendingContribution = lazy(() => import('./pages/PendingContribution'));
const Receipt = lazy(() => import('./pages/Receipt'));
const CollectionStatusReport = lazy(() => import('./pages/CollectionStatusReport'));

export const contributionRoutes: RouteObject[] = [
  {
    path: 'contributions',
    children: [
      // Overview Dashboard - index.tsx দেখাবে
      { index: true, element: <ContributionsOverview /> },
      
      // Other routes
      { path: 'entry', element: <ContributionEntry /> },
      { path: 'history', element: <ContributionHistory /> },
      { path: 'reports', element: <ContributionReports /> },
      { path: 'pending', element: <PendingContribution /> },
      { path: 'receipt/:id', element: <Receipt /> },
      { path: 'collection-status', element: <CollectionStatusReport /> },
    ],
  },
];