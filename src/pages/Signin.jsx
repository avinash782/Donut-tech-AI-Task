import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signin() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "worker",
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignup = (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password || !form.role) {
      alert("Please fill all fields");
      return;
    }

    // Store signup data
    signup({
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
    });

    alert("Account created successfully ✅");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 relative overflow-hidden flex items-center justify-center px-4">
      {/* Background Blobs */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-green-300 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute top-40 -right-20 w-72 h-72 bg-emerald-400 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-lime-300 rounded-full blur-3xl opacity-20"></div>

      {/* Glass Card */}
      <div className="relative z-10 w-full max-w-5xl grid md:grid-cols-2 gap-6 rounded-3xl bg-white/25 backdrop-blur-xl border border-white/40 shadow-2xl overflow-hidden">
        
        {/* LEFT SIDE (Brand Panel) */}
        <div className="hidden md:flex flex-col justify-center p-10 bg-white/10 backdrop-blur-xl border-r border-white/20">
          <h1 className="text-4xl font-extrabold leading-tight text-gray-900">
            Join <span className="text-green-700">Autonomous {" "}</span>
            <span className="text-gray-800">AI Task Tracker</span>
          </h1>

          <p className="mt-4 text-gray-600 text-lg leading-relaxed">
            Create your account and start tracking tasks smarter 🚀
          </p>

          <div className="mt-8 space-y-3 text-sm text-gray-700">
            <p className="flex items-center gap-2">
               <span>Add tasks</span>
            </p>
            <p className="flex items-center gap-2">
               <span>Automate business & workflow </span>
            </p>
            <p className="flex items-center gap-2">
               <span>Real time AI assist</span>
            </p>
          </div>

          <div className="mt-10 p-5 rounded-2xl bg-white/30 border border-white/40">
            <p className="text-sm font-semibold text-gray-900">
               Roles Available:
            </p>
            <p className="text-sm text-gray-600 mt-2">
               <strong>Super Admin</strong> - Full system access<br/>
               <strong>Admin</strong> - Domain management<br/>
               <strong>Worker</strong> - Task execution
            </p>
          </div>
        </div>

        {/* RIGHT SIDE (Form) */}
        <div className="p-8 md:p-10">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Create Account 
          </h2>
          <p className="text-gray-600 mt-2">
            Sign up and continue to your layout dashboard.
          </p>

          <form onSubmit={handleSignup} className="mt-7 space-y-4">
            {/* Name */}
            <div>
              <label className="text-sm text-gray-700 font-semibold">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="mt-1 w-full px-4 py-3 rounded-2xl bg-white/40 border border-white/50 backdrop-blur-md
                focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm text-gray-700 font-semibold">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="mt-1 w-full px-4 py-3 rounded-2xl bg-white/40 border border-white/50 backdrop-blur-md
                focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-gray-700 font-semibold">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create a password"
                className="mt-1 w-full px-4 py-3 rounded-2xl bg-white/40 border border-white/50 backdrop-blur-md
                focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Role Dropdown */}
            <div>
              <label className="text-sm text-gray-700 font-semibold">
                Select Role
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-3 rounded-2xl bg-white/40 border border-white/50 backdrop-blur-md
                focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
              >
                <option value="worker">Worker</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-green-600 text-white font-bold hover:bg-green-700 transition shadow-xl shadow-green-200"
            >
              Sign Up
            </button>
          </form>

          {/* Bottom Link */}
          <p className="mt-6 text-sm text-gray-700 text-center">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-green-700 font-bold hover:underline"
            >
              Login
            </Link>
          </p>

          {/* Back to Landing */}
          <p className="mt-3 text-sm text-gray-600 text-center">
            ←{" "}
            <Link to="/" className="hover:underline font-semibold">
              Back to Landing Page
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
