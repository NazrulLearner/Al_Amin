// src/modules/cashier/routes.tsx
import { lazy } from "react";
import ProtectedRoute from "../../app/routes/ProtectedRoute";

const CashierDashboard = lazy(() => import("./pages/cashierOverview"));
const CashIn = lazy(() => import("./pages/cashIn"));
const CashOut = lazy(() => import("./pages/cashOut"));
const Transfer = lazy(() => import("./pages/transfer"));
const Ledger = lazy(() => import("./pages/ledger"));
const Report = lazy(() => import("./pages/report"));

export const cashierRoutes = [
  {
    path: "cashierOverview",
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute allowedRoles={["admin", "cashier", "member", "collector"]}>
            <CashierDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "cashIn",
        element: (
          <ProtectedRoute allowedRoles={["admin", "cashier", "member", "collector"]}>
            <CashIn />
          </ProtectedRoute>
        ),
      },
      {
        path: "cashOut",
        element: (
          <ProtectedRoute allowedRoles={["admin", "cashier", "member", "collector"]}>
            <CashOut />
          </ProtectedRoute>
        ),
      },
      {
        path: "transfer",
        element: (
          <ProtectedRoute allowedRoles={["admin", "cashier", "member", "collector"]}>
            <Transfer />
          </ProtectedRoute>
        ),
      },
      {
        path: "ledger",
        element: (
          <ProtectedRoute allowedRoles={["admin", "cashier", "member", "collector"]}>
            <Ledger />
          </ProtectedRoute>
        ),
      },
      {
        path: "report",
        element: (
          <ProtectedRoute allowedRoles={["admin", "cashier", "member", "collector"]}>
            <Report />
          </ProtectedRoute>
        ),
      },
    ],
  },
];