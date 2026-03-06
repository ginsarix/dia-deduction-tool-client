import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import "./index.css";
import { Toaster } from "@/components/ui/sonner";
import App from "./App";
import Projects from "./components/projects";
import { ThemeProvider } from "./components/theme-provider";
import { TooltipProvider } from "./components/ui/tooltip";
import Layout from "./Layout";
import Login from "./Login";

function RoutesComp() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index path="/" element={<App />} />
        <Route path="login" element={<Login />} />
        <Route path="projects">
          <Route index element={<Projects />} />
          <Route path="/projects/:id" />
        </Route>
      </Route>
    </Routes>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider storageKey="theme">
      <TooltipProvider>
        <BrowserRouter>
          <RoutesComp />
        </BrowserRouter>
      </TooltipProvider>

      <Toaster />
    </ThemeProvider>
  </StrictMode>,
);
