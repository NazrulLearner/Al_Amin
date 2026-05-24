import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const CommunicationDashboard = lazy(() => import("./pages/index"));
const Chat = lazy(() => import("./pages/chat"));
const CommitteeMessages = lazy(() => import("./pages/committee-messages"));
const Notices = lazy(() => import("./pages/notices"));

export const communicationRoutes: RouteObject[] = [
  {
    path: "communication",  // NO leading slash
    children: [
      { index: true, element: <CommunicationDashboard /> },
      { path: "chat", element: <Chat /> },
      { path: "committee-messages", element: <CommitteeMessages /> },  // kebab-case
      { path: "notices", element: <Notices /> },
    ],
  },
];