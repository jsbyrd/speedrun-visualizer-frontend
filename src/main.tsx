import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Router from "./Router.tsx";
import { BrowserRouter } from "react-router";
import { UserProvider } from "./components/UserProvider/UserProvider.tsx";
import { Toaster } from "@/components/ui/sonner";
import { BackdropProvider } from "./components/BackdropProvider/BackdropProvider.tsx";
import { FavoritesProvider } from "./components/FavoritesProvider/FavoritesProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <BackdropProvider>
        <UserProvider>
          <FavoritesProvider>
            <Router />
            <Toaster />
          </FavoritesProvider>
        </UserProvider>
      </BackdropProvider>
    </BrowserRouter>
  </StrictMode>
);
