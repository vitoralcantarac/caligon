-- ═══════════════════════════════════════
-- TABELA: plans
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL,
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('one_time', 'monthly', 'quarterly')),
  diagnostics_per_period INTEGER,
  diagnostics_unlimited BOOLEAN DEFAULT FALSE,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  highlight BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.plans (name, slug, description, price_cents, billing_cycle, diagnostics_per_period, diagnostics_unlimited, features, highlight, sort_order) VALUES
('Diagnóstico Único', 'single', 'Um diagnóstico completo com acesso permanente ao relatório', 39700, 'one_time', 1, FALSE,
  '["Diagnóstico operacional completo","Todos os gargalos identificados com impacto financeiro","Todas as recomendações com passo a passo de implementação","Roadmap de implementação em 4 fases","Fluxogramas AS-IS e TO-BE","PDF completo para download","Acesso permanente ao diagnóstico"]'::jsonb,
  FALSE, 1),
('Starter', 'starter', '3 diagnósticos por mês para acompanhar a evolução do negócio', 59700, 'monthly', 3, FALSE,
  '["3 diagnósticos por mês","Tudo do Diagnóstico Único","Relatório de acompanhamento pós-implementação","Histórico completo de diagnósticos anteriores","Comparação de evolução entre diagnósticos","Suporte por email"]'::jsonb,
  FALSE, 2),
('Professional', 'professional', '8 diagnósticos por mês com módulo extra de análise de riscos', 99700, 'monthly', 8, FALSE,
  '["8 diagnósticos por mês","Tudo do Starter","Módulo extra de análise e mitigação de riscos em cada diagnóstico","Exportação completa ZIP (PDF + dados + fluxogramas)","Prioridade no suporte com resposta em 24h"]'::jsonb,
  TRUE, 3),
('Business Trimestral', 'business_quarterly', '6 diagnósticos em 3 meses com acesso ao histórico', 299700, 'quarterly', 6, FALSE,
  '["6 diagnósticos no trimestre (2 por mês)","Todos os relatórios e PDFs","Selo oficial de Diagnóstico CALIGON para materiais da empresa","Acesso somente leitura ao histórico completo após o trimestre"]'::jsonb,
  FALSE, 4),
('Agency', 'agency', 'Para consultores e agências que atendem múltiplos clientes', 499700, 'monthly', NULL, TRUE,
  '["Diagnósticos ilimitados","White-label: relatórios com a sua marca","Dashboard de gestão multi-cliente","Onboarding dedicado com os fundadores","Acesso antecipado a novas funcionalidades"]'::jsonb,
  FALSE, 5)
ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════
-- TABELA: subscriptions
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.plans(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
  diagnostics_used INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- TABELA: payments
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.plans(id),
  amount_cents INTEGER NOT NULL,
  installments INTEGER DEFAULT 1,
  type TEXT NOT NULL CHECK (type IN ('one_time', 'subscription')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'refunded', 'chargeback')),
  gateway TEXT NOT NULL DEFAULT 'manual' CHECK (gateway IN ('manual', 'mercadopago', 'stripe', 'pix')),
  gateway_payment_id TEXT,
  method TEXT,
  registered_by UUID REFERENCES auth.users(id),
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- TABELA: unlocked_diagnostics
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.unlocked_diagnostics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE NOT NULL,
  payment_id UUID REFERENCES public.payments(id),
  subscription_id UUID REFERENCES public.subscriptions(id),
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, analysis_id)
);

-- ═══════════════════════════════════════
-- TABELA: diagnosis_ratings
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.diagnosis_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  helpful_recommendations BOOLEAN,
  would_recommend BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(analysis_id, user_id)
);

-- ═══════════════════════════════════════
-- ALTERAÇÕES EM TABELAS EXISTENTES
-- ═══════════════════════════════════════
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'client' CHECK (user_type IN ('client', 'internal'));
ALTER TABLE public.analyses ADD COLUMN IF NOT EXISTS estimated_savings NUMERIC DEFAULT 0;

-- Marcar sócios existentes como internal
UPDATE public.profiles SET user_type = 'internal' 
WHERE user_id IN (SELECT user_id FROM public.user_roles WHERE role IN ('socio', 'analista', 'consultor', 'comercial', 'gestor'));

-- ═══════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unlocked_diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnosis_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Planos visíveis para autenticados" ON public.plans FOR SELECT TO authenticated USING (is_active = TRUE);
CREATE POLICY "Sócios gerenciam planos" ON public.plans FOR ALL TO authenticated USING (has_role(auth.uid(), 'socio'::app_role)) WITH CHECK (has_role(auth.uid(), 'socio'::app_role));

CREATE POLICY "Usuário vê próprias assinaturas" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id OR NOT has_role(auth.uid(), 'cliente'::app_role));
CREATE POLICY "Internos criam assinaturas" ON public.subscriptions FOR INSERT TO authenticated WITH CHECK (NOT has_role(auth.uid(), 'cliente'::app_role) OR auth.uid() = user_id);
CREATE POLICY "Internos atualizam assinaturas" ON public.subscriptions FOR UPDATE TO authenticated USING (NOT has_role(auth.uid(), 'cliente'::app_role));

CREATE POLICY "Usuário vê próprios pagamentos" ON public.payments FOR SELECT TO authenticated USING (auth.uid() = user_id OR NOT has_role(auth.uid(), 'cliente'::app_role));
CREATE POLICY "Internos criam pagamentos" ON public.payments FOR INSERT TO authenticated WITH CHECK (NOT has_role(auth.uid(), 'cliente'::app_role) OR auth.uid() = user_id);
CREATE POLICY "Internos atualizam pagamentos" ON public.payments FOR UPDATE TO authenticated USING (NOT has_role(auth.uid(), 'cliente'::app_role));

CREATE POLICY "Usuário vê próprios desbloqueios" ON public.unlocked_diagnostics FOR SELECT TO authenticated USING (auth.uid() = user_id OR NOT has_role(auth.uid(), 'cliente'::app_role));
CREATE POLICY "Internos criam desbloqueios" ON public.unlocked_diagnostics FOR INSERT TO authenticated WITH CHECK (NOT has_role(auth.uid(), 'cliente'::app_role) OR auth.uid() = user_id);

CREATE POLICY "Cliente avalia próprio diagnóstico" ON public.diagnosis_ratings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Avaliações visíveis para autenticados" ON public.diagnosis_ratings FOR SELECT TO authenticated USING (true);

-- ═══════════════════════════════════════
-- ÍNDICES
-- ═══════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON public.subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_unlocked_diagnostics_user ON public.unlocked_diagnostics(user_id);
CREATE INDEX IF NOT EXISTS idx_unlocked_diagnostics_analysis ON public.unlocked_diagnostics(analysis_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id);

-- Trigger para updated_at em subscriptions
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();