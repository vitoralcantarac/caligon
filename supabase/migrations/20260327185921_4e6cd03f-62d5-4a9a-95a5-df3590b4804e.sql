
DROP POLICY "Auth users insert logs" ON public.audit_logs;
CREATE POLICY "Auth users insert own logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
