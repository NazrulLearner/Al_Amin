import type { MenuItem } from "../../navigation/menuFilter";

export const settingsMenu: MenuItem[] = [
  {
    key: "settings",
    label: "Settings",
    icon: "settings",
    roles: ["admin", "super_admin"],
    permissions: ["settings.view"],
    children: [
      {
        key: "settings_main",
        label: "Settings",
        path: "/settings",
        icon: "layout-dashboard",
        roles: ["admin", "super_admin"],
        permissions: ["settings.view"],
      },
      {
        key: "settings_account",
        label: "Account",
        path: "/settings/account",
        icon: "user",
        roles: ["admin", "super_admin"],
        permissions: ["settings.account"],
      },
      {
        key: "settings_notifications",
        label: "Notifications",
        path: "/settings/notifications",
        icon: "bell",
        roles: ["admin", "super_admin"],
        permissions: ["settings.notifications"],
      },
      {
        key: "settings_roles",
        label: "Roles & Permissions",
        path: "/settings/roles",
        icon: "lock",
        roles: ["admin"],
        permissions: ["settings.roles"],
      },
      {
        key: "settings_system",
        label: "System",
        path: "/settings/system",
        icon: "cog",
        roles: ["admin"],
        permissions: ["settings.system"],
      },
    ],
  },
];

export default settingsMenu;
