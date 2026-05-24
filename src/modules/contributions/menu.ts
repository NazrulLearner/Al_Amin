export const contributionsMenu = [
  {
    key: "contributions",
    label: "Contributions",
    icon: "dollar",
    roles: ["admin", "cashier", "collector", "super_admin"],
    children: [
      {
        key: "contribution_overview",
        label: "Overview",
        path: "/contributions",
        icon: "layout-dashboard",
        roles: ["admin", "cashier", "collector", "super_admin"],
      },
      {
        key: "contribution_entry",
        label: "Contribution Entry",
        path: "/contributions/entry",
        icon: "plus-circle",
        roles: ["admin", "cashier", "collector", "super_admin"],
      },
      {
        key: "contribution_history",
        label: "History",
        path: "/contributions/history",
        icon: "history",
        roles: ["admin", "cashier", "collector", "member", "super_admin"],
      },
      {
        key: "pending_contributions",
        label: "Pending",
        path: "/contributions/pending",
        icon: "clock",
        roles: ["admin", "cashier", "collector", "super_admin"],
      },
      {
        key: "collection_status",
        label: "Collection Status",
        path: "/contributions/collection-status",
        icon: "file-chart",
        roles: ["admin", "super_admin"],
      },
      {
        key: "contribution_reports",
        label: "Reports",
        path: "/contributions/reports",
        icon: "bar-chart",
        roles: ["admin", "super_admin"],
      },
    ],
  },
];

export default contributionsMenu;