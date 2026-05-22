import type { MenuItem } from "../../navigation/menuFilter";

export const membersMenu: MenuItem[] = [
  {
    key: "members",
    label: "Members",
    icon: "users",
    roles: ["admin", "member"],
    permissions: ["member.view"],
    children: [
      {
        key: "members_list",
        label: "Member List",
        path: "/members",
        icon: "list",
        roles: ["admin", "member"],
        permissions: ["member.view"],
      },
      {
        key: "members_add",
        label: "Add Member",
        path: "/members/add",
        icon: "plus",
        roles: ["admin"],
        permissions: ["member.create"],
      },
      {
        key: "members_profile",
        label: "My Profile",
        path: "/members/my-profile",
        icon: "user",
        roles: ["admin", "member"],
        permissions: ["member.view"],
      },
    ],
  },
];

export default membersMenu;
