

import React, { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSupabase } from "../hooks/useFirestore";

const TaskHistory = () => {
  const { user, role, domain } = useAuth();
  const [activeCard, setActiveCard] = useState("All");

  const tableName = "tasks";
  const queryDomain = user?.user_metadata?.domain || domain || null;

  const { data: fetchedTasks = [], loading, error } = useSupabase(
    tableName,
    role === "superadmin" ? null : queryDomain ? { field: "domain", value: queryDomain } : null
  );

  const mappedTasks = useMemo(() => {
    return fetchedTasks.map((t) => {
      let status = t.status;
      if (!status || status === '' || status === null) {
        status = 'In Progress';
      } else if (status !== 'Completed') {
        status = 'In Progress';
      }
      return {
        ...t,
        taskID: t.taskID || t.id,
        // Map expert_name from schema to assignedTo
        assignedTo: t.expert_name || t.assignedTo,
        status,
      };
    });
  }, [fetchedTasks]);

  const filteredTasks = useMemo(() => {
    let tasks = mappedTasks;
    if (role === "worker") {
      const workerEmail = user?.email;
      const workerName = user?.user_metadata?.name || user?.user_metadata?.full_name;
      
      if (!workerEmail && !workerName) return [];
      
      // Filter by expert_email from your schema or by assigned name
      tasks = tasks.filter(
        (t) => t.expert_email === workerEmail || t.assignedTo === workerName || t.worker === workerName
      );
    }
    if (activeCard === "Completed") {
      return tasks.filter((t) => t.status === "Completed");
    } else if (activeCard === "In Progress") {
      return tasks.filter((t) => t.status === "In Progress");
    } else if (activeCard === "High Priority") {
      return tasks.filter((t) => t.priority === "High");
    }
    return tasks;
  }, [mappedTasks, role, user, activeCard]);

  // Badge Components
  const PriorityBadge = ({ priority }) => {
    const bgStyles = {
      High: "bg-red-50",
      Medium: "bg-orange-50",
      Low: "bg-green-50",
    };
    const textStyles = {
      High: "text-red-700",
      Medium: "text-orange-700",
      Low: "text-green-700",
    };
    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap ${bgStyles[priority] || 'bg-gray-50'} ${textStyles[priority] || 'text-gray-700'}`}>
        {priority}
      </span>
    );
  };

  const StatusBadge = ({ status }) => {
    const bgStyles = {
      Completed: "bg-emerald-50",
      Pending: "bg-amber-50",
      "In Progress": "bg-blue-50",
    };
    const textStyles = {
      Completed: "text-emerald-700",
      Pending: "text-amber-700",
      "In Progress": "text-blue-700",
    };
    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap ${bgStyles[status] || 'bg-gray-50'} ${textStyles[status] || 'text-gray-700'}`}>
        {status.replace(/ /g, '\u00A0')}
      </span>
    );
  };

  return (
    <main className="flex-1 p-8 flex flex-col gap-8 bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 overflow-y-auto">
      {/* Header Section with Modern Design */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Task Overview</h1>
          <p className="text-slate-500 text-base font-medium">
            {role === "superadmin"
              ? "Monitor all completed tasks across domains"
              : role === "admin"
              ? `Manage tasks from ${user?.domain || domain} domain`
              : "Track your assigned tasks"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Total Tasks</p>
          <p className="text-5xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mt-2">{filteredTasks.length}</p>
        </div>
      </div>

      {/* Modern Stats Cards Grid */}
      <div className="grid grid-cols-4 gap-6">
        {[
          {
            title: "Completed",
            value: mappedTasks.filter((t) => t.status === "Completed").length,
            border: "border-emerald-400",
            accent: "text-emerald-600",
            icon: "✓",
          },
          {
            title: "In Progress",
            value: mappedTasks.filter((t) => t.status === "In Progress").length,
            border: "border-amber-400",
            accent: "text-amber-600",
            icon: "●",
          },
          {
            title: "High Priority",
            value: mappedTasks.filter((t) => t.priority === "High" && t.status === "In Progress").length,
            border: "border-red-400",
            accent: "text-red-600",
            icon: "◯",
          },
          {
            title: "Unique Domains",
            value: new Set(mappedTasks.map((t) => t.domain)).size,
            border: "border-blue-400",
            accent: "text-blue-600",
            icon: "🏢",
          },
        ].map((stat, index) => (
          <button
            key={index}
            onClick={() => setActiveCard(stat.title)}
            className={`relative bg-white rounded-xl shadow-sm p-8 border-l-4 ${stat.border} focus:outline-none transition-all duration-200 w-full text-left hover:shadow-md ${activeCard === stat.title ? 'ring-2 ring-offset-2 ring-emerald-100' : ''}`}
          >
            <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-sm">
              <span className={`${stat.accent} text-lg opacity-90`}>{stat.icon}</span>
            </div>

            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
              {stat.title}
            </p>
            <p className="text-4xl font-extrabold text-slate-900">{String(stat.value).padStart(2, '0')}</p>
          </button>
        ))}
      </div>

      {/* Filter Button */}
      <div className="flex justify-end mt-2">
        <button
          className={`px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold mr-2 ${activeCard === 'All' ? 'ring-2 ring-green-400' : ''}`}
          onClick={() => setActiveCard('All')}
        >
          Show All
        </button>
      </div>

      {/* Data Table Section */}
      <div className="mt-6">
        {filteredTasks.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
            {/* Table Header */}
            <div className="grid grid-cols-5 gap-4 px-8 py-5 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
              <div className="col-span-1">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Task Description</p>
              </div>
              <div className="col-span-1">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Domain</p>
              </div>
              <div className="col-span-1">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Priority</p>
              </div>
              <div className="col-span-1">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Status</p>
              </div>
              <div className="col-span-1">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Expert</p>
              </div>
            </div>

            {/* Table Body - Modern Card Style Rows */}
            <div className="divide-y divide-slate-200">
              {filteredTasks.map((t, idx) => (
                <div
                  key={t.id || t.taskID || idx}
                  className="group grid grid-cols-5 gap-4 px-8 py-5 hover:bg-slate-50 transition-all duration-200 hover:border-l-4 hover:border-l-emerald-400 items-center"
                >
                  {/* Task Description */}
                  <div className="col-span-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 text-base group-hover:text-emerald-600 transition-colors">{t.task}</h3>
                    {t.description ? (
                      <p className="text-xs text-slate-500 mt-1">Created {t.createdDate || t.created_at || 'N/A'}</p>
                    ) : null}
                  </div>

                  {/* Domain */}
                  <div className="col-span-1">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wide hover:bg-slate-200 transition-colors">
                      {t.domain || '-'}
                    </span>
                  </div>

                  {/* Priority */}
                  <div className="col-span-1">
                    <PriorityBadge priority={t.priority} />
                  </div>

                  {/* Status */}
                  <div className="col-span-1">
                    <StatusBadge status={t.status} />
                  </div>

                  {/* Expert */}
                  <div className="col-span-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                        {(t.assignedTo || 'E').charAt(0).toUpperCase()}
                      </div>
                      <p className="text-sm font-medium text-slate-700 truncate">{t.assignedTo || '-'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Stats */}
            <div className="px-8 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <p className="text-sm font-medium text-slate-600">
                Showing <span className="font-bold text-slate-900">{filteredTasks.length}</span> tasks
              </p>
              <div className="flex gap-3 text-xs text-slate-500">
                <span>• Last updated: just now</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-16 px-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <p className="text-lg font-bold text-slate-900 mb-2">No tasks found</p>
            <p className="text-sm text-slate-500">There are no task records available for your role. Check back soon!</p>
          </div>
        )}
      </div>
    </main>
  );
};


export default TaskHistory;