import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

// Lazy load all pages
const CashierDashboard = lazy(() => import("./pages/cashierOverview"));
const CashIn = lazy(() => import("./pages/cashIn"));
const CashOut = lazy(() => import("./pages/cashOut"));
const Transfer = lazy(() => import("./pages/transfer"));
const Ledger = lazy(() => import("./pages/ledger"));
const Report = lazy(() => import("./pages/report"));

export const cashierRoutes: RouteObject[] = [
  {
    path: "cashier",  // NO leading slash
    children: [
      { index: true, element: <CashierDashboard /> },  // /cashier এ দেখাবে
      { path: "cash-in", element: <CashIn /> },        // /cashier/cash-in
      { path: "cash-out", element: <CashOut /> },      // /cashier/cash-out
      { path: "transfer", element: <Transfer /> },     // /cashier/transfer
      { path: "ledger", element: <Ledger /> },         // /cashier/ledger
      { path: "report", element: <Report /> },         // /cashier/report
    ],
  },
];