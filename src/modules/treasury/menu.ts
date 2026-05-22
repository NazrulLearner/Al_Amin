import type { MenuItem } from "../../navigation/menuFilter";

export const treasuryMenu: MenuItem[] = [
  {
    key: "treasury",
    label: "Treasury",
    icon: "vault",
    roles: ["admin"],
    permissions: ["treasury.view"],
    children: [
      {
        key: "treasury_dashboard",
        label: "Dashboard",
        path: "/treasury",
        icon: "layout-dashboard",
        roles: ["admin"],
        permissions: ["treasury.view"],
      },
      {
        key: "treasury_cash",
        label: "Cash Management",
        path: "/treasury/cash-management",
        icon: "wallet",
        roles: ["admin"],
        permissions: ["treasury.cash"],
      },
      {
        key: "treasury_transfer",
        label: "Fund Transfer",
        path: "/treasury/fund-transfer",
        icon: "arrow-right",
        roles: ["admin"],
        permissions: ["treasury.transfer"],
      },
      {
        key: "treasury_bank",
        label: "Bank Accounts",
        path: "/treasury/bank-accounts",
        icon: "building-bank",
        roles: ["admin"],
        permissions: ["treasury.bank"],
      },
      {
        key: "treasury_ledger",
        label: "Bank Ledger",
        path: "/treasury/bank-ledger",
        icon: "file-text",
        roles: ["admin"],
        permissions: ["treasury.ledger"],
      },
      {
        key: "treasury_history",
        label: "Transaction History",
        path: "/treasury/transaction-history",
        icon: "history",
        roles: ["admin"],
        permissions: ["treasury.view"],
      },
    ],
  },
];

export default treasuryMenu;
