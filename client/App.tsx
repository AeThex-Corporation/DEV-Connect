import "./polyfills/process";
import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Jobs from "./pages/Jobs";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Profiles from "./pages/Profiles";
import ProfileView from "./pages/ProfileView";
import Onboarding from "./pages/Onboarding";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";
import { Layout } from "./components/Layout";
import { FakeStackProvider } from "@/lib/fake-stack";
import { ThemeProvider } from "@/lib/theme";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <FakeStackProvider>
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
                <Route path="/profiles" element={<Profiles />} />
                <Route path="/u/:stackUserId" element={<ProfileView />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/messages" element={<Messages />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </FakeStackProvider>
  </ThemeProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
