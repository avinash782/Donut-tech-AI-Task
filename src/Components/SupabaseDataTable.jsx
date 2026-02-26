import React from "react";

const SupabaseDataTable = ({ data, loading, error, columns }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-14 w-14 border-4 border-slate-200 border-t-emerald-500"></div>
          <p className="mt-6 text-slate-600 font-semibold text-lg">Loading data...</p>
          <p className="text-slate-500 text-sm mt-1">Fetching your records from Supabase</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl">
        <div className="flex items-start gap-4">
          <div className="text-2xl">⚠️</div>
          <div>
            <p className="text-red-800 font-bold text-lg">Error loading data</p>
            <p className="text-red-600 mt-2">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="py-20 px-8 text-center bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 shadow-sm">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-200 mb-6">
          <span className="text-4xl">📭</span>
        </div>
        <p className="text-slate-800 font-bold text-xl">No records yet</p>
        <p className="text-slate-500 text-sm mt-2">Start by adding your first record to see it displayed here</p>
      </div>
    );
  }

  // Calculate some basic stats for visual interest
  const totalRecords = data.length;
  const recordsPerColumn = {};
  
  if (columns && columns.length > 0) {
    columns.forEach(col => {
      const uniqueValues = new Set(data.map(item => item[col])).size;
      recordsPerColumn[col] = uniqueValues;
    });
  }

  return (
    <div className="space-y-6">
      {/* Stats Preview */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 text-center">
          <p className="text-emerald-600 text-2xl font-bold">{totalRecords}</p>
          <p className="text-emerald-700 text-xs font-semibold mt-1 uppercase tracking-wide">Total Records</p>
        </div>
        {columns && columns.slice(0, 3).map((col, idx) => (
          <div key={col} className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 text-center">
            <p className="text-blue-600 text-2xl font-bold">{recordsPerColumn[col] || 0}</p>
            <p className="text-blue-700 text-xs font-semibold mt-1 uppercase tracking-wide truncate">{col}</p>
          </div>
        ))}
      </div>

      {/* Data Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700">
          <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${columns?.length || 5}, minmax(0, 1fr))` }}>
            {columns &&
              columns.map((col) => (
                <div key={col}>
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">{col}</p>
                </div>
              ))}
          </div>
        </div>

        {/* Body - Card Style Rows */}
        <div className="divide-y divide-slate-200">
          {data.map((item, index) => (
            <div
              key={item.id || index}
              className="group px-8 py-6 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-300 border-l-4 border-l-transparent hover:border-l-emerald-500 cursor-pointer"
            >
              <div className="grid gap-6 items-center" style={{ gridTemplateColumns: `repeat(${columns?.length || 5}, minmax(0, 1fr))` }}>
                {columns &&
                  columns.map((col, colIdx) => {
                    const value = item[col];
                    const displayValue = typeof value === "object"
                      ? JSON.stringify(value)
                      : String(value || "-");

                    // Add styling based on column type
                    const isFirstCol = colIdx === 0;
                    const isStatus = col.toLowerCase().includes("status");
                    const isPriority = col.toLowerCase().includes("priority");
                    const isEmail = col.toLowerCase().includes("email");

                    let badgeClass = "";
                    if (isStatus) {
                      badgeClass = displayValue.toLowerCase() === "completed" ? "bg-emerald-100 text-emerald-700" 
                        : displayValue.toLowerCase() === "pending" ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700";
                    }
                    if (isPriority) {
                      badgeClass = displayValue.toLowerCase() === "high" ? "bg-red-100 text-red-700"
                        : displayValue.toLowerCase() === "medium" ? "bg-orange-100 text-orange-700"
                        : "bg-green-100 text-green-700";
                    }

                    return (
                      <div key={col} className="min-w-0">
                        {isFirstCol ? (
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-2 ">
                              {displayValue}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">Row {index + 1}</p>
                          </div>
                        ) : isStatus || isPriority ? (
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${badgeClass}`}>
                            {displayValue}
                          </span>
                        ) : isEmail ? (
                          <span className="text-sm text-slate-700 break-all font-medium">{displayValue}</span>
                        ) : (
                          <div className="text-sm text-slate-700 font-medium line-clamp-2">
                            {displayValue}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer with Stats */}
        <div className="px-8 py-5 bg-gradient-to-r from-slate-50 to-slate-100 border-t border-slate-200 flex justify-between items-center flex-wrap gap-4">
          <div className="flex gap-6">
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Entries</p>
              <p className="text-lg font-bold text-slate-900 mt-1">{totalRecords}</p>
            </div>
            <div className="w-px bg-slate-300"></div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Columns</p>
              <p className="text-lg font-bold text-slate-900 mt-1">{columns?.length || 0}</p>
            </div>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Last updated: just now
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupabaseDataTable;
