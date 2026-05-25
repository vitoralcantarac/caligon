# Arquitetura do Sistema — Caligon

## Visão Geral

O Caligon é uma aplicação SaaS com arquitetura cliente-servidor desacoplada:

- **Frontend**: Aplicação React estática, servida pelo GitHub Pages
- **Backend**: Supabase (BaaS) — banco PostgreSQL, autenticação, storage e Edge Functions
- **IA**: Claude API (Anthropic), acessada exclusivamente pelas Edge Functions (a chave nunca fica exposta no frontend)

```
Navegador do Usuário
        │
        ▼
GitHub Pages (HTML/CSS/JS estático)
        │
        ├──► Supabase Auth         (login, cadastro, sessão)
        ├──► Supabase PostgreSQL   (dados de análises, clientes, métricas)
        ├──► Supabase Storage      (documentos enviados pelo usuário)
        └──► Supabase Edge Functions
                    │
                    └──► Claude API (Anthropic) — geração de perguntas e diagnósticos
```

## Dois Painéis

### Painel Interno (`user_type: "internal"`)
Usado por consultores, analistas e sócios da Caligon.

Rotas: `/` (dashboard), `/analyses`, `/clients`, `/analyses/new`, `/analyses/:id`, `/settings`

### Painel do Cliente (`user_type: "client"`)
Usado pelos donos de PMEs.

Rotas: `/dashboard`, `/novo-diagnostico`, `/questionario/:id`, `/resultado/:id`, `/planos`, `/minha-conta`

## Autenticação e Autorização

- **Autenticação**: Supabase Auth (email + senha)
- **Separação de painéis**: campo `user_type` na tabela `profiles` (`"internal"` ou `"client"`)
- **Papéis internos**: tabela `user_roles` (`socio`, `analista`, `consultor`, `comercial`)
- **Row Level Security (RLS)**: clientes só acessam seus próprios registros no banco
- **ProtectedRoute**: componente React que redireciona usuários não autorizados

## Banco de Dados (PostgreSQL via Supabase)

### Tabelas Principais

| Tabela | Propósito |
|--------|----------|
| `profiles` | Dados do usuário (nome, tipo) |
| `user_roles` | Papel do usuário interno |
| `clients` | Dados das empresas PMEs |
| `analyses` | Registros de diagnóstico |
| `questionnaire_sessions` | Sessão de Q&A |
| `questionnaire_questions` | Perguntas geradas pela IA |
| `questionnaire_responses` | Respostas do usuário |
| `analysis_scores` | Scores por dimensão |
| `bottlenecks` | Gargalos identificados |
| `recommendations` | Recomendações geradas |
| `flowcharts` | Fluxogramas AS-IS e TO-BE |
| `documents` | Arquivos enviados + conteúdo OCR |
| `client_metrics` | Métricas financeiras da empresa |
| `plans` | Planos de assinatura disponíveis |
| `payments` | Pagamentos registrados |
| `subscriptions` | Assinaturas ativas |
| `unlocked_diagnostics` | Acessos avulsos desbloqueados |
| `audit_logs` | Log de auditoria de ações |

### Ciclo de Vida de uma Análise

```
cadastro (5%)
  → questionario (10%)    ← usuário responde perguntas da IA
    → diagnostico (40%)   ← IA processa e gera resultados
      → fluxogramas (70%) ← consultor edita fluxos AS-IS/TO-BE
        → relatorio (80%) ← relatório revisado
          → revisao (90%) ← aguarda aprovação do sócio
            → aprovado (95%)
              → entregue (100%) ← entregue ao cliente
```

## Edge Functions (Deno)

### `questionnaire-ai`
Responsável por toda a lógica de IA do sistema. Aceita três ações via POST:

- **`run_qualification`**: Analisa o questionário de pré-diagnóstico e retorna score (0–30) e nível de qualificação
- **`generate_question`**: Gera a próxima pergunta adaptativa com base no histórico de respostas
- **`run_diagnosis`**: Processa toda a sessão e retorna scores, gargalos, recomendações e fluxogramas

### `extract-documents`
Recebe documentos enviados pelo usuário (PDF, Excel, Word) do Supabase Storage, extrai o texto via OCR/parsing e salva o conteúdo na tabela `documents` para alimentar o contexto da IA.

## Fluxo de Dados — Diagnóstico Completo

```
1. Usuário cria análise (NewAnalysis.tsx)
        │ dados da empresa + métricas + documentos
        ▼
2. Supabase Storage ← documentos enviados
   extract-documents Edge Function ← OCR automático
        │ texto extraído salvo em documents.parsed_content
        ▼
3. Questionário adaptativo (Questionnaire.tsx)
        │ POST /functions/v1/questionnaire-ai {action: "generate_question"}
        ▼
4. Claude API gera pergunta contextualizada
        │ resposta salva em questionnaire_responses
        │ (repete 57 vezes em 5 fases)
        ▼
5. Diagnóstico executado (supabase-helpers.runDiagnosis)
        │ POST /functions/v1/questionnaire-ai {action: "run_diagnosis"}
        │ envia: todas as respostas + métricas + documentos OCR'd
        ▼
6. Claude API processa e retorna:
        │ - scores[] por dimensão
        │ - bottlenecks[] com perda estimada
        │ - recommendations[] com ROI
        │ - flowchartAsIs / flowchartToBe
        │ - executiveSummary + financialGate
        ▼
7. Resultados salvos no banco:
        │ analysis_scores, bottlenecks, recommendations, flowcharts
        ▼
8. AnalysisDetail.tsx exibe em 6 abas
   ReportTab.tsx gera PDF via jsPDF (client-side)
```

## Geração de PDFs

Os PDFs são gerados **inteiramente no navegador** (client-side) usando jsPDF. Nenhum servidor é necessário para isso. O fluxo é:

1. Buscar dados da análise do Supabase
2. Construir o documento com jsPDF + jsPDF-AutoTable
3. Fazer download direto no navegador

Quatro tipos de relatório: Técnico, Executivo, Cliente e Comercial.

## Design System

- **Cores primárias**: Navy `hsl(220,25%,14%)` + Gold `hsl(42,92%,56%)`
- **Fontes**: DM Serif Display (títulos) + DM Sans (corpo)
- **Componentes**: Shadcn UI (40+ componentes baseados em Radix UI)
- **Animações**: Framer Motion para transições e contadores
- **Responsividade**: Mobile-first, sidebar colapsável
