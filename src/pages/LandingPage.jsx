import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 relative overflow-hidden">
      
      {/* Background Blobs */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-green-300 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute top-40 -right-20 w-72 h-72 bg-emerald-400 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-lime-300 rounded-full blur-3xl opacity-20"></div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-14 py-6">
        <h1 className="text-2xl font-extrabold text-green-700 tracking-tight">
          Autonomous<span className="text-gray-700">Tracker</span>
        </h1>

        <div className="flex gap-3">
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl border border-green-300 bg-white/30 backdrop-blur-md hover:bg-white/50 transition font-semibold text-green-700"
          >
            Login
          </Link>

          <Link
            to="/signin"
            className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition font-semibold shadow-lg shadow-green-200"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 px-6 md:px-14 pt-10 md:pt-16 pb-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">

          {/* Left Content */}
          <div>
            <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 backdrop-blur-md border border-white/40 text-green-800 font-semibold text-sm shadow">
               Smart Workflow • Auto Tracking • Productivity Boost
            </p>

            <h2 className="mt-6 text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Welcome to the{" "}
              <span className="text-green-700">Autonomous Task Tracker</span>{" "}
              Tool
            </h2>

            <p className="mt-5 text-gray-600 text-lg leading-relaxed">
              Track tasks, monitor progress, and manage your work smarter.
              A modern tool built for students, teams, and developers to stay
              consistent and productive.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                to="/signin"
                className="px-6 py-3 rounded-2xl bg-green-600 text-white font-bold text-center hover:bg-green-700 transition shadow-xl shadow-green-200"
              >
                Get Started (Free)
              </Link>

              <Link
                to="/login"
                className="px-6 py-3 rounded-2xl bg-white/40 backdrop-blur-md border border-white/50 font-bold text-center text-gray-800 hover:bg-white/60 transition"
              >
                I already have an account
              </Link>
            </div>

            {/* Mini Stats */}
            <div className="mt-10 grid grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white/30 backdrop-blur-md border border-white/40 shadow">
                <p className="mt-2 text-sm font-semibold text-gray-700">
                  Fast UI
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/30 backdrop-blur-md border border-white/40 shadow">
                <p className="mt-2 text-sm font-semibold text-gray-700">
                  Secure Auth
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/30 backdrop-blur-md border border-white/40 shadow">
                <p className="mt-2 text-sm font-semibold text-gray-700">
                  Task Focus
                </p>
              </div>
            </div>
          </div>

          {/* Right Glass Card */}
          <div className="flex justify-center md:justify-end">
            <div className="w-full max-w-md rounded-3xl bg-white/25 backdrop-blur-xl border border-white/40 shadow-2xl p-6 md:p-8">
              <h3 className="text-xl font-bold text-gray-900">
                Why Autonomous Tracker?
              </h3>

              <p className="mt-2 text-gray-600">
                Everything you need to stay consistent and organized.
              </p>

              <div className="mt-6 space-y-4">
                <div className="p-4 rounded-2xl bg-white/30 border border-white/40">
                  <p className="font-semibold text-gray-900">
                     Smart Task Management
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Add tasks, prioritize them, and track them daily.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/30 border border-white/40">
                  <p className="font-semibold text-gray-900">
                     Clean Dashboard Layout
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Sidebar + main content design (like real apps).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/30 border border-white/40">
                  <p className="font-semibold text-gray-900">
                      Upgrade Ready
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Start with localStorage now → JWT + MongoDB later.
                  </p>
                </div>
              </div>

              <div className="mt-7 flex gap-3">
                <Link
                  to="/signin"
                  className="flex-1 px-5 py-3 rounded-2xl bg-green-600 text-white font-bold text-center hover:bg-green-700 transition"
                >
                  Sign Up
                </Link>

                <Link
                  to="/login"
                  className="flex-1 px-5 py-3 rounded-2xl bg-white/40 backdrop-blur-md border border-white/50 font-bold text-center text-gray-800 hover:bg-white/60 transition"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center text-gray-500 text-sm pb-6">
        Built with 💚 using React + Tailwind • Autonomous Task Tracker Tool
      </footer>
    </div>
  );
}
