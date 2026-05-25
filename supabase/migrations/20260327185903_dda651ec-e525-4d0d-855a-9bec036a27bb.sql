
-- =============================================
-- CALIGON COMPLETE DATABASE SCHEMA
-- =============================================

-- Enums
CREATE TYPE public.app_role AS ENUM ('socio', 'analista', 'consultor', 'comercial', 'gestor', 'cliente');
CREATE TYPE public.analysis_status AS ENUM ('cadastro', 'questionario', 'diagnostico', 'fluxogramas', 'relatorio', 'revisao', 'aprovado', 'entregue');
CREATE TYPE public.evidence_type AS ENUM ('fact', 'inference', 'hypothesis');
CREATE TYPE public.confidence_level AS ENUM ('high', 'medium', 'low');
CREATE TYPE public.severity_level AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE public.recommendation_category AS ENUM ('corte', 'simplificacao', 'automacao', 'delegacao', 'reestruturacao', 'acompanhamento');
CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.approval_type AS ENUM ('report', 'flowchart', 'memory');
CREATE TYPE public.question_type AS ENUM ('open', 'multiple_choice', 'scale', 'matrix', 'hybrid');
CREATE TYPE public.knowledge_type AS ENUM ('bottleneck', 'solution', 'pattern', 'question', 'benchmark');

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- USER ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1 $$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'socio'));
CREATE POLICY "Socios can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'socio'));

-- CLIENTS
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  niche TEXT NOT NULL,
  contact TEXT,
  email TEXT,
  phone TEXT,
  employees INTEGER,
  revenue TEXT,
  context TEXT,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'prospecto')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users can view clients" ON public.clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Non-client insert clients" ON public.clients FOR INSERT TO authenticated WITH CHECK (NOT public.has_role(auth.uid(), 'cliente'));
CREATE POLICY "Non-client update clients" ON public.clients FOR UPDATE TO authenticated USING (NOT public.has_role(auth.uid(), 'cliente'));

-- ANALYSES
CREATE TABLE public.analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  process TEXT NOT NULL,
  status analysis_status NOT NULL DEFAULT 'cadastro',
  assignee_id UUID REFERENCES auth.users(id),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  chaos_score INTEGER DEFAULT 0,
  estimated_loss NUMERIC DEFAULT 0,
  version INTEGER NOT NULL DEFAULT 1,
  approved BOOLEAN NOT NULL DEFAULT false,
  executive_summary TEXT,
  ai_reasoning TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users view analyses" ON public.analyses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Non-client insert analyses" ON public.analyses FOR INSERT TO authenticated WITH CHECK (NOT public.has_role(auth.uid(), 'cliente'));
CREATE POLICY "Non-client update analyses" ON public.analyses FOR UPDATE TO authenticated USING (NOT public.has_role(auth.uid(), 'cliente'));

-- QUESTIONNAIRE SESSIONS
CREATE TABLE public.questionnaire_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  phase TEXT NOT NULL DEFAULT 'triage' CHECK (phase IN ('triage', 'deep', 'specific')),
  progress INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  ai_context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.questionnaire_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users view sessions" ON public.questionnaire_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Non-client insert sessions" ON public.questionnaire_sessions FOR INSERT TO authenticated WITH CHECK (NOT public.has_role(auth.uid(), 'cliente'));
CREATE POLICY "Non-client update sessions" ON public.questionnaire_sessions FOR UPDATE TO authenticated USING (NOT public.has_role(auth.uid(), 'cliente'));

-- QUESTIONNAIRE QUESTIONS
CREATE TABLE public.questionnaire_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.questionnaire_sessions(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type question_type NOT NULL DEFAULT 'open',
  options JSONB DEFAULT '[]',
  category TEXT NOT NULL DEFAULT 'geral',
  order_index INTEGER NOT NULL DEFAULT 0,
  is_adaptive BOOLEAN NOT NULL DEFAULT false,
  ai_reasoning TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.questionnaire_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users view questions" ON public.questionnaire_questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Non-client insert questions" ON public.questionnaire_questions FOR INSERT TO authenticated WITH CHECK (NOT public.has_role(auth.uid(), 'cliente'));

-- QUESTIONNAIRE RESPONSES
CREATE TABLE public.questionnaire_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questionnaire_questions(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.questionnaire_sessions(id) ON DELETE CASCADE,
  response_text TEXT,
  response_data JSONB DEFAULT '{}',
  is_vague BOOLEAN DEFAULT false,
  vague_attempts INTEGER DEFAULT 0,
  ai_follow_up TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.questionnaire_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users view responses" ON public.questionnaire_responses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Non-client insert responses" ON public.questionnaire_responses FOR INSERT TO authenticated WITH CHECK (NOT public.has_role(auth.uid(), 'cliente'));
CREATE POLICY "Non-client update responses" ON public.questionnaire_responses FOR UPDATE TO authenticated USING (NOT public.has_role(auth.uid(), 'cliente'));

-- SCORES
CREATE TABLE public.analysis_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  value INTEGER NOT NULL CHECK (value >= 0 AND value <= 100),
  max_value INTEGER NOT NULL DEFAULT 100,
  description TEXT,
  factors JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.analysis_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users view scores" ON public.analysis_scores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Non-client insert scores" ON public.analysis_scores FOR INSERT TO authenticated WITH CHECK (NOT public.has_role(auth.uid(), 'cliente'));

-- BOTTLENECKS
CREATE TABLE public.bottlenecks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  severity severity_level NOT NULL DEFAULT 'medium',
  layer TEXT NOT NULL,
  estimated_loss NUMERIC DEFAULT 0,
  confidence confidence_level NOT NULL DEFAULT 'medium',
  evidence_type evidence_type NOT NULL DEFAULT 'inference',
  description TEXT,
  evidences JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bottlenecks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users view bottlenecks" ON public.bottlenecks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Non-client insert bottlenecks" ON public.bottlenecks FOR INSERT TO authenticated WITH CHECK (NOT public.has_role(auth.uid(), 'cliente'));

-- RECOMMENDATIONS
CREATE TABLE public.recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  problem TEXT,
  evidence_type evidence_type NOT NULL DEFAULT 'inference',
  confidence confidence_level NOT NULL DEFAULT 'medium',
  impact severity_level NOT NULL DEFAULT 'medium',
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category recommendation_category NOT NULL DEFAULT 'simplificacao',
  estimated_saving NUMERIC DEFAULT 0,
  estimated_cost NUMERIC DEFAULT 0,
  timeframe TEXT,
  is_quick_win BOOLEAN DEFAULT false,
  justification TEXT,
  area TEXT,
  process TEXT,
  risk TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users view recommendations" ON public.recommendations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Non-client insert recommendations" ON public.recommendations FOR INSERT TO authenticated WITH CHECK (NOT public.has_role(auth.uid(), 'cliente'));

-- FLOWCHARTS
CREATE TABLE public.flowcharts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('as_is', 'to_be', 'transition')),
  label TEXT,
  nodes JSONB NOT NULL DEFAULT '[]',
  edges JSONB NOT NULL DEFAULT '[]',
  version INTEGER NOT NULL DEFAULT 1,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.flowcharts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users view flowcharts" ON public.flowcharts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Non-client manage flowcharts" ON public.flowcharts FOR INSERT TO authenticated WITH CHECK (NOT public.has_role(auth.uid(), 'cliente'));
CREATE POLICY "Non-client update flowcharts" ON public.flowcharts FOR UPDATE TO authenticated USING (NOT public.has_role(auth.uid(), 'cliente'));

-- KNOWLEDGE BASE
CREATE TABLE public.knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  niche TEXT NOT NULL,
  title TEXT NOT NULL,
  type knowledge_type NOT NULL DEFAULT 'bottleneck',
  description TEXT,
  frequency INTEGER DEFAULT 1,
  approved BOOLEAN NOT NULL DEFAULT false,
  source TEXT,
  tags JSONB DEFAULT '[]',
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users view approved knowledge" ON public.knowledge_base FOR SELECT TO authenticated USING (approved = true OR NOT public.has_role(auth.uid(), 'cliente'));
CREATE POLICY "Non-client insert knowledge" ON public.knowledge_base FOR INSERT TO authenticated WITH CHECK (NOT public.has_role(auth.uid(), 'cliente'));
CREATE POLICY "Socios update knowledge" ON public.knowledge_base FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'socio'));

-- APPROVALS
CREATE TABLE public.approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type approval_type NOT NULL,
  reference_id UUID NOT NULL,
  analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  status approval_status NOT NULL DEFAULT 'pending',
  requested_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users view approvals" ON public.approvals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Non-client insert approvals" ON public.approvals FOR INSERT TO authenticated WITH CHECK (NOT public.has_role(auth.uid(), 'cliente'));
CREATE POLICY "Socios update approvals" ON public.approvals FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'socio'));

-- AUDIT LOG
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Socios view all logs" ON public.audit_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'socio') OR auth.uid() = user_id);
CREATE POLICY "Auth users insert logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- DOCUMENTS
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  parsed_content TEXT,
  classification TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users view documents" ON public.documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Non-client insert documents" ON public.documents FOR INSERT TO authenticated WITH CHECK (NOT public.has_role(auth.uid(), 'cliente'));

-- STORAGE
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);
CREATE POLICY "Auth users upload docs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents');
CREATE POLICY "Auth users read docs" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'documents');

-- TRIGGERS
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_analyses_updated_at BEFORE UPDATE ON public.analyses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.questionnaire_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_flowcharts_updated_at BEFORE UPDATE ON public.flowcharts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_knowledge_updated_at BEFORE UPDATE ON public.knowledge_base FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_approvals_updated_at BEFORE UPDATE ON public.approvals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AUTO-CREATE PROFILE ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  IF (SELECT COUNT(*) FROM public.user_roles) = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'socio');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'analista');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
