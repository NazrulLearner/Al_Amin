import type { MenuItem } from "../../navigation/menuFilter";

export const communicationMenu: MenuItem[] = [
  {
    key: "communication",
    label: "Communication",
    icon: "message-square",
    roles: ["admin", "member"],
    permissions: ["communication.view"],
    children: [
      {
        key: "communication_main",
        label: "Communication",
        path: "/communication",
        icon: "layout-dashboard",
        roles: ["admin", "member"],
        permissions: ["communication.view"],
      },
      {
        key: "communication_chat",
        label: "Chat",
        path: "/communication/chat",
        icon: "message-circle",
        roles: ["admin", "member"],
        permissions: ["communication.chat"],
      },
      {
        key: "communication_committee",
        label: "Committee Messages",
        path: "/communication/committee-messages",
        icon: "users",
        roles: ["admin"],
        permissions: ["communication.committee"],
      },
      {
        key: "communication_notices",
        label: "Notices",
        path: "/communication/notices",
        icon: "bell",
        roles: ["admin", "member"],
        permissions: ["communication.notices"],
      },
    ],
  },
];

export default communicationMenu;
