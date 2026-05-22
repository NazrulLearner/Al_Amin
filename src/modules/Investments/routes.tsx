import type { RouteObject } from "react-router-dom";
import InvestmentCreatePage from "./pages/InvestmentCreatePage";
import InvestmentDashboardPage from "./pages/InvestmentDashboardPage";
import InvestmentDetailPage from "./pages/InvestmentDetailPage";
import InvestmentHistoryPage from "./pages/InvestmentHistoryPage";
import InvestmentListPage from "./pages/InvestmentListPage";
import InvestmentReportsPage from "./pages/InvestmentReportsPage";
import InvestmentUpdatePage from "./pages/InvestmentUpdatePage";

export const investmentRoutes: RouteObject[] = [
  {
    path: "investments",
    children: [
      {
        index: true,
        element: <InvestmentDashboardPage />,
      },
      {
        path: "list",
        element: <InvestmentListPage />,
      },
      {
        path: "create",
        element: <InvestmentCreatePage />,
      },
      {
        path: "history",
        element: <InvestmentHistoryPage />,
      },
      {
        path: "reports",
        element: <InvestmentReportsPage />,
      },
      {
        path: "edit/:id",
        element: <InvestmentUpdatePage />,
      },
      {
        path: ":id",
        element: <InvestmentDetailPage />,
      },
    ],
  },
];
