import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import ProtectedRoute from "../../app/routes/ProtectedRoute";

const ReportsDashboard = lazy(() => import("./pages/index"));
const MemberReport = lazy(() => import("./pages/memberReport"));
const LoanReport = lazy(() => import("./pages/loanReports"));
const FinanceReport = lazy(() => import("./pages/financeReport"));
const ExportData = lazy(() => import("./pages/exportData"));

export const reportsRoutes: RouteObject[] = [
  {
    path: "reports",
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute allowedRoles={["admin", "cashier"]}>
            <ReportsDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "member",
        element: (
          <ProtectedRoute allowedRoles={["admin", "cashier"]}>
            <MemberReport />
          </ProtectedRoute>
        ),
      },
      {
        path: "loan",
        element: (
          <ProtectedRoute allowedRoles={["admin", "cashier"]}>
            <LoanReport />
          </ProtectedRoute>
        ),
      },
      {
        path: "finance",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <FinanceReport />
          </ProtectedRoute>
        ),
      },
      {
        path: "export",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <ExportData />
          </ProtectedRoute>
        ),
      },
    ],
  },
];