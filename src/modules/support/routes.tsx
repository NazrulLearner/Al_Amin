import { lazy } from "react";
import ProtectedRoute from "../../app/routes/ProtectedRoute";

const SupportHome = lazy(() => import("./pages/index"));
const FAQ = lazy(() => import("./pages/faq"));
const About = lazy(() => import("./pages/about"));

export const supportRoutes = [
  {
    path: "support",
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute allowedRoles={["admin", "cashier", "member", "collector"]}>
            <SupportHome />
          </ProtectedRoute>
        ),
      },
      {
        path: "faq",
        element: (
          <ProtectedRoute allowedRoles={["admin", "cashier", "member", "collector"]}>
            <FAQ />
          </ProtectedRoute>
        ),
      },
      {
        path: "about",
        element: (
          <ProtectedRoute allowedRoles={["admin", "cashier", "member", "collector"]}>
            <About />
          </ProtectedRoute>
        ),
      },
    ],
  },
];