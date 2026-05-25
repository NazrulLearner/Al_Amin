export const assetsMenu = [
  {
    key: "assets",
    label: "Financial Core",
    icon: "trending",
    roles: ["admin", "cashier", "super_admin"],
    children: [
      {
        key: "assets_dashboard",
        label: "Overview",
        path: "/assets",
        icon: "layout-dashboard",
        roles: ["admin", "cashier", "super_admin"],
      },
      {
        key: "cash_management",
        label: "Cash Management",
        path: "/assets/cash-management",
        icon: "banknote",
        roles: ["admin", "cashier", "super_admin"],
      },
      {
        key: "bank_accounts",
        label: "Bank Accounts",
        path: "/assets/bank-accounts",
        icon: "building",
        roles: ["admin", "super_admin"],
      },
      {
        key: "income",
        label: "Income",
        path: "/assets/income",
        icon: "trending-up",
        roles: ["admin", "cashier", "super_admin"],
      },
      {
        key: "expense",
        label: "Expense",
        path: "/assets/expense",
        icon: "trending-down",
        roles: ["admin", "cashier", "super_admin"],
      },
      {
        key: "assets_register",
        label: "Assets Register",
        path: "/assets/register",
        icon: "home",
        roles: ["admin", "super_admin"],
      },
      {
        key: "profit_loss",
        label: "Profit & Loss",
        path: "/assets/profit-loss",
        icon: "file-chart",
        roles: ["admin", "super_admin"],
      },
      {
        key: "capital_flow",
        label: "Capital Flow",
        path: "/assets/capital-flow",
        icon: "arrow-right-left",
        roles: ["admin", "super_admin"],
      },
      {
        key: "financial_reports",
        label: "Reports",
        path: "/assets/reports",
        icon: "file-text",
        roles: ["admin", "super_admin"],
      },
      {
        key: "wealth_summary",
        label: "Wealth Summary",
        path: "/assets/wealth-summary",
        icon: "shield",
        roles: ["admin", "super_admin"],
      },
    ],
  },
];

export default assetsMenu;