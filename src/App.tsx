// src/App.tsx
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./app/routes/AppRoutes";

import { AuthProvider } from "./app/providers/AuthProvider";

import { Toaster } from "sonner";

export default function App() {
  return (
    <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" richColors />
          <AppRoutes />
        </BrowserRouter>
    </AuthProvider>
  );
}