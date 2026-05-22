import type { MenuItem } from "../../navigation/menuFilter";

export const financingMenu: MenuItem[] = [
  {
    key: "financing",
    label: "Financing",
    icon: "trending-up",
    roles: ["admin"],
    permissions: ["financing.view"],
    children: [
      {
        key: "financing_dashboard",
        label: "Dashboard",
        path: "/financing",
        icon: "layout-dashboard",
        roles: ["admin"],
        permissions: ["financing.view"],
      },
      {
        key: "financing_list",
        label: "Financing List",
        path: "/financing/list",
        icon: "list",
        roles: ["admin"],
        permissions: ["financing.view"],
      },
      {
        key: "financing_active",
        label: "Active",
        path: "/financing/active",
        icon: "check-circle",
        roles: ["admin"],
        permissions: ["financing.view"],
      },
      {
        key: "financing_pending",
        label: "Pending",
        path: "/financing/pending",
        icon: "clock",
        roles: ["admin"],
        permissions: ["financing.view"],
      },
      {
        key: "financing_create",
        label: "Create",
        path: "/financing/create",
        icon: "plus",
        roles: ["admin"],
        permissions: ["financing.create"],
      },
      {
        key: "financing_reports",
        label: "Reports",
        path: "/financing/reports",
        icon: "file-chart",
        roles: ["admin"],
        permissions: ["financing.report"],
      },
    ],
  },
];

export default financingMenu;
