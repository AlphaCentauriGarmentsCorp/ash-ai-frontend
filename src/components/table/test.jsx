import React, { useState, useEffect } from "react";
import AdminLayout from "../../layouts/Admin/AdminLayout";

// Sample data - replace with your actual data
const initialData = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "Admin",
    status: "Active",
    date: "2023-10-01",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "Editor",
    status: "Active",
    date: "2023-10-02",
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "Viewer",
    status: "Inactive",
    date: "2023-10-03",
  },
  {
    id: 4,
    name: "Alice Brown",
    email: "alice@example.com",
    role: "Admin",
    status: "Active",
    date: "2023-10-04",
  },
  {
    id: 5,
    name: "Charlie Wilson",
    email: "charlie@example.com",
    role: "Editor",
    status: "Inactive",
    date: "2023-10-05",
  },
  {
    id: 6,
    name: "David Lee",
    email: "david@example.com",
    role: "Viewer",
    status: "Active",
    date: "2023-10-06",
  },
  {
    id: 7,
    name: "Eva Martinez",
    email: "eva@example.com",
    role: "Admin",
    status: "Active",
    date: "2023-10-07",
  },
  {
    id: 8,
    name: "Frank Miller",
    email: "frank@example.com",
    role: "Editor",
    status: "Inactive",
    date: "2023-10-08",
  },
  {
    id: 9,
    name: "Grace Taylor",
    email: "grace@example.com",
    role: "Viewer",
    status: "Active",
    date: "2023-10-09",
  },
  {
    id: 10,
    name: "Henry Clark",
    email: "henry@example.com",
    role: "Admin",
    status: "Active",
    date: "2023-10-10",
  },
];

export default function Dashboard() {
  const [data, setData] = useState(initialData);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");

  // Get unique values for filters
  const roles = ["All", ...new Set(data.map((item) => item.role))];
  const statuses = ["All", ...new Set(data.map((item) => item.status))];
  const dates = ["All", ...new Set(data.map((item) => item.date))];

  // Filtered and sorted data
  const filteredData = data.filter((item) => {
    // Search filter
    const matchesSearch = Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // Role filter
    const matchesRole = roleFilter === "All" || item.role === roleFilter;

    // Status filter
    const matchesStatus =
      statusFilter === "All" || item.status === statusFilter;

    // Date filter
    const matchesDate = dateFilter === "All" || item.date === dateFilter;

    return matchesSearch && matchesRole && matchesStatus && matchesDate;
  });

  // Sorting function
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedData.length / entriesPerPage);
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = sortedData.slice(indexOfFirstEntry, indexOfLastEntry);

  // Sort handler
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Pagination handlers
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleEntriesChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Filter handlers
  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value);
    setCurrentPage(1);
  };

  // Action button handlers
  const handleEdit = (id) => {
    console.log("Edit account:", id);
    // Add your edit logic here
  };

  const handleDelete = (id) => {
    console.log("Delete account:", id);
    // Add your delete logic here
  };

  const handleView = (id) => {
    console.log("View account:", id);
    // Add your view logic here
  };

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter, dateFilter]);

  // Function to render pagination buttons
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;

    if (totalPages <= maxVisibleButtons) {
      // Show all pages if total pages are less than or equal to maxVisibleButtons
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`w-8 h-8 flex items-center justify-center rounded text-sm ${
              currentPage === i
                ? "bg-primary text-white"
                : "text-primary hover:bg-gray-100 bg-light"
            }`}
          >
            {i}
          </button>,
        );
      }
    } else {
      // Always show first page
      buttons.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={`w-8 h-8 flex items-center justify-center rounded text-sm ${
            currentPage === 1
              ? "bg-blue-500 text-white"
              : "text-gray-700 hover:bg-gray-100 border"
          }`}
        >
          1
        </button>,
      );

      // Show ellipsis if current page is far from start
      if (currentPage > 3) {
        buttons.push(
          <span key="ellipsis-start" className="px-2">
            ...
          </span>,
        );
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          buttons.push(
            <button
              key={i}
              onClick={() => handlePageChange(i)}
              className={`w-8 h-8 flex items-center justify-center rounded text-sm ${
                currentPage === i
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 hover:bg-gray-100 border"
              }`}
            >
              {i}
            </button>,
          );
        }
      }

      // Show ellipsis if current page is far from end
      if (currentPage < totalPages - 2) {
        buttons.push(
          <span key="ellipsis-end" className="px-2">
            ...
          </span>,
        );
      }

      // Always show last page
      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`w-8 h-8 flex items-center justify-center rounded text-sm ${
            currentPage === totalPages
              ? "bg-blue-500 text-white"
              : "text-gray-700 hover:bg-gray-100 border"
          }`}
        >
          {totalPages}
        </button>,
      );
    }

    return buttons;
  };

  return (
    <AdminLayout
      icon="fa-user"
      pageTitle="All Accounts"
      path="/account/employee"
      links={[
        { label: "Home", href: "/admin/dashboard" },
        { label: "Accounts", href: "/admin/accounts" },
        { label: "Accounts", href: "/admin/accounts" },
      ]}
    >
      <div className="bg-white rounded-lg">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <div>
            <button className="cursor-pointer hover:bg-secondary/90 bg-secondary text-white px-4 py-2 rounded-xl text-sm">
              <i className="fa fa-add mr-2"></i>New Order
            </button>
          </div>

          <div className="w-full md:w-auto flex items-center">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 border border-gray-300 rounded-l-lg px-3 w-full md:w-64
                focus:ring-1 focus:ring-primary/20 "
            />

            <div
              className="h-10 px-4 border border-l-0 border-gray-300 rounded-r-lg
                 bg-gray-50 hover:bg-gray-100 transition
                 flex items-center justify-center"
            >
              <i className="fas fa-search text-gray-600"></i>
            </div>
          </div>
        </div>

        {/* List Title with Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h1 className="text-lg font-semibold text-gray-800">All Accounts</h1>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-auto">
            <div className="flex flex-wrap gap-3">
              {/* Role Filter */}
              <div className="flex items-center gap-3">
                <label className="text-xs text-gray-600 mb-1">Role</label>
                <div className="relative">
                  <select
                    value={roleFilter}
                    onChange={handleRoleFilterChange}
                    className="h-10 border border-gray-300 rounded-lg px-3 pr-8 text-sm
                      focus:ring-1 focus:ring-primary/20 focus:border-primary
                      appearance-none bg-white cursor-pointer min-w-[120px]"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <i className="fas fa-chevron-down text-gray-400 text-xs"></i>
                  </div>
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-3">
                <label className="text-xs text-gray-600 mb-1">Status</label>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                    className="h-10 border border-gray-300 rounded-lg px-3 pr-8 text-sm
                      focus:ring-1 focus:ring-primary/20 focus:border-primary
                      appearance-none bg-white cursor-pointer min-w-[120px]"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <i className="fas fa-chevron-down text-gray-400 text-xs"></i>
                  </div>
                </div>
              </div>

              {/* Date Filter */}
              <div className="flex items-center gap-3 ">
                <label className="text-xs text-gray-600 mb-1">Date</label>
                <div className="relative">
                  <select
                    value={dateFilter}
                    onChange={handleDateFilterChange}
                    className="h-10 border border-gray-300 rounded-lg px-3 pr-8 text-sm
                      focus:ring-1 focus:ring-primary/20 focus:border-primary
                      appearance-none bg-white cursor-pointer min-w-[120px]"
                  >
                    {dates.map((date) => (
                      <option key={date} value={date}>
                        {date}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <i className="fas fa-chevron-down text-gray-400 text-xs"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Responsive Table Container */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-light">
              <tr>
                <th
                  className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("id")}
                >
                  <div className="flex items-center font-normal text-primary">
                    Id
                    <div className="flex flex-col ml-1">
                      <i
                        className={`fas fa-caret-up text-[9px] ${
                          sortConfig.key === "id" &&
                          sortConfig.direction === "ascending"
                            ? "text-primary"
                            : "text-gray-400"
                        }`}
                      ></i>
                      <i
                        className={`fas fa-caret-down text-[9px] -mt-[4.2px] ${
                          sortConfig.key === "id" &&
                          sortConfig.direction === "descending"
                            ? "text-primary"
                            : "text-gray-400"
                        }`}
                      ></i>
                    </div>
                  </div>
                </th>
                <th
                  className="px-6 py-2 text-left text-xs font-medium text-gray-500 tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center font-normal text-primary">
                    Name
                    <div className="flex flex-col ml-1">
                      <i
                        className={`fas fa-caret-up text-[9px] ${
                          sortConfig.key === "name" &&
                          sortConfig.direction === "ascending"
                            ? "text-primary"
                            : "text-gray-400"
                        }`}
                      ></i>
                      <i
                        className={`fas fa-caret-down text-[9px] -mt-[4.2px] ${
                          sortConfig.key === "name" &&
                          sortConfig.direction === "descending"
                            ? "text-primary"
                            : "text-gray-400"
                        }`}
                      ></i>
                    </div>
                  </div>
                </th>
                <th
                  className="px-6 py-2 text-left text-xs font-medium text-gray-500  tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("email")}
                >
                  <div className="flex items-center font-normal text-primary">
                    Email
                    <div className="flex flex-col ml-1">
                      <i
                        className={`fas fa-caret-up text-[9px] ${
                          sortConfig.key === "email" &&
                          sortConfig.direction === "ascending"
                            ? "text-primary"
                            : "text-gray-400"
                        }`}
                      ></i>
                      <i
                        className={`fas fa-caret-down text-[9px] -mt-[4.2px] ${
                          sortConfig.key === "email" &&
                          sortConfig.direction === "descending"
                            ? "text-primary"
                            : "text-gray-400"
                        }`}
                      ></i>
                    </div>
                  </div>
                </th>
                <th
                  className="px-6 py-2 text-left text-xs font-medium text-gray-500 tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("role")}
                >
                  <div className="flex items-center font-normal text-primary">
                    Role
                    <div className="flex flex-col ml-1">
                      <i
                        className={`fas fa-caret-up text-[9px] ${
                          sortConfig.key === "role" &&
                          sortConfig.direction === "ascending"
                            ? "text-primary"
                            : "text-gray-400"
                        }`}
                      ></i>
                      <i
                        className={`fas fa-caret-down text-[9px] -mt-[4.2px] ${
                          sortConfig.key === "role" &&
                          sortConfig.direction === "descending"
                            ? "text-primary"
                            : "text-gray-400"
                        }`}
                      ></i>
                    </div>
                  </div>
                </th>
                <th
                  className="px-6 py-2 text-left text-xs font-medium text-gray-500 tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center font-normal text-primary">
                    Status
                    <div className="flex flex-col ml-1">
                      <i
                        className={`fas fa-caret-up text-[9px] ${
                          sortConfig.key === "status" &&
                          sortConfig.direction === "ascending"
                            ? "text-primary"
                            : "text-gray-400"
                        }`}
                      ></i>
                      <i
                        className={`fas fa-caret-down text-[9px] -mt-[4.2px] ${
                          sortConfig.key === "status" &&
                          sortConfig.direction === "descending"
                            ? "text-primary"
                            : "text-gray-400"
                        }`}
                      ></i>
                    </div>
                  </div>
                </th>
                <th
                  className="px-6 py-2 text-left text-xs font-medium text-gray-500 tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("date")}
                >
                  <div className="flex items-center font-normal text-primary">
                    Date
                    <div className="flex flex-col ml-1">
                      <i
                        className={`fas fa-caret-up text-[9px] ${
                          sortConfig.key === "date" &&
                          sortConfig.direction === "ascending"
                            ? "text-primary"
                            : "text-gray-400"
                        }`}
                      ></i>
                      <i
                        className={`fas fa-caret-down text-[9px] -mt-[4.2px] ${
                          sortConfig.key === "date" &&
                          sortConfig.direction === "descending"
                            ? "text-primary"
                            : "text-gray-400"
                        }`}
                      ></i>
                    </div>
                  </div>
                </th>
                <th className="px-6 py-2 text-left text-xs font-normal text-primary tracking-wider cursor-pointer hover:bg-gray-100">
                  <div className="flex justify-center">Actions</div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentEntries.length > 0 ? (
                currentEntries.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-2 whitespace-nowrap text-xs  text-primary">
                      {item.id}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap">
                      <div className="text-xs font-medium text-primary">
                        {item.name}
                      </div>
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-xs  font-normal text-primary">
                      {item.email}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-xs text-primary">
                      {item.role}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-xs text-primary">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-xs text-primary">
                      {item.date}
                    </td>
                    <td className="px-6  py-2 whitespace-nowrap text-xs font-medium">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleView(item.id)}
                          className="cursor-pointer w-7 h-7 border border-gray-300 flex items-center justify-center rounded-lg text-xs hover:bg-gray-100 transition"
                        >
                          <i className="fas fa-eye"></i>
                        </button>

                        <button
                          onClick={() => handleEdit(item.id)}
                          className="cursor-pointer w-7 h-7 border border-gray-300 flex items-center justify-center rounded-lg text-xs hover:bg-gray-100 transition"
                        >
                          <i className="fas fa-pen "></i>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="cursor-pointer w-7 h-7 border text-red-600 border-red-600 flex items-center justify-center rounded-lg text-xs hover:bg-gray-100 transition"
                        >
                          <i className="fas fa-trash "></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No accounts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mt-4 pt-4 border-gray-300 border-t">
          {/* Showing Info - Right */}
          <div className="text-xs text-gray-700">
            Showing {indexOfFirstEntry + 1} to{" "}
            {Math.min(indexOfLastEntry, sortedData.length)} of{" "}
            {sortedData.length} entries
          </div>

          {/* Pagination - Center */}
          <div className="mb-4 md:mb-0">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`w-8 h-8 flex items-center justify-center rounded text-sm ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed "
                    : "text-gray-700 hover:bg-gray-100 "
                }`}
              >
                <i className="fas fa-chevron-left text-xs"></i>
              </button>

              {renderPaginationButtons()}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`w-8 h-8 flex items-center justify-center rounded text-sm ${
                  currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed "
                    : "text-gray-700 hover:bg-gray-100 "
                }`}
              >
                <i className="fas fa-chevron-right text-xs"></i>
              </button>
            </div>
          </div>

          {/* Show Entries - Left */}
          <div className="mb-4 md:mb-0">
            <span className="text-xs text-gray-700 mr-2">Show:</span>
            <select
              value={entriesPerPage}
              onChange={handleEntriesChange}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="all">All</option>
            </select>
            <span className="text-sm text-gray-700 ml-2">entries</span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
