export const teamsMenu = [
  {
    key: "teams",
    label: "Teams",
    icon: "users",
    roles: ["admin", "super_admin"],  // cashier নয়
    children: [
      {
        key: "teams_list",
        label: "All Teams",
        path: "/teams",
        icon: "list",
        roles: ["admin", "super_admin"],
      },
      {
        key: "teams_create",
        label: "Create Team",
        path: "/teams/create",
        icon: "plus",
        roles: ["admin", "super_admin"],
      },
      {
        key: "teams_performance",
        label: "Performance",
        path: "/teams/performance",
        icon: "chart",
        roles: ["admin", "super_admin"],
      },
      {
        key: "teams_history",
        label: "History",
        path: "/teams/history",
        icon: "history",
        roles: ["admin", "super_admin"],
      },
    ],
  },
];

export default teamsMenu;