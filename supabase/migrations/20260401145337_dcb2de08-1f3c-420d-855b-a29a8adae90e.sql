
CREATE TABLE public.client_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  metric_key text NOT NULL,
  metric_group text NOT NULL,
  metric_level text NOT NULL DEFAULT 'recommended',
  value numeric,
  unit text,
  status text NOT NULL DEFAULT 'absent',
  origin text DEFAULT 'manual',
  formula_used text,
  calculation_inputs jsonb DEFAULT '{}'::jsonb,
  observation text,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(client_id, metric_key)
);

ALTER TABLE public.client_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users view metrics"
  ON public.client_metrics FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Non-client insert metrics"
  ON public.client_metrics FOR INSERT
  TO authenticated
  WITH CHECK (NOT has_role(auth.uid(), 'cliente'::app_role));

CREATE POLICY "Non-client update metrics"
  ON public.client_metrics FOR UPDATE
  TO authenticated
  USING (NOT has_role(auth.uid(), 'cliente'::app_role));

CREATE TRIGGER update_client_metrics_updated_at
  BEFORE UPDATE ON public.client_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
