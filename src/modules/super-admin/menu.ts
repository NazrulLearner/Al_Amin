export const superAdminMenu = [
  {
    key: "super-admin",
    label: "Super Admin",
    icon: "shield",
    roles: ["super_admin"],
    children: [
      {
        key: "sa_dashboard",
        label: "Dashboard",
        path: "/super-admin",
        icon: "layout-dashboard",
        roles: ["super_admin"],
      },
      {
        key: "sa_users",
        label: "Users Control",
        path: "/super-admin/users",
        icon: "users",
        roles: ["super_admin"],
      },
      {
        key: "sa_firestore",
        label: "Firestore Inspector",
        path: "/super-admin/firestore",
        icon: "database",
        roles: ["super_admin"],
      },
      {
        key: "sa_logs",
        label: "System Logs",
        path: "/super-admin/logs",
        icon: "file-text",
        roles: ["super_admin"],
      },
      {
        key: "sa_usage",
        label: "Usage Tracking",
        path: "/super-admin/usage",
        icon: "activity",
        roles: ["super_admin"],
      },
      {
        key: "sa_settings",
        label: "System Settings",
        path: "/super-admin/settings",
        icon: "settings",
        roles: ["super_admin"],
      },
    ],
  },
];

export default superAdminMenu;