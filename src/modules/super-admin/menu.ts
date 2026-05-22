import type { MenuItem } from "../../navigation/menuFilter";

export const superAdminMenu: MenuItem[] = [
  {
    key: "super_admin",
    label: "Super Admin",
    icon: "shield-admin",
    roles: ["super_admin"],
    permissions: ["super_admin.view"],
    children: [
      {
        key: "super_admin_dashboard",
        label: "Dashboard",
        path: "/super-admin",
        icon: "layout-dashboard",
        roles: ["super_admin"],
        permissions: ["super_admin.view"],
      },
      {
        key: "super_admin_firestore",
        label: "Firestore",
        path: "/super-admin/firestore",
        icon: "database",
        roles: ["super_admin"],
        permissions: ["super_admin.view"],
      },
      {
        key: "super_admin_logs",
        label: "Logs",
        path: "/super-admin/logs",
        icon: "file-text",
        roles: ["super_admin"],
        permissions: ["super_admin.logs"],
      },
      {
        key: "super_admin_usage",
        label: "Usage",
        path: "/super-admin/usage",
        icon: "activity",
        roles: ["super_admin"],
        permissions: ["super_admin.usage"],
      },
      {
        key: "super_admin_settings",
        label: "Settings",
        path: "/super-admin/settings",
        icon: "settings",
        roles: ["super_admin"],
        permissions: ["super_admin.settings"],
      },
    ],
  },
];

export default superAdminMenu;
