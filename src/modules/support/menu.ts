export const supportMenu = [
  {
    key: "support",
    label: "Support",
    icon: "help",
    roles: ["admin", "cashier", "member", "collector", "super_admin"],
    children: [
      {
        key: "support_home",
        label: "Help Center",
        path: "/support",
        icon: "help-circle",
        roles: ["admin", "cashier", "member", "collector", "super_admin"],
      },
      {
        key: "support_faq",
        label: "FAQ",
        path: "/support/faq",
        icon: "message-question",
        roles: ["admin", "cashier", "member", "collector", "super_admin"],
      },
      {
        key: "support_about",
        label: "About",
        path: "/support/about",
        icon: "info",
        roles: ["admin", "cashier", "member", "collector", "super_admin"],
      },
    ],
  },
];

export default supportMenu;