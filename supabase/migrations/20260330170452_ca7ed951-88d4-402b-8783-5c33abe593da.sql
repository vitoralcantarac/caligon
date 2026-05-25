
-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT NOT NULL DEFAULT 'info',
  entity_type TEXT,
  entity_id UUID,
  analysis_id UUID,
  read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);

-- Deliverables table
CREATE TABLE public.deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL,
  type TEXT NOT NULL,
  label TEXT NOT NULL,
  file_path TEXT,
  file_size INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users view deliverables" ON public.deliverables FOR SELECT TO authenticated USING (true);
CREATE POLICY "Non-client insert deliverables" ON public.deliverables FOR INSERT TO authenticated WITH CHECK (NOT has_role(auth.uid(), 'cliente'::app_role));
CREATE POLICY "Non-client update deliverables" ON public.deliverables FOR UPDATE TO authenticated USING (NOT has_role(auth.uid(), 'cliente'::app_role));

-- Add columns to bottlenecks for calculation transparency
ALTER TABLE public.bottlenecks ADD COLUMN IF NOT EXISTS calculation_formula TEXT;
ALTER TABLE public.bottlenecks ADD COLUMN IF NOT EXISTS calculation_premises JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.bottlenecks ADD COLUMN IF NOT EXISTS annual_loss NUMERIC DEFAULT 0;
ALTER TABLE public.bottlenecks ADD COLUMN IF NOT EXISTS behavior_description TEXT;

-- Add columns to recommendations for ROI/payback
ALTER TABLE public.recommendations ADD COLUMN IF NOT EXISTS roi_percentage NUMERIC DEFAULT 0;
ALTER TABLE public.recommendations ADD COLUMN IF NOT EXISTS payback_months NUMERIC DEFAULT 0;
ALTER TABLE public.recommendations ADD COLUMN IF NOT EXISTS calculation_explanation TEXT;

-- Add status to flowcharts
ALTER TABLE public.flowcharts ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft';

-- Notification settings
CREATE TABLE public.notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  in_app_enabled BOOLEAN NOT NULL DEFAULT true,
  on_approval_pending BOOLEAN NOT NULL DEFAULT true,
  on_review_pending BOOLEAN NOT NULL DEFAULT true,
  on_new_upload BOOLEAN NOT NULL DEFAULT true,
  on_new_comment BOOLEAN NOT NULL DEFAULT true,
  on_diagnosis_complete BOOLEAN NOT NULL DEFAULT true,
  on_report_generated BOOLEAN NOT NULL DEFAULT true,
  on_error BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own settings" ON public.notification_settings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
