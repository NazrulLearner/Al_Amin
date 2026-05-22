import type { MenuItem } from "../../navigation/menuFilter";

export const contributionsMenu: MenuItem[] = [
  {
    key: "contributions",
    label: "Contributions",
    icon: "gift",
    roles: ["admin", "collector"],
    permissions: ["contribution.view"],
    children: [
      {
        key: "contributions_list",
        label: "Contributions",
        path: "/contributions",
        icon: "layout-dashboard",
        roles: ["admin", "collector"],
        permissions: ["contribution.view"],
      },
      {
        key: "contributions_entry",
        label: "Entry",
        path: "/contributions/entry",
        icon: "plus-circle",
        roles: ["admin", "collector"],
        permissions: ["contribution.create"],
      },
      {
        key: "contributions_pending",
        label: "Pending",
        path: "/contributions/pending",
        icon: "clock",
        roles: ["admin"],
        permissions: ["contribution.view"],
      },
      {
        key: "contributions_collection",
        label: "Collection Status",
        path: "/contributions/collection-status",
        icon: "chart-pie",
        roles: ["admin"],
        permissions: ["contribution.view"],
      },
      {
        key: "contributions_history",
        label: "History",
        path: "/contributions/history",
        icon: "history",
        roles: ["admin", "collector"],
        permissions: ["contribution.view"],
      },
      {
        key: "contributions_reports",
        label: "Reports",
        path: "/contributions/reports",
        icon: "file-chart",
        roles: ["admin"],
        permissions: ["contribution.report"],
      },
    ],
  },
];

export default contributionsMenu;
