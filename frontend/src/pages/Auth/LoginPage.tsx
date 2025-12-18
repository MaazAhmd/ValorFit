import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md p-8 bg-card/80 backdrop-blur-xl rounded-2xl border border-border shadow-card relative z-10">
        <div className="space-y-8">
          {/* Header */}
          <header className="space-y-2 text-center">
            <Link to="/" className="inline-block">
              <h1 className="font-display text-3xl text-primary tracking-wider">T-SHIRT STUDIO</h1>
            </Link>
            <h2 className="text-2xl font-display tracking-wide text-foreground">WELCOME BACK</h2>
            <p className="text-sm text-muted-foreground">
              Sign in to continue to your account
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground
                           focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-smooth"
                placeholder="your@email.com"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground
                           focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-smooth"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground
                           shadow-lg transition-smooth hover:shadow-glow hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>

              <Link
                to="/auth/register"
                className="block w-full rounded-lg border border-border py-3 text-sm font-semibold text-center text-foreground
                           transition-smooth hover:bg-secondary hover:border-primary/50"
              >
                Create Account
              </Link>
            </div>
          </form>

          {/* Back to home */}
          <div className="text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
              ← Back to Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
