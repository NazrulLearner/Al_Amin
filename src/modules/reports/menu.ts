import type { MenuItem } from "../../navigation/menuFilter";

export const reportsMenu: MenuItem[] = [
  {
    key: "reports",
    label: "Reports",
    icon: "file-chart",
    roles: ["admin"],
    permissions: ["report.view"],
    children: [
      {
        key: "reports_list",
        label: "Reports",
        path: "/reports",
        icon: "layout-dashboard",
        roles: ["admin"],
        permissions: ["report.view"],
      },
      {
        key: "reports_finance",
        label: "Finance Report",
        path: "/reports/finance",
        icon: "chart-line",
        roles: ["admin"],
        permissions: ["report.finance"],
      },
      {
        key: "reports_members",
        label: "Members Report",
        path: "/reports/members",
        icon: "users",
        roles: ["admin"],
        permissions: ["report.members"],
      },
      {
        key: "reports_loans",
        label: "Loans Report",
        path: "/reports/loans",
        icon: "trending-down",
        roles: ["admin"],
        permissions: ["report.loans"],
      },
      {
        key: "reports_export",
        label: "Export",
        path: "/reports/export",
        icon: "download",
        roles: ["admin"],
        permissions: ["report.export"],
      },
    ],
  },
];

export default reportsMenu;
