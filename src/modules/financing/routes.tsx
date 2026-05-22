import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import ProtectedRoute from "../../app/routes/ProtectedRoute";

const FinancingDashboard = lazy(() => import("./pages/FinancingDashboardPage"));
const FinancingList = lazy(() => import("./pages/FinancingListPage"));
const CreateFinancing = lazy(() => import("./pages/CreateFinancingPage"));
const ActiveFinancing = lazy(() => import("./pages/ActiveFinancingPage"));
const PendingFinancing = lazy(() => import("./pages/PendingFinancingPage"));
const CompletedFinancing = lazy(() => import("./pages/CompletedFinancingPage"));
const FinancingHistory = lazy(() => import("./pages/FinancingHistoryPage"));
const FinancingReport = lazy(() => import("./pages/FinancingReportPage"));
const FinancingDetails = lazy(() => import("./pages/FinancingDetailsPage"));

export const financingRoutes: RouteObject[] = [
  {
    path: "financing",
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute allowedRoles={["admin", "cashier"]}>
            <FinancingDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "list",
        element: (
          <ProtectedRoute allowedRoles={["admin", "cashier", "member"]}>
            <FinancingList />
          </ProtectedRoute>
        ),
      },
      {
        path: "create",
        element: (
          <ProtectedRoute allowedRoles={["admin", "cashier"]}>
            <CreateFinancing />
          </ProtectedRoute>
        ),
      },
      {
        path: "active",
        element: (
          <ProtectedRoute allowedRoles={["admin", "cashier"]}>
            <ActiveFinancing />
          </ProtectedRoute>
        ),
      },
      {
        path: "pending",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <PendingFinancing />
          </ProtectedRoute>
        ),
      },
      {
        path: "completed",
        element: (
          <ProtectedRoute allowedRoles={["admin", "cashier"]}>
            <CompletedFinancing />
          </ProtectedRoute>
        ),
      },
      {
        path: "history",
        element: (
          <ProtectedRoute allowedRoles={["admin", "cashier", "member"]}>
            <FinancingHistory />
          </ProtectedRoute>
        ),
      },
      {
        path: "reports",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <FinancingReport />
          </ProtectedRoute>
        ),
      },
      {
        path: ":id",
        element: (
          <ProtectedRoute allowedRoles={["admin", "cashier", "member"]}>
            <FinancingDetails />
          </ProtectedRoute>
        ),
      },
    ],
  },
];