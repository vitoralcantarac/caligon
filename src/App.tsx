import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Analyses from "./pages/Analyses";
import AnalysisDetail from "./pages/AnalysisDetail";
import NewAnalysis from "./pages/NewAnalysis";
import SettingsPage from "./pages/SettingsPage";
import Questionnaire from "./pages/Questionnaire";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

// Painel do cliente
import ClientLayout from "./components/client/ClientLayout";
import ClientSignup from "./pages/client/ClientSignup";
import ClientLogin from "./pages/client/ClientLogin";
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientNewDiagnosis from "./pages/client/ClientNewDiagnosis";
import ClientQuestionnaire from "./pages/client/ClientQuestionnaire";
import ClientResult from "./pages/client/ClientResult";
import ClientPlans from "./pages/client/ClientPlans";
import ClientAccount from "./pages/client/ClientAccount";

const queryClient = new QueryClient();

function ProtectedRoute({ children, requireInternal = false }: { children: React.ReactNode; requireInternal?: boolean }) {
  const { user, loading, profile } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--gradient-premium)" }}>
      <Loader2 className="w-8 h-8 animate-spin text-primary-foreground" />
    </div>
  );
  if (!user) return <Navigate to={requireInternal ? "/login" : "/entrar"} replace />;

  const userType = (profile as any)?.user_type || "client";
  if (requireInternal && userType === "client") return <Navigate to="/dashboard" replace />;
  if (!requireInternal && userType === "internal") return <Navigate to="/" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <AuthProvider>
          <Routes>
            {/* Public — internal */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Public — client */}
            <Route path="/cadastro" element={<ClientSignup />} />
            <Route path="/entrar" element={<ClientLogin />} />

            {/* Client panel (protected) */}
            <Route element={<ProtectedRoute><ClientLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<ClientDashboard />} />
              <Route path="/novo-diagnostico" element={<ClientNewDiagnosis />} />
              <Route path="/questionario/:analysisId" element={<ClientQuestionnaire />} />
              <Route path="/resultado/:id" element={<ClientResult />} />
              <Route path="/planos" element={<ClientPlans />} />
              <Route path="/minha-conta" element={<ClientAccount />} />
            </Route>

            {/* Internal panel (protected, internal only) */}
            <Route element={<ProtectedRoute requireInternal><AppLayout /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/analyses" element={<Analyses />} />
              <Route path="/analyses/new" element={<NewAnalysis />} />
              <Route path="/analyses/:id" element={<AnalysisDetail />} />
              <Route path="/analyses/:analysisId/questionnaire" element={<Questionnaire />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
