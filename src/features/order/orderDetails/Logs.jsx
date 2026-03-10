import React, { useState, useMemo } from "react";

const Logs = ({ order }) => {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - replace with actual data from your API
  const logsData = [
    {
      id: 1,
      timestamp: "2024-03-15 08:30:25",
      employee: "John Doe",
      employeeRole: "cutter",
      action: "Started cutting for Layer 1",
      department: "cutting",
      details: "Cut 50 pieces for size Medium",
      status: "success",
    },
    {
      id: 2,
      timestamp: "2024-03-15 09:15:42",
      employee: "Maria Santos",
      employeeRole: "sewer",
      action: "Completed shoulder seams",
      department: "sewing",
      details: "Finished 25 pieces for Station 1",
      status: "success",
    },
    {
      id: 3,
      timestamp: "2024-03-15 10:05:18",
      employee: "Pedro Reyes",
      employeeRole: "quality_assurance",
      action: "Quality check passed",
      department: "quality",
      details: "Inspected 30 pieces - all passed",
      status: "success",
    },
    {
      id: 4,
      timestamp: "2024-03-15 11:20:33",
      employee: "Ana Lopez",
      employeeRole: "printer",
      action: "Started printing",
      department: "printing",
      details: "Setting up screens for Design #123",
      status: "info",
    },
    {
      id: 5,
      timestamp: "2024-03-15 13:45:57",
      employee: "Mike Johnson",
      employeeRole: "cutter",
      action: "Completed cutting",
      department: "cutting",
      details: "Finished all cutting for size Small",
      status: "success",
    },
    {
      id: 6,
      timestamp: "2024-03-15 14:30:12",
      employee: "Sarah Chen",
      employeeRole: "packer",
      action: "Started packing",
      department: "packing",
      details: "Packing 50 pieces for Order #PO-123",
      status: "info",
    },
    {
      id: 7,
      timestamp: "2024-03-15 15:15:44",
      employee: "James Wilson",
      employeeRole: "quality_assurance",
      action: "Quality check failed",
      department: "quality",
      details:
        "Found stitching issue on 3 pieces - sent for rework Found stitching issue on 3 pieces - sent for rework Found stitching issue on 3 pieces - sent for rework Found stitching issue on 3 pieces - sent for rework",
      status: "warning",
    },
    {
      id: 8,
      timestamp: "2024-03-15 16:00:29",
      employee: "Rosa Santos",
      employeeRole: "sewer",
      action: "Rework completed",
      department: "sewing",
      details: "Fixed stitching issues on 3 pieces",
      status: "success",
    },
    {
      id: 9,
      timestamp: "2024-03-15 09:45:18",
      employee: "Tom Garcia",
      employeeRole: "driver",
      action: "Materials received",
      department: "logistics",
      details: "Received fabric delivery for Order #PO-123",
      status: "success",
    },
    {
      id: 10,
      timestamp: "2024-03-15 11:50:36",
      employee: "Lisa Kim",
      employeeRole: "graphic_artist",
      action: "Design approved",
      department: "design",
      details: "Final design approved for production",
      status: "success",
    },
    {
      id: 11,
      timestamp: "2024-03-15 08:45:22",
      employee: "Mike Johnson",
      employeeRole: "cutter",
      action: "Issue reported",
      department: "cutting",
      details: "Fabric tension issue on cutting machine",
      status: "warning",
    },
    {
      id: 12,
      timestamp: "2024-03-15 13:20:15",
      employee: "John Doe",
      employeeRole: "cutter",
      action: "Issue resolved",
      department: "cutting",
      details: "Adjusted machine tension - cutting resumed",
      status: "success",
    },
  ];

  const departments = [
    { id: "all", label: "All Departments" },
    { id: "cutting", label: "Cutting" },
    { id: "sewing", label: "Sewing" },
    { id: "printing", label: "Printing" },
    { id: "embroidery", label: "Embroidery" },
    { id: "quality", label: "Quality Control" },
    { id: "packing", label: "Packing" },
    { id: "design", label: "Design" },
    { id: "logistics", label: "Logistics" },
  ];

  const getDepartmentIcon = (department) => {
    const icons = {
      cutting: "fa-cut",
      printing: "fa-print",
      embroidery: "fa-thread",
      quality: "fa-check-circle",
      packing: "fa-box",
      design: "fa-paint-brush",
      logistics: "fa-truck",
      default: "fa-clipboard-list",
    };
    return icons[department] || icons.default;
  };

  // Filter logs based on department and search term
  const filteredLogs = useMemo(() => {
    return logsData.filter((log) => {
      // Department filter
      if (filter !== "all" && log.department !== filter) return false;

      // Search filter - search in employee name, action, and details
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          log.employee.toLowerCase().includes(searchLower) ||
          log.action.toLowerCase().includes(searchLower) ||
          log.details.toLowerCase().includes(searchLower) ||
          log.department.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [filter, searchTerm]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
    }
  };

  return (
    <section className="flex flex-col gap-y-4 sm:gap-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="font-semibold text-base sm:text-lg flex items-center gap-2">
          <i className="fas fa-history text-primary"></i>
          Activity Logs
          <span className="text-xs sm:text-sm font-normal text-gray-500 ml-2">
            ({filteredLogs.length} entries)
          </span>
        </h1>
        {/* <button className="px-3 py-1.5 text-xs sm:text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center">
          <i className="fas fa-download"></i>
          Export Logs
        </button> */}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-300 rounded-lg sm:rounded-xl p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Department Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by employee, action, or details..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pl-8 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <i className="fas fa-search absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm"></i>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xs sm:text-sm"></i>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Logs Timeline */}
      <div className="border border-gray-300 rounded-lg sm:rounded-xl overflow-hidden">
        {/* Logs Header - Hidden on mobile, visible on sm and up */}
        <div className="hidden sm:grid bg-gray-50 px-4 sm:px-6 py-3 border-b border-gray-300 grid-cols-12 gap-2 sm:gap-4 text-xs font-medium text-gray-500 uppercase">
          <div className="col-span-3 lg:col-span-2">Timestamp</div>
          <div className="col-span-3 lg:col-span-2">Employee</div>
          <div className="col-span-6 lg:col-span-8">Action</div>
        </div>

        {/* Logs List */}
        <div className="divide-y divide-gray-200  overflow-y-auto">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="block sm:hidden">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                        <i className="fas fa-user text-xs text-gray-600"></i>
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          {log.employee}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(log.timestamp)} •{" "}
                          {new Date(log.timestamp).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </div>
                      </div>
                    </div>
                    <i
                      className={`fas ${getDepartmentIcon(log.department)} text-gray-400 text-sm`}
                    ></i>
                  </div>
                  <div className="pl-8">
                    <p className="text-sm font-medium">{log.action}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {log.details}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full capitalize">
                        {log.department}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Desktop View (sm and up) */}
                <div className="hidden sm:grid grid-cols-12 gap-2 sm:gap-4 items-center">
                  {/* Timestamp */}
                  <div className="col-span-3 lg:col-span-2">
                    <div className="text-xs sm:text-sm font-medium">
                      {new Date(log.timestamp).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(log.timestamp)}
                    </div>
                  </div>

                  {/* Employee */}
                  <div className="col-span-3 lg:col-span-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                        <i className="fas fa-user text-xs text-gray-600"></i>
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-medium truncate">
                          {log.employee}
                        </div>
                        <div className="text-xs text-gray-500 capitalize truncate">
                          {log.employeeRole.replace("_", " ")}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="col-span-6 lg:col-span-8">
                    <div className="flex items-start gap-2">
                      <i
                        className={`fas ${getDepartmentIcon(log.department)} w-4 text-gray-400 text-xs sm:text-sm mt-0.5 shrink-0`}
                      ></i>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-medium truncate">
                          {log.action}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {log.details}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 sm:px-6 py-8 sm:py-12 text-center">
              <div className="flex flex-col items-center gap-2">
                <i className="fas fa-search text-3xl sm:text-4xl text-gray-300"></i>
                <p className="text-sm sm:text-base text-gray-500">
                  No logs found
                </p>
                <p className="text-xs text-gray-400">
                  Try adjusting your search or filter
                </p>
                {(filter !== "all" || searchTerm) && (
                  <button
                    onClick={() => {
                      setFilter("all");
                      setSearchTerm("");
                    }}
                    className="mt-2 text-xs sm:text-sm text-blue-600 hover:text-blue-800"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Logs;
