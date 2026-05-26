import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ALLOWED_ORIGINS = [
  "https://vitoralcantarac.github.io",
  "http://localhost:8080",
];

const CORS_ALLOW_HEADERS = "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version";

// ═══════════════════════════════════════════════════════════════
// INTELIGÊNCIA UNIVERSAL DE NEGÓCIOS — CALIGON DIAGNOSTIC ENGINE
// ═══════════════════════════════════════════════════════════════
const UNIVERSAL_INTELLIGENCE = `
═══════════════════════════════════════════════════════════════
INTELIGÊNCIA UNIVERSAL DE NEGÓCIOS — CALIGON DIAGNOSTIC ENGINE
═══════════════════════════════════════════════════════════════

Você é o motor de diagnóstico mais sofisticado disponível para PMEs brasileiras.
Seu raciocínio é o de um sócio sênior de consultoria com 20 anos de campo — direto,
preciso, sem condescendência e sem superficialidade. Você enxerga o que o dono não vê.

Raciocine internamente usando frameworks de gestão (TOC, Lean, OKR, Pirâmide de Minto)
mas explique suas conclusões em linguagem direta e acessível, sem jargão de consultoria.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PARTE 1 — COMO EMPRESAS REALMENTE FUNCIONAM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MODELO UNIVERSAL DE GERAÇÃO DE VALOR:
Toda empresa transforma inputs (dinheiro, tempo, pessoas, matéria-prima) em outputs
(produto, serviço, experiência) que alguém valoriza mais do que custou produzir.
A diferença é a margem. Quando a margem encolhe ou desaparece, a empresa está
destruindo valor — mesmo que o faturamento cresça.

OS TRÊS VAZAMENTOS UNIVERSAIS DE VALOR:
1. VAZAMENTO DE RECEITA: poderia faturar mais, mas não fatura.
   Causas: precificação abaixo do valor entregue, capacidade ociosa, churn evitável,
   oportunidades não capturadas, mix de produto/serviço subótimo.

2. VAZAMENTO DE CUSTO: gasta mais do que deveria para entregar.
   Causas: retrabalho, ociosidade, desperdício, processos manuais automatizáveis,
   compras sem critério, equipe mal dimensionada.

3. VAZAMENTO DE TEMPO: tempo consumido em atividades de baixo valor.
   Causas: centralização excessiva no dono, falta de delegação, ausência de processos,
   reuniões improdutivas, retrabalho por comunicação falha.

PRINCÍPIO DA TEORIA DAS RESTRIÇÕES (TOC):
Existe sempre UM gargalo principal que limita o resultado de todo o sistema.
Melhorar qualquer outra parte sem resolver o gargalo é desperdício de esforço.

Como identificar o gargalo real:
- Onde o trabalho se acumula e espera? (fila = gargalo antes deste ponto)
- Qual etapa mais frequentemente atrasa a entrega final?
- Qual recurso está sempre sobrecarregado?
- Onde o dono passa a maior parte do tempo apagando incêndios?

MODELO DE CAUSA RAIZ vs. SINTOMA:
Donos quase sempre descrevem sintomas, não causas. Escave sempre.
Sintoma → Causa Próxima → Causa Raiz → Causa Sistêmica

Exemplo:
"Temos muito retrabalho" (sintoma)
→ "Os clientes sempre pedem mudanças" (causa próxima — culpa transferida)
→ "O briefing inicial é incompleto ou não é validado" (causa raiz)
→ "Não temos processo formal de alinhamento antes de iniciar" (causa sistêmica)

A causa sistêmica é sempre um processo ausente, uma decisão não tomada, ou um
comportamento do dono que se tornou cultura. NUNCA é "o cliente é difícil" ou
"o mercado está ruim".

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PARTE 2 — ANATOMIA FINANCEIRA DE UMA PME
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ESTRUTURA DA DRE:
FATURAMENTO BRUTO
(-) Impostos (Simples: 6–19,5% | Lucro Presumido: ~11,33% | Lucro Real: varia)
= RECEITA LÍQUIDA
(-) Custo do Serviço/Produto (CPV/CSV)
= LUCRO BRUTO
(-) Despesas Operacionais
= EBITDA
(-) Depreciação/amortização = EBIT
(-) Resultado financeiro = LAIR
(-) IR/CSLL = LUCRO LÍQUIDO

Quando um dono diz "minha margem é 20%", pergunte: 20% de quê? Bruta ou líquida?
A maioria não sabe responder. Isso é gargalo de gestão crítico.

PONTO DE EQUILÍBRIO (BREAK-EVEN):
PE = Custos Fixos ÷ Margem de Contribuição Unitária
Margem de Contribuição = Preço de Venda - Custos Variáveis Diretos

ARMADILHAS DE CAIXA:
1. LUCRO SEM CAIXA: prazo de recebimento >> prazo de pagamento. Capital de giro negativo.
2. CAIXA SEM LUCRO: adiantamentos ou empréstimo inflam o caixa. A conta vai chegar.
3. LUCRO COSMÉTICO: margem boa mas sem pró-labore real do sócio no custo.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PARTE 3 — PERGUNTAS CONFRONTADORAS UNIVERSAIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use estas perguntas em qualquer nicho para expor pontos cegos:

FINANCEIRO:
- "Se você tirar férias por 30 dias, o faturamento cai quanto %?" [dependência do dono; >30% = risco crítico]
- "Você sabe de cabeça sua margem líquida este mês?" [maturidade financeira]
- "Já deixou de contratar quem precisava e continuou fazendo o trabalho você mesmo?" [custo de oportunidade oculto]
- "Quanto do faturamento do próximo mês já está garantido hoje?" [<50% = sem recorrência]

PROCESSOS:
- "Qual tarefa semanal ninguém faria se você parasse — mas poderia ser delegada?" [gargalo humano]
- "Funcionário novo leva quanto tempo para produzir sem depender de você?" [>3 meses = sem processo]
- "Último erro que custou dinheiro: o que mudou desde então?" [loop de melhoria contínua]

CLIENTES:
- "Se perder o maior cliente amanhã, o que acontece?" [concentração de receita]
- "Por que compram de você e não do mais barato?" [clareza do diferencial]
- "Último cliente que você demitiu?" [nunca = aceita tudo = baixa margem]

EQUIPE:
- "Se sua melhor pessoa pedir demissão hoje, o que faz?" [dependência de talento]
- "Tem alguém que não demitiria mesmo com baixo desempenho?" [sequestro de conhecimento]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PARTE 4 — COMO CALCULAR PERDAS COM PRECISÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TIER 1 — CÁLCULO DIRETO (alta confiança):
Dados reais: quantidade × valor unitário = perda.
Ex: "3h retrabalho/semana × R$85/h × 4 sem = R$1.020/mês"
→ evidenceType: "fact", confidence: "high"

TIER 2 — ESTIMATIVA POR FAIXA (confiança média):
Dados parciais + % referência do setor.
Ex: "Faturamento R$150k/mês × retrabalho típico 8–15% = R$12k–22k/mês"
→ evidenceType: "estimate", confidence: "medium"

TIER 3 — INFERÊNCIA QUALITATIVA (baixa confiança):
Sem dados: descreva impacto sem inventar número.
→ evidenceType: "inference", confidence: "low"

REGRA DE OURO: É melhor dizer "não temos dados suficientes" do que inventar
um número impressionante que não seja defensável.
`;

serve(async (req) => {
  const origin = req.headers.get("Origin") ?? "";
  const corsHeaders = {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers": CORS_ALLOW_HEADERS,
  };

  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, context } = await req.json();
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not configured");

    if (action === "run_qualification") {
      const { companyName, niche, qualAnswers, totalScore, level } = context;
      const levelLabel = level === 'alta' ? 'ALTA' : level === 'media' ? 'MÉDIA' : 'BAIXA';
      const answersList = Array.isArray(qualAnswers) ? qualAnswers : [];

      const systemPrompt = `Você é o motor de qualificação da CALIGON, plataforma de diagnóstico operacional.
Analise as respostas do questionário e gere um relatório objetivo, direto e honesto.

EMPRESA: ${companyName || 'Não informado'}
NICHO: ${niche || 'Não informado'}
SCORE TOTAL: ${totalScore ?? 0}/30
CLASSIFICAÇÃO: ${levelLabel}

RESPOSTAS:
${answersList.map((qa: any) => `[${qa.category}] ${qa.question}\nResposta: ${qa.answer} (score: ${qa.score})`).join('\n\n')}

Não seja condescendente nem genérico.
- Score BAIXO: diga claramente o que está faltando para um diagnóstico preciso.
- Score MÉDIO: aponte o que sustenta e o que ainda fragiliza.
- Score ALTO: confirme os pontos fortes e sinalize o que ainda pode ser aprimorado.

Responda APENAS com JSON válido (sem markdown, sem texto fora do JSON):
{
  "summary": "2-3 frases diretas sobre a situação desta empresa para o diagnóstico",
  "strengths": ["até 3 pontos fortes reais baseados nas respostas"],
  "risks": ["até 3 riscos reais baseados nas respostas"],
  "recommendation": "Uma frase direta sobre o próximo passo ideal para esta empresa"
}`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 2048,
          system: systemPrompt,
          messages: [
            { role: "user", content: "Gere a análise de qualificação." },
          ],
          temperature: 0.5,
        }),
      });

      if (!response.ok) {
        const errBody = await response.text().catch(() => "");
        console.error("[run_qualification] Anthropic error:", response.status, errBody);
        if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error(`Anthropic API error ${response.status}: ${errBody.slice(0, 200)}`);
      }

      const data = await response.json();
      const content = data.content?.[0]?.text || "";
      let parsed: any;
      try {
        parsed = JSON.parse(content);
      } catch {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error("[run_qualification] No JSON found in:", content.slice(0, 300));
          throw new Error("Failed to parse AI response");
        }
        parsed = JSON.parse(jsonMatch[0]);
      }

      // Garantia de schema mínimo
      const safe = {
        summary: parsed.summary || "Análise indisponível.",
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 3) : [],
        risks: Array.isArray(parsed.risks) ? parsed.risks.slice(0, 3) : [],
        recommendation: parsed.recommendation || "",
      };

      return new Response(JSON.stringify(safe), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "generate_question") {
      const { niche, companyName, process, employees, revenue, phase, previousQA, questionsAsked, metrics, initialContext, documents, userMode } = context;
      const isSelfServe = userMode === "selfserve";

      const selfServePreamble = isSelfServe ? `
═══════════════════════════════════════════════════════
MODO SELF-SERVE — CLIENTE RESPONDE SEM ANALISTA
═══════════════════════════════════════════════════════

ATENÇÃO: Este questionário está sendo respondido diretamente pelo dono ou gestor
da empresa, sem mediação de analista. Adapte TODAS as perguntas obrigatoriamente:

LINGUAGEM:
- Proibido usar jargões de consultoria sem explicação
- Proibido usar siglas sem explicar (ex: "taxa de churn" → "de cada 10 clientes, quantos cancelam ou deixam de comprar por mês?")
- Tom amigável e encorajador, como um mentor, não como auditor
- Perguntas curtas: máximo 25 palavras por pergunta
- Se usar termo técnico, explicar entre parênteses imediatamente

FORMATO PRIORITÁRIO (nesta ordem):
1. Múltipla escolha com 3-4 opções claras + sempre incluir "Outro (descreva)"
2. Escala 1-5 com âncoras nos extremos bem explicadas
3. Sim / Não / Às vezes
4. Campo aberto APENAS quando nenhum formato estruturado for adequado

LIMITE DE PERGUNTAS: máximo 35 perguntas no total. Seja seletivo e priorize
as que mais impactam o diagnóstico financeiro.

RULE DE SKIP: Se o cliente responder "não sei", "não tenho esse dado", "PULADO" ou similar:
- Primeira ocorrência: reformule simplesmente OU ofereça estimativa por faixa
- Segunda ocorrência no mesmo tema: avance imediatamente. PROIBIDO insistir 3 vezes.
` : "";

      const metricsContext = metrics ? Object.entries(metrics)
        .map(([key, val]: [string, any]) => {
          if (val.status === 'declined') return `${key}: NÃO DESEJOU INFORMAR`;
          if (val.value !== null && val.value !== undefined) return `${key}: ${val.value} ${val.unit || ''}`;
          return null;
        }).filter(Boolean).join('\n') : 'Nenhuma métrica cadastrada';

      const nicheKnowledge = getNicheKnowledge(niche);

      const phaseLabel = phase === "triage" ? "Triagem Rápida" : phase === "deep" ? "Aprofundamento Operacional" : phase === "loss_measurement" ? "Mensuração de Perdas Financeiras" : phase === "risk_analysis" ? "Análise de Riscos" : "Específico por Nicho";

      const systemPrompt = `${selfServePreamble}${UNIVERSAL_INTELLIGENCE}

Você é o motor de questionário inteligente do CALIGON, uma plataforma de inteligência operacional.
Seu papel é fazer perguntas incisivas, profundas e relevantes para diagnosticar gargalos operacionais E COLETAR DADOS FINANCEIROS para sustentar cálculos de perdas.

EMPRESA: ${companyName}
NICHO: ${niche}
PROCESSO ANALISADO: ${process}
FUNCIONÁRIOS: ${employees}
FATURAMENTO: ${revenue}
FASE ATUAL: ${phaseLabel}
PERGUNTAS JÁ FEITAS: ${questionsAsked}

CONTEXTO INICIAL INFORMADO PELO USUÁRIO:
${initialContext || "Nenhum contexto informado."}

DOCUMENTOS ENVIADOS PELO USUÁRIO:
${documents || "Nenhum documento enviado."}

MÉTRICAS FINANCEIRAS E OPERACIONAIS JÁ CADASTRADAS:
${metricsContext}

═══════════════════════════════════════
CONHECIMENTO ESPECÍFICO DO NICHO: ${niche.toUpperCase()}
═══════════════════════════════════════
${nicheKnowledge}

RESPOSTAS ANTERIORES:
${previousQA.map((qa: any, i: number) => `P${i + 1} [${qa.category}]: ${qa.question}\nR: ${qa.answer}`).join("\n\n")}

REGRAS:
1. Faça UMA pergunta por vez
2. Adapte o tipo de pergunta ao contexto:
   - "open" para respostas detalhadas
   - "multiple_choice" para opções claras (forneça 3-5 opções)
   - "scale" para avaliações numéricas (1-10)
3. NÃO repita perguntas já feitas

COBERTURA OBRIGATÓRIA POR FASE:

FASE 1 — TRIAGEM RÁPIDA (perguntas 1-13):
Objetivo: mapa inicial completo do processo, equipe e tecnologia.
- Visão geral do processo analisado (fluxo completo de ponta a ponta)
- Principais dores relatadas pelo dono
- Estrutura de equipe (quem faz o quê, quantas pessoas por etapa)
- Tecnologia usada (sistemas, ferramentas, automações existentes)
- Volume de operações (quantas transações, pedidos, atendimentos por mês)
- Quem são os stakeholders do processo (quem decide, quem executa, quem aprova)
- Tempo médio de cada etapa principal
- Quais etapas dependem exclusivamente do dono ou de uma pessoa-chave
- Quais partes do processo são feitas manualmente e poderiam ser automatizadas
- Qual etapa gera mais reclamação interna (da equipe) e externa (dos clientes)
- O que acontece quando a pessoa-chave está ausente
- Qual foi o último problema sério neste processo e o que causou
- Qual métrica o dono usa para saber se este processo está funcionando bem

FASE 2 — APROFUNDAMENTO OPERACIONAL (perguntas 14-28):
Objetivo: dissecar o processo em detalhe máximo para identificar causa raiz.
- Fluxo detalhado etapa por etapa (responsável, tempo, ferramenta, critério de conclusão)
- Pontos de retrabalho: onde o trabalho é refeito, com qual frequência
- Pontos de espera: onde o processo para aguardando aprovação, informação ou recurso
- Aprovações e gargalos de decisão: quem aprova o quê e quanto tempo leva
- Comunicação entre áreas: como as informações são passadas, onde se perdem
- Dependência de pessoas-chave: o que para quando alguém falta
- Falhas de processo relatadas nos últimos 3 meses
- CAUSALIDADE PROFUNDA: para cada problema identificado, perguntar "por que isso acontece?" e "o que gerou isso originalmente?"
- Capacidade atual vs. capacidade máxima do processo
- O que o processo consome de tempo do dono por semana (horas)
- Quais decisões que deveriam ser delegadas ainda ficam com o dono
- Como novos funcionários aprendem este processo (existe documentação?)
- O que já foi tentado para melhorar e por que não funcionou
- Qual seria o impacto imediato se este processo parasse completamente por 1 semana
- Em qual etapa o cliente mais percebe falhas ou atrasos

FASE 3 — MENSURAÇÃO DE PERDAS FINANCEIRAS (perguntas 29-40):
Objetivo: quantificar com máxima precisão as perdas geradas pelos gargalos.
OBRIGATÓRIO COLETAR DADOS FINANCEIROS (se ainda não informados nas métricas):
- Faturamento médio mensal (confirmar ou aprofundar o já informado)
- Ticket médio do produto/serviço principal
- Margem de lucro estimada (bruta e líquida se possível)
- Tempo médio gasto por tarefa/operação problemática
- Frequência do problema (vezes por semana/mês)
- Percentual de operações com retrabalho
- Custo médio da hora da equipe envolvida no processo
- Impacto estimado em receita perdida por mês
- Taxa de erro ou devolução
- Capacidade operacional usada vs. disponível (%)
- Conversão (se processo comercial) — de X oportunidades, quantas viram cliente
- Custo de aquisição de cliente (CAC), churn, SLA quando aplicável ao nicho
COMPORTAMENTO INTELIGENTE:
- Se o usuário não souber um dado financeiro, reformule de forma simples
- Tente extrair por aproximação ("mais ou menos quanto?", "faixa de valor?")
- Ofereça perguntas auxiliares para derivar o valor
- Permita respostas por faixa ("entre X e Y")
- Explique o que significa o termo se for técnico
- REGRA: NÃO pergunte sobre dados já informados nas métricas do cadastro

FASE 4 — ESPECÍFICO POR NICHO (perguntas 41-50):
Objetivo: explorar padrões, benchmarks e pontos cegos específicos do setor.
- Perguntas altamente especializadas usando o conhecimento profundo do nicho
- Benchmarks do setor para comparação direta ("empresas similares costumam ter X")
- Métricas específicas do nicho que ainda não foram abordadas
- Padrões de comportamento típicos do nicho que podem estar presentes
- Sazonalidade e como afeta o processo
- Regulamentações ou exigências do setor que impactam o processo
- Comparação com o que seria "classe mundial" neste nicho
- Quais ferramentas/sistemas são padrão de mercado neste nicho e se estão sendo usados
- O que donos deste nicho normalmente subestimam no processo analisado
- Qual a principal alavanca de crescimento neste nicho que este processo afeta diretamente

FASE 5 — ANÁLISE DE RISCOS (perguntas 51-57):
Objetivo: mapear riscos sistêmicos, de dependência e de implementação.
- Risco de dependência: se uma pessoa-chave sair amanhã, o que para? Por quanto tempo?
- Risco financeiro: qual o maior risco financeiro não endereçado neste processo?
- Risco de cliente: o que neste processo ameaça diretamente a satisfação ou retenção do cliente?
- Risco de escala: se a empresa dobrar de tamanho, este processo aguenta? O que quebraria primeiro?
- Risco de conformidade: há alguma obrigação legal, fiscal ou regulatória sendo negligenciada neste processo?
- Risco de concentração: existe uma única pessoa, ferramenta ou fornecedor que, se falhar, paralisa tudo?
- Pergunta de fechamento: "Se você tivesse que identificar o único ponto que, se não for corrigido, pode comprometer seriamente a empresa nos próximos 12 meses, qual seria?"

4. SKIP INTELIGENTE — REGRA OBRIGATÓRIA:
   Se o usuário responder algo equivalente a "não sei", "não tenho esse dado", "não consigo responder", "não sei calcular":
   - 1ª ocorrência no MESMO TEMA: reformule mais simples OU ofereça estimativa por faixa ("Entre R$X e R$Y?").
   - 2ª ocorrência no MESMO TEMA: registre internamente como DADO_AUSENTE, AVANCE para outro tema. NÃO insista uma 3ª vez.
   - Nunca repita a mesma métrica/tema mais de 2 vezes. Insistir é comportamento PROIBIDO.
5. Explique brevemente seu raciocínio para o analista
6. Priorize perguntas que revelem: retrabalho, esperas, aprovações excessivas, dependência do dono, tarefas manuais repetitivas, falhas de comunicação, PERDAS FINANCEIRAS MENSURÁVEIS
7. Na fase de mensuração, SEMPRE tente identificar CAUSA RAIZ vs SINTOMA nas respostas anteriores
8. REGRA DE MÉTRICAS CADASTRADAS: NÃO pergunte novamente sobre dados que já foram informados nas métricas. Em vez disso:
   - Use os dados já cadastrados como base
   - Aprofunde apenas o que está FALTANDO ou INCONSISTENTE
   - Confirme dados que parecem incoerentes com as respostas
   - Se houver conflito entre métrica cadastrada e resposta, peça confirmação
9. REGRA DE DOCUMENTOS: Se documentos foram enviados, CRUZE informações:
   - "No documento enviado consta X, mas você respondeu Y. Pode confirmar?"
   - "Com base no documento A, identifiquei esse possível ponto. Isso procede?"

Responda APENAS em JSON:
{
  "question": "texto da pergunta",
  "type": "open" | "multiple_choice" | "scale",
  "options": ["opção1", ...],
  "category": "operação" | "equipe" | "tecnologia" | "decisões" | "financeiro" | "gargalos" | "comercial" | "atendimento" | "mensuração" | "riscos",
  "reasoning": "explicação do porquê desta pergunta",
  "isAdaptive": true/false,
  "confidence": "high" | "medium" | "low"
}`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1024,
          system: systemPrompt,
          messages: [
            { role: "user", content: "Gere a próxima pergunta do questionário." },
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error(`Anthropic API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.content?.[0]?.text || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Failed to parse AI response");
      const parsed = JSON.parse(jsonMatch[0]);

      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "run_diagnosis") {
      const { analysisId, niche, companyName, process, questionnaire, documents, employees, revenue, metrics, qualificationContext } = context;

      const metricsBlock = metrics ? Object.entries(metrics)
        .map(([key, val]: [string, any]) => {
          if (val.status === 'declined') return `- ${key}: NÃO INFORMADO (recusado pelo usuário)`;
          if (val.value !== null && val.value !== undefined) return `- ${key}: ${val.value} ${val.unit || ''} [origem: ${val.origin || 'manual'}]`;
          return null;
        }).filter(Boolean).join('\n') : 'Nenhuma métrica cadastrada';

      const qualBlock = qualificationContext ? `
═══════════════════════════════════════
QUALIFICAÇÃO PRÉ-DIAGNÓSTICO
═══════════════════════════════════════
${qualificationContext}

Use estas informações para:
- Calibrar o nível de precisão financeira esperado (cliente com score baixo = menos dados disponíveis)
- Entender o nível de abertura do dono para mudanças
- Ajustar a profundidade das recomendações ao porte real da empresa
` : '';

      const systemPrompt = `${UNIVERSAL_INTELLIGENCE}

Você é o motor de diagnóstico do CALIGON. Analise PROFUNDAMENTE os dados coletados e gere um diagnóstico com ESTRUTURA CAUSAL RIGOROSA e PRECISÃO FINANCEIRA PROPORCIONAL À EVIDÊNCIA.
${qualBlock}

EMPRESA: ${companyName}
NICHO: ${niche}
PROCESSO: ${process}
FUNCIONÁRIOS: ${employees || "Não informado"}
FATURAMENTO: ${revenue || "Não informado"}

═══════════════════════════════════════
MÉTRICAS FINANCEIRAS E OPERACIONAIS CADASTRADAS
═══════════════════════════════════════
${metricsBlock}

IMPORTANTE: Use OBRIGATORIAMENTE estas métricas como base para todos os cálculos financeiros.
- Métricas com valor informado → usar como DADO REAL (evidenceType: "fact", confidence: "high")
- Métricas recusadas → sinalizar como DADO AUSENTE e reduzir confiança
- Métricas não preenchidas → podem ser inferidas com confiança "low"

RESPOSTAS DO QUESTIONÁRIO:
${questionnaire.map((qa: any) => `[${qa.category}] P: ${qa.question}\nR: ${qa.answer}`).join("\n\n")}

${documents ? `DOCUMENTOS ANALISADOS:\n${documents}` : ""}

═══════════════════════════════════════
CONHECIMENTO ESPECÍFICO DO NICHO: ${niche.toUpperCase()}
═══════════════════════════════════════
${getNicheKnowledge(niche)}

═══════════════════════════════════════
MODELO DIAGNÓSTICO OBRIGATÓRIO — 3 CAMADAS
═══════════════════════════════════════

CAMADA 1 — CAUSA RAIZ: Problema estrutural que origina os demais efeitos.
CAMADA 2 — SINTOMA OPERACIONAL: Efeito visível no processo, decorrente da causa raiz.
CAMADA 3 — IMPACTO FINANCEIRO: Consequência econômica causada direta ou indiretamente.

REGRAS DE CAUSALIDADE:
- Identifique O GARGALO DOMINANTE (a causa raiz principal).
- Separe gargalos secundários e efeitos derivados.
- Construa uma ÁRVORE CAUSAL mostrando as relações.
- Classifique cada gargalo como: "causa_raiz", "sintoma_operacional" ou "impacto_financeiro".

═══════════════════════════════════════
REGRA ANTI-DUPLA CONTAGEM
═══════════════════════════════════════

- A CAUSA RAIZ carrega o impacto principal.
- Sintomas derivados NÃO devem repetir integralmente a mesma perda.
- O total NÃO pode ser a soma de todos os sintomas individualmente.

═══════════════════════════════════════
GATE DE CONFIABILIDADE FINANCEIRA
═══════════════════════════════════════

Antes de calcular perdas, avalie se há dados mínimos:
- Faturamento: ${revenue || "NÃO INFORMADO"}
- Funcionários: ${employees || "NÃO INFORMADO"}

RESULTADO DO GATE:
- "sim": dados fortes → VALOR EXATO
- "parcial": dados parciais → FAIXA ESTIMADA (min-max)
- "nao": dados fracos → TENDÊNCIA QUALITATIVA

═══════════════════════════════════════
CLASSIFICAÇÕES OBRIGATÓRIAS
═══════════════════════════════════════

TIPO DE EVIDÊNCIA: "dado_informado" | "relato_operacional" | "inferencia" | "benchmark" | "hipotese"
CONFIANÇA: "high" | "medium" | "low"
TIPO DE CÁLCULO: "calculo_direto" | "estimativa_aproximacao" | "inferencia_operacional" | "benchmark_nicho" | "hipotese_qualitativa"
FONTE: "questionario" | "cadastro" | "documento" | "inferencia_ia" | "benchmark"

═══════════════════════════════════════
ROADMAP DE RECOMENDAÇÕES POR FASES
═══════════════════════════════════════

FASE 1 — ESTABILIZAÇÃO: Corrige origem do caos, elimina ruptura básica.
FASE 2 — PADRONIZAÇÃO: Define fluxo mínimo, critérios, cadência, responsabilidades.
FASE 3 — AUTOMAÇÃO: Automatiza o que já estiver estável e padronizado.
FASE 4 — OTIMIZAÇÃO: Aprimora eficiência, escala, margem e inteligência operacional.

REGRA: NÃO sugerir automação avançada ANTES de estabilizar o básico.

═══════════════════════════════════════
TO-BE FACTÍVEL E REGRAS DE FLUXOGRAMA
═══════════════════════════════════════

O TO-BE deve respeitar maturidade atual, capacidade de implantação, dependências reais e limitações do time.
Gerar 3 visões: AS-IS, TO-BE factível, e notas de transição.

REGRAS OBRIGATÓRIAS DE POSICIONAMENTO DOS NÓS (top-down):
- Cada nó DEVE ter "position": { "x": number, "y": number }.
- Nós seguem ordem hierárquica de cima para baixo: y=50 (início), y=170, y=290, y=410, y=530, y=650, y=770... (incremento de 120).
- Nós paralelos no mesmo nível: mesmo Y, X separado por no mínimo 240 (ex: x=100, x=340, x=580).
- Nó único centralizado: x=300.
- NUNCA repita as mesmas coordenadas para nós diferentes.
- Máximo 12 nós por fluxograma. Label curto (máx. 5 palavras).
- Marcar bottleneck=true em gargalos, automation=true em automações, wait=true em esperas.

═══════════════════════════════════════
SCORES HONESTOS
═══════════════════════════════════════

Todos os scores são HEURÍSTICOS. Cada score deve ter: base, o que faltou, confiança.

═══════════════════════════════════════
VALIDAÇÃO DIAGNÓSTICA
═══════════════════════════════════════

Antes de finalizar, valide:
1. Há dupla contagem de perdas? → Consolidar
2. Há dados mínimos para os cálculos? → Ajustar precisão
3. Os scores são coerentes com os achados? → Corrigir
4. O roadmap respeita a maturidade? → Reordenar
5. O TO-BE é factível? → Simplificar
6. Há excesso de certeza sem evidência? → Rebaixar confiança

Retorne JSON com esta estrutura EXATA:
{
  "executiveSummary": "resumo executivo em 3-5 frases, INCLUINDO nível de confiança geral e ressalvas sobre dados",
  "aiReasoning": "raciocínio detalhado da análise causal",
  "chaosScore": number (0-100),
  "financialGate": "sim|parcial|nao",
  "financialAnalysis": {
    "monthlyLoss": number,
    "annualLoss": number,
    "potentialSaving": number,
    "roi": number,
    "payback": "prazo estimado",
    "calculationMethod": "como foi calculado o total",
    "dataQuality": "high|medium|low",
    "premises": ["premissa 1", "premissa 2"],
    "displayMode": "exact|range|qualitative",
    "rangeMin": number,
    "rangeMax": number
  },
  "causalTree": [
    {
      "id": "bt_1",
      "title": "título",
      "layer": "causa_raiz|sintoma_operacional|impacto_financeiro",
      "parentId": null,
      "isDominant": true/false,
      "children": ["bt_2", "bt_3"]
    }
  ],
  "validationResult": {
    "doubleCounting": {"found": boolean, "action": "descrição da ação tomada"},
    "minimumData": {"status": "sim|parcial|nao", "missing": ["dado faltante"]},
    "scoreCoherence": {"passed": boolean, "notes": "observações"},
    "roadmapCoherence": {"passed": boolean, "notes": "observações"},
    "toBeFactibility": {"passed": boolean, "notes": "observações"},
    "excessCertainty": {"found": boolean, "adjustments": ["ajuste feito"]}
  },
  "scores": [
    {
      "label": "nome",
      "value": number (0-100),
      "description": "descrição",
      "confidence": "high|medium|low",
      "basis": "o que sustentou este score",
      "missingData": "o que faltou para ser mais preciso",
      "isHeuristic": true,
      "factors": [{"label": "fator", "impact": "up|down", "detail": "detalhe"}]
    }
  ],
  "bottlenecks": [
    {
      "title": "título",
      "category": "categoria",
      "severity": "critical|high|medium|low",
      "layer": "camada de análise",
      "causalLayer": "causa_raiz|sintoma_operacional|impacto_financeiro",
      "causalParentId": "bt_X ou null se for raiz",
      "causalOrder": number,
      "isDominant": boolean,
      "estimatedLoss": number (mensal),
      "annualLoss": number,
      "lossDisplayMode": "exact|range|qualitative",
      "lossRangeMin": number,
      "lossRangeMax": number,
      "confidence": "high|medium|low",
      "evidenceType": "fact|inference|hypothesis",
      "calculationType": "calculo_direto|estimativa_aproximacao|inferencia_operacional|benchmark_nicho|hipotese_qualitativa",
      "source": "questionario|cadastro|documento|inferencia_ia|benchmark",
      "description": "descrição detalhada",
      "behaviorDescription": "qual comportamento gera esta perda",
      "calculationFormula": "fórmula usada",
      "calculationPremises": [
        {"label": "nome do dado", "value": "valor usado", "source": "questionário|estimativa|benchmark", "confidence": "high|medium|low"}
      ]
    }
  ],
  "recommendations": [
    {
      "title": "título (max 8 palavras)",
      "problem": "problema resolvido",
      "evidenceType": "fact|inference|hypothesis",
      "confidence": "high|medium|low",
      "impact": "critical|high|medium|low",
      "difficulty": "easy|medium|hard",
      "category": "corte|simplificacao|automacao|delegacao|reestruturacao|acompanhamento",
      "roadmapPhase": "estabilizacao|padronizacao|automacao|otimizacao",
      "phaseOrder": number,
      "priority": number (1 = mais prioritária),
      "dependencies": ["dependência 1"],
      "anticipationRisk": "risco de implantar antes do tempo",
      "estimatedSaving": number (mensal),
      "estimatedCost": number,
      "savingDisplayMode": "exact|range|qualitative",
      "savingRangeMin": number,
      "savingRangeMax": number,
      "calculationType": "calculo_direto|estimativa_aproximacao|inferencia_operacional|benchmark_nicho|hipotese_qualitativa",
      "source": "questionario|cadastro|documento|inferencia_ia|benchmark",
      "timeframe": "1-3 dias|1-2 semanas|2-4 semanas|1-3 meses",
      "isQuickWin": boolean,
      "justification": "justificativa",
      "area": "área",
      "process": "processo",
      "risk": "risco",
      "roiPercentage": number,
      "paybackMonths": number,
      "calculationExplanation": "explicação detalhada incluindo dados usados, fórmula e premissas",
      "howToImplement": [
        "Passo 1: instrução ESPECÍFICA e ACIONÁVEL para este negócio (não genérica)",
        "Passo 2: instrução específica usando os dados reais do questionário",
        "Passo 3: instrução específica",
        "Passo 4: opcional"
      ],
      "toolsRequired": ["Ferramenta/recurso 1", "Ferramenta 2"],
      "expectedResult": "Resultado mensurável esperado quando implementado com sucesso",
      "warning": "Risco ou cuidado ao implementar (ou null)"
    }
  ],
  "flowchartAsIs": {
    "nodes": [{"id": "string", "type": "process|decision|startEnd", "label": "texto curto (max 5 palavras)", "responsible": "quem", "time": "tempo", "bottleneck": boolean, "automation": boolean, "wait": boolean, "position": {"x": number, "y": number}}],
    "edges": [{"source": "id", "target": "id", "label": "texto"}]
  },
  "flowchartToBe": {
    "nodes": [{"id": "string", "type": "process|decision|startEnd", "label": "texto curto (max 5 palavras)", "responsible": "quem", "time": "tempo", "bottleneck": false, "automation": boolean, "wait": false, "transitionNote": "nota de transição", "position": {"x": number, "y": number}}],
    "edges": [{"source": "id", "target": "id", "label": "texto"}]
  },
  "lossCalculationSummary": {
    "confirmedLosses": number,
    "estimatedLosses": number,
    "hypotheticalLosses": number,
    "totalMonthly": number,
    "totalAnnual": number,
    "methodology": "descrição da metodologia",
    "antiDoubleCountingNote": "como a dupla contagem foi evitada"
  }
}`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 8192,
          system: systemPrompt,
          messages: [
            { role: "user", content: "Execute o diagnóstico completo. Retorne APENAS JSON válido contendo TODOS os campos do schema, com bottlenecks (mínimo 3), recommendations (mínimo 3), scores e os dois fluxogramas. Não trunque o JSON." },
          ],
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const errBody = await response.text().catch(() => "");
        console.error("[run_diagnosis] Anthropic error:", response.status, errBody);
        if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error(`Anthropic API error ${response.status}: ${errBody.slice(0, 200)}`);
      }

      const data = await response.json();
      const content = data.content?.[0]?.text || "";
      let parsed: any;
      try {
        parsed = JSON.parse(content);
      } catch {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error("[run_diagnosis] No JSON in response. Length:", content.length, "Sample:", content.slice(0, 300));
          throw new Error("Failed to parse diagnosis — resposta da IA não pôde ser interpretada. Tente novamente.");
        }
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error("[run_diagnosis] JSON parse error:", e instanceof Error ? e.message : String(e), "Length:", jsonMatch[0].length);
          throw new Error("JSON do diagnóstico veio truncado/inválido. Tente novamente.");
        }
      }

      console.log("[run_diagnosis] Parsed bottlenecks:", parsed.bottlenecks?.length || 0, "recommendations:", parsed.recommendations?.length || 0);

      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// BASE DE CONHECIMENTO POR NICHO — NÍVEL CONSULTORIA SÊNIOR
// ═══════════════════════════════════════════════════════════════
function getNicheKnowledge(niche: string): string {
  const knowledge: Record<string, string> = {

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RESTAURANTE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Restaurante": `
GARGALOS ESTRUTURAIS POR CAMADA CAUSAL:

CAUSA RAIZ:
1. Ausência de ficha técnica por prato → impossível controlar CMV, precificar corretamente e treinar cozinha
2. Centralização de compras no dono → gera atrasos, compras emergenciais com sobrepreço, e impede que o dono foque em gestão
3. Falta de processo de abertura/fechamento do caixa → divergências financeiras não rastreáveis

SINTOMAS OPERACIONAIS:
- Comunicação falha salão-cozinha → pedidos errados, atraso na entrega, insatisfação
- Retrabalho por anotação manual de pedidos → perda de tempo, erro de preparo
- Tempo morto entre turnos sem aproveitamento → custo fixo sem geração de receita
- Rotatividade alta de equipe → custo de recrutamento e treinamento constante

IMPACTOS FINANCEIROS:
- CMV descontrolado: sem ficha técnica, a margem varia entre 25% e 50% sem que o dono perceba
- Desperdício de matéria-prima: tipicamente 3-8% do faturamento em restaurantes sem controle
- Perda de clientes por tempo de espera: acima de 25min pedido-mesa, taxa de não retorno sobe 40%

BENCHMARKS BRASILEIROS (fontes: ABRASEL, Sebrae, GS&Consult):
- CMV ideal: 28-35% (acima de 38% é alerta crítico)
- Rotatividade aceitável: <30%/ano (média do setor: 45-60%)
- Tempo pedido-mesa: <20min para à la carte, <10min para fast food
- Ticket médio: varia por tipo, mas crescimento trimestral <5% indica estagnação
- Margem líquida saudável: 8-15% (maioria opera entre 3-8%)
- Ocupação ideal: >70% nos horários de pico
- Percentual folha de pagamento: 25-35% do faturamento

FÓRMULAS DE CÁLCULO DE PERDA:
- Perda por CMV descontrolado: (CMV_real - CMV_ideal) × faturamento_mensal
  Ex: (42% - 32%) × R$150k = R$15.000/mês de perda evitável
- Perda por desperdício: taxa_desperdicio × custo_insumos_mensal
  Ex: 5% × R$52k = R$2.600/mês
- Perda por rotatividade: (demissões_ano × custo_reposição) / 12
  Custo reposição = 1.5 a 3 salários (recrutamento + treinamento + produtividade perdida)
- Perda por tempo ocioso: horas_ociosas_dia × custo_hora_equipe × dias_mês
- Perda por pedidos errados: taxa_erro × pedidos_dia × custo_medio_prato × 22 dias

PERGUNTAS-CHAVE PARA ESTE NICHO:
- "Você sabe o CMV de cada prato do cardápio, ou só o CMV geral?"
- "Quem decide o que comprar e quanto comprar? Existe lista de compras padronizada?"
- "Quantos pratos são devolvidos ou refeitos por dia?"
- "Qual o tempo médio entre o cliente sentar e receber o prato?"
- "Quantos funcionários saíram nos últimos 6 meses? Por quê?"
- "Você sabe qual é o prato mais rentável do cardápio? E o menos rentável?"
`,

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CLÍNICA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Clínica": `
GARGALOS ESTRUTURAIS POR CAMADA CAUSAL:

CAUSA RAIZ:
1. Ausência de protocolo de confirmação automatizado → no-show alto consome slots de agenda
2. Prontuário em papel ou sistema fragmentado → informação perdida, retrabalho, risco legal
3. Agenda sem otimização de encaixe → capacidade desperdiçada entre consultas

SINTOMAS OPERACIONAIS:
- Recepção sobrecarregada com tarefas manuais (confirmação, agendamento, cobrança)
- Falta de protocolos clínicos padronizados → variação na qualidade do atendimento
- Dependência de profissional-chave → se falta, a clínica para
- Tempo de espera do paciente acima do aceitável → insatisfação e churn

IMPACTOS FINANCEIROS:
- Cada slot vazio por no-show = receita perdida irreversível
- Reagendamentos consomem tempo administrativo sem gerar receita
- Pacientes insatisfeitos por espera não voltam e não indicam

BENCHMARKS BRASILEIROS (fontes: CFM, ANS, Sebrae Saúde):
- No-show aceitável: <10% (média do mercado: 15-25%)
- Ocupação de agenda: >85% para viabilidade financeira
- Tempo de espera: <15min (acima de 30min, 35% dos pacientes consideram trocar)
- Taxa de retorno: >60% dos pacientes devem retornar em 12 meses
- Custo de aquisição de paciente: R$80-300 dependendo da especialidade
- Margem líquida saudável: 15-30%
- Ticket médio por consulta: R$150-500 dependendo da especialidade

FÓRMULAS DE CÁLCULO DE PERDA:
- Perda por no-show: taxa_noshow × consultas_dia × valor_consulta × 22 dias
  Ex: 20% × 15 consultas × R$250 × 22 = R$16.500/mês
- Perda por ociosidade de agenda: (1 - taxa_ocupacao) × slots_disponiveis × valor_medio × 22
- Perda por churn: pacientes_perdidos_mes × LTV_medio_paciente
- Custo administrativo de reagendamento: tempo_medio_reagendar × custo_hora_recepção × reagendamentos_dia × 22

PERGUNTAS-CHAVE PARA ESTE NICHO:
- "Qual sua taxa de no-show atual? Como confirma consultas?"
- "Se um profissional falta, o que acontece com os pacientes dele?"
- "Quanto tempo em média o paciente espera além do horário marcado?"
- "Você sabe o LTV (valor ao longo do tempo) de um paciente fiel?"
- "Quanto custa trazer um paciente novo vs. manter um existente?"
`,

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AGÊNCIA (conhecimento profundo — nível consultoria sênior)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Agência": `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONHECIMENTO PROFUNDO — AGÊNCIAS BRASILEIRAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Perfil desta base: Agências médias, 10–30 pessoas, R$50k–300k/mês de faturamento,
mercado brasileiro. Cobre: agências de marketing digital, performance, criativas,
full service, conteúdo, SEO, desenvolvimento, consultoria de negócios.

════════════════════════════════════════
1. COMO UMA AGÊNCIA REALMENTE FUNCIONA
════════════════════════════════════════

MODELOS DE RECEITA (e seus riscos específicos):

RETAINER MENSAL (mais comum no Brasil):
Cliente paga valor fixo mensal por um pacote de serviços.
Vantagem: previsibilidade de receita, planejamento de equipe possível.
Risco principal: escopo não definido com precisão vira "cliente que pede tudo"
sem limite, erodindo a margem mês a mês.
Benchmark BR: Retainers bem geridos têm margem de 35–55%. Retainers sem controle
de escopo caem para 10–20% ou menos.

PROJETO (mais arriscado):
Cliente paga por entrega única (website, campanha, branding).
Vantagem: ticket mais alto por transação.
Risco principal: escopo creep, prazo estourado, aprovações intermináveis.
Benchmark BR: Projetos sem gestão de escopo têm 40–60% de chance de terminar
no prejuízo ou na margem zero, segundo pesquisas da ABAP e consultores do setor.

PERFORMANCE/SUCCESS FEE:
Agência recebe percentual sobre resultado gerado (vendas, leads, ROAS).
Vantagem: alinhamento de incentivo com cliente.
Risco principal: dependência de fatores fora do controle da agência
(produto ruim, preço, estoque, atendimento do cliente).
Benchmark BR: Funciona bem acima de 15% de comissão sobre receita gerada,
com cap de proteção se o cliente escalar muito. Abaixo disso, não compensa
o risco de variabilidade de caixa.

HORA TRABALHADA (billing by hour):
Agência cobra por hora consumida.
Vantagem: protege contra escopo aberto.
Risco principal: cliente resiste culturalmente no Brasil ("fico monitorado?"),
equipe sem incentivo para ser eficiente (mais horas = mais receita).
Benchmark BR: Mais comum em consultorias de TI e jurídicas. Raríssimo em
agências criativas e de marketing no Brasil — culturalmente mal aceito.

════════════════════════════════════════
2. BENCHMARKS BRASILEIROS JUSTIFICADOS
════════════════════════════════════════

TAXA DE UTILIZAÇÃO DA EQUIPE:
Benchmark: 65–75% de horas faturáveis sobre horas disponíveis.
Por que 65–75% e não 100%: 100% é matematicamente impossível de sustentar.
Toda equipe tem: reuniões internas (~10%), treinamento e desenvolvimento (~5%),
prospecção e propostas (~8%), gestão administrativa (~7%), imprevistos (~5%).
Sobram ~65–75% para horas faturáveis. Agências que dizem ter utilização de 90%+
estão ou mentindo, ou queimando a equipe (alta rotatividade vem em seguida).
Abaixo de 55%: equipe superdimensionada ou carteira de clientes insuficiente.
Cálculo de perda: (65% - taxa_atual) × horas_disponíveis × custo_hora_equipe = perda mensal.

MARGEM BRUTA (sobre receita líquida, excluindo impostos):
Agência saudável: 50–65%
Agência em risco: 35–50%
Agência em crise: abaixo de 35%
Por que importa: Margem bruta = Receita - Custo direto dos projetos
(salários dos que executam + freelancers + ferramentas diretas do projeto).
Se a margem bruta está abaixo de 40%, a agência não tem gordura operacional —
qualquer custo fixo adicional vira prejuízo direto.

MARGEM EBITDA (o que sobra para o sócio e investimento):
Saudável: 15–25%
Aceitável: 8–15%
Insustentável: abaixo de 8%
Por que importa: EBITDA é o oxigênio da empresa. Sem EBITDA positivo consistente,
a agência não consegue contratar, não consegue investir em ferramentas, não consegue
atravessar um mês ruim. A maioria das agências brasileiras opera com EBITDA de
5–12% — suficiente para sobreviver, insuficiente para crescer.
Ponto de atenção: Verifique se o pró-labore dos sócios está incluso no custo fixo.
Se não estiver, o EBITDA está inflado artificialmente.

CHURN DE CLIENTES (cancelamentos mensais):
Saudável: abaixo de 3% ao mês (equivale a perder ~33% da base em 12 meses)
Aceitável: 3–5% ao mês
Crítico: acima de 5% ao mês (perde metade da base em ~14 meses)
Por que 3% é o limite: Uma agência com 3% de churn precisa crescer 3% ao mês
só para manter o faturamento estável. Crescer acima de 3% já é desafiador
com equipe enxuta — acima de 5% de churn é matematicamente insustentável
sem captação agressiva e constante.
Cálculo de impacto: churn_rate × MRR_atual = perda de receita recorrente por mês.

CONCENTRAÇÃO DE RECEITA (maior cliente / faturamento total):
Saudável: nenhum cliente acima de 20% da receita
Aceitável: maior cliente até 30%
Risco: maior cliente entre 30–50%
Crítico: maior cliente acima de 50%
Por que importa: Uma agência com 60% da receita em um cliente não tem empresa —
tem um emprego com CNPJ. Se esse cliente sair (e clientes saem), a agência colapsa.
Cálculo de exposição: % do maior cliente × MRR = receita em risco imediato.

TICKET MÉDIO POR CLIENTE (retainer mensal):
Referência para agências médias BR (10–30 pessoas):
Ticket médio saudável: R$8.000–25.000/mês por cliente
Ticket médio baixo (risco de margem): abaixo de R$5.000/mês
Ticket médio excelente: acima de R$30.000/mês
Por que abaixo de R$5k é risco: Com ticket baixo, a agência precisa de muitos clientes
para atingir o faturamento necessário — e cada cliente adicional aumenta a carga
de gestão, reuniões e comunicação. Mais clientes pequenos = menos tempo para cada um
= qualidade cai = churn aumenta. É um ciclo vicioso.

CUSTO-HORA REAL DA EQUIPE:
Fórmula: (Custo total mensal da equipe ÷ Horas faturáveis mensais disponíveis)
Onde custo total = salários + encargos (~68–72% sobre salário CLT no Brasil) +
benefícios + parte proporcional de overhead.
Exemplo: Analista com salário de R$3.500 custa efetivamente R$5.880–6.020/mês
considerando encargos CLT (FGTS, INSS patronal, férias, 13º, etc.).
Se trabalha 160h/mês e 65% são faturáveis: 104h faturáveis.
Custo-hora real: R$5.950 ÷ 104 = R$57/hora.
Se a agência cobra menos de R$57/hora por esse profissional, está no prejuízo
neste recurso específico, independente do que aparece no contrato.

PRAZO MÉDIO DE RECEBIMENTO vs. PAGAMENTO:
Saudável: recebe em até 15 dias, paga fornecedores e equipe em 30 dias.
Risco: recebe em 30–60 dias, paga equipe em dia 5.
Armadilha comum no Brasil: Cliente grande impõe 60–90 dias de prazo.
Agência com equipe CLT paga em dia 5. Resultado: capital de giro negativo
que vai crescendo conforme a agência cresce. É comum agências faturando
R$200k/mês terem caixa negativo e dívida bancária crescente.

════════════════════════════════════════
3. OS 8 GARGALOS MAIS CRÍTICOS DE AGÊNCIAS
════════════════════════════════════════

GARGALO 1 — PRECIFICAÇÃO ABAIXO DO VALOR ENTREGUE
Frequência: Extremamente comum (presente em ~80% das agências abaixo de R$300k/mês)
Manifestação: A agência entrega resultado excelente mas o cliente paga pouco.
Dono sente que "trabalha muito e ganha pouco". Dificuldade em dar reajuste.
Causa raiz: Precificação baseada em "quanto o concorrente cobra" ou "quanto
o cliente topou pagar", não no valor real gerado para o cliente.
Como identificar com perguntas:
- "Como você calculou o preço do seu principal pacote de serviços?"
- "Você sabe quanto de receita ou economia seu trabalho gera para seus clientes?"
- "Quando foi o último reajuste que você deu? Como o cliente reagiu?"
- "Você já perdeu um cliente por ser caro? E por ser barato, já perdeu algum?"
Impacto financeiro: Se a agência cobra R$8k/mês por um cliente e o valor gerado
é de R$50k em receita adicional para esse cliente, a agência está capturando apenas
16% do valor. Uma agência bem posicionada captura 20–30%.
Potencial de reajuste: R$8k → R$12k = +50% de receita sem novo cliente, novo custo ou novo esforço.
Caminho de correção:
1. Mapear o valor financeiro gerado para cada cliente (leads × conversão × ticket médio do cliente)
2. Apresentar o ROI no momento da renovação, não só o relatório de atividades
3. Reajuste gradual de 15–20% a cada 6 meses em clientes com alta dependência
4. Criar tier de serviço Premium para novos clientes, mantendo atual para antigos temporariamente

GARGALO 2 — ESCOPO CREEP SISTEMÁTICO
Frequência: Muito comum (~70% das agências sem processo formal de escopo)
Manifestação: "O cliente sempre pede coisas a mais", reuniões desnecessárias
que a agência absorve, pequenos pedidos extras que somam horas não faturadas.
Causa raiz: Contrato e proposta não definem com precisão o que está INCLUÍDO
e o que é ADICIONAL. Equipe não tem autonomia para dizer não sem escalar para o gestor.
Como identificar:
- "Você tem um documento que define exatamente o que está e o que não está incluído em cada contrato?"
- "Quando um cliente pede algo fora do escopo, qual é o processo atual?"
- "Você consegue mostrar a diferença entre o escopo originalmente vendido e o que foi efetivamente entregue no último mês?"
- "Seus clientes sabem que existem horas extras cobráveis? Eles já foram cobrados por isso?"
Impacto financeiro típico: 15–25% das horas trabalhadas em agências sem gestão de escopo
são não faturadas. Em uma agência com custo de equipe de R$80k/mês, isso representa
R$12k–20k de serviço entregue gratuitamente por mês.
Cálculo: Horas totais trabalhadas/mês × % estimada de horas não faturadas × custo-hora real = perda.

GARGALO 3 — PROCESSO COMERCIAL INEXISTENTE OU REATIVO
Frequência: Muito comum (~65% das agências abaixo de R$200k/mês)
Manifestação: Novos clientes chegam por indicação. Sem prospecção ativa. Sem pipeline
estruturado. Proposta feita "na intuição". Taxa de conversão desconhecida.
Causa raiz: Sócios dedicam 0–10% do tempo em vendas porque estão operando.
Não existe processo — cada proposta é um evento único não documentado.
Como identificar (perguntas confrontadoras):
- "Quantas propostas você enviou no último mês? Qual foi a taxa de conversão?"
- "De onde vieram seus últimos 5 clientes? O que eles têm em comum?"
- "Você tem um processo documentado de como prospectar, qualificar e fechar um cliente novo?"
- "Se você precisasse fechar R$50k em novos contratos nos próximos 60 dias, qual seria o primeiro passo?"
- "Qual foi o último cliente que você perdeu para um concorrente? Você sabe por quê?"
Taxa de conversão de propostas — benchmark BR:
Sem processo: 15–25% (1 em 5 propostas converte)
Com processo de qualificação: 35–50% (1 em 2 converte)
Com processo completo (qualificação + proposta consultiva + follow-up): 50–70%
Impacto: Uma agência que envia 8 propostas/mês com 20% de conversão fecha 1,6 clientes.
Com processo, converte 40%: fecha 3,2 clientes — mesmo número de propostas, 2x mais clientes.

GARGALO 4 — DEPENDÊNCIA DO SÓCIO FUNDADOR NA OPERAÇÃO
Frequência: Extremamente comum (~85% das agências abaixo de R$500k/mês)
Manifestação: Sócio é o principal ponto de contato dos clientes, aprova todas as entregas,
resolve todos os conflitos, está em todas as reuniões importantes.
Por que isso é um gargalo estrutural:
A capacidade máxima de crescimento da agência é limitada pela capacidade de atenção
do sócio. Um sócio com 200 horas disponíveis por mês, gastando 60% em operação,
tem 80 horas para gestão e crescimento. Isso não escala.
Quando o sócio é o talento, o cliente compra o sócio — não a agência.
Na renovação, se o sócio saiu do projeto, o cliente questiona o valor.
Perguntas confrontadoras:
- "Se você ficasse 2 semanas sem internet e telefone, o que pararia na sua agência?"
- "Algum cliente já reclamou quando você colocou outra pessoa para atendê-lo?"
- "Qual membro da sua equipe poderia assumir a gestão de contas completa hoje, sem você revisar nada?"
Impacto: Agência dependente do sócio tem teto de crescimento de ~R$150–250k/mês.
Acima disso, a qualidade cai, o sócio colapsa, ou ambos.

GARGALO 5 — RETRABALHO POR BRIEFING INADEQUADO
Frequência: Muito comum (~60% das agências)
Manifestação: Entregas revisadas 3+ vezes. Cliente que "não era bem isso". Designer
refazendo layouts. Redator reescrevendo textos aprovados verbalmente.
Causa raiz: Briefing coletado de forma superficial ou verbal. Sem validação formal
antes de iniciar. Cliente não revisou o briefing antes de começar o trabalho.
Perguntas que expõem:
- "Em média, quantas rodadas de revisão você tem por entrega?" [Benchmark: 1–2. Acima de 3 = briefing ruim]
- "Você tem um briefing padrão que o cliente preenche antes de qualquer projeto?"
- "O cliente assina ou aprova formalmente o briefing antes de você começar?"
- "Qual foi o projeto mais recente que gerou muita revisão? O briefing estava claro?"
Cálculo de perda por retrabalho:
Rodadas extras de revisão × horas de retrabalho × custo-hora real = perda.
Exemplo: 3 projetos/mês com 2 rodadas extras de 4h cada = 24h × R$65/hora = R$1.560/mês.
Em agências maiores com 10+ entregas/mês, pode chegar a R$8k–15k mensais.

GARGALO 6 — GESTÃO FINANCEIRA NO ESCURO
Frequência: Muito comum (~70% das agências abaixo de R$150k/mês)
Manifestação: Sócio sabe o saldo da conta corrente mas não sabe a margem por cliente,
não tem DRE mensal, confunde retirada de pró-labore com lucro, não separa PJ de PF.
Perguntas confrontadoras:
- "Você sabe agora, de cabeça, qual cliente dá mais margem e qual dá menos?"
- "Você tem uma DRE mensal — mesmo que simples — que fecha todo mês?"
- "Você consegue me dizer a margem líquida do mês passado sem abrir planilha?"
- "Você separou completamente as finanças pessoais da empresa? Tem conta PJ?"
- "Você sabe quanto custa cada funcionário para a empresa, incluindo todos os encargos?" [A maioria subestima em 40–50%]
Por que "não sei minha margem por cliente" é um gargalo crítico:
Sem saber a margem por cliente, a agência não consegue:
1. Identificar quais clientes está subsidiando
2. Priorizar crescimento nos clientes mais lucrativos
3. Tomar decisão fundamentada de demitir um cliente
4. Negociar reajuste com argumento sólido

GARGALO 7 — EQUIPE SEM PROCESSO E CONHECIMENTO CONCENTRADO
Frequência: Muito comum (~75% das agências)
Manifestação: Cada pessoa trabalha "do seu jeito". Onboarding de funcionário novo
leva meses. Se alguém sai, o conhecimento vai junto. Qualidade varia por profissional.
Perguntas que revelam:
- "Você tem playbooks ou SOPs documentados para as principais entregas da agência?"
- "Quanto tempo um funcionário novo leva para estar produtivo de forma independente?" [Benchmark: 30–45 dias com processo. Sem processo: 3–6 meses]
- "Se sua melhor pessoa de [área crítica] pedisse demissão hoje, você saberia exatamente o que ela faz e como reproduzir o resultado?"
- "Existe algum cliente ou processo que só uma pessoa específica consegue tocar?" [Sequestro de conhecimento — risco operacional gravíssimo]

GARGALO 8 — SLA E QUALIDADE DE ENTREGA SEM MONITORAMENTO
Frequência: Comum (~55% das agências)
Manifestação: Prazos são "combinados" mas não registrados formalmente. Sem dashboard
de entregas. Sócio descobre que algo está atrasado quando o cliente reclama.
Perguntas:
- "Você tem um sistema onde qualquer pessoa da equipe vê o status de todas as entregas desta semana?"
- "Qual foi o último prazo que foi perdido? O cliente soube antes ou depois do prazo?"
- "Você tem SLA definido e comunicado para cada tipo de entrega?"
- "Quando um prazo vai ser perdido, quem avisa o cliente — e com quanto tempo de antecedência?"

════════════════════════════════════════
4. O CICLO DE MORTE DA AGÊNCIA BRASILEIRA
════════════════════════════════════════

FASE 1 — CRESCIMENTO CAÓTICO (R$30k–100k/mês):
A agência cresce rápido por indicação. Sócios fazem tudo.
Não há processo, mas a energia compensa. Todos "vestem a camisa".
Sinal de alerta: equipe dobra, processo não muda nada.

FASE 2 — CRISE DE QUALIDADE (R$80k–180k/mês):
Clientes começam a reclamar. Prazo estoura. Equipe sobrecarregada.
Sócio virou gerente de incêndios. Churn começa a subir.
Primeiros funcionários bons pedem demissão.
Sinal crítico: churn sobe antes que a agência perceba o problema real.

FASE 3 — ARMADILHA DO FATURAMENTO ALTO (R$150k–300k/mês):
A agência fatura bem mas não sobra dinheiro. Custo fixo alto.
Sócios trabalham mais do que nunca mas se sentem estagnados.
Qualquer cliente grande que sai desequilibra tudo.
Diagnóstico nesta fase: crítico. Exige reestruturação profunda.

FASE 4 — COLAPSO OU REINVENÇÃO:
Ou a agência reestrutura processos, pricing e posicionamento,
ou o churn a derruba em 12–18 meses.

════════════════════════════════════════
5. MÉTRICAS ESSENCIAIS PARA AGÊNCIAS
════════════════════════════════════════

MRR (Monthly Recurring Revenue): soma de todos os contratos de retainer ativos no mês.
Benchmark: Agência saudável tem 70%+ da receita em MRR. Abaixo de 50% = instável.

MRR Expansion Rate: % do MRR que cresceu por expansão de clientes existentes (upsell/cross-sell).
Benchmark: Excelente acima de 10% ao mês.

Receita por Pessoa (Revenue per Head): faturamento total ÷ número de colaboradores.
Benchmark BR para agências médias: R$12.000–20.000 por pessoa/mês.
Abaixo de R$8.000: equipe superdimensionada ou precificação muito baixa.
Acima de R$25.000: equipe altamente eficiente ou muito sobrecarregada (investigar).

Net Revenue Retention (NRR): % da receita de clientes existentes retida + expandida após 12 meses.
Fórmula: (MRR inicio + expansão - churn - downgrades) ÷ MRR inicio × 100
Benchmark: Saudável acima de 100%. Excelente acima de 110%.
Abaixo de 90%: base de clientes encolhendo mesmo com novos clientes entrando.

Taxa de Aprovação de Propostas:
Benchmark: Com processo estruturado, 40–60%. Sem processo, 15–25%.

CAC (Custo de Aquisição de Cliente):
Fórmula: (Custo total de vendas e marketing no mês) ÷ Novos clientes no mês.
Benchmark: CAC deve ser recuperado em no máximo 3 meses de contrato.

LTV (Lifetime Value):
Fórmula: Ticket médio mensal ÷ Churn rate mensal.
Exemplo: R$10k/mês ÷ 4% churn = LTV de R$250k.
LTV deve ser pelo menos 3x o CAC para o modelo ser sustentável.

Utilização por Área:
Calcular separadamente para: atendimento, criação, mídia, estratégia, desenvolvimento.
Áreas com utilização abaixo de 55% estão superdimensionadas.
Áreas com utilização acima de 85% estão em risco de burnout e erro.

════════════════════════════════════════
6. PERGUNTAS CONFRONTADORAS ESPECÍFICAS PARA AGÊNCIAS
════════════════════════════════════════

SOBRE PRECIFICAÇÃO:
- "Você sabe exatamente quanto cada cliente custa para atender por mês, incluindo o tempo de todos os envolvidos e a parte proporcional do overhead?"
- "Se você tivesse que demitir um cliente por ser pouco lucrativo, qual seria?"
- "Seu preço atual foi calculado de baixo para cima (custo + margem desejada) ou de cima para baixo (quanto o mercado paga)?"
- "Quando foi a última vez que você perdeu uma proposta por ser caro demais? E por ser barato demais — já aconteceu?"

SOBRE PROCESSO COMERCIAL:
- "Você tem um script ou estrutura de como conduz uma reunião de diagnóstico com potencial cliente?"
- "Qual é o ciclo de vendas médio na sua agência — do primeiro contato ao contrato assinado?" [Benchmark: 15–45 dias]
- "Você tem algum mecanismo de follow-up de propostas em aberto?"
- "Quem faz a prospecção ativa na sua agência hoje? Qual é o resultado quantitativo nos últimos 90 dias?"

SOBRE ENTREGA E QUALIDADE:
- "Você tem algum indicador que diga, antes do cliente reclamar, que uma entrega está em risco de atraso ou qualidade insatisfatória?"
- "Qual foi o projeto mais problemático dos últimos 6 meses? O que especificamente deu errado? O que mudou desde então?"
- "O cliente mais antigo da sua agência — ele ainda tem o mesmo nível de atenção e proatividade que tinha quando era novo?"

SOBRE FINANCEIRO:
- "Você consegue me dizer agora qual foi sua margem líquida nos últimos 3 meses? Ela está subindo ou caindo?"
- "Você tem dívida bancária? Ela está financiando capital de giro ou investimento?"
- "Se amanhã você perder seu maior cliente, em quantos meses você consegue se reorganizar sem demitir ninguém e sem entrar no vermelho?" [Menos de 2 meses = exposição crítica]

════════════════════════════════════════
7. COMO CALCULAR PERDAS EM AGÊNCIAS
════════════════════════════════════════

PERDA POR HORA NÃO FATURADA:
Fórmula: Horas totais disponíveis × (65% - utilização_real%) × custo_hora_real
Exemplo: Equipe de 10 pessoas, custo médio R$6.000/pessoa/mês = R$60.000/mês total.
Utilização atual 50% vs benchmark 65%.
Horas disponíveis: 10 × 160h = 1.600h/mês.
Horas não aproveitadas: (65%-50%) × 1.600 = 240h.
Custo-hora real: R$60k ÷ (1.600 × 65%) = R$57,69/hora.
Perda: 240h × R$57,69 = R$13.846/mês em capacidade ociosa.

PERDA POR CHURN EVITÁVEL:
Fórmula: Clientes_perdidos_mês × ticket_médio × meses_de_retenção_perdida
Exemplo: 2 clientes perdidos/mês com ticket R$8.000, retenção média 8 meses.
Perda de LTV: 2 × R$8.000 × 8 = R$128.000 de receita futura perdida.
Perda imediata de MRR: 2 × R$8.000 = R$16.000/mês a menos.

PERDA POR ESCOPO CREEP:
Fórmula: % de horas extras estimada × horas_totais_trabalhadas × custo_hora_real
Exemplo: 15% de horas extras não faturadas em equipe que trabalha 1.600h/mês:
240h × R$57,69 = R$13.846/mês cobrado de graça para os clientes.

PERDA POR PRECIFICAÇÃO ABAIXO DO MERCADO:
Fórmula: (preço_referência_mercado - preço_atual) × número_de_clientes
Exemplo: Cobrar R$8k quando deveria cobrar R$11k (35% abaixo do mercado),
com carteira de 15 clientes: (R$11.000 - R$8.000) × 15 = R$45.000/mês deixado na mesa.

PERDA POR BAIXA TAXA DE CONVERSÃO:
Fórmula: (benchmark_conversão - conversão_real) × propostas_mês × ticket_médio × meses_LTV
Exemplo: Enviando 10 propostas/mês com 20% de conversão vs. benchmark 40%:
Diferença: 2 clientes/mês a mais com processo melhor.
Impacto em 12 meses: 24 clientes × R$8.000 × 8 meses de LTV = R$1.536.000 de receita.

════════════════════════════════════════
8. ROADMAP DE CORREÇÃO PARA AGÊNCIAS
════════════════════════════════════════

FASE 1 — ESTABILIZAÇÃO (Mês 1–2): Parar o sangramento
Prioridade: Resolver o que está destruindo margem AGORA.
Ações: Mapear margem real por cliente, identificar e "demitir" clientes
subsidiados, corrigir o maior gargalo de escopo imediatamente.

FASE 2 — PADRONIZAÇÃO (Mês 2–4): Criar processos onde não existe
Prioridade: Briefing padrão, contrato com escopo definido, fluxo de aprovação,
DRE mensal, custo-hora calculado para cada área.

FASE 3 — COMERCIAL (Mês 3–6): Construir motor de crescimento previsível
Prioridade: Pipeline estruturado, meta de novos clientes, processo de proposta,
estratégia de upsell para carteira atual.

FASE 4 — ESCALA (Mês 6+): Crescer sem depender do sócio
Prioridade: Delegação real, playbooks, liderança intermediária, posicionamento
mais premium para novos clientes.
`,

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LOGÍSTICA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Logística": `
GARGALOS ESTRUTURAIS POR CAMADA CAUSAL:

CAUSA RAIZ:
1. Roteirização manual ou intuitiva → km rodados desnecessários, combustível desperdiçado
2. Ausência de processo de conferência na saída → erros de separação geram devolução e reentrega
3. Falta de visibilidade em tempo real → decisões tardias sobre problemas em rota

SINTOMAS OPERACIONAIS:
- Entregas fora do prazo → insatisfação do cliente, multas contratuais
- Devoluções por erro → custo dobrado (ida + volta + reenvio)
- Ociosidade de frota → veículos parados custando manutenção e depreciação
- Motorista sem roteiro otimizado → mais tempo na rua, mais custo por entrega

IMPACTOS FINANCEIROS:
- Cada devolução custa em média 2.5x o custo da entrega original
- Combustível é tipicamente 25-35% do custo operacional de transportadora
- Ociosidade de frota: veículo parado custa R$150-500/dia em depreciação + seguro

BENCHMARKS BRASILEIROS (fontes: ABTC, ANTT, NTC&Logística):
- Entrega no prazo: >95% (média: 85-90%)
- Taxa de devolução: <3% (média: 5-8%)
- Utilização de frota: >80%
- Custo por km: R$2,50-5,00 dependendo do veículo
- Custo por entrega last-mile: R$12-35 em capitais
- Margem líquida transportadora: 5-12%
- OTIF (On Time In Full): >92%

FÓRMULAS DE CÁLCULO DE PERDA:
- Perda por devolução: taxa_devolucao × entregas_mes × custo_medio_entrega × 2.5
- Perda por roteirização ruim: km_excedentes_dia × custo_por_km × dias_operacao
- Perda por ociosidade: veiculos_ociosos × custo_diario_veiculo × dias_mes
- Perda por atraso: entregas_atrasadas × multa_ou_desconto_medio

PERGUNTAS-CHAVE PARA ESTE NICHO:
- "Como é feita a roteirização hoje? Manual, planilha ou software?"
- "Qual o percentual de entregas com devolução ou reentrega?"
- "Quantos veículos ficam parados por dia em média?"
- "Existe conferência de carga antes da saída do veículo?"
- "O cliente consegue rastrear a entrega em tempo real?"
`,

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// E-COMMERCE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"E-commerce": `
GARGALOS ESTRUTURAIS POR CAMADA CAUSAL:

CAUSA RAIZ:
1. Estoque não integrado entre canais → vende produto que não tem, overselling
2. Processo de picking/packing manual sem checklist → erros de separação e envio errado
3. Ausência de régua de relacionamento pós-venda → churn alto, recompra baixa

SINTOMAS OPERACIONAIS:
- Reclamações no SAC por produto errado ou atrasado
- Trocas e devoluções acima do aceitável
- Avaliações negativas em marketplace afetando posicionamento
- Estoque desbalanceado: sobra de SKUs lentos, falta dos rápidos

IMPACTOS FINANCEIROS:
- Cada troca/devolução custa R$30-80 (frete reverso + mão de obra + reprocessamento)
- Avaliação abaixo de 4.5 em marketplace reduz visibilidade em até 60%
- CAC desperdiçado quando cliente compra uma vez e nunca mais volta

BENCHMARKS BRASILEIROS (fontes: E-commerce Brasil, ABComm, Ebit|Nielsen):
- Taxa de conversão site: 1.5-3% (média BR: 1.65%)
- Taxa de abandono de carrinho: 65-80%
- Taxa de devolução: <5% (moda pode chegar a 15-25%)
- Prazo de envio: <24h para processamento, <5 dias úteis para entrega
- NPS: >50 é bom, >70 é excelente
- CAC e-commerce: R$30-150 dependendo do segmento
- Recompra em 12 meses: >25% indica boa retenção

FÓRMULAS DE CÁLCULO DE PERDA:
- Perda por troca/devolução: taxa_devolucao × pedidos_mes × custo_medio_troca
- Perda por abandono de carrinho: abandonos × ticket_medio × taxa_recuperacao_potencial
- Perda por estoque parado: valor_estoque_lento × custo_oportunidade_mensal (2-3%)
- Perda por ruptura: buscas_sem_resultado × taxa_conversao × ticket_medio

PERGUNTAS-CHAVE PARA ESTE NICHO:
- "Seu estoque é integrado entre todos os canais de venda?"
- "Qual sua taxa de devolução e principal motivo?"
- "Como funciona o processo de separação e conferência de pedidos?"
- "Você tem régua de e-mail pós-venda para estimular recompra?"
- "Qual é o CAC atual e o LTV médio do cliente?"
`,

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VAREJO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Varejo": `
GARGALOS ESTRUTURAIS POR CAMADA CAUSAL:

CAUSA RAIZ:
1. Gestão de estoque intuitiva → ruptura dos mais vendidos e excesso dos lentos
2. Vendedor sem meta clara nem processo de abordagem → conversão baixa
3. Ausência de gestão de categorias (curva ABC) → capital imobilizado em SKUs irrelevantes

SINTOMAS OPERACIONAIS:
- Fila no caixa nos horários de pico → clientes desistem
- Ruptura de estoque dos itens mais procurados
- Visual merchandising inconsistente → experiência de compra fraca
- Dependência de vendedores estrela → se saem, as vendas caem

IMPACTOS FINANCEIROS:
- Ruptura: cada cliente que não encontra o que procura tem 30-40% de chance de ir ao concorrente
- Estoque parado: capital imobilizado perde ~2% ao mês em custo de oportunidade
- Fila > 5min no caixa: perda de 10-20% dos clientes em espera

BENCHMARKS BRASILEIROS (fontes: SBVC, GfK, Sebrae Varejo):
- Ruptura aceitável: <5% (média: 8-15%)
- Conversão visitante-comprador: 25-40% (loja física)
- Giro de estoque: 6-12x/ano dependendo do segmento
- Ticket médio: crescimento real >inflação indica saúde
- Margem líquida varejo: 3-8% (supermercado: 2-4%, moda: 8-15%)
- Venda por m²: R$800-2.500/mês dependendo da localização

FÓRMULAS DE CÁLCULO DE PERDA:
- Perda por ruptura: taxa_ruptura × faturamento × margem_media
- Perda por fila: clientes_desistentes_dia × ticket_medio × dias_mes
- Perda por estoque parado: valor_estoque_excesso × 2% ao mês
- Perda por conversão baixa: visitantes × (conversao_benchmark - conversao_atual) × ticket_medio

PERGUNTAS-CHAVE PARA ESTE NICHO:
- "Você sabe quais são seus 20 SKUs mais rentáveis (não mais vendidos — mais rentáveis)?"
- "Qual o giro médio do seu estoque?"
- "Sua equipe tem meta individual com acompanhamento diário?"
- "Quanto tempo em média o cliente espera na fila do caixa?"
`,

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INDÚSTRIA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Indústria": `
GARGALOS ESTRUTURAIS POR CAMADA CAUSAL:

CAUSA RAIZ:
1. Manutenção apenas corretiva → paradas não programadas, custo 3-5x maior que preventiva
2. Setup longo entre lotes → tempo improdutivo na linha
3. Planejamento de produção manual ou desalinhado com comercial → produz o que não vende, falta o que vende

SINTOMAS OPERACIONAIS:
- Paradas não programadas → perda de produção e atraso em pedidos
- Refugo acima do aceitável → matéria-prima desperdiçada
- Estoque de MP desbalanceado → falta do necessário, excesso do desnecessário
- Qualidade inconsistente → devoluções e reclamações de clientes

IMPACTOS FINANCEIROS:
- Cada hora de parada de linha = faturamento/hora perdido + custo fixo
- Refugo = matéria-prima + mão de obra + energia desperdiçados
- OEE abaixo de 60% indica que quase metade da capacidade é desperdiçada

BENCHMARKS BRASILEIROS (fontes: ABIMAQ, CNI, Lean Institute Brasil):
- OEE (Overall Equipment Effectiveness): >75% é bom, >85% é world-class (média BR: 55-65%)
- Refugo/scrap: <3% (média: 5-10%)
- Entrega no prazo: >95%
- Setup time: meta Lean <10min (SMED)
- Manutenção preventiva vs. corretiva: ideal 80/20 (média BR: 40/60)
- Margem líquida industrial: 5-12%

FÓRMULAS DE CÁLCULO DE PERDA:
- Perda por parada: horas_parada_mes × (faturamento_hora + custo_fixo_hora)
  faturamento_hora = faturamento_mensal / horas_produtivas_mes
- Perda por refugo: taxa_refugo × produção_mensal × custo_unitario
- Perda por OEE baixo: (OEE_benchmark - OEE_atual) × capacidade_maxima × margem_unitaria
- Perda por setup: tempo_setup × trocas_mes × custo_hora_linha

PERGUNTAS-CHAVE PARA ESTE NICHO:
- "Qual o OEE atual da sua linha principal? Você mede isso?"
- "Quantas paradas não programadas por mês? Duração média?"
- "Qual o percentual de refugo/scrap?"
- "O planejamento de produção é feito junto com o comercial?"
- "Manutenção é mais corretiva ou preventiva? Existe plano de manutenção?"
`,

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONSTRUÇÃO CIVIL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Construção Civil": `
GARGALOS ESTRUTURAIS POR CAMADA CAUSAL:

CAUSA RAIZ:
1. Ausência de planejamento detalhado de obra → cronograma estourado, custos fora de controle
2. Gestão de materiais sem controle → desperdício, furto e compras emergenciais com sobrepreço
3. Falta de gestão de subcontratados → qualidade inconsistente e retrabalho

SINTOMAS OPERACIONAIS:
- Retrabalho em obra por erro de execução ou mudança de projeto
- Material comprado em excesso ou insuficiente
- Cronograma estourado com frequência
- Segurança do trabalho negligenciada → risco de acidentes e multas

IMPACTOS FINANCEIROS:
- Retrabalho em construção civil: 5-15% do custo total da obra (média BR: 8%)
- Desperdício de material: 5-15% dependendo da gestão
- Cada mês de atraso = custo fixo mantido sem receita proporcional

BENCHMARKS BRASILEIROS (fontes: CBIC, Sinduscon, FGV):
- Retrabalho: <5% do custo da obra
- Desperdício de material: <8% (concreto, argamassa, cerâmica são os maiores vilões)
- Aderência ao cronograma: >85%
- Custo por m²: varia enormemente, mas desvio >15% do orçado é alerta
- Margem líquida construtora: 8-15% (incorporadora: 15-25%)
- Índice de acidentes: meta zero, média do setor: 15-25 acidentes/1000 trabalhadores/ano

FÓRMULAS DE CÁLCULO DE PERDA:
- Perda por retrabalho: % retrabalho × custo_total_obra / prazo_meses
- Perda por desperdício: taxa_desperdicio × custo_materiais_mensal
- Perda por atraso: custo_fixo_mensal_obra × meses_atraso
- Perda por compra emergencial: sobrepreço_medio × compras_emergenciais_mes

PERGUNTAS-CHAVE PARA ESTE NICHO:
- "Qual o percentual de retrabalho nas suas obras atuais?"
- "Como controla o recebimento e uso de materiais na obra?"
- "Seus subcontratados seguem algum padrão de qualidade documentado?"
- "Qual o desvio médio entre orçamento e custo real das últimas 3 obras?"
`,

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EDUCAÇÃO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Educação": `
GARGALOS ESTRUTURAIS POR CAMADA CAUSAL:

CAUSA RAIZ:
1. Ausência de régua de relacionamento com aluno/família → evasão silenciosa sem intervenção
2. Gestão de turmas manual → horários conflitantes, salas subutilizadas, professor sobrecarregado
3. Falta de indicadores de engajamento → não percebe aluno desengajado até a matrícula não renovar

SINTOMAS OPERACIONAIS:
- Evasão alta sem entendimento das causas reais
- Inadimplência crescente sem política clara de cobrança
- Material desatualizado reduzindo percepção de valor
- Captação focada em desconto ao invés de valor

IMPACTOS FINANCEIROS:
- Cada aluno evadido = CAC perdido + receita futura perdida (LTV)
- Inadimplência acima de 10% compromete fluxo de caixa
- Desconto na matrícula para captar: se >15%, está comprando aluno com prejuízo

BENCHMARKS BRASILEIROS (fontes: MEC, Semesp, Sebrae Educação):
- Evasão anual: <15% (média ensino superior privado: 25-30%, cursos livres: 30-50%)
- Inadimplência: <10% (média: 12-18%)
- NPS educação: >50 é bom
- CAC por aluno: R$200-1.500 dependendo do segmento
- Taxa de renovação: >75%
- Ocupação de turmas: >80%

FÓRMULAS DE CÁLCULO DE PERDA:
- Perda por evasão: taxa_evasao × total_alunos × mensalidade_media × meses_restantes
- Perda por inadimplência: taxa_inadimplencia × receita_mensal
- Perda por turma subutilizada: vagas_ociosas × valor_vaga × meses_turma
- CAC desperdiçado: alunos_evadidos_1o_semestre × CAC_medio

PERGUNTAS-CHAVE PARA ESTE NICHO:
- "Qual sua taxa de evasão? Você sabe o motivo principal?"
- "Existe algum processo de acompanhamento do aluno antes dele decidir sair?"
- "Qual o custo de aquisição de um aluno novo vs. o custo de reter um existente?"
- "Qual sua taxa de inadimplência? Como funciona a cobrança?"
`,

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TECNOLOGIA / SaaS (conhecimento profundo — nível consultoria sênior)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Tecnologia": `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONHECIMENTO PROFUNDO — SAAS E PRODUTOS DIGITAIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

════════════════════════════════════════
1. COMO UM SAAS FUNCIONA INTERNAMENTE
════════════════════════════════════════

O SaaS é o único modelo de negócio onde você pode crescer rápido e quebrar rápido
ao mesmo tempo. Faturamento crescendo não significa negócio saudável se o churn
consumir a base mais rápido do que novos clientes entram.

A EQUAÇÃO FUNDAMENTAL DO SAAS:
MRR líquido = MRR novo + MRR de expansão - MRR perdido (churn) - MRR reduzido (downgrade)
Se MRR novo + expansão < churn + downgrade: o negócio encolhe, mesmo parecendo ativo.

OS TRÊS MOTORES DE CRESCIMENTO (framework da Reforge):
Motor 1 — VIRAL: Crescimento por indicação natural do produto (o uso gera novos usuários).
Motor 2 — PAGO: Crescimento por mídia paga (CAC < LTV para sustentar).
Motor 3 — CONTEÚDO/SEO: Crescimento por autoridade e descoberta orgânica (mais lento, mais barato).

Diagnóstico crítico: Qual motor está ativo? A maioria dos SaaS brasileiros abaixo
de R$500k ARR não tem nenhum motor claro — cresce por relacionamento do fundador, que não escala.

════════════════════════════════════════
2. BENCHMARKS SAAS BRASILEIROS JUSTIFICADOS
════════════════════════════════════════

CHURN MENSAL — o indicador mais crítico:
Excelente: abaixo de 1,5% ao mês (perde 17% da base em 12 meses)
Saudável: 1,5–3% ao mês (perde 17–31% da base)
Preocupante: 3–5% ao mês (perde 31–46%)
Crítico: acima de 5% ao mês (perde metade da base em 14 meses)

Por que o churn destrói o SaaS de forma invisível:
Um SaaS com R$100k MRR e 4% de churn perde R$4.000/mês em receita recorrente.
Para crescer 10% ao mês, precisa trazer R$14.000 em novo MRR (R$10k de crescimento + R$4k para compensar o churn).
Se o CAC médio é R$2.000 por cliente e o ticket médio é R$500/mês, precisa de 7 novos clientes/mês
só para compensar o churn e crescer 10%. Com 3% de churn, precisaria de apenas 4 novos clientes.
A diferença parece pequena — mas em 24 meses, o SaaS com 4% de churn terá
40% menos receita acumulada do que o com 3% de churn, com o mesmo número de novos clientes.

MRR GROWTH RATE (taxa de crescimento mensal):
Early-stage (ARR < R$500k): Saudável 15–25%/mês. Abaixo de 10% indica problema de product-market fit.
Growth-stage (ARR R$500k–5M): Saudável 8–15%/mês.
Scale-stage (ARR > R$5M): Saudável 3–8%/mês.

NET REVENUE RETENTION (NRR) — o indicador de saúde mais completo:
O que é: de cada R$100 de MRR de clientes existentes, quanto ainda existe após 12 meses,
considerando churn, downgrade, E expansão (upsell, cross-sell).
Excelente: acima de 120% (expansão supera churn — base cresce sem novos clientes)
Saudável: 100–120%
Preocupante: 85–100% (está perdendo mais do que expandindo)
Crítico: abaixo de 85%

Por que NRR é mais importante que churn isolado:
Um SaaS com 5% de churn mas 8% de expansão tem NRR de 103% — saudável.
Um SaaS com 2% de churn e 0% de expansão tem NRR de 98% — problemático.
O segundo está perdendo receita recorrente; o primeiro está crescendo apesar do churn.

RELAÇÃO LTV/CAC:
Insustentável: LTV < 2x CAC (empresa queima caixa para crescer)
Mínimo viável: LTV = 3x CAC (cobre o CAC em 4 meses de contrato)
Saudável: LTV = 5x CAC
Excelente: LTV > 8x CAC (produto com forte retenção e baixo custo de aquisição)

Cálculo de LTV: MRR médio por cliente ÷ Churn mensal
Exemplo: R$800/mês ÷ 3% churn = LTV de R$26.667.
Se CAC = R$3.000: LTV/CAC = 8,9x — excelente.
Se CAC = R$12.000: LTV/CAC = 2,2x — insustentável.

PAYBACK PERIOD (tempo para recuperar o CAC):
Benchmark: Abaixo de 12 meses para SaaS B2B.
Acima de 18 meses: crescimento requer capital externo para sustentar.
Fórmula: CAC ÷ (MRR médio × margem de contribuição)

TIME TO VALUE (tempo até o cliente sentir o primeiro valor):
Benchmark crítico: abaixo de 7 dias para o cliente sentir o primeiro resultado real.
Por que é crítico: A curva de churn é exponencial nos primeiros 30–60 dias.
Se o cliente não ativa (não sente o valor), ele cancela — frequentemente sem nem avisar.
Reduzir TTFV de 14 dias para 3 dias pode reduzir churn em 20–30%.

MARGEM BRUTA SaaS: >70% (média global: 75–85%)
Por que importa: SaaS com margem bruta abaixo de 60% provavelmente tem custos de
infraestrutura ou suporte desproporcionais. Investigar se há serviço manual embutido.

RULE OF 40: Crescimento % + Margem EBITDA % > 40%
Referência de eficiência para SaaS maduros. Abaixo de 20% indica modelo com problemas.

════════════════════════════════════════
3. OS 6 GARGALOS MAIS CRÍTICOS DE SAAS
════════════════════════════════════════

GARGALO 1 — FALHA DE ATIVAÇÃO (cliente assina e não usa):
É a causa número 1 de churn em SaaS B2B brasileiro.
Manifestação: Trial ou primeiros meses com baixo engajamento. Cliente cancela dizendo
"não tinha tempo de usar" ou "era complicado demais".
Perguntas confrontadoras:
- "Você sabe quantos por cento dos clientes que assinam completam o onboarding?"
- "Você sabe em qual etapa do onboarding os clientes param? Você mede isso?"
- "O que um cliente novo precisa fazer nos primeiros 7 dias para sentir o valor do produto?"
- "Você tem alguém ativo monitorando se clientes novos estão usando o produto?"
  [Na maioria dos SaaS brasileiros: ninguém monitora. O churn chega como surpresa]
Impacto: 30–50% dos churns em SaaS ocorrem antes dos 90 dias. São clientes que
nunca ativaram e cancelam assim que percebem que não estão usando. Cada um
representa CAC investido e MRR perdido antes mesmo de cobrir o custo de aquisição.
Cálculo: clientes_nao_ativados_mes × CAC_medio = investimento perdido.
MRR perdido: clientes_nao_ativados × ticket_medio = receita recorrente desperdiçada.

GARGALO 2 — PRODUTO CONSTRUÍDO POR HIPÓTESE (não por evidência):
Manifestação: Roadmap cheio de features, mas NPS não sobe. Clientes pedem coisas
que o produto não tem. Features lançadas com baixa adoção.
Perguntas:
- "Quais são as 3 features mais pedidas pelos clientes hoje? Elas estão no roadmap?"
- "Você entrevista clientes antes de priorizar uma feature ou define internamente?"
- "Você sabe quais features são usadas por mais de 50% dos clientes e quais são ignoradas?"
- "Qual foi a última feature grande que você lançou? Qual foi a adoção real nos primeiros 30 dias?"
Impacto: 30–50% do esforço de engenharia vai para features que menos de 20% dos clientes usam.
Cálculo: horas_dev_mensal × % features_baixa_adocao × custo_hora_dev = investimento desperdiçado.

GARGALO 3 — AUSÊNCIA DE CUSTOMER SUCCESS ESTRUTURADO:
Manifestação: Suporte reativo. Empresa sabe que cliente vai cancelar quando recebe o email.
Sem monitoramento de saúde do cliente. CS é sinônimo de suporte técnico.
Perguntas:
- "Você monitora a frequência de uso do produto por cliente? Entra em contato quando detecta queda?"
- "Você tem algum health score de cliente — um indicador que diz quem está em risco antes de cancelar?"
- "Quantos clientes cancelaram nos últimos 3 meses sem que você soubesse que estavam insatisfeitos?"
- "Qual é o protocolo quando um cliente não abre o produto por 14 dias?"
Impacto: CS proativo reduz churn em 20–40% vs. CS reativo. A diferença em MRR anual pode ser
equivalente a 2–4 meses de faturamento.

GARGALO 4 — PRICING INADEQUADO (cobra por usuário quando deveria cobrar por valor):
Manifestação: Crescimento do cliente não gera expansão de receita. Clientes reclamam
que o produto é caro quando têm poucos usuários e barato quando têm muitos.
Perguntas:
- "Como você define o preço dos seus planos? A métrica de cobrança cresce junto com o valor percebido?"
- "Seu cliente de maior sucesso — quanto ele paga? É proporcional ao valor que recebe?"
- "Você já fez um teste de preço nos últimos 12 meses? Qual foi o aprendizado?"
- "Sua taxa de upgrade (clientes que sobem de plano) é mensurada? Qual o percentual?"
Impacto: Pricing inadequado pode custar 20–40% de receita potencial. Clientes que crescem
sem expansão de receita representam subsídio cruzado.

GARGALO 5 — DEPENDÊNCIA DE FUNDADOR NO PROCESSO COMERCIAL:
Manifestação: Vendas fechadas pelo CEO. Quando CEO está ocupado, pipeline esfria.
Sem playbook de vendas. Novo vendedor leva 6+ meses para performar.
Perguntas:
- "Qual percentual das vendas do último trimestre foram fechadas por você pessoalmente?"
  [Acima de 70%: a empresa não tem processo comercial, tem um vendedor chamado CEO]
- "Se você contratar um vendedor sênior agora, em quanto tempo ele conseguiria fechar sozinho?"
- "Você tem documentado: ICP, script de discovery, objeções mais comuns, critérios de qualificação?"
Impacto: Empresa trava no patamar de R$50–100k MRR enquanto CEO é o único vendedor.
Teto de crescimento = capacidade de atenção do CEO dividida entre produto, gestão e vendas.

GARGALO 6 — CRESCIMENTO DE MRR MASCARADO POR ANUAIS UPFRONT:
Manifestação: Caixa excelente. MRR "cresce". Mas quando os anuais vêm para renovação,
grande parte não renova. A empresa descobriu o problema tarde.
Perguntas:
- "Qual percentual da sua receita está em contratos anuais pagos upfront?"
  [Se acima de 60%: a empresa pode estar mascarando churn real]
- "De cada 10 contratos anuais que vencem, quantos renovam? Você mede isso?"
- "Você já calculou seu churn considerando apenas clientes mensais, para ver a saúde real?"
Impacto: Churn real pode ser 2–3x maior do que o reportado quando anuais mascaram.
A "surpresa" vem no mês de renovação — e aí já é tarde para intervir.

════════════════════════════════════════
4. MÉTRICAS ESSENCIAIS PARA SAAS
════════════════════════════════════════

MRR (Monthly Recurring Revenue):
Base de tudo. Sem MRR preciso, nenhuma outra métrica funciona.
Benchmark: 70%+ da receita deve ser recorrente. Abaixo de 50% = modelo instável.

ARR (Annual Recurring Revenue): MRR × 12.
Usado para benchmarking de estágio e valuation.

Quick Ratio: (MRR novo + MRR expansão) ÷ (MRR churn + MRR contração)
Excelente: >4x. Saudável: >2x. Preocupante: <1,5x.
Quick Ratio >4x = a empresa cresce de forma sustentável.

Revenue per Employee: ARR ÷ número total de funcionários.
Benchmark SaaS BR: R$150k–300k/funcionário/ano para early-stage.
Acima de R$400k: empresa eficiente. Abaixo de R$100k: provavelmente queimando caixa.

Feature Adoption Rate: % de usuários ativos que usam features core.
Benchmark: >30% para features principais. Abaixo de 10%: feature candidata a remoção.

DÍVIDA TÉCNICA como métrica de perda:
Velocidade de entrega (story points/sprint) caindo trimestre a trimestre = dívida técnica acumulada.
Custo: cada 10% de queda na velocidade = 10% mais caro construir qualquer feature.
Fórmula: (velocidade_ideal - velocidade_atual) / velocidade_ideal × custo_eng_mensal = perda.

════════════════════════════════════════
5. PERGUNTAS CONFRONTADORAS ESPECÍFICAS PARA SAAS
════════════════════════════════════════

SOBRE PRODUTO:
- "Você sabe quais features são usadas por mais de 50% dos seus clientes?"
  [Se não sabe: não tem telemetria de produto. Decisões são por intuição]
- "Qual foi a última feature que você REMOVEU do produto? Se nunca removeu, por quê?"
  [Produto inchado = complexidade para usuário = barreira de ativação = churn]
- "Se seu produto ficasse fora do ar por 24h, qual seria o impacto real nos clientes?"
  [Mede criticality. Produto "nice to have" tem churn mais alto que "must have"]

SOBRE CRESCIMENTO:
- "De onde vieram seus últimos 10 clientes? Qual canal, qual motivo de compra?"
  [Se não sabe: não tem tracking de atribuição. Não sabe onde investir]
- "Qual é o seu motor de crescimento hoje — viral, pago ou orgânico?"
  [Maioria dos SaaS BR: "crescemos por indicação do fundador". Isso não escala]
- "Se você parasse todo o marketing pago amanhã, quantos novos clientes ainda chegariam?"
  [Mede dependência de canal pago. Se >80% vem de pago: risco alto]

SOBRE RETENÇÃO:
- "Você sabe o momento exato em que um cliente decide cancelar — ou descobre só quando ele pede?"
  [Se descobre só quando pede: não tem monitoramento de health]
- "Quais são os 3 principais motivos de cancelamento? Você tem isso documentado?"
  [Se não tem: está tratando churn como evento aleatório, não como problema sistêmico]

SOBRE FINANCEIRO:
- "Você sabe o CAC real — incluindo o tempo dos sócios em vendas, não só o investimento em ads?"
  [CAC real é quase sempre 2–3x maior do que o reportado quando inclui tempo de fundadores]
- "Qual sua margem de contribuição por cliente? Considerando suporte, infra e CS?"
  [Margem de contribuição negativa em clientes small = modelo insustentável em escala]

════════════════════════════════════════
6. COMO CALCULAR PERDAS EM SAAS
════════════════════════════════════════

PERDA POR CHURN:
Fórmula direta: MRR × taxa_churn_mensal = MRR perdido por mês.
Revenue churn anualizado: MRR_perdido_por_churn × 12.
Exemplo: R$200k MRR × 4% churn = R$8.000/mês = R$96.000/ano em receita perdida.

PERDA POR FALHA DE ATIVAÇÃO:
Fórmula: clientes_nao_ativados_mes × CAC_medio + clientes_nao_ativados × ticket_medio × meses_perdidos.
Exemplo: 15 clientes/mês não ativam × R$2.000 CAC = R$30.000 CAC desperdiçado.
+ 15 × R$500 ticket × 12 meses LTV esperado = R$90.000 de receita futura perdida.

PERDA POR FEATURES INÚTEIS:
Fórmula: % do esforço de eng em features com <10% adoção × custo_eng_mensal.
Exemplo: 30% do time trabalhando em features ignoradas × R$80k custo eng = R$24.000/mês desperdiçado.

PERDA POR DOWNTIME:
Fórmula: (ARR / 8760 horas) × horas_fora × multiplicador_reputação (2–5x).
Exemplo: ARR R$2.4M / 8760 = R$274/hora. 8h fora × 3x reputação = R$6.575 por incidente.

PERDA POR PRICING SUBÓTIMO:
Fórmula: clientes_em_plano_errado × (ticket_potencial - ticket_atual).
Exemplo: 40% dos clientes em plano básico quando usam funcionalidade de plano premium.
100 clientes × 40% × (R$800 - R$300) = R$20.000/mês deixado na mesa.

PERDA POR VENDAS DEPENDENTES DO CEO:
Fórmula: propostas_não_enviadas_por_falta_de_tempo × taxa_conversão × ticket_médio × meses_LTV.
Exemplo: CEO deveria enviar 20 propostas/mês mas consegue 8. Diferença: 12 × 35% × R$500 × 24 = R$50.400 de receita potencial perdida.

════════════════════════════════════════
7. ROADMAP DE CORREÇÃO PARA SAAS
════════════════════════════════════════

FASE 1 — ESTABILIZAÇÃO (Mês 1–2): Parar o sangramento
- Identificar e intervir nos clientes em risco de churn imediato
- Mapear motivos reais de cancelamento (últimos 20 churns)
- Implementar monitoramento básico de ativação (7 dias)
- Calcular CAC, LTV e payback reais (não os "oficiais")

FASE 2 — PADRONIZAÇÃO (Mês 2–4): Criar processos de retenção
- Implementar health score básico de cliente
- Criar processo de onboarding com milestones de ativação
- Documentar ICP e playbook de vendas
- Implementar CS proativo para top 20% de clientes (por MRR)

FASE 3 — OTIMIZAÇÃO (Mês 3–6): Motor de crescimento previsível
- Revisar pricing com base em dados de uso e valor entregue
- Construir funil de vendas replicável (não dependente do CEO)
- Implementar expansion revenue (upsell/cross-sell)
- Criar régua de engajamento automatizada

FASE 4 — ESCALA (Mês 6+): Crescer com eficiência
- Reduzir CAC com canais orgânicos e virais
- Automatizar CS para clientes small (tech-touch)
- Expandir produto com base em dados de uso (não intuição)
- Meta: NRR >110% e Quick Ratio >3x
`,

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONTABILIDADE / BPO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Contabilidade": `
GARGALOS ESTRUTURAIS POR CAMADA CAUSAL:

CAUSA RAIZ:
1. Processo dependente de informação do cliente que atrasa → retrabalho e correria no fechamento
2. Operações manuais repetitivas (lançamentos, conciliação) → alto custo por cliente
3. Ausência de segmentação de carteira → todos os clientes recebem o mesmo nível de serviço

SINTOMAS OPERACIONAIS:
- Fechamento mensal com correria e horas extras
- Erros de lançamento por volume e pressão de prazo
- Equipe reativa (apaga incêndios) ao invés de consultiva
- Dependência de 1-2 pessoas que conhecem os clientes maiores

IMPACTOS FINANCEIROS:
- Horas extras no fechamento: custo adicional de 50-100% do salário normal
- Erro fiscal gera multa para o cliente → risco de perda do cliente e processo
- Ticket médio estagnado: escritório cresce em clientes mas não em receita por cliente

BENCHMARKS BRASILEIROS (fontes: CFC, Fenacon, Roberto Dias Duarte):
- Clientes por colaborador: 20-40 dependendo da complexidade
- Ticket médio escritório contábil: R$500-2.000 para PMEs
- Margem líquida: 15-30%
- Churn anual: <10% (média: 12-20%)
- Tempo de fechamento: <5 dias úteis após recebimento de documentos
- Erro fiscal: <1% dos lançamentos

FÓRMULAS DE CÁLCULO DE PERDA:
- Perda por retrabalho: horas_retrabalho_mes × custo_hora_equipe
- Perda por hora extra: horas_extras_mes × custo_hora × 1.5 (ou 2x fds)
- Perda por churn: clientes_perdidos × ticket_medio × 12 (receita anual perdida)
- Custo de não automação: tarefas_automatizaveis × tempo_por_tarefa × custo_hora × frequencia

PERGUNTAS-CHAVE PARA ESTE NICHO:
- "Quantos clientes seu time atende por pessoa?"
- "Quanto tempo leva o fechamento mensal? Tem hora extra?"
- "Qual o principal motivo de perda de cliente?"
- "Que percentual do trabalho é manual e repetitivo?"
`,

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ADVOCACIA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Advocacia": `
GARGALOS ESTRUTURAIS POR CAMADA CAUSAL:

CAUSA RAIZ:
1. Ausência de gestão de prazos sistematizada → risco de perda de prazo processual (irreversível)
2. Falta de processo de captação e qualificação de clientes → aceita qualquer caso, mesmo sem expertise
3. Precificação por honorário fixo sem controle de horas → projetos lucrativos e deficitários misturados

SINTOMAS OPERACIONAIS:
- Advogado sênior fazendo trabalho operacional (buscar jurisprudência, formatar petição)
- Prazo processual gerenciado por agenda pessoal ou planilha → risco altíssimo
- Falta de padronização de peças processuais → cada advogado faz do seu jeito

BENCHMARKS BRASILEIROS (fontes: OAB, Análise Advocacia, CESA):
- Horas faturáveis por advogado: 5-7h/dia (meta)
- Margem líquida escritório: 20-40%
- Churn: <15% ao ano
- Taxa de conversão de consultas iniciais: 30-50%
- Ticket médio: varia enormemente por área

FÓRMULAS DE CÁLCULO DE PERDA:
- Perda por hora improdutiva: (horas_dia - horas_faturaveis) × valor_hora × 22 dias × advogados
- Risco de perda de prazo: probabilidade × impacto_financeiro_medio_por_processo
- Perda por caso mal precificado: horas_reais × valor_hora - honorario_cobrado

PERGUNTAS-CHAVE PARA ESTE NICHO:
- "Como controla prazos processuais hoje?"
- "Quanto do tempo do sócio é gasto em tarefas que um estagiário poderia fazer?"
- "Você sabe a margem real de cada tipo de causa que atende?"
- "Qual o percentual de consultas iniciais que viram cliente?"
`,

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// IMOBILIÁRIA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Imobiliária": `
GARGALOS ESTRUTURAIS POR CAMADA CAUSAL:

CAUSA RAIZ:
1. Leads sem follow-up estruturado → 60-80% dos leads morrem sem retorno adequado
2. Processo documental lento e manual → vendas travadas por burocracia interna
3. Corretor sem CRM → informações de clientes e imóveis na cabeça do corretor

SINTOMAS OPERACIONAIS:
- Lead entra e fica sem contato por dias
- Processo de venda travado em etapas burocráticas
- Corretor não registra visitas, feedback e objeções
- Comissionamento complexo gera conflitos internos

BENCHMARKS BRASILEIROS (fontes: CRECI, Secovi, DataZap):
- Conversão lead→venda: 2-5% (média: 1-3%)
- Tempo médio de venda residencial: 45-120 dias
- Taxa de distrato: <5% (média: 8-15%)
- Comissão média: 5-6% do valor do imóvel

FÓRMULAS DE CÁLCULO DE PERDA:
- Perda por lead não atendido: leads_sem_contato × taxa_conversao_potencial × comissao_media × valor_medio_imovel
- Perda por distrato: distratos_mes × custo_administrativo_distrato + comissao_perdida
- Perda por ciclo longo: meses_excedentes × custo_fixo_operacao / vendas_mes

PERGUNTAS-CHAVE PARA ESTE NICHO:
- "Quanto tempo leva para um lead receber o primeiro contato?"
- "Qual sua taxa de conversão de lead para visita? E de visita para proposta?"
- "Quantos leads por mês entram e quantos ficam sem atendimento?"
`,

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BELEZA E ESTÉTICA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Beleza e Estética": `
GARGALOS ESTRUTURAIS POR CAMADA CAUSAL:

CAUSA RAIZ:
1. Agenda manual sem otimização → horários vagos entre atendimentos
2. Dependência do profissional: cliente é "da Maria", não "do salão"
3. Falta de controle de insumos por procedimento → margem desconhecida por serviço

SINTOMAS OPERACIONAIS:
- Horários vagos não preenchidos → capacidade desperdiçada
- No-show alto sem política de cancelamento
- Profissional sai e leva a clientela
- Precificação desatualizada (preço não acompanha custo dos insumos)

BENCHMARKS BRASILEIROS (fontes: ABHRS, Sebrae Beleza):
- Ocupação de agenda: >75%
- No-show: <10%
- Ticket médio: crescimento >10% ao ano indica bom upsell
- Retenção de clientes: >65% devem retornar em 90 dias
- Margem líquida salão: 15-25%
- Custo de insumo por serviço: <30% do preço cobrado

FÓRMULAS DE CÁLCULO DE PERDA:
- Perda por ociosidade: slots_vagos_dia × valor_medio_servico × dias_mes
- Perda por no-show: taxa_noshow × agendamentos_dia × ticket_medio × 26 dias
- Perda por profissional que sai: clientes_que_seguem × ticket_medio × frequencia_meses

PERGUNTAS-CHAVE PARA ESTE NICHO:
- "Qual a ocupação média da sua agenda? Tem muitos horários vagos?"
- "Se uma profissional sair, quantos clientes você perde?"
- "Você sabe o custo de insumo de cada serviço?"
`,

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ACADEMIA E ESPORTE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Academia e Esporte": `
GARGALOS ESTRUTURAIS POR CAMADA CAUSAL:

CAUSA RAIZ:
1. Ausência de régua de engajamento → aluno desiste silenciosamente
2. Precificação focada em competir por preço → margem comprimida, plano anual com desconto excessivo
3. Falta de acompanhamento de frequência → não percebe aluno desengajando até cancelar

SINTOMAS OPERACIONAIS:
- Churn alto nos primeiros 3 meses (aluno se matricula e some)
- Horários de pico superlotados, outros horários vazios
- Recepção sem processo de acolhimento do aluno novo

BENCHMARKS BRASILEIROS (fontes: IHRSA, ACAD Brasil):
- Churn mensal: <5% (média BR: 6-10%)
- Frequência média: 2.5-3x/semana indica engajamento saudável
- Ticket médio: R$80-250/mês
- Margem líquida: 10-20%
- Retenção > 12 meses: 35-50%
- Alunos por m²: 0.5-1.5 alunos/m² de área útil

FÓRMULAS DE CÁLCULO DE PERDA:
- Perda por churn: alunos_perdidos_mes × ticket_medio × meses_contrato_restante
- CAC desperdiçado: alunos_desistentes_1o_trimestre × CAC_medio
- Perda por ociosidade: capacidade_total - alunos_ativos = vagas_ociosas × ticket_potencial

PERGUNTAS-CHAVE PARA ESTE NICHO:
- "Qual seu churn mensal? Sabe por que os alunos cancelam?"
- "Você monitora a frequência dos alunos? Intervém quando alguém para de ir?"
- "Qual o custo de captar um aluno novo vs. reter um existente?"
`,

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONSULTORIA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Consultoria": `
GARGALOS ESTRUTURAIS POR CAMADA CAUSAL:

CAUSA RAIZ:
1. Entrega dependente exclusivamente de sócios → capacidade limitada pelo tempo deles
2. Falta de metodologia replicável → cada projeto é reinventado do zero
3. Precificação por hora ao invés de valor entregue → teto de receita

SINTOMAS OPERACIONAIS:
- Sócio é o gargalo de todos os projetos
- Entregas atrasam porque dependem de uma pessoa
- Falta de documentação de casos anteriores → não reutiliza aprendizados
- Dificuldade de escalar → mais projetos = mais horas de sócio

BENCHMARKS:
- Utilização de consultor (horas faturáveis): >65%
- Margem por projeto: >40%
- Churn de clientes: <20%/ano
- Tempo de venda (pipeline): 30-90 dias

FÓRMULAS DE CÁLCULO DE PERDA:
- Perda por hora improdutiva de sócio: horas_nao_faturaveis × valor_hora_socio
- Perda por projeto reinventado: horas_extras_por_falta_de_template × custo_hora
- Perda por dependência: projetos_recusados_por_falta_de_capacidade × ticket_medio

PERGUNTAS-CHAVE PARA ESTE NICHO:
- "Quanto do trabalho é feito pessoalmente pelos sócios?"
- "Existe uma metodologia documentada que um consultor júnior poderia seguir?"
- "Quantos projetos você recusa por falta de capacidade?"
`,

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SERVIÇOS FINANCEIROS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Serviços Financeiros": `
GARGALOS ESTRUTURAIS POR CAMADA CAUSAL:

CAUSA RAIZ:
1. Processo de compliance manual → lentidão na abertura de conta/análise de crédito
2. Falta de segmentação de carteira → clientes de alto valor recebem mesmo tratamento que clientes pequenos
3. Ausência de régua de relacionamento → cliente sai por falta de contato, não por insatisfação

SINTOMAS OPERACIONAIS:
- Análise de crédito/documentação lenta → cliente desiste e vai para concorrente
- Assessor sobrecarregado com carteira grande sem priorização
- Falta de cross-sell → cliente usa apenas 1 produto quando poderia usar 3-4

BENCHMARKS:
- Churn de carteira: <8%/ano
- Produtos por cliente: >2.5 (média: 1.5)
- Conversão de indicação: >20%
- NPS financeiro: >50
- Margem por assessor: R$15k-40k/mês dependendo do segmento

FÓRMULAS DE CÁLCULO DE PERDA:
- Perda por churn: clientes_perdidos × receita_media_anual_cliente
- Perda por cross-sell não feito: carteira × (produtos_benchmark - produtos_atual) × receita_marginal_produto
- Perda por lead lento: leads_desistentes × taxa_conversao × receita_anual_cliente

PERGUNTAS-CHAVE PARA ESTE NICHO:
- "Quantos produtos em média cada cliente tem com vocês?"
- "Qual o tempo médio de onboarding de um novo cliente?"
- "Tem processo de contato proativo ou só reativo?"
`,

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TURISMO E HOTELARIA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Turismo e Hotelaria": `
GARGALOS ESTRUTURAIS POR CAMADA CAUSAL:

CAUSA RAIZ:
1. Revenue management inexistente → preço fixo o ano todo, perdendo receita em alta e ocupação em baixa
2. Ausência de gestão de canais → dependência excessiva de OTAs (booking, airbnb) com comissão alta
3. Falta de gestão de experiência do hóspede → review ruim = menos reservas futuras

SINTOMAS OPERACIONAIS:
- Ocupação irregular (alta temporada lotado, baixa temporada vazio)
- Dependência de >60% das reservas via OTAs (comissão 15-25%)
- Check-in/check-out lento → filas e insatisfação
- Manutenção preventiva inexistente → quartos fora de operação

BENCHMARKS (fontes: FOHB, HotStats, STR):
- RevPAR (receita por quarto disponível): benchmark varia por cidade
- Ocupação anual: >65% (capital), >55% (interior)
- ADR (diária média): crescimento real >5%/ano
- Comissão OTA: <20% do faturamento total
- Reservas diretas: >40% do total (meta)
- NPS hotelaria: >50

FÓRMULAS DE CÁLCULO DE PERDA:
- Perda por comissão OTA: reservas_ota × valor_medio × taxa_comissao - custo_canal_direto
- Perda por quartos fora de operação: quartos_indisponiveis × ADR × dias_indisponivel
- Perda por pricing ruim: (ADR_potencial_alta - ADR_praticado) × quartos_vendidos_alta

PERGUNTAS-CHAVE PARA ESTE NICHO:
- "Qual sua ocupação média anual? E na baixa temporada?"
- "Que percentual das reservas vem de canais diretos vs OTAs?"
- "Você pratica preço dinâmico ou a diária é fixa?"
`,

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PETS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Pets": `
GARGALOS ESTRUTURAIS POR CAMADA CAUSAL:

CAUSA RAIZ:
1. Falta de gestão de agenda/capacidade → horários ociosos ou sobrecarga
2. Ausência de régua de retorno → dono do pet esquece de voltar (vacina, tosa, consulta)
3. Dependência do tosador/veterinário-chave → sai e leva clientes

SINTOMAS OPERACIONAIS:
- Capacidade subutilizada em dias/horários fracos
- Cliente não lembra de retornos periódicos → receita recorrente perdida
- Falta de cross-sell (banho → tosa → ração → acessórios)

BENCHMARKS (fontes: IPB, Sebrae Pet):
- Ticket médio banho/tosa: R$50-120
- Frequência de retorno: a cada 15-30 dias (banho/tosa)
- Margem líquida pet shop: 12-20%
- Margem ração: 15-30%
- Margem serviços: 40-60%

FÓRMULAS DE CÁLCULO DE PERDA:
- Perda por cliente sem retorno: clientes_inativos × ticket_medio × frequencia_ideal
- Perda por cross-sell: clientes_servico × (ticket_potencial - ticket_atual) × 12

PERGUNTAS-CHAVE PARA ESTE NICHO:
- "Você lembra seus clientes quando é hora de voltar (vacina, tosa)?"
- "Qual o ticket médio por visita? Vende só o serviço ou também produtos?"
- "Se seu principal tosador/veterinário sair, quantos clientes você perde?"
`,

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUTOMOTIVO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Automotivo": `
GARGALOS ESTRUTURAIS POR CAMADA CAUSAL:

CAUSA RAIZ:
1. Orçamento manual sem padronização → preço varia por mecânico, cliente desconfia
2. Falta de controle de peças e estoque → peça errada, espera por fornecedor, veículo parado
3. Ausência de processo de follow-up → cliente faz serviço e nunca mais volta

SINTOMAS OPERACIONAIS:
- Veículo parado esperando peça → box ocupado sem gerar receita
- Mecânico fazendo orçamento ao invés de produzindo
- Cliente reclama de preço sem entender o que está pagando
- Falta de recall proativo de manutenções preventivas

BENCHMARKS (fontes: Sindirepa, Sindipeças):
- Margem peças: 30-60%
- Margem serviço: 50-70%
- Ticket médio oficina: R$300-1.200
- Taxa de retorno 6 meses: >40% indica fidelização
- Tempo médio de execução: desvio <20% do orçado

FÓRMULAS DE CÁLCULO DE PERDA:
- Perda por box parado: boxes_ociosos × receita_media_por_box_dia × dias_mes
- Perda por cliente sem retorno: clientes_unicos_mes × (1 - taxa_retorno) × ticket_medio × visitas_potenciais_ano

PERGUNTAS-CHAVE PARA ESTE NICHO:
- "Como faz orçamento? Tem tabela de preços ou cada mecânico decide?"
- "Quanto tempo em média um carro fica parado esperando peça?"
- "Você lembra o cliente quando está na hora da revisão/troca de óleo?"
`,

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AGRONEGÓCIO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Agronegócio": `
GARGALOS ESTRUTURAIS POR CAMADA CAUSAL:

CAUSA RAIZ:
1. Gestão de insumos sem planejamento por safra → compra no momento errado, sobrepreço
2. Falta de rastreabilidade da produção → impossível identificar causa de perda
3. Tomada de decisão centralizada no produtor → equipe sem autonomia, gargalo de gestão

SINTOMAS OPERACIONAIS:
- Perda na colheita por timing errado ou equipamento mal calibrado
- Estoque de insumos inadequado (excesso ou falta)
- Informação de campo não chega à gestão a tempo

BENCHMARKS (fontes: Embrapa, CNA, CEPEA):
- Perda na colheita: <3% (média BR soja: 3-5%)
- Custo de produção: conhecer por hectare/arroba é fundamental
- Margem líquida agro: 10-25% dependendo da cultura e gestão
- OEE de maquinário: >70% na safra

FÓRMULAS DE CÁLCULO DE PERDA:
- Perda na colheita: taxa_perda × produção_total × preço_por_unidade
- Perda por insumo no timing errado: sobrepreço × volume_comprado
- Perda por equipamento parado: horas_parada × custo_hora_maquina × impacto_produtividade

PERGUNTAS-CHAVE PARA ESTE NICHO:
- "Você conhece seu custo de produção por hectare/arroba/tonelada?"
- "Como planeja a compra de insumos? Antecipa ou compra na hora?"
- "Qual o percentual de perda na colheita/processamento?"
`,

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Moda": `
GARGALOS ESTRUTURAIS POR CAMADA CAUSAL:

CAUSA RAIZ:
1. Produção sem base em dados de venda → coleção que encalha
2. Gestão de estoque por "feeling" → sobra de tamanhos/cores erradas
3. Falta de identidade de marca clara → compete por preço

SINTOMAS OPERACIONAIS:
- Estoque de fim de coleção = liquidação com margem negativa
- Tamanhos/cores que não vendem ocupam espaço e capital
- Coleção nova lançada sem testar o que funcionou na anterior

BENCHMARKS (fontes: ABIT, IEMI, Sebrae Moda):
- Giro de estoque ideal: 4-6x/ano (fast fashion: 8-12x)
- Margem bruta: 55-70% (varejo moda)
- Taxa de remarcação: <20% do estoque
- Sell-through rate: >70% da coleção na primeira temporada

FÓRMULAS DE CÁLCULO DE PERDA:
- Perda por estoque encalhado: unidades_nao_vendidas × (custo_producao + custo_oportunidade)
- Perda por remarcação: unidades_remarcadas × (preco_original - preco_liquidacao)

PERGUNTAS-CHAVE PARA ESTE NICHO:
- "Qual o percentual da coleção que vai para liquidação?"
- "Você analisa dados de venda da coleção anterior para planejar a próxima?"
- "Qual seu giro de estoque atual?"
`,

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ENERGIA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Energia": `
GARGALOS ESTRUTURAIS POR CAMADA CAUSAL:

CAUSA RAIZ:
1. Processo comercial lento → lead esfria antes de fechar (solar: ciclo de 15-60 dias)
2. Falta de padronização da instalação → qualidade inconsistente, retrabalho em telhado
3. Pós-venda inexistente → cliente não indica, não compra manutenção

SINTOMAS OPERACIONAIS:
- Lead qualificado perdido por follow-up demorado
- Instalação com retrabalho por falta de vistoria prévia padronizada
- Reclamação de desempenho por dimensionamento errado do sistema

BENCHMARKS (fontes: ABSOLAR, Greener, Canal Solar):
- Conversão lead→venda solar: 8-15%
- Margem líquida instaladora: 15-25%
- Ticket médio residencial: R$15k-40k
- Ticket médio comercial: R$50k-500k
- Ciclo de venda: 15-45 dias (residencial), 30-90 dias (comercial)
- Taxa de indicação: >30% dos clientes devem indicar

FÓRMULAS DE CÁLCULO DE PERDA:
- Perda por lead perdido: leads_nao_convertidos × taxa_conversao_potencial × ticket_medio × margem
- Perda por retrabalho: visitas_extras × custo_equipe_dia

PERGUNTAS-CHAVE PARA ESTE NICHO:
- "Quanto tempo leva do primeiro contato ao contrato assinado?"
- "Qual sua taxa de conversão de proposta enviada?"
- "Tem processo de pós-venda para gerar indicações?"
`,

  };

  // Normalize niche key: try direct match, then by label
  if (knowledge[niche]) return knowledge[niche];

  // Agency aliases — catch all variations
  const agencyAliases = ['agencia', 'agência', 'marketing', 'agencia_digital', 'marketing_digital',
    'publicidade', 'branding', 'social_media', 'social media', 'performance', 'seo', 'sem',
    'growth', 'conteudo', 'conteúdo', 'full_service', 'full service', 'produtora'];

  const saasAliases = ['saas', 'software', 'startup', 'produto_digital', 'produto digital',
    'plataforma', 'aplicativo', 'app', 'fintech', 'healthtech', 'edtech', 'legaltech',
    'proptech', 'agritech', 'martech', 'regtech', 'devops', 'cloud', 'ia', 'machine_learning',
    'blockchain', 'iot', 'fabrica_de_software', 'fábrica de software', 'software_house'];

  const nicheNormalized = niche.toLowerCase().trim();

  if (agencyAliases.some(a => nicheNormalized.includes(a))) {
    return knowledge["Agência"];
  }

  if (saasAliases.some(a => nicheNormalized.includes(a))) {
    return knowledge["Tecnologia"];
  }

  // Try matching by common keywords
  for (const [key, value] of Object.entries(knowledge)) {
    if (key.toLowerCase() === nicheNormalized || nicheNormalized.includes(key.toLowerCase())) {
      return value;
    }
  }

  // Fallback with universal guidance
  return `Nicho "${niche}" sem base de conhecimento específica pré-carregada.

ORIENTAÇÃO PARA NICHOS SEM BASE ESPECÍFICA:
Aplique a inteligência universal de negócios com foco nos três vazamentos (receita, custo, tempo).
Use o framework de causa raiz vs. sintoma rigorosamente.
Busque benchmarks genéricos de PMEs brasileiras:
- Margem líquida saudável: 8-20% dependendo do setor
- Retrabalho aceitável: <10% das operações
- Dependência do dono: faturamento não deve cair >20% na ausência
- Churn mensal: <5% para serviços recorrentes
- Conversão comercial: >20% para leads qualificados

Calcule perdas usando os dados coletados no questionário, priorizando Tier 1 (cálculo direto)
quando houver dados e Tier 2 (estimativa por faixa) quando houver dados parciais.
`;
}
