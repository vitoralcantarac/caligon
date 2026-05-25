# Camada de Inteligência Artificial — Caligon

## Visão Geral

A IA do Caligon é baseada na **Claude API da Anthropic** e opera exclusivamente através de Edge Functions Deno hospedadas no Supabase. A chave da API nunca é exposta ao navegador — todas as chamadas passam pelo servidor.

## O que é código próprio vs o que é IA

### Código próprio (heurísticas e regras)

| Funcionalidade | Onde | Como funciona |
|---------------|------|--------------|
| Controle de acesso | `lib/access-control.ts` | Lógica determinística: verifica `user_type`, `unlocked_diagnostics` e `subscriptions` em sequência |
| Ciclo de vida da análise | `lib/constants.ts` + `supabase-helpers.ts` | Máquina de estados com 8 status fixos e progressão linear |
| Cálculo de métricas | `lib/metrics-config.ts` + `MetricsForm.tsx` | Fórmulas matemáticas fixas (ex: CAC = custo_marketing / leads_convertidos) |
| Agrupamento por roadmap | `BottlenecksTab.tsx`, `RecommendationsTab.tsx` | Ordenação e agrupamento determinístico por campos retornados pela IA |
| Geração de PDF | `lib/pdf-generator.ts` | Código puro jsPDF, sem IA — monta documento a partir dos dados já processados |
| Controle de fluxogramas | `FlowEditor.tsx` | Editor visual React Flow — interação humana, sem IA |
| Score de qualificação | `NewAnalysis.tsx` | Soma ponderada das respostas do questionário de qualificação |

### Processado pela IA (Claude API)

| Funcionalidade | Ação na Edge Function | Entrada | Saída |
|---------------|----------------------|---------|-------|
| Perguntas adaptativas | `generate_question` | Histórico de respostas, niche, métricas, documentos OCR | Próxima pergunta contextualizada |
| Relatório de qualificação | `run_qualification` | 10 respostas do pré-diagnóstico | Score, nível, análise textual |
| Diagnóstico completo | `run_diagnosis` | Todas as respostas + métricas + documentos | Scores, gargalos, recomendações, fluxogramas, resumo |

## Edge Function: questionnaire-ai

**Arquivo**: `supabase/functions/questionnaire-ai/index.ts`

### Contexto enviado para a IA

A cada chamada, a IA recebe:
- Nome da empresa, niche/subniche, processo analisado
- Número de funcionários e faturamento mensal
- Todas as métricas financeiras preenchidas (com status: preenchido/calculado/recusado)
- Histórico completo de perguntas e respostas anteriores
- Conteúdo extraído dos documentos enviados (OCR)
- Score de qualificação da fase inicial
- Fase atual do questionário

### Persona e Metodologia da IA

O prompt de sistema instrui a IA a agir como:

> "Consultor sênior de 20 anos de experiência em diagnóstico de PMEs brasileiras, com conhecimento profundo em 50+ nichos de negócio."

**Metodologias aplicadas pela IA**:
- **TOC** (Theory of Constraints): encontrar o único gargalo que limita todo o sistema
- **Lean**: identificar e eliminar desperdícios operacionais
- **Análise de Causa Raiz**: partir do sintoma → causa imediata → causa sistêmica
- **Modelo Universal de Perdas**: categorizar perdas em receita, custo e tempo

### Estrutura do Diagnóstico (run_diagnosis)

A IA retorna um JSON estruturado:

```json
{
  "scores": [
    {
      "label": "Saúde Financeira",
      "value": 45,
      "confidence": "média",
      "basis": "Justificativa baseada nas respostas"
    }
  ],
  "bottlenecks": [
    {
      "title": "Taxa de Conversão Abaixo do Benchmark",
      "category": "Comercial",
      "severity": "critico",
      "causalLayer": "causa_raiz",
      "estimatedLoss": 28000,
      "description": "Descrição detalhada...",
      "calculationFormula": "leads × (taxa_benchmark - taxa_atual) × ticket_médio",
      "confidence": "alta"
    }
  ],
  "recommendations": [
    {
      "title": "Implementar pipeline de vendas estruturado",
      "estimatedSaving": 15000,
      "estimatedCost": 500,
      "timeframe": "30 dias",
      "roi_percentage": 2900,
      "roadmapPhase": "estabilizacao",
      "howToImplement": "Passo a passo detalhado..."
    }
  ],
  "flowchartAsIs": { "nodes": [], "edges": [] },
  "flowchartToBe": { "nodes": [], "edges": [] },
  "executiveSummary": "Resumo executivo em texto...",
  "financialGate": "sim",
  "chaosScore": 67
}
```

### Classificação de Evidências

A IA classifica cada dado em três níveis de confiança:

| Nível | Significado |
|-------|-------------|
| `alta` | Baseado em dado real informado pelo usuário |
| `média` | Estimativa fundamentada em benchmark do niche |
| `baixa` | Inferência qualitativa sem dado numérico |

## Edge Function: extract-documents

**Arquivo**: `supabase/functions/extract-documents/index.ts`

Processa arquivos enviados pelo usuário (PDF, Excel, Word) armazenados no Supabase Storage:
1. Baixa o arquivo do Storage
2. Extrai o texto via parsing/OCR
3. Salva o conteúdo em `documents.parsed_content`
4. Esse conteúdo é incluído no contexto da IA nas chamadas subsequentes

## Fases do Questionário

O questionário adaptativo tem 57 perguntas distribuídas em 5 fases:

| Fase | Objetivo | Perguntas (aprox.) |
|------|---------|-------------------|
| `triage` | Identificar a área principal do problema | 8–10 |
| `deep` | Aprofundar na causa raiz identificada | 15–18 |
| `loss_measurement` | Quantificar as perdas financeiras | 10–12 |
| `specific` | Detalhar contexto específico do niche | 10–12 |
| `risk_analysis` | Avaliar riscos sistêmicos e dependências | 7–8 |

A sequência e o conteúdo de cada pergunta são determinados pela IA com base nas respostas anteriores — não existe roteiro fixo.

## Segurança da IA

- A `ANTHROPIC_API_KEY` é armazenada como secret nas Edge Functions do Supabase
- O frontend nunca tem acesso direto à API da Anthropic
- Todas as chamadas passam pelo servidor Supabase, que valida a autenticação do usuário antes de acionar a IA
