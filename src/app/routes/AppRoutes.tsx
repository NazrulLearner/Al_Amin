import { Suspense } from "react";
import { useRoutes } from "react-router-dom";
import { RouteRegistry } from "./RouteRegistry";

export default function AppRoutes() {
  const element = useRoutes(RouteRegistry);
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    }>
      {element}
    </Suspense>
  );
}