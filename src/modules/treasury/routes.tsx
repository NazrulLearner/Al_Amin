import type { RouteObject } from "react-router-dom";
import TreasuryPage from "./pages/index";
import CashManagementPage from "./pages/cashManagement";
import TransactionHistoryPage from "./pages/TransactionHistory";
import BankAccountsPage from "./pages/bankAccounts";
import BankLedgerPage from "./pages/bankLedger";
import FundTransferPage from "./pages/FundTransfer";

export const treasuryRoutes: RouteObject[] = [
  {
    path: "treasury",
    children: [
      {
        index: true,
        element: <TreasuryPage />,
      },
      {
        path: "cash-management",
        element: <CashManagementPage />,
      },
      {
        path: "fund-transfer",
        element: <FundTransferPage />,
      },
      {
        path: "bank-accounts",
        element: <BankAccountsPage />,
      },
      {
        path: "bank-ledger",
        element: <BankLedgerPage />,
      },
      {
        path: "transaction-history",
        element: <TransactionHistoryPage />,
      },
    ],
  },
];
