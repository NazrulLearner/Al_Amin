export const membersMenu = [
  {
    key: "members",
    label: "Members",
    icon: "users",
    roles: ["admin", "cashier", "collector", "super_admin"],
    children: [
      {
        key: "all_members",
        label: "All Members",
        path: "/members",
        icon: "list",
        roles: ["admin", "cashier", "collector", "super_admin"],
      },
      {
        key: "add_member",
        label: "Add Member",
        path: "/members/add",
        icon: "user-plus",
        roles: ["admin", "super_admin"],
      },
      {
        key: "my_profile",
        label: "My Profile",
        path: "/my-profile",
        icon: "user",
        roles: ["member", "cashier", "collector"],
      },
    ],
  },
];