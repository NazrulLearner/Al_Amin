import type { RouteObject } from "react-router-dom";
import SupportPage from "./pages/index";
import AboutPage from "./pages/about";
import FAQPage from "./pages/faq";

export const supportRoutes: RouteObject[] = [
  {
    path: "support",
    children: [
      {
        index: true,
        element: <SupportPage />,
      },
      {
        path: "about",
        element: <AboutPage />,
      },
      {
        path: "faq",
        element: <FAQPage />,
      },
    ],
  },
];
