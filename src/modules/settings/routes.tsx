import type { RouteObject } from "react-router-dom";
import SettingsPage from "./pages/index";
import AccountSettingsPage from "./pages/account";
import NotificationsPage from "./pages/notifications";
import RolesPage from "./pages/roles";
import SystemSettingsPage from "./pages/system";

export const settingsRoutes: RouteObject[] = [
  {
    path: "settings",
    children: [
      {
        index: true,
        element: <SettingsPage />,
      },
      {
        path: "account",
        element: <AccountSettingsPage />,
      },
      {
        path: "notifications",
        element: <NotificationsPage />,
      },
      {
        path: "roles",
        element: <RolesPage />,
      },
      {
        path: "system",
        element: <SystemSettingsPage />,
      },
    ],
  },
];
