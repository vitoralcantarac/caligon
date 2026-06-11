-- ═══════════════════════════════════════
-- ATUALIZAÇÃO DE PREÇOS DOS PLANOS
-- ═══════════════════════════════════════
-- Starter: R$ 597 → R$ 497/mês (reduz fricção do primeiro plano recorrente)
-- Business Trimestral: R$ 2.997 → R$ 1.197/trimestre (corrige incoerência:
--   custava o mesmo que o Professional entregando 4x menos diagnósticos)

UPDATE public.plans SET price_cents = 49700 WHERE slug = 'starter';
UPDATE public.plans SET price_cents = 119700 WHERE slug = 'business_quarterly';
