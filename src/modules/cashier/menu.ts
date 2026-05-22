import type { MenuItem } from "../../navigation/menuFilter";

export const cashierMenu: MenuItem[] = [
  {
    key: "cashier",
    label: "Cashier",
    icon: "wallet",
    roles: ["admin", "cashier"],
    permissions: ["cashier.view"],
    children: [
      {
        key: "cashier_dashboard",
        label: "Dashboard",
        path: "/cashier",
        icon: "layout-dashboard",
        roles: ["admin", "cashier"],
        permissions: ["cashier.view"],
      },
      {
        key: "cashier_cash_in",
        label: "Cash In",
        path: "/cashier/cash-in",
        icon: "arrow-down-circle",
        roles: ["admin", "cashier"],
        permissions: ["cashier.cash_in"],
      },
      {
        key: "cashier_cash_out",
        label: "Cash Out",
        path: "/cashier/cash-out",
        icon: "arrow-up-circle",
        roles: ["admin", "cashier"],
        permissions: ["cashier.cash_out"],
      },
      {
        key: "cashier_transfer",
        label: "Transfer",
        path: "/cashier/transfer",
        icon: "arrow-right",
        roles: ["admin", "cashier"],
        permissions: ["cashier.transfer"],
      },
      {
        key: "cashier_ledger",
        label: "Ledger",
        path: "/cashier/ledger",
        icon: "file-text",
        roles: ["admin", "cashier"],
        permissions: ["cashier.ledger"],
      },
      {
        key: "cashier_reports",
        label: "Reports",
        path: "/cashier/report",
        icon: "file-chart",
        roles: ["admin", "cashier"],
        permissions: ["cashier.report"],
      },
    ],
  },
];

export default cashierMenu;
