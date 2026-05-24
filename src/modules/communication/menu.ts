export const communicationMenu = [
  {
    key: "communication",
    label: "Communication",
    icon: "message",
    roles: ["admin", "cashier", "member", "collector", "super_admin"],
    children: [
      {
        key: "communication_dashboard",
        label: "Dashboard",
        path: "/communication",
        icon: "layout-dashboard",
        roles: ["admin", "cashier", "member", "collector", "super_admin"],
      },
      {
        key: "communication_chat",
        label: "Chat",
        path: "/communication/chat",
        icon: "message-circle",
        roles: ["admin", "cashier", "member", "collector", "super_admin"],
      },
      {
        key: "communication_notices",
        label: "Notices",
        path: "/communication/notices",
        icon: "bell",
        roles: ["admin", "cashier", "member", "super_admin"],
      },
      {
        key: "communication_committee",
        label: "Committee Messages",
        path: "/communication/committee-messages",
        icon: "users",
        roles: ["admin", "super_admin"],
      },
    ],
  },
];

export default communicationMenu;