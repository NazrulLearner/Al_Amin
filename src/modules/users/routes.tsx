import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const UsersDashboard = lazy(() => import("./pages/index"));
const AddUser = lazy(() => import("./pages/AddUser"));
const CreateMemberAccount = lazy(() => import("./pages/CreateMemberAccount"));
const UserProfile = lazy(() => import("./pages/UserProfile"));

export const usersRoutes: RouteObject[] = [
  {
    path: "users",  // NO leading slash
    children: [
      { index: true, element: <UsersDashboard /> },
      { path: "add", element: <AddUser /> },
      { path: "create-member-account", element: <CreateMemberAccount /> },
      { path: "profile/:id", element: <UserProfile /> },
    ],
  },
];