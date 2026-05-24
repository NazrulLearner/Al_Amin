import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Users = lazy(() => import("./pages/Users"));
const FirestoreInspector = lazy(() => import("./pages/FirestoreInspector"));
const Logs = lazy(() => import("./pages/Logs"));
const UsageTracking = lazy(() => import("./pages/UsageTracking"));
const Settings = lazy(() => import("./pages/settings"));

export const superAdminRoutes: RouteObject[] = [
  {
    path: "super-admin",  // NO leading slash
    children: [
      { index: true, element: <Dashboard /> },
      { path: "users", element: <Users /> },
      { path: "firestore", element: <FirestoreInspector /> },        // changed
      { path: "logs", element: <Logs /> },
      { path: "usage", element: <UsageTracking /> },                 // changed
      { path: "settings", element: <Settings /> },
    ],
  },
];