import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StackProvider, StackTheme } from "@stackframe/stack";
import Index from "./pages/Index";
import Jobs from "./pages/Jobs";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { Layout } from "./components/Layout";

const queryClient = new QueryClient();

const projectId = (import.meta as any).env.VITE_STACK_PROJECT_ID || (import.meta as any).env.NEXT_PUBLIC_STACK_PROJECT_ID;
const publishableClientKey = (import.meta as any).env.VITE_STACK_PUBLISHABLE_CLIENT_KEY || (import.meta as any).env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY;

const App = () => (
  <StackProvider projectId={projectId} publishableClientKey={publishableClientKey}>
    <StackTheme>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile" element={<Profile />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </StackTheme>
  </StackProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
