import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));

// Only Login and ForgotPassword are public routes.
// Account creation is admin-only (AddUser, CreateMemberAccount in users module).
export const authRoutes: RouteObject[] = [
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "forgot-password",
    element: <ForgotPassword />,
  },
];