export type AuthPayload = {
  name?: string;
  email: string;
  password: string;
  role: "designer" | "customer";
};

async function handleResp(res: Response) {
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    if (!res.ok) throw new Error(json?.message || res.statusText || "Request failed");
    return json;
  } catch {
    if (!res.ok) throw new Error(text || res.statusText);
    return text;
  }
}

/**
 * Attempts real backend auth first. If backend is unreachable or returns error,
 * falls back to a dev-only mock account:
 *   email: admin@admin.com
 *   password: 12345
 *
 * The mock returns a token stored in localStorage and minimal user info.
 * Do NOT rely on this for production.
 */
export async function login(payload: { email: string; password: string; role: "designer" | "customer" }) {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      // try to read server error and fall through to mock
      await handleResp(res);
    }
    const data = await res.json();
    if (data?.token) localStorage.setItem("auth_token", data.token);
    return data;
  } catch {
    // Fallback mock for local development/testing only
    if (payload.email === "admin@admin.com" && payload.password === "12345") {
      const mock = {
        token: "dev-mock-token",
        user: { name: "Admin", email: payload.email, role: payload.role },
      };
      localStorage.setItem("auth_token", mock.token);
      return mock;
    }
    throw new Error("Authentication failed (no backend). Use admin@admin.com / 12345 for local testing.");
  }
}

export async function register(payload: AuthPayload) {
  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await handleResp(res);
  } catch {
    // simple mock success for development
    return { ok: true, message: "Mock account created (dev only)." };
  }
}

export function logout() {
  localStorage.removeItem("auth_token");
}