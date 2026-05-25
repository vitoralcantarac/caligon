import { describe, it, expect } from "vitest";
import {
  STATUS_LABELS,
  STATUS_COLOR,
  STATUS_STEPS,
  formatLossValue,
  financialGateLabels,
  roadmapPhaseLabels,
  severityStyle,
} from "@/lib/constants";

describe("STATUS_LABELS", () => {
  it("cobre todos os status do ciclo de vida", () => {
    const expectedStatuses = ["cadastro", "questionario", "diagnostico", "fluxogramas", "relatorio", "revisao", "aprovado", "entregue"];
    expectedStatuses.forEach((status) => {
      expect(STATUS_LABELS[status]).toBeDefined();
      expect(STATUS_LABELS[status].length).toBeGreaterThan(0);
    });
  });

  it("STATUS_STEPS contém os mesmos status que STATUS_LABELS", () => {
    STATUS_STEPS.forEach((step) => {
      expect(STATUS_LABELS[step]).toBeDefined();
    });
  });

  it("STATUS_COLOR cobre todos os status", () => {
    STATUS_STEPS.forEach((step) => {
      expect(STATUS_COLOR[step]).toBeDefined();
    });
  });

  it("statuses de aprovação têm badge-success", () => {
    expect(STATUS_COLOR["aprovado"]).toBe("badge-success");
    expect(STATUS_COLOR["entregue"]).toBe("badge-success");
  });

  it("statuses iniciais têm badge-info", () => {
    expect(STATUS_COLOR["cadastro"]).toBe("badge-info");
    expect(STATUS_COLOR["questionario"]).toBe("badge-info");
  });
});

describe("formatLossValue", () => {
  it("formata valor simples em reais", () => {
    const result = formatLossValue(10000);
    expect(result).toContain("10.000");
    expect(result).toContain("R$");
  });

  it("formata faixa de valores quando displayMode é range", () => {
    const result = formatLossValue(0, "range", 5000, 8000);
    expect(result).toContain("5.000");
    expect(result).toContain("8.000");
    expect(result).toContain("–");
  });

  it("formata como estimativa quando displayMode é qualitative", () => {
    const result = formatLossValue(3000, "qualitative");
    expect(result).toContain("estimativa");
    expect(result).toContain("3.000");
  });

  it("retorna mensagem quando qualitative e loss é zero", () => {
    const result = formatLossValue(0, "qualitative");
    expect(result).toBe("Impacto não quantificado");
  });

  it("usa formatação pt-BR com separador de milhar", () => {
    const result = formatLossValue(1000000);
    expect(result).toContain("1.000.000");
  });
});

describe("financialGateLabels", () => {
  it("cobre os três estados do financial gate", () => {
    expect(financialGateLabels["sim"]).toBeDefined();
    expect(financialGateLabels["parcial"]).toBeDefined();
    expect(financialGateLabels["nao"]).toBeDefined();
  });

  it("cada estado tem label, icon e color", () => {
    ["sim", "parcial", "nao"].forEach((gate) => {
      expect(financialGateLabels[gate].label).toBeTruthy();
      expect(financialGateLabels[gate].icon).toBeTruthy();
      expect(financialGateLabels[gate].color).toBeTruthy();
    });
  });

  it("estado sim tem cor de sucesso", () => {
    expect(financialGateLabels["sim"].color).toContain("success");
  });

  it("estado nao tem cor de erro", () => {
    expect(financialGateLabels["nao"].color).toContain("destructive");
  });
});

describe("roadmapPhaseLabels", () => {
  it("cobre as 4 fases do roadmap", () => {
    const phases = ["estabilizacao", "padronizacao", "automacao", "otimizacao"];
    phases.forEach((phase) => {
      expect(roadmapPhaseLabels[phase]).toBeDefined();
    });
  });

  it("fases estão em ordem crescente", () => {
    expect(roadmapPhaseLabels["estabilizacao"].order).toBe(1);
    expect(roadmapPhaseLabels["padronizacao"].order).toBe(2);
    expect(roadmapPhaseLabels["automacao"].order).toBe(3);
    expect(roadmapPhaseLabels["otimizacao"].order).toBe(4);
  });

  it("cada fase tem label e color", () => {
    Object.values(roadmapPhaseLabels).forEach((phase) => {
      expect(phase.label).toBeTruthy();
      expect(phase.color).toBeTruthy();
    });
  });
});

describe("severityStyle", () => {
  it("cobre os 4 níveis de severidade", () => {
    expect(severityStyle["critical"]).toBeDefined();
    expect(severityStyle["high"]).toBeDefined();
    expect(severityStyle["medium"]).toBeDefined();
    expect(severityStyle["low"]).toBeDefined();
  });

  it("severidade crítica usa badge destrutivo", () => {
    expect(severityStyle["critical"]).toContain("destructive");
  });
});
