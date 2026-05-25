
-- Add causal hierarchy and diagnostic engine columns to bottlenecks
ALTER TABLE public.bottlenecks 
  ADD COLUMN IF NOT EXISTS causal_layer text DEFAULT 'causa_raiz',
  ADD COLUMN IF NOT EXISTS causal_parent_id uuid REFERENCES public.bottlenecks(id),
  ADD COLUMN IF NOT EXISTS causal_order integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS calculation_type text DEFAULT 'estimativa',
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'inferência',
  ADD COLUMN IF NOT EXISTS is_dominant boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS loss_display_mode text DEFAULT 'exact',
  ADD COLUMN IF NOT EXISTS loss_range_min numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS loss_range_max numeric DEFAULT 0;

-- Add roadmap phases and diagnostic engine columns to recommendations  
ALTER TABLE public.recommendations
  ADD COLUMN IF NOT EXISTS roadmap_phase text DEFAULT 'estabilizacao',
  ADD COLUMN IF NOT EXISTS phase_order integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS dependencies text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS anticipation_risk text,
  ADD COLUMN IF NOT EXISTS calculation_type text DEFAULT 'estimativa',
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'inferência',
  ADD COLUMN IF NOT EXISTS saving_display_mode text DEFAULT 'exact',
  ADD COLUMN IF NOT EXISTS saving_range_min numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS saving_range_max numeric DEFAULT 0;

-- Add financial gate and validation to analyses
ALTER TABLE public.analyses
  ADD COLUMN IF NOT EXISTS financial_gate text DEFAULT 'parcial',
  ADD COLUMN IF NOT EXISTS validation_result jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS causal_tree jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS loss_display_mode text DEFAULT 'exact',
  ADD COLUMN IF NOT EXISTS loss_range_min numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS loss_range_max numeric DEFAULT 0;

-- Add heuristic metadata to analysis_scores
ALTER TABLE public.analysis_scores
  ADD COLUMN IF NOT EXISTS confidence text DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS basis text,
  ADD COLUMN IF NOT EXISTS missing_data text,
  ADD COLUMN IF NOT EXISTS is_heuristic boolean DEFAULT true;
