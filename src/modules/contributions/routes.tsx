import type { RouteObject } from "react-router-dom";
import ContributionsPage from "./pages/index";
import ContributionEntryPage from "./pages/ContributionEntry";
import ContributionHistoryPage from "./pages/ContributionHistory";
import ContributionReportsPage from "./pages/ContributionReports";
import PendingContributionPage from "./pages/PendingContribution";
import CollectionStatusReportPage from "./pages/CollectionStatusReport";
import ReceiptPage from "./pages/Receipt";

export const contributionRoutes: RouteObject[] = [
  {
    path: "contributions",
    children: [
      {
        index: true,
        element: <ContributionsPage />,
      },
      {
        path: "list",
        element: <ContributionsPage />,
      },
      {
        path: "entry",
        element: <ContributionEntryPage />,
      },
      {
        path: "history",
        element: <ContributionHistoryPage />,
      },
      {
        path: "reports",
        element: <ContributionReportsPage />,
      },
      {
        path: "pending",
        element: <PendingContributionPage />,
      },
      {
        path: "collection-status",
        element: <CollectionStatusReportPage />,
      },
      {
        path: "receipt",
        element: <ReceiptPage />,
      },
    ],
  },
];
