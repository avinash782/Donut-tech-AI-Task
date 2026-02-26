

import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSupabase } from "../hooks/useFirestore";
import SupabaseDataTable from "../Components/SupabaseDataTable";

const Dashboards = () => {
  const { user, role, domain } = useAuth();

  // Helpers for initials avatar and color (copied to keep file self-contained)
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

  const COLLECTION_NAME = "tasks";
  const ADMIN_TABLE = "admin";

  const getQueryCondition = () => {
    if (role === "superadmin") {
      return null;
    }
    // Updated to use 'expert_email' based on the tasks table schema
    if (role === "worker" && user?.email) {
      return { field: "expert_email", value: user.email };
    }
    if (role === "admin") {
      return null;
    }
    return null;
  };

  const queryCondition = getQueryCondition();

  const { data: adminRows = [], loading: adminLoading, error: adminError } = useSupabase(ADMIN_TABLE);
  const { data: rawData = [], loading, error } = useSupabase(COLLECTION_NAME, queryCondition);

  const filteredData = React.useMemo(() => {
    if (role === "superadmin") return rawData;
    if (role === "worker") {
      return rawData;
    }
    if (role === "admin" && domain) {
      return rawData.filter((row) => row.domain === domain );
    }
    return [];
  }, [rawData, role, domain]);

  const [selectedDomain, setSelectedDomain] = React.useState(null);
  const navigate = useNavigate();

  const showNoDomain = role === "admin" && !domain;
  const showNoTasks = filteredData.length === 0 && !loading && !error && !showNoDomain;

  const getColumns = () => {
    if (filteredData && filteredData.length > 0) {
      return Object.keys(filteredData[0]).filter(
        (key) => key !== "id" && key !== "expert_email" && key !== "expert_id" && key !== "timestamp" && key !== "source"
      );
    }
    return ["task", "domain", "priority","status","expert_name"];
  };

  if (role === "superadmin") {
    const totalTasks = rawData.length;
    const completedTasks = rawData.filter(
      t => (t.status || "").toLowerCase().trim() === "completed"
    ).length;
    const inProgressTasks = rawData.filter(
      t => (t.status || "").toLowerCase().trim() === "in progress"
    ).length;
    const domainAdmins = adminRows.length;

    const [selectedWorker, setSelectedWorker] = React.useState(null);
    const { data: workerRows = [], loading: workerLoading, error: workerError } = useSupabase("worker", selectedDomain ? { field: "domain", value: selectedDomain } : null);
    
    // Updated to use 'expert_email' for fetching worker tasks
    const { data: workerTasks = [], loading: workerTaskLoading, error: workerTaskError } = useSupabase(
      "tasks",
      selectedWorker ? { field: "expert_email", value: selectedWorker.email } : null
    );

    if (selectedDomain) {
      let domainTasks = rawData.filter(row => row.domain === selectedDomain || row.department === selectedDomain);
      if (selectedWorker) {
        domainTasks = workerTasks;
      }
      return (
        <main className="flex-1 p-6 flex flex-col gap-6 bg-gradient-to-br from-green-50 to-gray-50 overflow-y-auto">
          <button className="mb-4 px-4 py-2 bg-green-600 text-white rounded" onClick={() => { setSelectedDomain(null); setSelectedWorker(null); }}>
            ← Back to Admin Domains
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Tasks for Domain: {selectedDomain}</h1>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Workers in {selectedDomain}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {workerLoading ? (
                <div className="col-span-3 text-center text-gray-500">Loading workers...</div>
              ) : workerError ? (
                <div className="col-span-3 text-center text-red-500">Error loading workers</div>
              ) : workerRows.length === 0 ? (
                <div className="col-span-3 text-center text-gray-500">No workers found for this domain.</div>
              ) : (
                workerRows.map((worker, idx) => (
                  <div
                    key={worker.id}
                    className={`group bg-white rounded-xl border transition-all duration-300 p-5 hover:shadow-lg cursor-pointer ${
                      selectedWorker && selectedWorker.id === worker.id
                        ? 'ring-2 ring-purple-500 border-purple-300 shadow-lg'
                        : 'border-slate-200 hover:border-purple-300 hover:-translate-y-1 transform'
                    }`}
                    onClick={() => setSelectedWorker(worker)}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${avatarColorClass(idx)} text-sm shadow-sm group-hover:shadow-md transition-shadow`}>
                        {getInitials(worker.name)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 group-hover:text-purple-600 transition-colors">{worker.name}</h3>
                        <p className="text-xs text-slate-600 mt-0.5 break-all">{worker.email}</p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-3 border border-purple-200 text-center">
                      <p className="text-xs text-purple-600 font-bold uppercase tracking-wide">Domain</p>
                      <p className="text-lg font-bold text-purple-700 mt-1">{worker.domain}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            {selectedWorker && (
              <button className="mt-4 px-4 py-2 bg-gray-300 text-gray-800 rounded" onClick={() => setSelectedWorker(null)}>
                ← Back to all workers
              </button>
            )}
          </div>
          <SupabaseDataTable
            data={domainTasks}
            loading={selectedWorker ? workerTaskLoading : loading}
            error={selectedWorker ? workerTaskError : error}
            columns={getColumns()}
          />
        </main>
      );
    }
    // Precompute admin content to avoid complex nested JSX ternary parsing
    const adminContent = adminLoading ? (
      <div className="col-span-3 text-center text-lg text-gray-600">Loading admin data...</div>
    ) : adminError ? (
      <div className="col-span-3 text-center text-lg text-red-600">Error loading admin data: {adminError}</div>
    ) : (
      adminRows.map((admin, idx) => (
        <div
          key={admin.id}
          className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:border-purple-300 transition-all duration-300 hover:-translate-y-1 transform cursor-pointer"
          onClick={() => setSelectedDomain(admin.domain)}
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
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200 hover:border-blue-300 transition">
              <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-2">Total</p>
              <p className="text-2xl font-extrabold text-blue-700">{admin.totalTasks}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 text-center border border-emerald-200 hover:border-emerald-300 transition">
              <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-2">Completed</p>
              <p className="text-2xl font-extrabold text-emerald-700">{admin.completedTasks}</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 text-center border border-amber-200 hover:border-amber-300 transition">
              <p className="text-xs text-amber-600 font-bold uppercase tracking-wider mb-2">In Progress</p>
              <p className="text-2xl font-extrabold text-amber-700">{admin.InProgressTasks}</p>
            </div>
          </div>
        </div>
      ))
    );

    return (
      <main className="flex-1 p-6 flex flex-col gap-6 bg-gradient-to-br from-green-50 to-gray-50 overflow-y-auto">
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
        <div className="grid grid-cols-4 gap-6">
          {[
            { title: "Total Tasks", value: rawData.length, border: "border-blue-400", accent: "text-blue-600", icon: "📊" },
            { title: "Completed Tasks", value: completedTasks, border: "border-emerald-400", accent: "text-emerald-600", icon: "✓" },
            { title: "In Progress Tasks", value: inProgressTasks, border: "border-amber-400", accent: "text-amber-600", icon: "●" },
            { title: "Domain Admins", value: domainAdmins, border: "border-blue-400", accent: "text-blue-600", icon: "👥" },
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
        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Admin Domains Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {adminContent}
        </div> 
     </main>
    );
  }


  const totalTasks = filteredData.length;
  const completedTasks = filteredData.filter(t => (t.status || "").toLowerCase().trim() === "completed").length;
  const inProgressTasks = filteredData.filter(t => (t.status || "").toLowerCase().trim() === "in progress").length;
  const [selectedWorker, setSelectedWorker] = React.useState(null);
  const { data: workerRows = [], loading: workerLoading, error: workerError } = useSupabase(
    "worker",
    role === "admin" && domain ? { field: "domain", value: domain } : null
  );

  // Updated to use 'expert_email' for admin view
  const { data: workerTasks = [], loading: workerTaskLoading, error: workerTaskError } = useSupabase(
      "tasks",
      selectedWorker ? { field: "expert_email", value: selectedWorker.email } : null)

  return (
    <main className="flex-1 p-6 flex flex-col gap-6 bg-gradient-to-br from-green-50 to-gray-50 overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Supabase Records</h1>
          <p className="text-gray-600 mt-1">
            Viewing data from <span className="font-semibold text-green-600 capitalize">{COLLECTION_NAME}</span> collection
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total Records</p>
          <p className="text-3xl font-bold text-green-600">{rawData.length}</p>
        </div>
      </div>
      {(role === "admin" || role === "worker") && (
        <div className="grid grid-cols-3 gap-6 my-2">
          {[
            { title: "Total Tasks", value: totalTasks, border: "border-blue-400", accent: "text-blue-600", icon: "📊" },
            { title: "Completed Tasks", value: completedTasks, border: "border-emerald-400", accent: "text-emerald-600", icon: "✓" },
            { title: "In Progress Tasks", value: inProgressTasks, border: "border-amber-400", accent: "text-amber-600", icon: "●" },
          ].map((card, index) => (
            <button
              key={index}
              onClick={() => {}}
              className={`relative bg-white rounded-xl shadow-sm p-8 border-l-4 ${card.border} focus:outline-none transition-all duration-200 w-full text-left text-center hover:shadow-md`}
            >
              <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-sm">
                <span className={`${card.accent} text-lg opacity-90`}>{card.icon}</span>
              </div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">{card.title}</p>
              <p className="text-4xl font-extrabold text-slate-900">{String(card.value).padStart(2, '0')}</p>
            </button>
          ))}
        </div>
      )}
      {role === "admin" && domain && (
        <div className="my-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Workers in {domain}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {workerLoading ? (
              <div className="col-span-3 text-center text-gray-500">Loading workers...</div>
            ) : workerError ? (
              <div className="col-span-3 text-center text-red-500">Error loading workers</div>
            ) : workerRows.length === 0 ? (
              <div className="col-span-3 text-center text-gray-500">No workers found for this domain.</div>
            ) : (
              workerRows.map(worker => (
                <div
                  key={worker.id}
                  className={`group bg-white rounded-xl border transition-all duration-300 p-5 hover:shadow-lg cursor-pointer ${selectedWorker && selectedWorker.id === worker.id ? 'ring-2 ring-blue-500 border-blue-300 shadow-lg' : 'border-slate-200 hover:border-blue-300 hover:-translate-y-1 transform'}`}
                  onClick={() => setSelectedWorker(worker)}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={worker.avatar || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100"}
                      alt={worker.name}
                      className="w-12 h-12 rounded-xl object-cover shadow-sm group-hover:shadow-md transition-shadow"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{worker.name}</h3>
                      <p className="text-xs text-slate-600 mt-0.5 break-all">{worker.email}</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-200 text-center">
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wide">Domain</p>
                    <p className="text-lg font-bold text-blue-700 mt-1">{worker.domain}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          {selectedWorker && (
            <button className="mt-4 px-4 py-2 bg-gray-300 text-gray-800 rounded" onClick={() => setSelectedWorker(null)}>
              ← Back to all workers
            </button>
          )}
        </div>
      )}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-md p-6 border-l-4 border-green-600">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Collection Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Collection Name</p>
            <p className="text-xl font-bold text-gray-900 capitalize mt-1">{COLLECTION_NAME}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Records</p>
            <p className="text-xl font-bold text-green-600 mt-1">{rawData.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className="text-xl font-bold text-blue-600 mt-1">{loading ? "Loading..." : "Ready"}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Data Preview</h2>
        {showNoDomain ? (
          <div className="p-8 text-center bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700 font-semibold">No domain found for your account.</p>
            <p className="text-yellow-600">Please contact your admin to set your domain.</p>
          </div>
        ) : showNoTasks ? (
          <div className="p-8 text-center bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-gray-600">No tasks found for your domain.</p>
          </div>
        ) : (
          <SupabaseDataTable
            data={selectedWorker ? workerTasks : filteredData}
            loading={selectedWorker ? workerTaskLoading : loading}
            error={selectedWorker ? workerTaskError : error}
            columns={getColumns()}
          />
        )}
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Current User:</span> {user?.name} |{" "}
          <span className="font-semibold">Role:</span> {role}
          {domain && role === "admin" && (
            <> | <span className="font-semibold">Domain:</span> {domain}</>
          )}
        </p>
      </div>
    </main>
  );
};

export default Dashboards;