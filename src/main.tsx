import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Router from "./Router.tsx";
import { ThemeProvider } from "@/components/ThemeProvider.tsx";
import { BrowserRouter } from "react-router";
import { UserProvider } from "./components/UserProvider/UserProvider.tsx";
import { Toaster } from "@/components/ui/sonner";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <UserProvider>
          <Router />
          <Toaster />
        </UserProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
