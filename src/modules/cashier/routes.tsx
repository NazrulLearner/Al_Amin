import type { RouteObject } from "react-router-dom";
import CashierPage from "./pages/index";
import CashInPage from "./pages/cashIn";
import CashOutPage from "./pages/cashOut";
import CashierLedgerPage from "./pages/ledger";
import CashierReportPage from "./pages/report";
import CashTransferPage from "./pages/transfer";

export const cashierRoutes: RouteObject[] = [
  {
    path: "cashier",
    children: [
      {
        index: true,
        element: <CashierPage />,
      },
      {
        path: "dashboard",
        element: <CashierPage />,
      },
      {
        path: "cash-in",
        element: <CashInPage />,
      },
      {
        path: "cash-out",
        element: <CashOutPage />,
      },
      {
        path: "ledger",
        element: <CashierLedgerPage />,
      },
      {
        path: "report",
        element: <CashierReportPage />,
      },
      {
        path: "transfer",
        element: <CashTransferPage />,
      },
    ],
  },
];
