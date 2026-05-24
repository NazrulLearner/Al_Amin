import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const TeamsPage = lazy(() => import('./pages/index'));
const CreateTeam = lazy(() => import('./pages/create'));
const TeamPerformance = lazy(() => import('./pages/performance'));
const TeamHistory = lazy(() => import('./pages/teamHistory'));

export const teamRoutes: RouteObject[] = [
  {
    path: 'teams',
    children: [
      { index: true, element: <TeamsPage /> },
      { path: 'create', element: <CreateTeam /> },
      { path: 'performance', element: <TeamPerformance /> },
      { path: 'history', element: <TeamHistory /> },
    ],
  },
];