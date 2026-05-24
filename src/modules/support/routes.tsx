import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const SupportHome = lazy(() => import("./pages/index"));
const FAQ = lazy(() => import("./pages/faq"));
const About = lazy(() => import("./pages/about"));

export const supportRoutes: RouteObject[] = [
  {
    path: "support",  // NO leading slash
    children: [
      { index: true, element: <SupportHome /> },
      { path: "faq", element: <FAQ /> },
      { path: "about", element: <About /> },
    ],
  },
];