export const usersMenu = [
  {
    key: "users",
    label: "Users",
    icon: "users",
    roles: ["admin", "super_admin"],
    children: [
      {
        key: "users_list",
        label: "All Users",
        path: "/users",
        icon: "list",
        roles: ["admin", "super_admin"],
      },
      {
        key: "add_user",
        label: "Add User",
        path: "/users/add",
        icon: "user-plus",
        roles: ["admin", "super_admin"],
      },
      {
        key: "create_member_account",
        label: "Create Member Account",
        path: "/users/create-member-account",
        icon: "user-check",
        roles: ["admin", "super_admin"],
      },
    ],
  },
];

export default usersMenu;