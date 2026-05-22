import type { RouteObject } from "react-router-dom";
import FinancingDashboardPage from "./pages/FinancingDashboardPage";
import FinancingListPage from "./pages/FinancingListPage";
import FinancingHistoryPage from "./pages/FinancingHistoryPage";
import FinancingReportPage from "./pages/FinancingReportPage";
import CreateFinancingPage from "./pages/CreateFinancingPage";
import FinancingDetailsPage from "./pages/FinancingDetailsPage";
import ActiveFinancingPage from "./pages/ActiveFinancingPage";
import CompletedFinancingPage from "./pages/CompletedFinancingPage";
import PendingFinancingPage from "./pages/PendingFinancingPage";
import PendingFinancingApplicationsPage from "./pages/PendingFinancingApplicationsPage";
import FinancingApplicationDetailsPage from "./pages/FinancingApplicationDetailsPage";

export const financingRoutes: RouteObject[] = [
  {
    path: "financing",
    children: [
      {
        index: true,
        element: <FinancingDashboardPage />,
      },
      {
        path: "list",
        element: <FinancingListPage />,
      },
      {
        path: "active",
        element: <ActiveFinancingPage />,
      },
      {
        path: "completed",
        element: <CompletedFinancingPage />,
      },
      {
        path: "pending",
        element: <PendingFinancingPage />,
      },
      {
        path: "applications",
        element: <PendingFinancingApplicationsPage />,
      },
      {
        path: "applications/:id",
        element: <FinancingApplicationDetailsPage />,
      },
      {
        path: "create",
        element: <CreateFinancingPage />,
      },
      {
        path: "history",
        element: <FinancingHistoryPage />,
      },
      {
        path: "reports",
        element: <FinancingReportPage />,
      },
      {
        path: ":id",
        element: <FinancingDetailsPage />,
      },
    ],
  },
];
