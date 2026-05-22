// AppRoutes.tsx
import { useRoutes } from "react-router-dom";
import { RouteRegistry } from "./RouteRegistry";

export default function AppRoutes() {
  const element = useRoutes(RouteRegistry);
  return element;
}