import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const CreateAdmin = lazy(() => import("./pages/CreateAdmin"));

export const authRoutes: RouteObject[] = [
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "create-admin",
    element: <CreateAdmin />,
  },
];