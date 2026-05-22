export const investmentMenu = [
  {
    key: "investments",
    label: "Investments",
    icon: "trending-up",
    roles: ["admin"],
    permissions: ["investment.view"],
    children: [
      {
        key: "investment_dashboard",
        label: "Dashboard",
        path: "/investments",
        icon: "layout-dashboard",
        roles: ["admin"],
        permissions: ["investment.view"],
      },
      {
        key: "investment_list",
        label: "Investment List",
        path: "/investments/list",
        icon: "list",
        roles: ["admin"],
        permissions: ["investment.view"],
      },
      {
        key: "investment_create",
        label: "Create Investment",
        path: "/investments/create",
        icon: "plus",
        roles: ["admin"],
        permissions: ["investment.create"],
      },
      {
        key: "investment_history",
        label: "History",
        path: "/investments/history",
        icon: "history",
        roles: ["admin"],
        permissions: ["investment.view"],
      },
      {
        key: "investment_reports",
        label: "Reports",
        path: "/investments/reports",
        icon: "file-chart",
        roles: ["admin"],
        permissions: ["investment.report"],
      },
    ],
  },
];

export default investmentMenu;
