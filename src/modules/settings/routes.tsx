import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const SettingsPage = lazy(() => import('./pages/index'));
const AccountSettings = lazy(() => import('./pages/account'));
const NotificationSettings = lazy(() => import('./pages/notifications'));
const RoleSettings = lazy(() => import('./pages/roles'));
const SystemSettings = lazy(() => import('./pages/system'));

export const settingsRoutes: RouteObject[] = [
  {
    path: 'settings',
    children: [
      { index: true, element: <SettingsPage /> },
      { path: 'account', element: <AccountSettings /> },
      { path: 'notifications', element: <NotificationSettings /> },
      { path: 'roles', element: <RoleSettings /> },
      { path: 'system', element: <SystemSettings /> },
    ],
  },
];