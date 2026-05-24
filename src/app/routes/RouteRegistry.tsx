import type { RouteObject } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import DashboardRedirect from "../layouts/DashboardRedirect";
import ProtectedRoute from "../layouts/ProtectedRoute";

// সব মডিউল ইমপোর্ট
import { teamRoutes } from "../../modules/teams/routes";
import { membersRoutes } from "../../modules/members/routes";
import { financingRoutes } from "../../modules/financing/routes";
import { treasuryRoutes } from "../../modules/treasury/routes";
import { reportsRoutes } from "../../modules/reports/routes";
import { settingsRoutes } from "../../modules/settings/routes";
import { usersRoutes } from "../../modules/users/routes";
import { superAdminRoutes } from "../../modules/super-admin/routes";
import { contributionRoutes } from "../../modules/contributions/routes";
import { businessRoutes } from "../../modules/business/routes";
import { cashierRoutes } from "../../modules/cashier/routes";
import { communicationRoutes } from "../../modules/communication/routes";
import { supportRoutes } from "../../modules/support/routes";
import { investmentRoutes } from "../../modules/Investments/routes";
import { dashboardRoutes } from "../../modules/dashboards/routes";
import { publicRoutes } from "../../modules/public/routes";
import { authRoutes } from "../../modules/auth/routes";

export const RouteRegistry: RouteObject[] = [
  ...publicRoutes,
  ...authRoutes,
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardRedirect />,
      },
      ...dashboardRoutes,
      ...teamRoutes,
      ...membersRoutes,
      ...financingRoutes,
      ...treasuryRoutes,
      ...reportsRoutes,
      ...settingsRoutes,
      ...usersRoutes,
      ...superAdminRoutes,
      ...contributionRoutes,
      ...businessRoutes,
      ...cashierRoutes,
      ...communicationRoutes,
      ...supportRoutes,
      ...investmentRoutes,
    ],
  },
];