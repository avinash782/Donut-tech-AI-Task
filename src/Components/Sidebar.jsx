import React from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `w-full text-left px-4 py-3 rounded-[6px] border-none cursor-pointer flex items-center gap-3 transition-all duration-200 ${isActive
      ? "bg-[#008080] text-white"
      : "bg-transparent text-[#a0aec0] hover:bg-[#004d4d] hover:text-white"
    }`;

  // Generate a local avatar using initials
  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const userInitials = getInitials(user?.name || "User");
  const colors = ["#4A90E2", "#50C878", "#FF6B6B", "#FFD700", "#9B59B6"];
  const colorIndex = (user?.id || 0) % colors.length;
  const avatarColor = colors[colorIndex];

  return (
    <div className="w-[260px] h-screen bg-gradient-to-b from-green-900 to-green-800 p-6 flex flex-col text-white shadow-[2px_0_5px_rgba(0,0,0,0.1)] z-10">

      {/* Brand Section */}
      <div className="mb-10 flex items-center gap-[10px]">
        <div className="w-[35px] h-[35px] bg-green-500 rounded-[8px] flex items-center justify-center font-bold text-[1.2rem]">
          AT
        </div>
        <h1 className="text-[1.25rem] font-bold tracking-[0.5px]">
          ATaskTracker
        </h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 flex flex-col gap-2">



        {/* 🔥 Dashboards - Supabase Data */}
        <NavLink to="/dashboards" className={(props) => `font-normal ${linkClass(props)}`}>
          <div className="w-[18px] h-[18px] border-2 border-green-300 opacity-50"></div>
          Dashboards
        </NavLink>

        {/* Tasks */}
        <NavLink to="/tasks" className={(props) => `font-normal ${linkClass(props)}`}>
          <div className="w-[18px] h-[18px] border-2 border-green-300 opacity-50"></div>
          Tasks
        </NavLink>

        {/* Reports */}
        <NavLink to="/reports" className={(props) => `font-normal ${linkClass(props)}`}>
          <div className="w-[18px] h-[18px] border-2 border-green-300 opacity-50"></div>
          Reports
        </NavLink>

        {/* ✅ Chat */}
        <NavLink to="/chat" className={(props) => `font-normal ${linkClass(props)}`}>
          <div className="w-[18px] h-[18px] border-2 border-green-300 opacity-50"></div>
          Chat
        </NavLink>

        {/* Settings (unchanged) */}
        <NavLink to="/settings" className={(props) => `font-normal ${linkClass(props)}`}>
          <div className="w-[18px] h-[18px] border-2 border-green-300 opacity-50"></div>
          Settings
        </NavLink>

      </nav>

      {/* Role Badge */}
      <div className="mb-4 p-3 rounded-lg bg-green-700/50 border border-green-500/50">
        <p className="text-xs text-green-200 uppercase font-semibold">Current Role</p>
        <p className="text-sm font-bold text-white capitalize mt-1">{role}</p>
      </div>

      {/* Footer */}
      <div className="pt-6 border-t border-green-700 space-y-4">
        <div className="flex items-center gap-3">
          {/* Local Avatar instead of external image */}
          <div
            className="w-[35px] h-[35px] rounded-full flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: avatarColor }}
          >
            {userInitials}
          </div>
          <div className="overflow-hidden flex-1">
            <div className="text-[0.85rem] font-bold whitespace-nowrap">
              {user?.name || "User"}
            </div>
            <div className="text-[0.7rem] text-green-300 whitespace-nowrap">
              {user?.email || "user@example.com"}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition text-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;