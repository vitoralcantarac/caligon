# Caligon — Plataforma de Diagnóstico Empresarial com IA

Plataforma web de inteligência empresarial que realiza diagnóstico operacional e financeiro de pequenas e médias empresas (PMEs) brasileiras, identificando gargalos, calculando perdas financeiras e gerando recomendações priorizadas com auxílio de Inteligência Artificial.

## Equipe

| Nome | GitHub |
|------|--------|
| Vitor Alcântara | [@vitoralcantarac](https://github.com/vitoralcantarac) |
| Ugo Pirangi | — |
| João Cesar Fernandes | — |
| Paulo Jesus | — |

## Funcionalidades Principais

- **Diagnóstico por IA**: Questionário adaptativo de 57 perguntas em 5 fases, gerado dinamicamente pela IA com base no perfil da empresa
- **Análise de Gargalos**: Identificação automática de pontos críticos com cálculo de perda financeira estimada
- **Recomendações Priorizadas**: Roadmap de ações organizadas em 4 fases (Estabilização → Padronização → Automação → Otimização)
- **Editor de Fluxogramas**: Criação visual de processos AS-IS e TO-BE
- **Geração de PDFs**: Relatórios técnico, executivo, para cliente e comercial
- **Dois Painéis**: Interno (consultores) e Cliente (donos de PMEs)
- **Controle de Acesso**: Sistema de planos e assinaturas com desbloqueio por diagnóstico

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Estilização | Tailwind CSS + Shadcn UI |
| Backend / Banco | Supabase (PostgreSQL + Auth + Storage) |
| Edge Functions | Deno (Supabase Functions) |
| IA | Claude API (Anthropic) |
| Fluxogramas | React Flow (@xyflow/react) |
| PDF | jsPDF + jsPDF-AutoTable |
| Animações | Framer Motion |
| Roteamento | React Router v6 |
| Cache/Fetching | TanStack React Query |

## Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- [npm](https://www.npmjs.com/) v9 ou superior
- Conta no [Supabase](https://supabase.com/)
- Chave de API da [Anthropic](https://console.anthropic.com/) (Claude)

## Instalação e Execução Local

### 1. Clone o repositório

```bash
git clone https://github.com/vitoralcantarac/caligon.git
cd caligon
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo de exemplo e preencha com suas credenciais:

```bash
cp .env.example .env
```

Edite o `.env`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

As credenciais do Supabase estão em: **Dashboard → Settings → API Keys**

### 4. Configure o banco de dados

No [SQL Editor do Supabase](https://supabase.com/dashboard/project/_/sql), execute os arquivos de migração na ordem:

```
supabase/migrations/20260327185903_*.sql
supabase/migrations/20260327185921_*.sql
supabase/migrations/20260330170452_*.sql
supabase/migrations/20260330170509_*.sql
supabase/migrations/20260331140943_*.sql
supabase/migrations/20260401145337_*.sql
supabase/migrations/20260401234604_*.sql
supabase/migrations/20260407141024_*.sql
supabase/migrations/20260409024600_*.sql
supabase/migrations/20260417040206_*.sql
supabase/migrations/20260421175801_*.sql
```

Cole o conteúdo de cada arquivo no SQL Editor e execute na ordem acima.

### 5. Configure e publique as Edge Functions

Instale o Supabase CLI e faça login:

```bash
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
```

O `SEU_PROJECT_REF` está na URL do dashboard: `supabase.com/dashboard/project/SEU_PROJECT_REF`

Publique as funções:

```bash
cd insight-engine-main
npx supabase functions deploy questionnaire-ai --no-verify-jwt
npx supabase functions deploy extract-documents --no-verify-jwt
```

### 6. Configure a chave da IA nas Edge Functions

No Supabase Dashboard: **Settings → Edge Functions → Secrets**

Adicione:
```
ANTHROPIC_API_KEY=sk-ant-sua-chave-aqui
```

### 7. Execute o servidor de desenvolvimento

```bash
npm run dev
```

Acesse: [http://localhost:8080](http://localhost:8080)

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento (porta 8080) |
| `npm run build` | Build de produção (gera `dist/`) |
| `npm run preview` | Preview local do build de produção |
| `npm run lint` | Verificação de código com ESLint |
| `npm run test` | Executa a suite de testes |
| `npm run test:watch` | Testes em modo watch (desenvolvimento) |

## Estrutura do Projeto

```
insight-engine-main/
├── src/
│   ├── components/
│   │   ├── analysis/tabs/     # Abas da tela de análise (Overview, Scores, etc.)
│   │   ├── client/            # Componentes do painel do cliente
│   │   ├── layout/            # AppLayout e Sidebar do painel interno
│   │   ├── metrics/           # Formulário de métricas financeiras
│   │   └── ui/                # Componentes Shadcn UI (40+)
│   ├── hooks/                 # useAuth, use-mobile, use-toast
│   ├── integrations/supabase/ # Cliente Supabase e tipos gerados
│   ├── lib/
│   │   ├── access-control.ts  # Lógica de planos e assinaturas
│   │   ├── constants.ts       # Labels, cores e utilitários de formatação
│   │   ├── metrics-config.ts  # Configuração de 50+ métricas financeiras
│   │   ├── niches-config.ts   # 50+ nichos de negócio com subnichos
│   │   ├── pdf-generator.ts   # Geração de 4 tipos de relatório PDF
│   │   └── supabase-helpers.ts # createAnalysis, runDiagnosis, logAudit
│   └── pages/
│       ├── client/            # Painel do cliente (8 páginas)
│       └── *.tsx              # Painel interno (9 páginas)
├── supabase/
│   ├── functions/
│   │   ├── questionnaire-ai/  # Edge Function principal de IA
│   │   └── extract-documents/ # OCR e parsing de documentos
│   └── migrations/            # 11 arquivos SQL de migração
├── docs/                      # Documentação técnica detalhada
├── public/                    # Assets estáticos
└── .github/workflows/         # CI/CD com GitHub Actions
```

## Deploy (GitHub Pages)

O projeto possui deploy automático configurado via GitHub Actions.

### Configuração inicial

1. Acesse **Settings → Pages** no repositório e selecione **GitHub Actions** como fonte
2. Acesse **Settings → Secrets → Actions** e adicione:
   - `VITE_SUPABASE_URL`: URL do seu projeto Supabase
   - `VITE_SUPABASE_ANON_KEY`: Chave anon/public do Supabase

### Deploy

A cada push na branch `main`, o workflow `.github/workflows/deploy.yml` executa automaticamente:
1. Instala as dependências (`npm ci`)
2. Executa o build (`npm run build`) com as variáveis de ambiente dos secrets
3. Publica a pasta `dist/` no GitHub Pages

O site fica disponível em: `https://vitoralcantarac.github.io/caligon/`

## Documentação Técnica

Consulte a pasta [`docs/`](docs/) para documentação detalhada:

- [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md) — Arquitetura completa do sistema
- [`docs/IA.md`](docs/IA.md) — Como a camada de IA funciona
- [`docs/DEMO.md`](docs/DEMO.md) — Demonstração do fluxo ponta a ponta

## Variáveis de Ambiente

| Variável | Descrição | Onde obter |
|----------|-----------|------------|
| `VITE_SUPABASE_URL` | URL do projeto Supabase | Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Chave pública anon | Dashboard → Settings → API Keys (Legacy) |

> **Nunca commite o arquivo `.env`**. Ele está no `.gitignore`. Use `.env.example` como referência.

## Licença

Projeto acadêmico — todos os direitos reservados à equipe Caligon.
