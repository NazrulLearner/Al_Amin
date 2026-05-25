import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

// Lazy imports - প্রতিটা component সঠিকভাবে import হচ্ছে কিনা চেক করো
const AssetsDashboard = lazy(() => import('./pages'));
const CashManagement = lazy(() => import('./pages/CashManagement'));
const BankAccounts = lazy(() => import('./pages/BankAccounts'));
const IncomePage = lazy(() => import('./pages/IncomePage'));
const ExpensePage = lazy(() => import('./pages/ExpensePage'));
const AssetsRegister = lazy(() => import('./pages/AssetsRegister'));
const ProfitLossPage = lazy(() => import('./pages/ProfitLossPage'));
const CapitalFlowPage = lazy(() => import('./pages/CapitalFlowPage'));
const FinancialReports = lazy(() => import('./pages/FinancialReports'));
const WealthSummary = lazy(() => import('./pages/WealthSummary'));

export const assetsRoutes: RouteObject[] = [
  {
    path: 'assets',
    children: [
      { index: true, element: <AssetsDashboard /> },
      { path: 'cash-management', element: <CashManagement /> },
      { path: 'bank-accounts', element: <BankAccounts /> },
      { path: 'income', element: <IncomePage /> },
      { path: 'expense', element: <ExpensePage /> },
      { path: 'register', element: <AssetsRegister /> },
      { path: 'profit-loss', element: <ProfitLossPage /> },
      { path: 'capital-flow', element: <CapitalFlowPage /> },
      { path: 'reports', element: <FinancialReports /> },
      { path: 'wealth-summary', element: <WealthSummary /> },
    ],
  },
];