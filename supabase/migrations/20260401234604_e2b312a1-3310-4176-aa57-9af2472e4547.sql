
-- Add document extraction columns to analyses
ALTER TABLE public.analyses ADD COLUMN IF NOT EXISTS documents_extracted_text text;
ALTER TABLE public.analyses ADD COLUMN IF NOT EXISTS documents_summary jsonb DEFAULT '[]'::jsonb;

-- Allow non-client users to delete documents
CREATE POLICY "Non-client delete documents"
ON public.documents
FOR DELETE
TO authenticated
USING (NOT has_role(auth.uid(), 'cliente'::app_role));

-- Allow non-client users to update documents
CREATE POLICY "Non-client update documents"
ON public.documents
FOR UPDATE
TO authenticated
USING (NOT has_role(auth.uid(), 'cliente'::app_role));
