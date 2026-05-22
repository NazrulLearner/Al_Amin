import type { RouteObject } from "react-router-dom";
import CommunicationPage from "./pages/index";
import ChatPage from "./pages/chat";
import CommitteeMsgsPage from "./pages/committeemsgs";
import NoticesPage from "./pages/notices";

export const communicationRoutes: RouteObject[] = [
  {
    path: "communication",
    children: [
      {
        index: true,
        element: <CommunicationPage />,
      },
      {
        path: "chat",
        element: <ChatPage />,
      },
      {
        path: "committee-messages",
        element: <CommitteeMsgsPage />,
      },
      {
        path: "notices",
        element: <NoticesPage />,
      },
    ],
  },
];
