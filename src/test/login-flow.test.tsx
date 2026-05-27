import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { auth: {}, from: vi.fn() },
}));
vi.mock("@/hooks/useAuth");
vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

const mockUseAuth = vi.mocked(useAuth);

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

// ── Login ──────────────────────────────────────────────────────────────────

describe("Login", () => {
  const signIn = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      profile: null,
      signIn,
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
    } as any);
  });

  it("renderiza os campos e o botão de entrar", () => {
    renderWithRouter(<Login />);
    expect(screen.getByPlaceholderText("seu@email.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
  });

  it("exibe erro ao submeter com campos vazios", async () => {
    renderWithRouter(<Login />);
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Preencha todos os campos")
    );
    expect(signIn).not.toHaveBeenCalled();
  });

  it("chama signIn com e-mail e senha corretos", async () => {
    signIn.mockResolvedValue({ error: null });
    renderWithRouter(<Login />);

    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), {
      target: { value: "admin@caligon.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "senha123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() =>
      expect(signIn).toHaveBeenCalledWith("admin@caligon.com", "senha123")
    );
  });

  it("exibe mensagem amigável para credenciais inválidas", async () => {
    signIn.mockResolvedValue({ error: { message: "Invalid login credentials" } });
    renderWithRouter(<Login />);

    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), {
      target: { value: "x@x.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "errada" },
    });
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("E-mail ou senha incorretos")
    );
  });

  it("alterna visibilidade da senha ao clicar no ícone", () => {
    renderWithRouter(<Login />);
    const passwordInput = screen.getByPlaceholderText("••••••••");
    const toggleBtn = screen.getByRole("button", { name: /mostrar senha/i });

    expect(passwordInput).toHaveAttribute("type", "password");
    fireEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute("type", "text");
    fireEvent.click(screen.getByRole("button", { name: /ocultar senha/i }));
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("exibe tela de carregamento enquanto loading=true", () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true, profile: null } as any);
    renderWithRouter(<Login />);
    expect(screen.queryByPlaceholderText("seu@email.com")).not.toBeInTheDocument();
  });
});

// ── Signup ─────────────────────────────────────────────────────────────────

describe("Signup", () => {
  const signUp = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      profile: null,
      signIn: vi.fn(),
      signUp,
      signOut: vi.fn(),
      resetPassword: vi.fn(),
    } as any);
  });

  it("renderiza os campos de nome, e-mail e senha", () => {
    renderWithRouter(<Signup />);
    expect(screen.getByPlaceholderText("Seu nome completo")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("seu@email.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Mínimo 6 caracteres")).toBeInTheDocument();
  });

  it("exibe erro ao submeter com campos vazios", async () => {
    renderWithRouter(<Signup />);
    fireEvent.click(screen.getByRole("button", { name: /criar conta/i }));
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Preencha todos os campos")
    );
    expect(signUp).not.toHaveBeenCalled();
  });

  it("exibe erro quando senha tem menos de 6 caracteres", async () => {
    renderWithRouter(<Signup />);

    fireEvent.change(screen.getByPlaceholderText("Seu nome completo"), {
      target: { value: "João Silva" },
    });
    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), {
      target: { value: "joao@email.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Mínimo 6 caracteres"), {
      target: { value: "abc" },
    });
    fireEvent.click(screen.getByRole("button", { name: /criar conta/i }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Senha deve ter no mínimo 6 caracteres"
      )
    );
    expect(signUp).not.toHaveBeenCalled();
  });

  it("chama signUp com dados corretos e exibe mensagem de sucesso", async () => {
    signUp.mockResolvedValue({ error: null });
    renderWithRouter(<Signup />);

    fireEvent.change(screen.getByPlaceholderText("Seu nome completo"), {
      target: { value: "João Silva" },
    });
    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), {
      target: { value: "joao@email.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Mínimo 6 caracteres"), {
      target: { value: "senha123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /criar conta/i }));

    await waitFor(() =>
      expect(signUp).toHaveBeenCalledWith(
        "joao@email.com",
        "senha123",
        "João Silva"
      )
    );
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        "Conta criada! Verifique seu e-mail para confirmar."
      )
    );
  });
});

// ── ForgotPassword ─────────────────────────────────────────────────────────

describe("ForgotPassword", () => {
  const resetPassword = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      profile: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword,
    } as any);
  });

  it("renderiza o campo de e-mail e o botão de enviar", () => {
    renderWithRouter(<ForgotPassword />);
    expect(screen.getByPlaceholderText("seu@email.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /enviar link/i })).toBeInTheDocument();
  });

  it("exibe erro ao submeter sem e-mail", async () => {
    renderWithRouter(<ForgotPassword />);
    fireEvent.click(screen.getByRole("button", { name: /enviar link/i }));
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Informe seu e-mail")
    );
    expect(resetPassword).not.toHaveBeenCalled();
  });

  it("chama resetPassword com o e-mail correto", async () => {
    resetPassword.mockResolvedValue({ error: null });
    renderWithRouter(<ForgotPassword />);

    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), {
      target: { value: "joao@email.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /enviar link/i }));

    await waitFor(() =>
      expect(resetPassword).toHaveBeenCalledWith("joao@email.com")
    );
  });

  it("exibe confirmação após envio bem-sucedido", async () => {
    resetPassword.mockResolvedValue({ error: null });
    renderWithRouter(<ForgotPassword />);

    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), {
      target: { value: "joao@email.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /enviar link/i }));

    await waitFor(() =>
      expect(screen.getByText("E-mail Enviado")).toBeInTheDocument()
    );
  });
});
