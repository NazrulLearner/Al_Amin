import type { MenuItem } from "../../navigation/menuFilter";

export const supportMenu: MenuItem[] = [
  {
    key: "support",
    label: "Support",
    icon: "help-circle",
    roles: ["admin", "member"],
    permissions: ["support.view"],
    children: [
      {
        key: "support_main",
        label: "Support",
        path: "/support",
        icon: "layout-dashboard",
        roles: ["admin", "member"],
        permissions: ["support.view"],
      },
      {
        key: "support_faq",
        label: "FAQ",
        path: "/support/faq",
        icon: "help-circle",
        roles: ["admin", "member"],
        permissions: ["support.view"],
      },
      {
        key: "support_about",
        label: "About",
        path: "/support/about",
        icon: "info",
        roles: ["admin", "member"],
        permissions: ["support.view"],
      },
    ],
  },
];

export default supportMenu;
