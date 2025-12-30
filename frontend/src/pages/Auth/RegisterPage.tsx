import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2, ShoppingBag, Palette, Check } from "lucide-react";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"customer" | "designer">("customer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name || !email || !password)
      return setError("Please complete all fields.");

    if (password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    try {
      setLoading(true);
      await register(name, email, password, role);
      setSuccess(true);
      // Show success message, then navigate
      setTimeout(() => {
        if (role === "designer") {
          navigate("/designer");
        } else {
          navigate("/");
        }
      }, 1500);
    } catch (err: any) {
      setError(err?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="w-full max-w-md p-8 bg-card/80 backdrop-blur-xl rounded-2xl border border-border shadow-card text-center relative z-10">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-display tracking-wide text-foreground mb-2">ACCOUNT CREATED!</h2>
          <p className="text-muted-foreground">Redirecting you to the app...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden py-8">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md p-8 bg-card/80 backdrop-blur-xl rounded-2xl border border-border shadow-card relative z-10">
        <div className="space-y-6">
          {/* Header */}
          <header className="space-y-2 text-center">
            <Link to="/" className="inline-block">
              <h1 className="font-display text-3xl text-primary tracking-wider">T-SHIRT STUDIO</h1>
            </Link>
            <h2 className="text-2xl font-display tracking-wide text-foreground">CREATE ACCOUNT</h2>
            <p className="text-sm text-muted-foreground">
              Start designing or shopping today
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground
                           focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-smooth"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground
                           focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-smooth"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground
                           focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-smooth"
              />
              <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">I want to:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("customer")}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-smooth
                    ${role === "customer"
                      ? "bg-primary text-primary-foreground shadow-glow"
                      : "border border-border text-foreground hover:border-primary/50 hover:bg-secondary"
                    }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Shop Compression Shirts
                </button>
                <button
                  type="button"
                  onClick={() => setRole("designer")}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-smooth
                    ${role === "designer"
                      ? "bg-primary text-primary-foreground shadow-glow"
                      : "border border-border text-foreground hover:border-primary/50 hover:bg-secondary"
                    }`}
                >
                  <Palette className="w-4 h-4" />
                  Sell Designs
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

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
                    Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>

              <Link
                to="/auth/login"
                className="block w-full rounded-lg border border-border py-3 text-sm font-semibold text-center text-foreground
                           transition-smooth hover:bg-secondary hover:border-primary/50"
              >
                Already have an account? Sign In
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
