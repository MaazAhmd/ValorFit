import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/authService";

type Props = { onSwitch?: () => void };

export default function LoginPage({ onSwitch }: Props) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"customer" | "designer">("customer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) return setError("Please enter email and password.");

    try {
      setLoading(true);
      await login({ email, password, role });
      // navigate to landing (root) after successful login
      navigate("/");
    } catch (err: any) {
      setError(err?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const fillTestAccount = () => {
    setEmail("admin@admin.com");
    setPassword("12345");
    setRole("designer");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
        <p className="text-sm text-black/60">
          Sign in to continue to T-Shirt Studio
        </p>
        <p className="text-xs text-black/40">
          Test account: <strong>admin@admin.com</strong> / <strong>12345</strong>
          {" "}— use for local checks.
        </p>
        <button type="button" onClick={fillTestAccount} className="text-xs underline mt-1">
          Use test account
        </button>

      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm shadow-sm
                       focus:outline-none focus:ring-2 focus:ring-black/80"
          />
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm shadow-sm
                       focus:outline-none focus:ring-2 focus:ring-black/80"
          />
        </div>

        {/* Role Selector */}
        <div className="flex gap-2">
          {["customer", "designer"].map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r as any)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all
                ${
                  role === r
                    ? "bg-black text-white shadow-md"
                    : "border border-black/20 hover:bg-black hover:text-white"
                }`}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-xl bg-black py-2.5 text-sm font-semibold text-white
                       shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/auth/register")}
            className="flex-1 rounded-xl border border-black/20 py-2.5 text-sm font-semibold
                       transition hover:bg-black hover:text-white"
          >
            Create account
          </button>
        </div>
      </form>
    </div>
  );
}
