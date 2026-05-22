import type { RouteObject } from "react-router-dom";
import ReportsPage from "./pages/index";
import FinanceReportPage from "./pages/financeReport";
import MemberReportPage from "./pages/memberReport";
import LoanReportsPage from "./pages/loanReports";
import ExportDataPage from "./pages/exportData";

export const reportsRoutes: RouteObject[] = [
  {
    path: "reports",
    children: [
      {
        index: true,
        element: <ReportsPage />,
      },
      {
        path: "finance",
        element: <FinanceReportPage />,
      },
      {
        path: "members",
        element: <MemberReportPage />,
      },
      {
        path: "loans",
        element: <LoanReportsPage />,
      },
      {
        path: "export",
        element: <ExportDataPage />,
      },
    ],
  },
];
