
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NuevoPaciente from "./pages/NuevoPaciente";
import DetallePaciente from "./pages/DetallePaciente";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { ThemeToggle } from "./components/theme/ThemeToggle";
import EditarPaciente from "./pages/EditarPaciente";


const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="system">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <div className="fixed top-4 right-4 z-50">
            <ThemeToggle />
          </div>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/nuevo-paciente" element={<NuevoPaciente />} />
            <Route path="/paciente/:id" element={<DetallePaciente />} />
            <Route path="/editar-paciente/:id" element={<EditarPaciente />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
