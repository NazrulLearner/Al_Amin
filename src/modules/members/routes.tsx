import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import ProtectedRoute from "../../app/routes/ProtectedRoute";

const MembersList = lazy(() => import("./pages/MembersPage"));
const AddMember = lazy(() => import("./pages/AddMember"));
const MemberProfile = lazy(() => import("./pages/MemberProfilePage"));
const MyProfile = lazy(() => import("./pages/my-profile"));

export const membersRoutes: RouteObject[] = [
  {
    path: "members",
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute allowedRoles={["admin", "cashier", "member"]}>
            <MembersList />
          </ProtectedRoute>
        ),
      },
      {
        path: "add",
        element: (
          <ProtectedRoute allowedRoles={["admin", "cashier"]}>
            <AddMember />
          </ProtectedRoute>
        ),
      },
      {
        path: ":id",
        element: (
          <ProtectedRoute allowedRoles={["admin", "cashier", "member"]}>
            <MemberProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile/my",
        element: (
          <ProtectedRoute allowedRoles={["admin", "cashier", "member"]}>
            <MyProfile />
          </ProtectedRoute>
        ),
      },
    ],
  },
];