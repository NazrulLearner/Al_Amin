import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import ProtectedRoute from "../../app/routes/ProtectedRoute";

const TreasuryDashboard = lazy(() => import("./pages/index"));
const BankAccounts = lazy(() => import("./pages/bankAccounts"));
const BankLedger = lazy(() => import("./pages/bankLedger"));
const CashManagement = lazy(() => import("./pages/cashManagement"));
const FundTransfer = lazy(() => import("./pages/FundTransfer"));
const TransactionHistory = lazy(() => import("./pages/TransactionHistory"));

export const treasuryRoutes: RouteObject[] = [
  {
    path: "treasury",
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <TreasuryDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "accounts",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <BankAccounts />
          </ProtectedRoute>
        ),
      },
      {
        path: "ledger",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <BankLedger />
          </ProtectedRoute>
        ),
      },
      {
        path: "cash",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <CashManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "transfer",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <FundTransfer />
          </ProtectedRoute>
        ),
      },
      {
        path: "history",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <TransactionHistory />
          </ProtectedRoute>
        ),
      },
    ],
  },
];