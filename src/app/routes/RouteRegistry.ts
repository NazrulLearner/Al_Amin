// src/app/routes/RouteRegistry.ts
import type { RouteObject } from "react-router-dom";

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

export const RouteRegistry: RouteObject[] = [
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
];