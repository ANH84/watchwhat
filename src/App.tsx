import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import JoinPage from "./pages/JoinPage";
import NotFound from "./pages/NotFound";
import AccessGate, { isAccessGranted } from "./components/AccessGate";

const queryClient = new QueryClient();

const App = () => {
  const [accessGranted, setAccessGranted] = useState(isAccessGranted());

  if (!accessGranted) {
    return <AccessGate onGranted={() => setAccessGranted(true)} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/join/:code" element={<JoinPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
