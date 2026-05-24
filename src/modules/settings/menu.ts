export const settingsMenu = [
  {
    key: "settings",
    label: "Settings",
    icon: "settings",
    roles: ["admin", "cashier", "collector", "member", "super_admin"],  // সবাই দেখতে পারে
    children: [
      {
        key: "general_settings",
        label: "General Settings",
        path: "/settings",
        icon: "building",  // Somity settings
        roles: ["admin", "super_admin"],  // শুধু admin
      },
      {
        key: "account_settings",
        label: "Account",
        path: "/settings/account",
        icon: "user",
        roles: ["admin", "cashier", "collector", "member", "super_admin"],  // সবাই নিজের অ্যাকাউন্ট সেটিংস দেখতে পারে
      },
      {
        key: "notification_settings",
        label: "Notifications",
        path: "/settings/notifications",
        icon: "bell",
        roles: ["admin", "cashier", "collector", "member", "super_admin"],  // সবাই
      },
      {
        key: "role_settings",
        label: "Roles & Permissions",
        path: "/settings/roles",
        icon: "shield",
        roles: ["admin", "super_admin"],  // শুধু admin
      },
      {
        key: "system_settings",
        label: "System",
        path: "/settings/system",
        icon: "database",
        roles: ["super_admin"],  // শুধু super_admin
      },
    ],
  },
];

export default settingsMenu;