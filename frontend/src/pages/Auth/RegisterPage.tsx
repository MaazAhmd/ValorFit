import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Account Created!</h2>
          <p className="text-gray-600">Redirecting you to the app...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        <div className="space-y-8">
          <header className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Create account</h2>
            <p className="text-sm text-black/60">
              Start designing or shopping today
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm shadow-sm
                           focus:outline-none focus:ring-2 focus:ring-black/80"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="john@example.com"
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
                placeholder="••••••••"
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm shadow-sm
                           focus:outline-none focus:ring-2 focus:ring-black/80"
              />
              <p className="text-xs text-gray-500">Must be at least 6 characters</p>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <label className="text-sm font-medium">I want to:</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRole("customer")}
                  className={`flex-1 px-4 py-2 rounded-xl text-sm font-semibold transition-all
                    ${role === "customer"
                      ? "bg-black text-white shadow-md"
                      : "border border-black/20 hover:bg-black hover:text-white"
                    }`}
                >
                  🛒 Shop T-Shirts
                </button>
                <button
                  type="button"
                  onClick={() => setRole("designer")}
                  className={`flex-1 px-4 py-2 rounded-xl text-sm font-semibold transition-all
                    ${role === "designer"
                      ? "bg-black text-white shadow-md"
                      : "border border-black/20 hover:bg-black hover:text-white"
                    }`}
                >
                  🎨 Sell Designs
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-black py-2.5 text-sm font-semibold text-white
                           shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60"
              >
                {loading ? "Creating account…" : "Create account"}
              </button>

              <Link
                to="/auth/login"
                className="flex-1 rounded-xl border border-black/20 py-2.5 text-sm font-semibold text-center
                           transition hover:bg-black hover:text-white"
              >
                Sign in
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
