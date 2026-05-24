export const cashierMenu = [
  {
    key: "cashier",
    label: "Cashier",
    icon: "banknote",
    roles: ["admin", "cashier", "super_admin"],
    children: [
      {
        key: "cashier_dashboard",
        label: "Dashboard",
        path: "/cashier",           // Full path with slash
        icon: "layout-dashboard",
        roles: ["admin", "cashier", "super_admin"],
      },
      {
        key: "cash_in",
        label: "Cash In",
        path: "/cashier/cash-in",
        icon: "arrow-down",
        roles: ["admin", "cashier", "super_admin"],
      },
      {
        key: "cash_out",
        label: "Cash Out",
        path: "/cashier/cash-out",
        icon: "arrow-up",
        roles: ["admin", "cashier", "super_admin"],
      },
      {
        key: "cashier_transfer",
        label: "Transfer",
        path: "/cashier/transfer",
        icon: "arrow-right-left",
        roles: ["admin", "cashier", "super_admin"],
      },
      {
        key: "cashier_ledger",
        label: "Ledger",
        path: "/cashier/ledger",
        icon: "book-open",
        roles: ["admin", "cashier", "super_admin"],
      },
      {
        key: "cashier_report",
        label: "Report",
        path: "/cashier/report",
        icon: "file-chart",
        roles: ["admin", "super_admin"],
      },
    ],
  },
];

export default cashierMenu;