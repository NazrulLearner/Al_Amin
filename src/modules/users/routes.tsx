import type { RouteObject } from "react-router-dom";
import UsersPage from "./pages/index";
import AddUserPage from "./pages/AddUser";
import CreateMemberAccountPage from "./pages/CreateMemberAccount";
import UserProfilePage from "./pages/UserProfile";

export const usersRoutes: RouteObject[] = [
  {
    path: "users",
    children: [
      {
        index: true,
        element: <UsersPage />,
      },
      {
        path: "list",
        element: <UsersPage />,
      },
      {
        path: "add",
        element: <AddUserPage />,
      },
      {
        path: "create-member",
        element: <CreateMemberAccountPage />,
      },
      {
        path: ":id",
        element: <UserProfilePage />,
      },
    ],
  },
];
