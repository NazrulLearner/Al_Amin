export const reportsMenu = [
  {
    key: "reports",
    label: "Reports",
    icon: "chart",
    roles: ["admin", "cashier", "super_admin"],
    children: [
      {
        key: "all_reports",
        label: "All Reports",
        path: "/reports",
        icon: "layout-dashboard",
        roles: ["admin", "cashier", "super_admin"],
      },
      {
        key: "finance_report",
        label: "Finance Report",
        path: "/reports/finance",
        icon: "file-chart",
        roles: ["admin", "super_admin"],  // cashier নয়
      },
      {
        key: "loan_report",
        label: "Loan Report",
        path: "/reports/loans",
        icon: "handcoins",
        roles: ["admin", "super_admin"],  // cashier নয়
      },
      {
        key: "member_report",
        label: "Member Report",
        path: "/reports/members",
        icon: "users",
        roles: ["admin", "super_admin"],  // cashier নয়
      },
      {
        key: "export_data",
        label: "Export Data",
        path: "/reports/export",
        icon: "download",
        roles: ["admin", "super_admin"],  // শুধু admin
      },
    ],
  },
];

export default reportsMenu;