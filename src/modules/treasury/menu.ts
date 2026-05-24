export const treasuryMenu = [
  {
    key: "treasury",
    label: "Treasury",
    icon: "landmark",
    roles: ["admin", "cashier", "super_admin"],
    children: [
      {
        key: "treasury_overview",
        label: "Overview",
        path: "/treasury",
        icon: "layout-dashboard",
        roles: ["admin", "cashier", "super_admin"],
      },
      {
        key: "bank_accounts",
        label: "Bank Accounts",
        path: "/treasury/bank-accounts",  // menu path match routes
        icon: "building",
        roles: ["admin", "super_admin"],
      },
      {
        key: "cash_management",
        label: "Cash Management",
        path: "/treasury/cash",
        icon: "banknote",
        roles: ["admin", "cashier", "super_admin"],
      },
      {
        key: "fund_transfer",
        label: "Fund Transfer",
        path: "/treasury/fund-transfer",
        icon: "arrow-right-left",
        roles: ["admin", "super_admin"],
      },
      {
        key: "transactions",
        label: "Transactions",
        path: "/treasury/transactions",
        icon: "history",
        roles: ["admin", "cashier", "super_admin"],
      },
    ],
  },
];

export default treasuryMenu;