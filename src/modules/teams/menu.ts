import type { MenuItem } from "../../navigation/menuFilter";

export const teamsMenu: MenuItem[] = [
  {
    key: "teams",
    label: "Teams",
    icon: "users",
    roles: ["admin"],
    permissions: ["team.view"],
    children: [
      {
        key: "teams_list",
        label: "Team List",
        path: "/teams",
        icon: "list",
        roles: ["admin"],
        permissions: ["team.view"],
      },
      {
        key: "teams_create",
        label: "Create Team",
        path: "/teams/create",
        icon: "plus",
        roles: ["admin"],
        permissions: ["team.create"],
      },
      {
        key: "teams_performance",
        label: "Performance",
        path: "/teams/performance",
        icon: "chart-bar",
        roles: ["admin"],
        permissions: ["team.view"],
      },
      {
        key: "teams_history",
        label: "History",
        path: "/teams/history",
        icon: "history",
        roles: ["admin"],
        permissions: ["team.view"],
      },
    ],
  },
];

export default teamsMenu;
