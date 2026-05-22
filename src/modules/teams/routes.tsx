import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import ProtectedRoute from "../../app/routes/ProtectedRoute";

const TeamsList = lazy(() => import("./pages/index"));
const CreateTeam = lazy(() => import("./pages/create"));
const TeamPerformance = lazy(() => import("./pages/performance"));
const TeamHistory = lazy(() => import("./pages/teamHistory"));

export const teamRoutes: RouteObject[] = [
  {
    path: "teams",
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute allowedRoles={["admin", "cashier"]}>
            <TeamsList />
          </ProtectedRoute>
        ),
      },
      {
        path: "create",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <CreateTeam />
          </ProtectedRoute>
        ),
      },
      {
        path: "performance",
        element: (
          <ProtectedRoute allowedRoles={["admin", "cashier"]}>
            <TeamPerformance />
          </ProtectedRoute>
        ),
      },
      {
        path: "history",
        element: (
          <ProtectedRoute allowedRoles={["admin", "cashier"]}>
            <TeamHistory />
          </ProtectedRoute>
        ),
      },
    ],
  },
];