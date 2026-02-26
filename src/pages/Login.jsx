import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../config/supabaseClient";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "worker",
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password, form.role);
      alert("Login successful ✅");
      navigate("/dashboards");
    } catch (error) {
      console.error("Login error:", error);
      alert("Invalid email or password ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100 px-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 bg-white rounded-2xl shadow-2xl overflow-hidden">
        
        {/* LEFT SIDE */}
        <div className="hidden md:flex flex-col justify-center p-10 bg-gradient-to-br from-green-600 to-green-500 text-white">
          <h1 className="text-4xl font-bold leading-tight">
            Login to <span className="text-green-200">Autonomous AI Task Tracker</span>
          </h1>
          <p className="mt-4 text-green-100">
            Explore the page 
          </p>

          <div className="mt-8 space-y-3 text-sm">
            <p className="flex items-center gap-2">
              <span className="text-white font-medium">Super Admin - Full system access</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-white font-medium">Admin - Domain management</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-white font-medium">Worker - Task execution</span>
            </p>
          </div>

          <div className="mt-10 p-4 rounded-lg bg-white/20 backdrop-blur-md border border-white/30">
            <p className="text-sm font-semibold text-white mb-2"> Demo Credentials:</p>
            <p className="text-xs text-white/90">
              Super: superadmin@example.com<br/>
              Admin: sarah.johnson@example.com<br/>
              Worker: alice.thompson@example.com
            </p>
            <p className="text-xs text-white/80 mt-2">Password: <strong>123</strong> for all (role-based)</p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="p-8 md:p-10">
          <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-gray-500 mt-2">
            Login to continue to your dashboards.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            {/* Role Dropdown */}
            <div>
              <label className="text-sm text-gray-600 font-medium">Select Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
              >
                <option value="worker">Worker</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600 font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="mt-1 w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 font-medium">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="mt-1 w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition disabled:bg-green-400"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-600 text-center">
            Don’t have an account?{" "}
            <Link to="/signin" className="text-green-600 font-semibold hover:underline">
              Sign Up
            </Link>
          </p>

          <p className="mt-3 text-sm text-gray-500 text-center">
            ←{" "}
            <Link to="/" className="text-gray-600 font-semibold hover:underline">
              Back to Landing Page
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
