import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) return setError("Please enter email and password.");

    try {
      setLoading(true);
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        <div className="space-y-8">
          {/* Header */}
          <header className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-sm text-black/60">
              Sign in to continue to T-Shirt Studio
            </p>
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
                placeholder="your@email.com"
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
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

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

              <Link
                to="/auth/register"
                className="flex-1 rounded-xl border border-black/20 py-2.5 text-sm font-semibold text-center
                           transition hover:bg-black hover:text-white"
              >
                Create account
              </Link>
            </div>
          </form>

          {/* Back to home */}
          <div className="text-center">
            <Link to="/" className="text-sm text-black/60 hover:text-black transition">
              ← Back to Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
