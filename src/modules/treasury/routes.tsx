import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const TreasuryDashboard = lazy(() => import("./pages/index"));
const BankAccounts = lazy(() => import("./pages/bankAccounts"));
const BankLedger = lazy(() => import("./pages/bankLedger"));
const CashManagement = lazy(() => import("./pages/cashManagement"));
const FundTransfer = lazy(() => import("./pages/FundTransfer"));
const TransactionHistory = lazy(() => import("./pages/TransactionHistory"));

export const treasuryRoutes: RouteObject[] = [
  {
    path: "treasury",  // NO leading slash
    children: [
      { index: true, element: <TreasuryDashboard /> },  // সবাই দেখতে পারে (যাদের permission)
      { path: "bank-accounts", element: <BankAccounts /> },  // kebab-case
      { path: "ledger", element: <BankLedger /> },
      { path: "cash", element: <CashManagement /> },
      { path: "fund-transfer", element: <FundTransfer /> },  // kebab-case
      { path: "transactions", element: <TransactionHistory /> },
    ],
  },
];