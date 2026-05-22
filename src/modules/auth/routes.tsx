import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const Login = lazy(() => import("./pages/Login"));
const CreateAdmin = lazy(() => import("./pages/CreateAdmin"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));

export const authRoutes: RouteObject[] = [
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "create-admin",
    element: <CreateAdmin />,
  },
  {
    path: "forgot-password",
    element: <ForgotPassword />,
  },
];