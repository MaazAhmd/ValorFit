import { useState } from "react";
import { register } from "../../services/authService";

type Props = { onSwitch?: () => void };

export default function RegisterPage({ onSwitch }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"customer" | "designer">("customer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name || !email || !password)
      return setError("Please complete all fields.");

    try {
      setLoading(true);
      await register({ name, email, password, role });
    } catch (err: any) {
      setError(err?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Create account</h2>
        <p className="text-sm text-black/60">
          Start designing or shopping today
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        {[{
          value: name,
          setter: setName,
          placeholder: "Full name",
        },{
          value: email,
          setter: setEmail,
          placeholder: "Email",
          type: "email",
        },{
          value: password,
          setter: setPassword,
          placeholder: "Password",
          type: "password",
        }].map((f, i) => (
          <input
            key={i}
            type={f.type || "text"}
            placeholder={f.placeholder}
            value={f.value}
            onChange={e => f.setter(e.target.value)}
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm shadow-sm
                       focus:outline-none focus:ring-2 focus:ring-black/80"
          />
        ))}

        {/* Role */}
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

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-xl bg-black py-2.5 text-sm font-semibold text-white
                       shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60"
          >
            {loading ? "Creating…" : "Create account"}
          </button>

          <button
            type="button"
            onClick={onSwitch}
            className="flex-1 rounded-xl border border-black/20 py-2.5 text-sm font-semibold
                       transition hover:bg-black hover:text-white"
          >
            Sign in
          </button>
        </div>
      </form>
    </div>
  );
}
