# Demonstração do Fluxo Ponta a Ponta — Caligon

Este documento demonstra o fluxo completo de uso do sistema, desde o cadastro até a geração do relatório de diagnóstico.

---

## Caso de Uso: Diagnóstico de uma Pizzaria com Problemas de Lucratividade

**Empresa**: Pizzaria do Bairro  
**Problema percebido**: Faturamento estável mas lucro caindo mês a mês  
**Processo a analisar**: Financeiro e Custos

---

## Fluxo 1 — Painel Interno (Consultor realiza o diagnóstico)

### Etapa 1: Login

Acesse `/login` com as credenciais de usuário interno (analista ou sócio).

### Etapa 2: Criar Nova Análise (`/analyses/new`)

**Step 0 — Informações da Empresa**
```
Nome da empresa: Pizzaria do Bairro
Niche: Restaurante → Pizzaria
Contato: João Silva
Email: joao@pizzariadobairro.com.br
Telefone: (11) 99999-0000
Funcionários: 8
Faturamento mensal: R$ 45.000
```

**Step 1 — Qualificação**

O sistema apresenta 10 perguntas sobre maturidade da gestão. Respostas típicas de uma pizzaria com problemas:
- Controle financeiro: manual/planilha → score baixo
- Separação de caixa pessoal/empresa: não → score muito baixo
- DRE mensal: nunca → sem dado

Score resultante: **12/30 — Qualificado com ressalvas**

**Step 2 — Métricas**

Preenchimento das métricas financeiras:
```
Faturamento mensal: R$ 45.000
Ticket médio: R$ 65
Margem bruta estimada: 35%
Custo fixo mensal: R$ 18.000
Número de pedidos/dia: 23
Percentual de delivery: 60%
```

Métricas sem dado: CAC, LTV (marcadas como "Não tenho esse dado")

**Step 3 — Contexto**
```
Processo: Financeiro e Custos
Descrição: "Faturamento cresceu 15% no último ano mas o lucro caiu. 
            Suspeito que os custos de delivery e insumos aumentaram 
            muito. Não sei exatamente onde está o vazamento."
```

**Step 4 — Documentos**

Upload do extrato bancário do último trimestre (PDF) e planilha de custos (Excel). A Edge Function `extract-documents` processa automaticamente.

**Step 5 — Confirmação**

Análise criada com status: `cadastro`.

---

### Etapa 3: Questionário Adaptativo (`/analyses/:id/questionnaire`)

A IA inicia o questionário na fase `triage`:

**Pergunta 1** (gerada pela IA):
> "Quando você compara o faturamento com o caixa disponível ao final do mês, qual é a diferença típica? O lucro esperado está chegando na conta ou sumindo no meio do caminho?"

**Resposta**: "Sobra muito menos do que esperado. Às vezes mal cobre o pró-labore."

**Pergunta 2** (IA adapta com base na resposta):
> "Vocês têm controle separado dos custos de cada canal de venda — salão, delivery e retirada? Ou tudo é contabilizado junto?"

**Resposta**: "Tudo junto. O iFood deposita de um jeito e não sei quanto custou para entregar."

*(A IA identifica o tema central: custos ocultos do delivery. As próximas perguntas aprofundam nesse ponto.)*

**[... 55 perguntas adicionais ...]**

Ao final das 5 fases, o questionário está completo. Status avança para `questionario`.

---

### Etapa 4: Executar Diagnóstico

Na tela de detalhe da análise, o consultor clica em **"Executar Diagnóstico IA"**.

A Edge Function `questionnaire-ai` (ação `run_diagnosis`) processa:
- 57 respostas do questionário
- Métricas financeiras preenchidas
- Conteúdo extraído dos documentos (extrato + planilha)

**Tempo de processamento**: 15–30 segundos

Status avança para `diagnostico`.

---

### Etapa 5: Resultado do Diagnóstico (`/analyses/:id`)

#### Aba Overview
```
Financial Gate: 🟡 Parcial — dados suficientes para faixas estimadas
Chaos Score: 71/100
Perda total estimada: R$ 12.400–R$ 18.600/mês
```

#### Aba Scores
```
Saúde Financeira:        38/100 🔴
Eficiência Operacional:  52/100 🟡
Gestão de Custos:        29/100 🔴
Maturidade de Processos: 41/100 🟡
Capacidade de Escala:    55/100 🟡
```

#### Aba Gargalos (ordenados por perda)

**1. Custo de delivery não precificado corretamente** `CRÍTICO`
- Camada causal: Causa Raiz
- Perda estimada: R$ 6.800–R$ 9.200/mês
- Fórmula: `pedidos_delivery × (taxa_plataforma + custo_embalagem + custo_entregador) - valor_cobrado_frete`
- Confiança: Alta (dado real do extrato)

**2. Ausência de controle de desperdício de insumos** `ALTO`
- Perda estimada: R$ 3.200–R$ 5.400/mês
- Confiança: Média (estimativa por benchmark do niche)

**3. Precificação sem base em custo real** `ALTO`
- Perda estimada: R$ 2.400–R$ 4.000/mês
- Confiança: Média

#### Aba Recomendações

**Fase 1 — Estabilização (0–30 dias)**
- Calcular custo real por canal (delivery vs salão) → Economia estimada: R$ 4.200/mês, Custo: R$ 0, ROI: ∞
- Ajustar preço do delivery somando todos os custos → R$ 3.800/mês, R$ 0, ROI: ∞

**Fase 2 — Padronização (30–90 dias)**
- Implementar ficha técnica de cada produto → R$ 2.100/mês, R$ 200, ROI: 950%
- Criar DRE simplificado mensal → R$ 1.500/mês, R$ 150, ROI: 900%

#### Aba Fluxogramas

**AS-IS** (processo atual de precificação):
```
[Pedido entra] → [Custo de ingredientes estimado] → [Markup fixo aplicado] → [Preço final]
                                                           ↑
                                              [Custos de delivery IGNORADOS]
```

**TO-BE** (processo otimizado):
```
[Pedido entra] → [Ficha técnica consulta custo real] → [+ Custos de canal] → [+ Margem alvo] → [Preço final]
```

#### Aba Relatório

Download dos PDFs:
- **Relatório Técnico**: 12 páginas com todas as análises, fórmulas e dados
- **Resumo Executivo**: 2 páginas com financial gate, top 3 gargalos e próximos passos
- **Relatório do Cliente**: 6 páginas em linguagem simples com plano de ação
- **Apresentação Comercial**: 4 páginas para proposta de consultoria

---

### Etapa 6: Fluxo de Entrega

```
Consultor edita fluxogramas → status: fluxogramas
Consultor revisa relatório  → status: relatorio
Envia para sócio revisar    → status: revisao
Sócio aprova                → status: aprovado
Sócio registra pagamento    → acesso liberado para cliente
Status final                → entregue
```

---

## Fluxo 2 — Painel do Cliente (Autodiagnóstico)

### Etapa 1: Cadastro

Acesse `/cadastro`, preencha nome, email e senha. Confirmação por email via Supabase Auth.

### Etapa 2: Novo Diagnóstico (`/novo-diagnostico`)

Formulário simplificado com dados da empresa. Sem etapas de qualificação — vai direto ao questionário.

### Etapa 3: Questionário (`/questionario/:id`)

Interface de chat conversacional. Mesma IA, experiência mais simples.

### Etapa 4: Resultado (`/resultado/:id`)

**Sem plano ativo**: Mostra preview com os primeiros gargalos bloqueados. Modal de pagamento com opções de planos.

**Com plano ativo / diagnóstico desbloqueado**:
- Exibe gargalos com animações de entrada
- Scores com contadores crescentes
- Recomendações com ROI calculado
- Botão de avaliação do diagnóstico (1–5 estrelas)
- Download do relatório em PDF

---

## Validação de Qualidade do Diagnóstico

### Critérios verificados no caso acima

| Critério | Resultado |
|----------|----------|
| Financial Gate compatível com dados fornecidos | ✅ Parcial (métricas incompletas) |
| Gargalo principal identificado corretamente | ✅ Custo delivery (causa raiz real) |
| Fórmulas de cálculo de perda apresentadas | ✅ Sim, com variáveis explícitas |
| Confiança variando conforme qualidade do dado | ✅ Alta para dados reais, Média para estimativas |
| Recomendações ordenadas por fase e ROI | ✅ Sim |
| PDF gerado sem erros | ✅ Testado localmente |

### Limitações conhecidas

- Diagnósticos com menos de 30 métricas preenchidas recebem `financialGate: "nao"` e trabalham com tendências qualitativas
- A precisão dos cálculos de perda depende diretamente da qualidade dos dados fornecidos
- Nichos muito específicos ou incomuns podem receber perguntas menos personalizadas
