import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { login, register, getUserRole } from "../../services/authService";
import { useAuth } from "@/context/AuthContext";

const redirectByRole = (navigate: any, role?: string) => {
  if (role === "admin") return navigate("/admin/products");
  if (role === "designer") return navigate("/designer/products");
  return navigate("/");
};

export default function AuthPage() {
  const navigate = useNavigate();
  const { isAuthenticated, setAuthData } = useAuth();
  const [searchParams] = useSearchParams();
  const initialMode = (searchParams.get("mode") as "login" | "register") || "login";

  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"customer" | "designer">("customer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) return setError("Email and password required.");
    if (mode === "register" && !name) return setError("Name required.");

    try {
      setLoading(true);
      let result;
      if (mode === "login") {
        result = await login({ email, password, role });
      } else {
        result = await register({ email, password, name, role });
      }
      // Update auth context with the user data and token
      setAuthData(result.user, result.access_token);
      redirectByRole(navigate, result.user?.role || getUserRole());
    } catch (err: any) {
      setError(err?.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setError(null);
    const newMode = mode === "login" ? "register" : "login";
    setMode(newMode);
    navigate(`/auth?mode=${newMode}`);
  };

  const fillTestAccount = () => {
    setEmail("test@example.com");
    setPassword("secret123");
    setName("Test User");
    setRole("designer");
  };

  return (
    <main className="min-h-screen bg-white text-black flex items-center justify-center px-6 py-12 mt-16">
      <div className="w-full max-w-md">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">ValorFit</h1>
          <p className="text-sm text-black/60 mt-2">
            {mode === "login" ? "Sign in to your account" : "Create a new account"}
          </p>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name (register only) */}
          {mode === "register" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full border border-black/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/80"
              />
            </div>
          )}

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-black/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/80"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-black/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/80"
            />
          </div>

          {/* Role selector */}
          {mode === "register" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Account type</label>
              <div className="flex gap-3">
                {["customer", "designer"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r as any)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${role === r
                      ? "bg-black text-white shadow-md"
                      : "border border-black/20 hover:bg-black/5"
                      }`}
                  >
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error message */}
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white rounded-lg py-2.5 text-sm font-semibold shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Loading…" : mode === "login" ? "Sign in" : "Create account"}
          </button>

          {/* Toggle mode */}
          <div className="text-center">
            <p className="text-sm text-black/60">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={toggleMode}
                className="font-semibold text-black underline hover:text-black/80"
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>

          {/* Test account helper */}
          {mode === "login" && (
            <button
              type="button"
              onClick={fillTestAccount}
              className="w-full text-xs text-black/60 py-2 rounded border border-black/10 hover:bg-black/5 transition"
            >
              Use test account (designer)
            </button>
          )}
        </form>
      </div>
    </main>
  );
}