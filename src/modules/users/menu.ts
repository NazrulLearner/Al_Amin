import type { MenuItem } from "../../navigation/menuFilter";

export const usersMenu: MenuItem[] = [
  {
    key: "users",
    label: "Users",
    icon: "users",
    roles: ["admin"],
    permissions: ["user.view"],
    children: [
      {
        key: "users_list",
        label: "User List",
        path: "/users",
        icon: "list",
        roles: ["admin"],
        permissions: ["user.view"],
      },
      {
        key: "users_add",
        label: "Add User",
        path: "/users/add",
        icon: "plus",
        roles: ["admin"],
        permissions: ["user.create"],
      },
      {
        key: "users_create_member",
        label: "Create Member Account",
        path: "/users/create-member",
        icon: "user-plus",
        roles: ["admin"],
        permissions: ["user.create"],
      },
    ],
  },
];

export default usersMenu;
