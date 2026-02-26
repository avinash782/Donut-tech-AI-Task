

import React from "react";
import { useAuth } from "../context/AuthContext";
import { useSupabase } from "../hooks/useFirestore";

// Helpers for initials avatar and color
const getInitials = (name) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const avatarColorClass = (index) => {
  const palette = [
    "bg-emerald-50 text-emerald-700",
    "bg-blue-50 text-blue-700",
    "bg-amber-50 text-amber-700",
    "bg-violet-50 text-violet-700",
  ];
  return palette[index % palette.length];
};

const Mainbar = () => {
  const { user, role, domain } = useAuth();

  // Superadmin: fetch all tasks and admins
  if (role === "superadmin") {
    const { data: tasks = [], loading: tasksLoading, error: tasksError } = useSupabase("tasks");
    const { data: admins = [], loading: adminsLoading, error: adminsError } = useSupabase("admin");

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => (t.status || "").toLowerCase().trim() === "completed").length;
    const pendingTasks = tasks.filter(t => (t.status || "").toLowerCase().trim() === "pending").length;

    return (
      <main className="flex-1 p-6 flex flex-col gap-6 bg-gradient-to-br from-green-50 to-gray-50 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage all domains and admins</p>
          </div>
          <img
            src={user?.avatar || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100&h=100"}
            alt="Profile"
            className="w-12 h-12 rounded-full border-2 border-green-500 object-cover"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6">
          {[
            { title: "Total Tasks", value: totalTasks, border: "border-blue-400", accent: "text-blue-600", icon: "📊" },
            { title: "Completed Tasks", value: completedTasks, border: "border-emerald-400", accent: "text-emerald-600", icon: "✓" },
            { title: "Pending Tasks", value: pendingTasks, border: "border-amber-400", accent: "text-amber-600", icon: "⏳" },
            { title: "Domain Admins", value: admins.length, border: "border-violet-400", accent: "text-violet-600", icon: "👥" },
          ].map((card, index) => (
            <button
              key={index}
              onClick={() => {}}
              className={`relative bg-white rounded-xl shadow-sm p-8 border-l-4 ${card.border} focus:outline-none transition-all duration-200 w-full text-left hover:shadow-md`}
            >
              <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-sm">
                <span className={`${card.accent} text-lg opacity-90`}>{card.icon}</span>
              </div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">{card.title}</p>
              <p className="text-4xl font-extrabold text-slate-900">{String(card.value).padStart(2, '0')}</p>
            </button>
          ))}
        </div>

        {/* Domain Admins Section */}
        <div className="rounded-2xl shadow-sm p-8 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-lg">👥</div>
            <h2 className="text-2xl font-bold text-slate-900">Domain Admins Overview</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {admins.map((admin, idx) => (
              <div
                key={admin.id}
                className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:border-purple-300 transition-all duration-300 hover:-translate-y-1 transform cursor-pointer"
              >
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold ${avatarColorClass(idx)} text-base shadow-sm group-hover:shadow-md transition-shadow`}> 
                    {getInitials(admin.name)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-purple-600 transition-colors">{admin.name}</h3>
                    <p className="text-sm text-purple-600 font-semibold uppercase tracking-wide">{admin.domain} Admin</p>
                  </div>
                  <div className="text-2xl">⭐</div>
                </div>
                {/* Stats for each admin */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200 hover:border-blue-300 transition">
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-2">Total</p>
                    <p className="text-2xl font-extrabold text-blue-700">{admin.totalTasks || 0}</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 text-center border border-emerald-200 hover:border-emerald-300 transition">
                    <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-2">Completed</p>
                    <p className="text-2xl font-extrabold text-emerald-700">{admin.completedTasks || 0}</p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 text-center border border-amber-200 hover:border-amber-300 transition">
                    <p className="text-xs text-amber-600 font-bold uppercase tracking-wider mb-2">Pending</p>
                    <p className="text-2xl font-extrabold text-amber-700">{admin.pendingTasks || 0}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // Admin Dashboard
  if (role === "admin") {
    // Fetch all tasks and filter by domain
    const { data: tasks = [], loading: tasksLoading, error: tasksError } = useSupabase("tasks");
    const { data: workers = [], loading: workersLoading, error: workersError } = useSupabase("worker", domain ? { field: "domain", value: domain } : null);

    const domainTasks = tasks.filter(t => t.domain === domain || t.department === domain);
    const totalTasks = domainTasks.length;
    const completedTasks = domainTasks.filter(t => (t.status || "").toLowerCase().trim() === "completed").length;
    const pendingTasks = domainTasks.filter(t => (t.status || "").toLowerCase().trim() === "pending").length;
    const highPriorityTasks = domainTasks.filter(t => (t.priority || "").toLowerCase().trim() === "high").length;

    return (
      <main className="flex-1 p-6 flex flex-col gap-6 bg-gradient-to-br from-green-50 to-gray-50 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard - {domain}</h1>
            <p className="text-gray-600 mt-1">Manage your domain tasks</p>
          </div>
          <img
            src={user?.avatar || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100&h=100"}
            alt="Profile"
            className="w-12 h-12 rounded-full border-2 border-green-500 object-cover"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6">
          {[
            { title: "Total Tasks", value: totalTasks, border: "border-blue-400", accent: "text-blue-600", icon: "📊" },
            { title: "Completed", value: completedTasks, border: "border-emerald-400", accent: "text-emerald-600", icon: "✓" },
            { title: "Pending", value: pendingTasks, border: "border-amber-400", accent: "text-amber-600", icon: "⏳" },
            { title: "High Priority", value: highPriorityTasks, border: "border-red-400", accent: "text-red-600", icon: "⚠️" },
          ].map((card, index) => (
            <button
              key={index}
              onClick={() => {}}
              className={`relative bg-white rounded-xl shadow-sm p-8 border-l-4 ${card.border} focus:outline-none transition-all duration-200 w-full text-left hover:shadow-md`}
            >
              <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-sm">
                <span className={`${card.accent} text-lg opacity-90`}>{card.icon}</span>
              </div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">{card.title}</p>
              <p className="text-4xl font-extrabold text-slate-900">{String(card.value).padStart(2, '0')}</p>
            </button>
          ))}
        </div>

        {/* Workers Section */}
        <div className="rounded-2xl shadow-sm p-8 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-lg">👨‍💼</div>
            <h2 className="text-2xl font-bold text-slate-900">Workers in {domain}</h2>
          </div>
          <div className="space-y-5">
            {workers.map((worker, idx) => (
              <div
                key={worker.id}
                className="group bg-white rounded-xl border border-blue-100 p-5 hover:shadow-lg hover:border-blue-300 transition-all duration-300 hover:translate-x-1 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${avatarColorClass(idx)} text-sm shadow-sm group-hover:shadow-md transition-shadow`}>
                      {getInitials(worker.name)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{worker.name}</h3>
                      <p className="text-xs text-slate-600 mt-0.5 break-all">{worker.email}</p>
                    </div>
                  </div>
                  <div className="text-right ml-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-200">
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wide">Tasks</p>
                    <p className="text-2xl font-extrabold text-blue-700 mt-0.5">{worker.taskCount || 0}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // Worker Dashboard
  if (role === "worker") {
    // Fetch tasks assigned to this worker
    const { data: tasks = [], loading: tasksLoading, error: tasksError } = useSupabase("workertask", user?.email ? { field: "email", value: user.email } : null);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => (t.status || "").toLowerCase().trim() === "completed").length;
    const pendingTasks = tasks.filter(t => (t.status || "").toLowerCase().trim() === "pending").length;

    return (
      <main className="flex-1 p-6 flex flex-col gap-6 bg-gradient-to-br from-green-50 to-gray-50 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Tasks Dashboard</h1>
            <p className="text-gray-600 mt-1">Track your assigned tasks</p>
          </div>
          <img
            src={user?.avatar || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100&h=100"}
            alt="Profile"
            className="w-12 h-12 rounded-full border-2 border-green-500 object-cover"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6">
          {[
            { title: "Total Assigned", value: totalTasks, border: "border-blue-400", accent: "text-blue-600", icon: "📋" },
            { title: "Completed", value: completedTasks, border: "border-emerald-400", accent: "text-emerald-600", icon: "✓" },
            { title: "Pending", value: pendingTasks, border: "border-amber-400", accent: "text-amber-600", icon: "⏳" },
          ].map((card, index) => (
            <button
              key={index}
              onClick={() => {}}
              className={`relative bg-white rounded-xl shadow-sm p-8 border-l-4 ${card.border} focus:outline-none transition-all duration-200 w-full text-left hover:shadow-md`}
            >
              <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-sm">
                <span className={`${card.accent} text-lg opacity-90`}>{card.icon}</span>
              </div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">{card.title}</p>
              <p className="text-4xl font-extrabold text-slate-900">{String(card.value).padStart(2, '0')}</p>
            </button>
          ))}
        </div>

        {/* Task Progress */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Task Progress</h2>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all"
              style={{ width: `${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">{completedTasks} of {totalTasks} tasks completed</p>
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">My Tasks</h2>
          <div className="space-y-3">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{task.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">Deadline: {task.deadline}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded text-xs font-semibold ${
                          (task.status || "").toLowerCase().trim() === "completed"
                            ? "bg-green-100 text-green-800"
                            : (task.status || "").toLowerCase().trim() === "in-progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {task.status}
                      </span>
                      <span
                        className={`px-3 py-1 rounded text-xs font-semibold ${
                          (task.priority || "").toLowerCase().trim() === "high"
                            ? "bg-red-100 text-red-800"
                            : (task.priority || "").toLowerCase().trim() === "medium"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-600 py-8">No tasks assigned yet</p>
            )}
          </div>
        </div>
      </main>
    );
  }

  return null;
};

export default Mainbar;
