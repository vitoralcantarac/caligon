import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock do cliente Supabase ───────────────────────────────────────────────
// vi.mock é hoisted para o topo do arquivo pelo Vitest; por isso as funções
// de mock devem ser criadas com vi.hoisted() para estarem disponíveis antes
// de qualquer import ser avaliado.

const { mockGetUser, mockFrom } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockFrom: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: mockGetUser },
    from: mockFrom,
  },
}));

import { hasAccessToAnalysis, getUserCurrentPlan, type AccessResult } from "@/lib/access-control";

// ── Helpers ────────────────────────────────────────────────────────────────

/** Cria um objeto que imita o query-builder encadeado do Supabase. */
function buildChain(data: unknown, error: unknown = null) {
  const c: Record<string, unknown> = {};
  const self = () => c;
  const terminal = () => Promise.resolve({ data, error });
  c.select = self;
  c.eq = self;
  c.order = self;
  c.limit = self;
  c.maybeSingle = terminal;
  c.single = terminal;
  c.upsert = terminal;
  c.insert = () => ({ select: () => ({ single: terminal }) });
  return c;
}

const USER_ID = "user-abc";
const ANALYSIS_ID = "analysis-123";

// ── hasAccessToAnalysis ────────────────────────────────────────────────────

describe("hasAccessToAnalysis", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retorna none quando não há usuário autenticado", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const result = await hasAccessToAnalysis(ANALYSIS_ID);

    expect(result).toEqual({ hasAccess: false, accessType: "none" });
  });

  it("retorna internal para consultores internos", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_ID } } });
    mockFrom.mockReturnValue(buildChain({ user_type: "internal" }));

    const result = await hasAccessToAnalysis(ANALYSIS_ID);

    expect(result).toEqual({ hasAccess: true, accessType: "internal" });
    // Deve retornar cedo — nunca consultar unlocked_diagnostics nem subscriptions
    expect(mockFrom).toHaveBeenCalledTimes(1);
  });

  it("retorna unlocked quando há registro em unlocked_diagnostics", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_ID } } });
    mockFrom
      .mockReturnValueOnce(buildChain({ user_type: "client" }))   // profiles
      .mockReturnValueOnce(buildChain({ id: "unlock-1" }));        // unlocked_diagnostics

    const result = await hasAccessToAnalysis(ANALYSIS_ID);

    expect(result).toEqual({ hasAccess: true, accessType: "unlocked" });
    // Deve retornar cedo — sem consultar subscriptions
    expect(mockFrom).toHaveBeenCalledTimes(2);
  });

  it("retorna none quando sem unlock e sem assinatura", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_ID } } });
    mockFrom
      .mockReturnValueOnce(buildChain({ user_type: "client" }))  // profiles
      .mockReturnValueOnce(buildChain(null))                      // unlocked_diagnostics: nenhum
      .mockReturnValueOnce(buildChain(null));                     // subscriptions: nenhuma

    const result = await hasAccessToAnalysis(ANALYSIS_ID);

    expect(result).toEqual({ hasAccess: false, accessType: "none" });
  });

  it("retorna subscription com plano unlimited independente do uso", async () => {
    const sub = {
      id: "sub-1",
      expires_at: "2099-12-31",
      diagnostics_used: 999,
      plans: { diagnostics_unlimited: true, diagnostics_per_period: 0 },
    };
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_ID } } });
    mockFrom
      .mockReturnValueOnce(buildChain({ user_type: "client" }))
      .mockReturnValueOnce(buildChain(null))
      .mockReturnValueOnce(buildChain(sub));

    const result = await hasAccessToAnalysis(ANALYSIS_ID);

    expect(result.hasAccess).toBe(true);
    expect(result.accessType).toBe("subscription");
    expect(result.subscription).toBeDefined();
  });

  it("retorna subscription quando quota não foi esgotada (2/5 usados)", async () => {
    const sub = {
      id: "sub-2",
      expires_at: "2099-12-31",
      diagnostics_used: 2,
      plans: { diagnostics_unlimited: false, diagnostics_per_period: 5 },
    };
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_ID } } });
    mockFrom
      .mockReturnValueOnce(buildChain({ user_type: "client" }))
      .mockReturnValueOnce(buildChain(null))
      .mockReturnValueOnce(buildChain(sub));

    const result = await hasAccessToAnalysis(ANALYSIS_ID);

    expect(result.hasAccess).toBe(true);
    expect(result.accessType).toBe("subscription");
  });

  it("retorna none quando quota esgotada (5/5 usados)", async () => {
    const sub = {
      id: "sub-3",
      expires_at: "2099-12-31",
      diagnostics_used: 5,
      plans: { diagnostics_unlimited: false, diagnostics_per_period: 5 },
    };
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_ID } } });
    mockFrom
      .mockReturnValueOnce(buildChain({ user_type: "client" }))
      .mockReturnValueOnce(buildChain(null))
      .mockReturnValueOnce(buildChain(sub));

    const result = await hasAccessToAnalysis(ANALYSIS_ID);

    expect(result.hasAccess).toBe(false);
    expect(result.accessType).toBe("none");
    expect(result.subscription).toBeDefined();
  });

  it("retorna none quando assinatura expirada (mesmo com unlimited)", async () => {
    const sub = {
      id: "sub-4",
      expires_at: "2020-01-01",
      diagnostics_used: 0,
      plans: { diagnostics_unlimited: true },
    };
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_ID } } });
    mockFrom
      .mockReturnValueOnce(buildChain({ user_type: "client" }))
      .mockReturnValueOnce(buildChain(null))
      .mockReturnValueOnce(buildChain(sub));

    const result = await hasAccessToAnalysis(ANALYSIS_ID);

    expect(result.hasAccess).toBe(false);
    expect(result.accessType).toBe("none");
    expect(result.subscription).toBeDefined();
  });

  it("retorna none quando assinatura sem expires_at e com quota zerada", async () => {
    const sub = {
      id: "sub-5",
      expires_at: null,
      diagnostics_used: 3,
      plans: { diagnostics_unlimited: false, diagnostics_per_period: 3 },
    };
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_ID } } });
    mockFrom
      .mockReturnValueOnce(buildChain({ user_type: "client" }))
      .mockReturnValueOnce(buildChain(null))
      .mockReturnValueOnce(buildChain(sub));

    const result = await hasAccessToAnalysis(ANALYSIS_ID);

    expect(result.hasAccess).toBe(false);
    expect(result.accessType).toBe("none");
  });
});

// ── getUserCurrentPlan ─────────────────────────────────────────────────────

describe("getUserCurrentPlan", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retorna null sem usuário autenticado", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const result = await getUserCurrentPlan();
    expect(result).toBeNull();
  });

  it("retorna null sem assinatura ativa", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_ID } } });
    mockFrom.mockReturnValue(buildChain(null));
    const result = await getUserCurrentPlan();
    expect(result).toBeNull();
  });

  it('retorna diagnosticsRemaining = "unlimited" para plano unlimited', async () => {
    const sub = {
      id: "sub-1",
      diagnostics_used: 99,
      plans: { diagnostics_unlimited: true, diagnostics_per_period: 0, name: "Pro" },
    };
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_ID } } });
    mockFrom.mockReturnValue(buildChain(sub));

    const result = await getUserCurrentPlan();

    expect(result).not.toBeNull();
    expect(result!.diagnosticsRemaining).toBe("unlimited");
  });

  it("calcula diagnosticsRemaining corretamente (3/5 usados → 2 restantes)", async () => {
    const sub = {
      id: "sub-2",
      diagnostics_used: 3,
      plans: { diagnostics_unlimited: false, diagnostics_per_period: 5, name: "Starter" },
    };
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_ID } } });
    mockFrom.mockReturnValue(buildChain(sub));

    const result = await getUserCurrentPlan();

    expect(result!.diagnosticsRemaining).toBe(2);
  });

  it("retorna 0 quando uso excede o limite (não retorna negativo)", async () => {
    const sub = {
      id: "sub-3",
      diagnostics_used: 7,
      plans: { diagnostics_unlimited: false, diagnostics_per_period: 5 },
    };
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_ID } } });
    mockFrom.mockReturnValue(buildChain(sub));

    const result = await getUserCurrentPlan();

    expect(result!.diagnosticsRemaining).toBe(0);
  });
});

// ── AccessResult — verificações de tipos ──────────────────────────────────

describe("AccessResult — discriminated union", () => {
  it("accessType none implica hasAccess false", () => {
    const r: AccessResult = { hasAccess: false, accessType: "none" };
    expect(r.hasAccess).toBe(false);
  });

  it("accessType internal implica hasAccess true", () => {
    const r: AccessResult = { hasAccess: true, accessType: "internal" };
    expect(r.hasAccess).toBe(true);
  });

  it("accessType subscription carrega objeto subscription", () => {
    const r: AccessResult = {
      hasAccess: true,
      accessType: "subscription",
      subscription: { id: "s1", diagnostics_used: 1 },
    };
    expect(r.subscription).toBeDefined();
  });
});
