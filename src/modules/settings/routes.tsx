import { lazy } from "react";
import ProtectedRoute from "../../app/routes/ProtectedRoute";

const SettingsDashboard = lazy(() => import("./pages/index"));
const AccountSettings = lazy(() => import("./pages/account"));
const Notifications = lazy(() => import("./pages/notifications"));
const Roles = lazy(() => import("./pages/roles"));
const SystemSettings = lazy(() => import("./pages/system"));

export const settingsRoutes = [
  {
    path: "settings",
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <SettingsDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "account",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <AccountSettings />
          </ProtectedRoute>
        ),
      },
      {
        path: "roles",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <Roles />
          </ProtectedRoute>
        ),
      },
      {
        path: "system",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <SystemSettings />
          </ProtectedRoute>
        ),
      },
      {
        path: "notifications",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <Notifications />
          </ProtectedRoute>
        ),
      },
    ],
  },
];