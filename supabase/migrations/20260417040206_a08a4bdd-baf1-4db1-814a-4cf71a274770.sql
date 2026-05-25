
-- 1.4: Add implementation guidance columns to recommendations
ALTER TABLE public.recommendations 
  ADD COLUMN IF NOT EXISTS how_to_implement JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS tools_required JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS expected_result TEXT,
  ADD COLUMN IF NOT EXISTS warning TEXT,
  ADD COLUMN IF NOT EXISTS priority INTEGER;

-- 1.8: Sector benchmark on scores
ALTER TABLE public.analysis_scores
  ADD COLUMN IF NOT EXISTS sector_benchmark NUMERIC,
  ADD COLUMN IF NOT EXISTS percentile INTEGER;
