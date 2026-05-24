export const investmentMenu = [
  {
    key: "investments",
    label: "Investments",
    icon: "trending-up",
    roles: ["admin", "super_admin"],
    children: [
      {
        key: "investment_dashboard",
        label: "Dashboard",
        path: "/investments",
        icon: "layout-dashboard",
        roles: ["admin", "super_admin"],
      },
      {
        key: "investment_list",
        label: "Investment List",
        path: "/investments/list",
        icon: "list",
        roles: ["admin", "super_admin"],
      },
      {
        key: "investment_create",
        label: "Create Investment",
        path: "/investments/create",
        icon: "plus",
        roles: ["admin", "super_admin"],
      },
      {
        key: "investment_history",
        label: "History",
        path: "/investments/history",
        icon: "history",
        roles: ["admin", "super_admin"],
      },
      {
        key: "investment_reports",
        label: "Reports",
        path: "/investments/reports",
        icon: "file-chart",
        roles: ["admin", "super_admin"],
      },
    ],
  },
];

export default investmentMenu;