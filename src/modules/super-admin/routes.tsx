import type { RouteObject } from "react-router-dom";
import SuperAdminDashboard from "./pages/Dashboard";
import FirestoreInspectorPage from "./pages/FirestoreInspector";
import LogsPage from "./pages/Logs";
import RequestsPage from "./pages/Requests";
import UsageTrackingPage from "./pages/UsageTracking";
import UsersPage from "./pages/Users";
import SettingsPage from "./pages/settings";

export const superAdminRoutes: RouteObject[] = [
  {
    path: "super-admin",
    children: [
      {
        index: true,
        element: <SuperAdminDashboard />,
      },
      {
        path: "dashboard",
        element: <SuperAdminDashboard />,
      },
      {
        path: "firestore",
        element: <FirestoreInspectorPage />,
      },
      {
        path: "logs",
        element: <LogsPage />,
      },
      {
        path: "requests",
        element: <RequestsPage />,
      },
      {
        path: "usage",
        element: <UsageTrackingPage />,
      },
      {
        path: "users",
        element: <UsersPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
];
