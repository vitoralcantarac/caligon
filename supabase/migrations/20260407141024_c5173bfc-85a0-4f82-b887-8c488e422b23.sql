
-- Allow non-client authenticated users to delete from analyses
CREATE POLICY "Non-client delete analyses" ON public.analyses
FOR DELETE TO authenticated
USING (NOT has_role(auth.uid(), 'cliente'::app_role));

-- Allow non-client authenticated users to delete from bottlenecks
CREATE POLICY "Non-client delete bottlenecks" ON public.bottlenecks
FOR DELETE TO authenticated
USING (NOT has_role(auth.uid(), 'cliente'::app_role));

-- Allow non-client authenticated users to delete from recommendations
CREATE POLICY "Non-client delete recommendations" ON public.recommendations
FOR DELETE TO authenticated
USING (NOT has_role(auth.uid(), 'cliente'::app_role));

-- Allow non-client authenticated users to delete from analysis_scores
CREATE POLICY "Non-client delete scores" ON public.analysis_scores
FOR DELETE TO authenticated
USING (NOT has_role(auth.uid(), 'cliente'::app_role));

-- Allow non-client authenticated users to delete from flowcharts
CREATE POLICY "Non-client delete flowcharts" ON public.flowcharts
FOR DELETE TO authenticated
USING (NOT has_role(auth.uid(), 'cliente'::app_role));

-- Allow non-client authenticated users to delete from questionnaire_sessions
CREATE POLICY "Non-client delete sessions" ON public.questionnaire_sessions
FOR DELETE TO authenticated
USING (NOT has_role(auth.uid(), 'cliente'::app_role));

-- Allow non-client authenticated users to delete from questionnaire_questions
CREATE POLICY "Non-client delete questions" ON public.questionnaire_questions
FOR DELETE TO authenticated
USING (NOT has_role(auth.uid(), 'cliente'::app_role));

-- Allow non-client authenticated users to delete from questionnaire_responses
CREATE POLICY "Non-client delete responses" ON public.questionnaire_responses
FOR DELETE TO authenticated
USING (NOT has_role(auth.uid(), 'cliente'::app_role));

-- Allow non-client authenticated users to delete from clients
CREATE POLICY "Non-client delete clients" ON public.clients
FOR DELETE TO authenticated
USING (NOT has_role(auth.uid(), 'cliente'::app_role));

-- Allow non-client authenticated users to delete from client_metrics
CREATE POLICY "Non-client delete metrics" ON public.client_metrics
FOR DELETE TO authenticated
USING (NOT has_role(auth.uid(), 'cliente'::app_role));

-- Allow non-client authenticated users to delete from deliverables
CREATE POLICY "Non-client delete deliverables" ON public.deliverables
FOR DELETE TO authenticated
USING (NOT has_role(auth.uid(), 'cliente'::app_role));
