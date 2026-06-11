# CLAUDE.md

Este arquivo fornece orientações ao Claude Code (claude.ai/code) ao trabalhar com o código neste repositório.

## Comandos

```bash
npm run dev          # Servidor de desenvolvimento na porta 8080
npm run build        # Build de produção → dist/
npm run build:local  # Build com caminhos relativos → dist-local/ (para Live Server / abrir sem servidor)
npm run preview      # Pré-visualizar build de produção
npm run lint         # ESLint
npm run typecheck    # Verificação de tipos TypeScript (sem emissão)
npm run test         # Vitest (execução única)
npm run test:watch   # Vitest em modo watch
```

Executar um único arquivo de teste:
```bash
npx vitest run src/test/access-control.test.ts
```

## Ambiente

Copie `.env.example` para `.env.local` e preencha as credenciais do Supabase:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_POSTHOG_KEY=...          # Analytics PostHog (opcional em dev — desativado automaticamente)
VITE_POSTHOG_HOST=...         # Opcional; padrão: https://us.i.posthog.com
```

As Edge Functions também precisam de `ANTHROPIC_API_KEY` e `RESEND_API_KEY` configurados nos secrets do projeto Supabase (nunca no frontend).

## Visualização local (Live Server / sem terminal)

O projeto pode ser visualizado de duas formas:

1. **Desenvolvimento (recomendado):** `npm run dev` → `http://localhost:8080/caligon/`
2. **Live Server / estático:** `npm run build:local` → aponta o Live Server para a pasta `dist-local/`

O `.vscode/settings.json` já configura o Live Server para servir de `dist-local/` automaticamente. Abra o VS Code a partir desta pasta (`caligon-main/`) para que as configurações sejam lidas corretamente.

## Arquitetura

**Caligon** é uma plataforma de diagnóstico empresarial com IA voltada para PMEs brasileiras. É um React SPA hospedado como site estático no GitHub Pages, com Supabase como backend (PostgreSQL + Auth + Storage + Edge Functions) e Claude API para IA.

### Dois Painéis

O app possui dois painéis distintos com roteamento e layouts separados:

- **Painel interno** (rotas `/`, `AppLayout`/`Sidebar`) — para consultores que gerenciam análises de clientes
- **Painel do cliente** (`ClientLayout`) — para donos de PMEs visualizando seus próprios diagnósticos. Nota: as rotas **não** usam prefixo `/client/`. Rotas: `/dashboard` (ClientDashboard), `/novo-diagnostico` (ClientNewDiagnosis), `/questionario/:analysisId` (ClientQuestionnaire), `/resultado/:id` (ClientResult, com paywall integrado), `/planos` (ClientPlans), `/minha-conta` (ClientAccount), além das páginas públicas de auth `/cadastro` e `/entrar`.

A autenticação é feita via Supabase Auth. O hook `useAuth` fornece `user`, `session`, `profile`, `role` e `loading`. `profile.user_type` é `'internal'` ou `'client'`; `role` vem da tabela `user_roles`. A lógica de acesso está em `src/lib/access-control.ts`. Ao autenticar, `useAuth` chama `identifyUser()` do analytics; ao sair, chama `resetAnalyticsUser()`.

### Painel de Dev (DevPanel)

Usuários com `user_type = 'internal'` veem um painel flutuante fixo no canto inferior direito que permite alternar entre a view de admin e cliente sem trocar de conta. Implementado em `src/components/dev/DevPanel.tsx` com estado em `src/contexts/DevContext.tsx`. O `viewMode` é persistido em `localStorage`. O `ProtectedRoute` em `App.tsx` usa `effectiveType` (viewMode quando admin, user_type real quando cliente) para controlar o roteamento. Clientes nunca veem este painel.

### Controle de Acesso a Diagnósticos

A função `hasAccessToAnalysis(analysisId)` em `src/lib/access-control.ts` verifica três níveis em cascata antes de exibir resultados no painel do cliente:

1. **`internal`** — `profile.user_type === "internal"`: acesso total imediato (consultores da equipe).
2. **`unlocked`** — registro na tabela `unlocked_diagnostics` com `(user_id, analysis_id)`: representa pagamento único por diagnóstico. Inserido via `unlockDiagnostic()` ou `registerManualPayment()`.
3. **`subscription`** — assinatura ativa (`subscriptions.status = "active"`, não expirada). Dentro da assinatura: `plans.diagnostics_unlimited` libera tudo; caso contrário, compara `diagnostics_used` com `plans.diagnostics_per_period`.

Se nenhum nível for satisfeito, retorna `accessType: "none"`. O `accessType` retornado também determina qual mensagem de paywall exibir. Qualquer tela que renderize resultados de diagnóstico deve passar por essa verificação antes de exibir o conteúdo.

### Pagamentos e Conversão

**Não há gateway de pagamento automatizado** — o fluxo é 100% manual:

1. No painel do cliente (`ClientResult.tsx`), o CTA mostra o preço de R$ 397 (ou 12x R$ 33,08) e abre um modal com a chave Pix `contato@caligon.com.br`. O cliente envia o comprovante via WhatsApp (número hardcoded no código).
2. O desbloqueio é feito pelo consultor no Dashboard interno (`Dashboard.tsx`): a seção "Oportunidades de conversão" lista diagnósticos concluídos ainda não pagos, e o botão "Registrar pagamento" abre um modal com plano, método (Pix/TED/Cartão/Boleto) e parcelas, que chama `registerManualPayment()`.
3. O match entre cliente e perfil de usuário é feito por heurística (`ilike` no `full_name`) — ponto frágil a considerar em mudanças nessa área.
4. Após confirmar, dispara o email `payment_confirmed` ao cliente (non-blocking).

O Dashboard interno também exibe métricas SaaS em tempo real: total de clientes (`profiles` com `user_type = 'client'`), diagnósticos gratuitos (analyses sem unlock), diagnósticos pagos (`unlocked_diagnostics`), taxa de conversão (pagos / total) e receita total (soma de `payments` com `status = 'approved'`, em centavos).

### Ciclo de Vida da Análise

Uma análise percorre 9 status: `cadastro → documentos → metricas → questionario → processando → fluxogramas → concluido → revisao → entregue`. O `run_diagnosis` atualiza para `fluxogramas` (progress=70) após salvar scores, gargalos, recomendações e fluxogramas. A maior parte da UI em `src/pages/AnalysisDetail.tsx` e suas abas filhas em `src/components/analysis/tabs/` é controlada por esse status.

### Camada de IA

As chamadas de IA nunca partem diretamente do navegador. Todas as chamadas à Claude API rodam dentro das Supabase Edge Functions (runtime Deno) em `supabase/functions/questionnaire-ai/`. A função expõe três ações via body HTTP:

- `run_qualification` — avalia os dados iniciais da empresa
- `generate_question` — retorna a próxima pergunta adaptativa do questionário (Claude Haiku 4.5)
- `run_diagnosis` — processa todas as 57 respostas e retorna um JSON estruturado com scores, gargalos, recomendações, fluxogramas e sumário executivo (Claude Sonnet 4.6)

Um prompt de conhecimento universal (`src/lib/business-intelligence.ts`) é injetado em todos os diagnósticos via `getUniversalIntelligence()`. Ele fornece à IA fundamentos de TOC, anatomia financeira de PMEs (DRE, ponto de equilíbrio, armadilhas de caixa), metodologia de quantificação de perdas em três tiers e perguntas confrontadoras universais — garantindo consistência do raciocínio entre nichos.

O pipeline de extração de documentos está em `supabase/functions/extract-documents/` — baixa os arquivos enviados do Supabase Storage, faz o parse e salva `parsed_content` na tabela `documents` para alimentar chamadas de IA subsequentes.

Antes de trabalhar na camada de IA ou no fluxo de diagnóstico, leia os documentos em `docs/`:
- `IA.md` — modelos usados por ação, persona do consultor, metodologias (TOC, Lean, Root Cause Analysis), estrutura do JSON de retorno
- `ARQUITETURA.md` — diagrama de tabelas, fluxo completo de dados, políticas RLS
- `DEMO.md` — walkthrough ponta a ponta com caso real (Pizzaria), útil para entender o fluxo esperado

### Email Transacional (Resend)

A Edge Function `supabase/functions/send-email/` envia emails via Resend (secret `RESEND_API_KEY`, remetente `noreply@caligon.com.br`). Dois tipos suportados:

- `diagnosis_completed` — disparado em `runDiagnosis()` (`src/lib/supabase-helpers.ts`) se `clientData.email` existir
- `payment_confirmed` — disparado em `handleRegisterPayment()` (`Dashboard.tsx`) se o email do cliente existir

Ambos são **non-blocking** (`supabase.functions.invoke(...).catch(() => {})`) — falha no envio nunca deve quebrar o fluxo principal. Novos tipos de email devem seguir o mesmo padrão.

### Dados e Segurança

Todas as tabelas do Supabase usam Row Level Security. As 15 tabelas principais são: `profiles`, `clients`, `analyses`, `questionnaire_sessions`, `questionnaire_questions`, `questionnaire_responses`, `analysis_scores`, `bottlenecks`, `recommendations`, `flowcharts`, `documents`, `plans`, `payments/subscriptions/unlocked_diagnostics`, `audit_logs`, `diagnosis_ratings` (avaliações de diagnóstico pelo cliente: rating 1–5, comment, helpful_recommendations, would_recommend).

Funções auxiliares de alto nível que encapsulam chamadas ao Supabase estão em `src/lib/supabase-helpers.ts`. O registro de auditoria é feito via `logAudit()` e notificações in-app via `createNotification()` no mesmo arquivo para ações importantes. A tabela `notifications` também existe no banco.

### Configurações de Domínio

Os arquivos abaixo definem o vocabulário do domínio — consulte-os antes de adicionar perguntas, métricas ou categorias:

- `src/lib/metrics-config.ts` — 50+ métricas financeiras usadas no formulário de entrada (`MetricsForm`) e enviadas para a IA como contexto
- `src/lib/niches-config.ts` — 50+ nichos de negócio com sub-nichos, usados na criação de análise e como parâmetro para geração de perguntas
- `src/lib/constants.ts` — labels, cores e mapeamentos de status, níveis de confiança, fases do roadmap (Estabilização → Padronização → Automatização → Otimização)

### Geração de PDF

Os quatro tipos de relatório PDF (Técnico, Executivo, Cliente, Comercial) são gerados no lado do cliente usando jsPDF. A lógica está em `src/lib/pdf-generator.ts`. É uma dependência pesada — separada em seu próprio chunk `pdf` pelo Vite.

### Analytics (PostHog)

`src/lib/analytics.ts` encapsula o PostHog e exporta: `initAnalytics()` (chamado em `main.tsx` logo após `initSentry()`; em `import.meta.env.DEV` a captura é desativada automaticamente — sem guard manual necessário), `identifyUser(userId, props?)`, `track(event, props?)` e `resetAnalyticsUser()`.

Eventos rastreados atualmente (manter nomes consistentes ao adicionar novos): `questionnaire_started`, `questionnaire_completed`, `questionnaire_diagnosis_completed`, `questionnaire_diagnosis_failed`, `result_viewed`, `paywall_unlock_clicked`.

### Notas sobre o Frontend

- `src/integrations/supabase/types.ts` é gerado automaticamente a partir do schema do Supabase — não editar manualmente.
- `src/components/ui/` contém 40+ componentes Shadcn UI — estender via `components.json` + Shadcn CLI, não editando os arquivos gerados diretamente.
- React Flow (`@xyflow/react`) é usado no editor de fluxogramas (mapas de processo AS-IS / TO-BE); também separado em seu próprio chunk.
- Framer Motion (`framer-motion`) está disponível para animações de UI.
- Sentry (`@sentry/react`) é usado para monitoramento de erros em produção — configurado em `src/lib/sentry.ts`.
- Todas as páginas são carregadas via `React.lazy` em `src/App.tsx`.
- O alias de caminho `@/` aponta para `src/`.

### Deploy

CI/CD roda via `.github/workflows/deploy.yml`: typecheck → build → deploy no GitHub Pages em `/caligon/`. O `base` do Vite está definido como `/caligon/` em `vite.config.ts`. O `build:local` usa `vite.config.local.ts` com `base: "./"` e salva em `dist-local/` (gitignored).
