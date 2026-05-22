import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import BusinessCreatePage from "./pages/BusinessCreatePage";
import BusinessUpdatePage from "./pages/BusinessUpdatePage";
import BusinessDetailPage from "./pages/BusinessDetailPage";

const BusinessListPage = lazy(() => import("./pages/BusinessListPage"));

export const businessRoutes: RouteObject[] = [
  {
    path: "business",
    children: [
      {
        index: true,
        element: <BusinessListPage />,
      },
      {
        path: "list",
        element: <BusinessListPage />,
      },
      {
        path: "create",
        element: <BusinessCreatePage />,
      },
      {
        path: "edit/:id",
        element: <BusinessUpdatePage />,
      },
      {
        path: ":id",
        element: <BusinessDetailPage />,
      },
    ],
  },
];
