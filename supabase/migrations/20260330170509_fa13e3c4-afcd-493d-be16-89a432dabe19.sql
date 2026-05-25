
-- Fix overly permissive INSERT policy on notifications
DROP POLICY IF EXISTS "Authenticated insert notifications" ON public.notifications;
CREATE POLICY "Users insert notifications for others" ON public.notifications FOR INSERT TO authenticated WITH CHECK (
  NOT has_role(auth.uid(), 'cliente'::app_role)
  OR auth.uid() = user_id
);
