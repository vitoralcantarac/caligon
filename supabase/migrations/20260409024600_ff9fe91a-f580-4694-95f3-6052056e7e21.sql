ALTER TABLE analyses ADD COLUMN IF NOT EXISTS qualification_score integer;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS qualification_level text;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS qualification_answers jsonb DEFAULT '[]'::jsonb;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS qualification_report jsonb;