import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "react-toastify";

import { loginUser } from "../../services/auth.service";
import { useAuth } from "../../context/useAuth";
import Button from "../../components/common/Button";
import Input from "../../components/ui/Input";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);
      const response = await loginUser(form);
      const { user, accessToken } = response.data;
      login({ token: accessToken, user });
      toast.success(`Welcome back, ${user?.name || "user"}`);
      navigate("/");
    } catch (err) {
      const message = err?.response?.data?.message || "Invalid email or password";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="surface relative overflow-hidden p-8 lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.14),transparent_28%)]" />
          <div className="relative space-y-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-300/80">CityHelp</p>
                <h1 className="text-2xl font-semibold text-white">Sign in to your civic workspace</h1>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-lg leading-8 text-slate-300">
                Access complaint tracking, admin analytics, notifications, and reward history from a clean, secure dashboard.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Secure role-based access",
                  "Complaint analytics",
                  "Live notification feed",
                  "Enterprise-grade UX",
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-soft p-5">
              <div className="flex items-center gap-3 text-sm text-slate-200">
                <Sparkles className="text-cyan-300" size={16} />
                Designed to feel like a high-trust government SaaS product.
              </div>
            </div>
          </div>
        </div>

        <div className="surface p-8 lg:p-10">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300/80">Welcome back</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Login to CityHelp</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">Use your account to continue reporting issues and managing civic workflows.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              label="Email"
              placeholder="you@example.com"
              autoComplete="email"
              error={error && !form.email ? error : ""}
            />

            <Input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              label="Password"
              placeholder="Enter your password"
              autoComplete="current-password"
              error={error && !form.password ? error : ""}
            />

            {error && <p className="rounded-2xl border border-rose-500/15 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</p>}

            <Button type="submit" disabled={loading} className="w-full" trailingIcon={<ArrowRight size={16} />}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-300">
            Don’t have an account?{" "}
            <Link to="/register" className="font-semibold text-cyan-300 transition hover:text-cyan-200">
              Register now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
