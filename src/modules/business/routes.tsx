import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

// Lazy load for better performance
const BusinessListPage = lazy(() => import('./pages/BusinessListPage'));
const BusinessCreatePage = lazy(() => import('./pages/BusinessCreatePage'));
const BusinessUpdatePage = lazy(() => import('./pages/BusinessUpdatePage'));
const BusinessDetailPage = lazy(() => import('./pages/BusinessDetailPage'));

export const businessRoutes: RouteObject[] = [
  {
    path: 'business',  // NO leading slash
    children: [
      { index: true, element: <BusinessListPage /> },
      { path: 'list', element: <BusinessListPage /> },
      { path: 'create', element: <BusinessCreatePage /> },
      { path: 'update/:id', element: <BusinessUpdatePage /> },
      { path: ':id', element: <BusinessDetailPage /> },
    ],
  },
];