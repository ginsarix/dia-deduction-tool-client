import { Loader2Icon } from "lucide-react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Navigate, Outlet, Route, Routes } from "react-router";
import "./index.css";
import { Toaster } from "@/components/ui/sonner";
import App from "./App";
import Connections from "./components/connections";
import HourDefinitions from "./components/hour-definitions";
import ProjectDetail from "./components/project-detail";
import Projects from "./components/projects";
import { ThemeProvider } from "./components/theme-provider";
import { TooltipProvider } from "./components/ui/tooltip";
import Workers from "./components/workers";
import Layout from "./Layout";
import Login from "./Login";
import { authClient } from "./lib/auth-client";

function ProtectedRoute() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <Loader2Icon className="animate-spin text-[#383838]" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function RoutesComp() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index path="/" element={<App />} />
          <Route path="projects">
            <Route index element={<Projects />} />
            <Route path=":id" element={<ProjectDetail />} />
          </Route>
          <Route path="connections/:create?" element={<Connections />} />
          <Route path="workers/:sync?" element={<Workers />} />
          <Route path="hour-definitions" element={<HourDefinitions />} />
        </Route>
      </Route>
    </Routes>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider storageKey="theme">
      <TooltipProvider>
        <HashRouter>
          <RoutesComp />
        </HashRouter>
      </TooltipProvider>

      <Toaster />
    </ThemeProvider>
  </StrictMode>,
);
