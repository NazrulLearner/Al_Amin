import { lazy } from "react";
import ProtectedRoute from "../../app/routes/ProtectedRoute";

const UsersDashboard = lazy(() => import("./pages/index"));
const AddUser = lazy(() => import("./pages/AddUser"));
const CreateMemberAccount = lazy(() => import("./pages/CreateMemberAccount"));
const UserProfile = lazy(() => import("./pages/UserProfile"));

export const usersRoutes = [
  {
    path: "users",
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <UsersDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "add",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <AddUser />
          </ProtectedRoute>
        ),
      },
      {
        path: "create-member-account",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <CreateMemberAccount />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <UserProfile />
          </ProtectedRoute>
        ),
      },
    ],
  },
];