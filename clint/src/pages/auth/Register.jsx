import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { registerUser } from "../../services/auth.service";
import { useAuth } from "../../context/AuthContext";


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

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "CITIZEN",
  });

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
      login({ token: accessToken, user }); // auto-login after registration
      navigate("/");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black-100">
      <div className="w-full max-w-md bg-gray-400 rounded shadow-sm p-6">
        <h2 className="text-2xl font-bold text-center text-blue-600">
          CityHelp
        </h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          Create a new account
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="mt-1 w-full rounded border px-3 py-2 text-sm"
              placeholder="Your name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="mt-1 w-full rounded border px-3 py-2 text-sm"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="mt-1 w-full rounded border px-3 py-2 text-sm"
              placeholder="••••••••"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="mt-1 w-full rounded border px-3 py-2 text-sm"
              placeholder="••••••••"
            />
          </div>

          

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
