import { useAuth } from "@/context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export type LoginPayload = { email: string; password: string; role?: string };
export type RegisterPayload = { name?: string; email: string; password: string; role?: "customer" | "designer" | "admin" };
export type AuthUser = { id: string; email: string; role: string; full_name?: string };

function parseJsonSafe(text: string) {
  try { return JSON.parse(text); } catch { return text; }
}

export async function login(payload: LoginPayload) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: payload.email, password: payload.password })
  });
  const txt = await res.text();
  const json = parseJsonSafe(txt);
  if (!res.ok) throw new Error(json?.error?.msg || json?.message || txt || "Login failed");

  const token = json?.access_token || json?.accessToken || json?.token;
  if (!token) throw new Error("No token in response");

  localStorage.setItem("token", token);
  // Store user info from response or metadata
  const user: AuthUser = {
    id: json?.user?.id || "",
    email: payload.email,
    role: payload.role || "customer",
    full_name: json?.user?.user_metadata?.full_name,
  };
  localStorage.setItem("auth_user", JSON.stringify(user));

  return { token, user, raw: json };
}

export async function register(payload: RegisterPayload) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const txt = await res.text();
  const json = parseJsonSafe(txt);
  if (!res.ok) throw new Error(json?.error || json?.message || txt || "Registration failed");

  // After registration, auto-login
  await login({ email: payload.email, password: payload.password, role: payload.role });

  return json;
}

export function getToken() {
  return localStorage.getItem("token");
}

export function getUser(): AuthUser | null {
  const user = localStorage.getItem("auth_user");
  return user ? JSON.parse(user) : null;
}

export function getUserRole(): string | null {
  return getUser()?.role || null;
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("auth_user");
}

export function authFetch(input: RequestInfo, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return fetch(input, { ...init, headers });
}