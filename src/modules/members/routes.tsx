import type { RouteObject } from "react-router-dom";
import MembersPage from "./pages/MembersPage";
import AddMember from "./pages/AddMember";
import MemberProfilePage from "./pages/MemberProfilePage";
import MyProfilePage from "./pages/my-profile";

export const membersRoutes: RouteObject[] = [
  {
    path: "members",
    children: [
      {
        index: true,
        element: <MembersPage />,
      },
      {
        path: "list",
        element: <MembersPage />,
      },
      {
        path: "add",
        element: <AddMember />,
      },
      {
        path: ":id",
        element: <MemberProfilePage />,
      },
      {
        path: "my-profile",
        element: <MyProfilePage />,
      },
    ],
  },
];
