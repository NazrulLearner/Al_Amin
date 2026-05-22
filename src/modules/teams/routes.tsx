import type { RouteObject } from "react-router-dom";
import TeamsPage from "./pages/index";
import CreateTeamPage from "./pages/create";
import TeamPerformancePage from "./pages/performance";
import TeamHistoryPage from "./pages/teamHistory";

export const teamRoutes: RouteObject[] = [
  {
    path: "teams",
    children: [
      {
        index: true,
        element: <TeamsPage />,
      },
      {
        path: "list",
        element: <TeamsPage />,
      },
      {
        path: "create",
        element: <CreateTeamPage />,
      },
      {
        path: "performance",
        element: <TeamPerformancePage />,
      },
      {
        path: "history",
        element: <TeamHistoryPage />,
      },
      {
        path: ":id",
        element: <TeamsPage />,
      },
    ],
  },
];
