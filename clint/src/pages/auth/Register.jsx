import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "react-toastify";

import { registerUser } from "../../services/auth.service";
import { useAuth } from "../../context/useAuth";
import Button from "../../components/common/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";

const ROLES = [
  { label: "Citizen", value: "CITIZEN" },
  { label: "Officer", value: "OFFICER" },
  { label: "Department Head", value: "DEPT_HEAD" },
  { label: "District Admin", value: "DISTRICT_ADMIN" },
  { label: "State Admin", value: "STATE_ADMIN" },
  { label: "Central Admin", value: "CENTRAL_ADMIN" },
  { label: "Super Admin", value: "SUPER_ADMIN" },
];

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "CITIZEN" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const response = await registerUser(form);
      const { user, accessToken } = response.data;
      login({ token: accessToken, user });
      toast.success(`Welcome to CityHelp, ${user?.name || "new user"}`);
      navigate("/");
    } catch (err) {
      const message = err?.response?.data?.message || "Registration failed";
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
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-300/80">Get started</p>
                <h1 className="text-2xl font-semibold text-white">Create your CityHelp account</h1>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-lg leading-8 text-slate-300">
                Join a civic platform built to feel trustworthy, organized, and genuinely usable on mobile and desktop.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Complaint filing with evidence",
                  "Rewards and leaderboard",
                  "Real-time status tracking",
                  "Role-aware admin access",
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-soft p-5">
              <div className="flex items-center gap-3 text-sm text-slate-200">
                <BadgeCheck className="text-cyan-300" size={16} />
                Designed for citizens, officers, and administrators at every level.
              </div>
            </div>
          </div>
        </div>

        <div className="surface p-8 lg:p-10">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300/80">Create account</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Build your profile</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">Register in a few steps and begin reporting or managing civic issues.</p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input name="name" value={form.name} onChange={handleChange} label="Full name" placeholder="Your name" autoComplete="name" />
            </div>

            <div className="sm:col-span-2">
              <Input name="email" type="email" value={form.email} onChange={handleChange} label="Email" placeholder="you@example.com" autoComplete="email" />
            </div>

            <Input name="password" type="password" value={form.password} onChange={handleChange} label="Password" placeholder="••••••••" autoComplete="new-password" />
            <Input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} label="Confirm password" placeholder="••••••••" autoComplete="new-password" />

            <div className="sm:col-span-2">
              <Select name="role" value={form.role} onChange={handleChange} label="Account role">
                {ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </Select>
            </div>

            {error && <p className="sm:col-span-2 rounded-2xl border border-rose-500/15 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</p>}

            <div className="sm:col-span-2">
              <Button type="submit" disabled={loading} className="w-full" trailingIcon={<ArrowRight size={16} />}>
                {loading ? "Creating account..." : "Register"}
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-slate-300">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-cyan-300 transition hover:text-cyan-200">
              Login now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
