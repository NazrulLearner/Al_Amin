import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const CashierDashboard = lazy(() => import("./pages/CashierDashboard"));
const MemberDashboard = lazy(() => import("./pages/MemberDashboard"));
const CollectorDashboard = lazy(() => import("./pages/CollectorDashboard"));

export const dashboardRoutes: RouteObject[] = [
  {
    path: "admin-dashboard",
    element: <AdminDashboard />,
  },
  {
    path: "cashier-dashboard",
    element: <CashierDashboard />,
  },
  {
    path: "member-dashboard",
    element: <MemberDashboard />,
  },
  {
    path: "collector/dashboard",
    element: <CollectorDashboard />,
  },
];