import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { DevProvider, useDevMode } from "@/contexts/DevContext";
import { DevPanel } from "@/components/dev/DevPanel";
import { Loader2 } from "lucide-react";

// Layouts (carregados imediatamente — necessários para o shell da aplicação)
import AppLayout from "./components/layout/AppLayout";
import ClientLayout from "./components/client/ClientLayout";

// Painel interno — carregado sob demanda
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Clients = lazy(() => import("./pages/Clients"));
const Analyses = lazy(() => import("./pages/Analyses"));
const AnalysisDetail = lazy(() => import("./pages/AnalysisDetail"));
const NewAnalysis = lazy(() => import("./pages/NewAnalysis"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const Questionnaire = lazy(() => import("./pages/Questionnaire"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Painel do cliente — carregado sob demanda
const ClientSignup = lazy(() => import("./pages/client/ClientSignup"));
const ClientLogin = lazy(() => import("./pages/client/ClientLogin"));
const ClientDashboard = lazy(() => import("./pages/client/ClientDashboard"));
const ClientNewDiagnosis = lazy(() => import("./pages/client/ClientNewDiagnosis"));
const ClientQuestionnaire = lazy(() => import("./pages/client/ClientQuestionnaire"));
const ClientResult = lazy(() => import("./pages/client/ClientResult"));
const ClientPlans = lazy(() => import("./pages/client/ClientPlans"));
const ClientAccount = lazy(() => import("./pages/client/ClientAccount"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

function ProtectedRoute({ children, requireInternal = false }: { children: React.ReactNode; requireInternal?: boolean }) {
  const { user, loading, profile } = useAuth();
  const { viewMode } = useDevMode();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--gradient-premium)" }}>
      <Loader2 className="w-8 h-8 animate-spin text-primary-foreground" />
    </div>
  );
  if (!user) return <Navigate to={requireInternal ? "/login" : "/entrar"} replace />;

  const realType = (profile as any)?.user_type || "client";
  const effectiveType = realType === "internal" ? viewMode : realType;
  if (requireInternal && effectiveType === "client") return <Navigate to="/dashboard" replace />;
  if (!requireInternal && effectiveType === "internal") return <Navigate to="/" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <DevProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <AuthProvider>
            <Suspense fallback={<PageLoader />}>
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
            </Suspense>
            <DevPanel />
          </AuthProvider>
        </HashRouter>
      </TooltipProvider>
    </DevProvider>
  </QueryClientProvider>
);

export default App;
