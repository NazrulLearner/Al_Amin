import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import ProtectedRoute from "../../app/routes/ProtectedRoute";

const CommunicationDashboard = lazy(() => import("./pages/index"));
const Chat = lazy(() => import("./pages/chat"));
const CommitteeMsgs = lazy(() => import("./pages/committeemsgs"));
const Notices = lazy(() => import("./pages/notices"));

export const communicationRoutes: RouteObject[] = [
  {
    path: "communication",
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute allowedRoles={["admin", "cashier", "member"]}>
            <CommunicationDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "chat",
        element: (
          <ProtectedRoute allowedRoles={["admin", "cashier", "member"]}>
            <Chat />
          </ProtectedRoute>
        ),
      },
      {
        path: "committeemsgs",
        element: (
          <ProtectedRoute allowedRoles={["admin", "cashier", "member"]}>
            <CommitteeMsgs />
          </ProtectedRoute>
        ),
      },
      {
        path: "notices",
        element: (
          <ProtectedRoute allowedRoles={["admin", "cashier", "member"]}>
            <Notices />
          </ProtectedRoute>
        ),
      },
    ],
  },
];