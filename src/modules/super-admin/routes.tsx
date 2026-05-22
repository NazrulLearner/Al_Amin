import { lazy } from "react";
import ProtectedRoute from "../../app/routes/ProtectedRoute";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Users = lazy(() => import("./pages/Users"));
const FirestoreInspector = lazy(() => import("./pages/FirestoreInspector"));
const Logs = lazy(() => import("./pages/Logs"));
const UsageTracking = lazy(() => import("./pages/UsageTracking"));
const Settings = lazy(() => import("./pages/settings"));

export const superAdminRoutes = [
  {
    path: "super-admin",
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "users",
        element: (
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <Users />
          </ProtectedRoute>
        ),
      },
      {
        path: "firestoreInspector",
        element: (
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <FirestoreInspector />
          </ProtectedRoute>
        ),
      },
      {
        path: "logs",
        element: (
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <Logs />
          </ProtectedRoute>
        ),
      },
      {
        path: "UsageTracking",
        element: (
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <UsageTracking />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <Settings />
          </ProtectedRoute>
        ),
      },
    ],
  },
];