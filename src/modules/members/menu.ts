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
        roles: ["admin", "super_admin"],  // cashier কি member add করতে পারবে? যদি না পারে তাহলে cashier এর roles থেকে "add_member" permission remove করতে হবে
      },
      {
        key: "my_profile",
        label: "My Profile",
        path: "/my-profile",
        icon: "user",
        roles: ["admin", "cashier", "collector", "member", "super_admin"],  // সবাই নিজের প্রোফাইল দেখতে পারে
      },
    ],
  },
];

export default membersMenu;