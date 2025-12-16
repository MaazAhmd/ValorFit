import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function AdminLoginPage() {
    const navigate = useNavigate();
    const { adminLogin } = useAuth();
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
            await adminLogin(email, password);
            navigate("/admin");
        } catch (err: any) {
            setError(err?.message || "Admin login failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl">
                <div className="space-y-8">
                    {/* Header */}
                    <header className="text-center space-y-2">
                        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl mx-auto flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-white">Admin Portal</h2>
                        <p className="text-sm text-white/60">
                            Secure access for administrators only
                        </p>
                    </header>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-white/80">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white text-sm
                           placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="admin@example.com"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-white/80">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white text-sm
                           placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                                <p className="text-sm text-red-300">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-gradient-to-r from-red-500 to-orange-500 py-3 text-sm font-semibold text-white
                         shadow-lg transition hover:from-red-600 hover:to-orange-600 hover:shadow-xl disabled:opacity-60"
                        >
                            {loading ? "Authenticating..." : "Access Admin Panel"}
                        </button>
                    </form>

                    {/* Back to store link */}
                    <div className="text-center">
                        <button
                            onClick={() => navigate("/")}
                            className="text-sm text-white/60 hover:text-white transition"
                        >
                            ← Back to Store
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
