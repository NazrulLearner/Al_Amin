import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import ProtectedRoute from "../../app/routes/ProtectedRoute";

const ContributionDashboard = lazy(() => import("./pages/index"));
const ContributionEntry = lazy(() => import("./pages/ContributionEntry"));
const ContributionHistory = lazy(() => import("./pages/ContributionHistory"));
const ContributionReports = lazy(() => import("./pages/ContributionReports"));
const PendingContribution = lazy(() => import("./pages/PendingContribution"));
const CollectionStatusReport = lazy(() => import("./pages/CollectionStatusReport"));
const Receipt = lazy(() => import("./pages/Receipt"));

export const contributionRoutes: RouteObject[] = [
  {
    path: "contributions",
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute allowedRoles={["admin", "cashier"]}>
            <ContributionDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "entry",
        element: (
          <ProtectedRoute allowedRoles={["admin", "cashier"]}>
            <ContributionEntry />
          </ProtectedRoute>
        ),
      },
      {
        path: "history",
        element: (
          <ProtectedRoute allowedRoles={["admin", "cashier", "member"]}>
            <ContributionHistory />
          </ProtectedRoute>
        ),
      },
      {
        path: "reports",
        element: (
          <ProtectedRoute allowedRoles={["admin", "cashier"]}>
            <ContributionReports />
          </ProtectedRoute>
        ),
      },
      {
        path: "pending",
        element: (
          <ProtectedRoute allowedRoles={["admin", "cashier"]}>
            <PendingContribution />
          </ProtectedRoute>
        ),
      },
      {
        path: "collection-status",
        element: (
          <ProtectedRoute allowedRoles={["admin", "cashier"]}>
            <CollectionStatusReport />
          </ProtectedRoute>
        ),
      },
      {
        path: "receipt/:id",
        element: (
          <ProtectedRoute allowedRoles={["admin", "cashier", "member"]}>
            <Receipt />
          </ProtectedRoute>
        ),
      },
    ],
  },
];