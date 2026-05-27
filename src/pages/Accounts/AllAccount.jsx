import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import Table from "../../components/table/Table";
import { accountApi } from "../../api/accountApi";
import { accountService } from "../../services/accountService";

const AccountsPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [actionError, setActionError] = useState("");

  const columns = [
    {
      key: "name",
      label: "Name",
      sortable: true,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
    },
    {
      key: "domain_role",
      label: "Role",
      sortable: true,
      render: (item) => {
        const formatRole = (role) =>
          role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

        let roleList = [];
        if (Array.isArray(item.domain_role)) {
          roleList = item.domain_role;
        } else if (item.domain_role) {
          roleList = [item.domain_role];
        }

        if (roleList.length === 0) {
          return <span className="text-gray-400">No role</span>;
        }

        // Convention: index 0 is the primary role; the rest are secondary.
        const primary = formatRole(roleList[0]);
        const secondaries = roleList.slice(1).map(formatRole);

        return (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">
              {primary}
            </span>
            {secondaries.map((role) => (
              <span
                key={role}
                className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 text-xs"
              >
                {role}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: "contact_number",
      label: "Contact Number",
      sortable: true,
      render: (item) => item.employee_details?.contact_number ?? "N/A",
    },

    {
      key: "createdAt",
      label: "Date Created",
      sortable: true,
      render: (item) =>
        item.created_at
          ? new Date(item.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })
          : "N/A",
    },
  ];

  const fetchData = useCallback(
    async (perPage = pageSize) => {
      setIsLoading(true);
      try {
        let response;

        if (perPage === "all") {
          response = await accountApi.index();
        } else {
          response = await accountApi.index({ per_page: perPage });
        }

        const responseData = response.data || response;
        setData(responseData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    },
    [pageSize],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData(pageSize);
  }, [pageSize]);

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
  };

  const handleAction = async (action, rowData) => {
    setActionError("");
    switch (action) {
      case "view":
        navigate(`/account/employee/${rowData.id}`);
        break;
      case "edit":
        navigate(`/account/employee/${rowData.id}/edit`);
        break;
      case "delete":
        if (
          window.confirm(
            `Deactivate ${rowData.name}? Their account will be disabled but can be restored later.`,
          )
        ) {
          try {
            await accountService.deleteAccount(rowData.id);
            // Remove from the current view immediately, then refresh from server.
            setData((prev) => prev.filter((u) => u.id !== rowData.id));
            fetchData(pageSize);
          } catch (error) {
            console.error("Error deleting account:", error);
            setActionError(
              error.response?.data?.message ||
                "Failed to deactivate account. Please try again.",
            );
          }
        }
        break;
      default:
        break;
    }
  };

  const tableConfig = {
    sortable: true,
    pagination: true,
    search: true,
    filters: true,
    actions: ["view", "edit", "delete"],
    pageSize: pageSize,
    pageSizeOptions: [20, 50, 100, 500, "All"],
    emptyMessage: "No accounts found",
    searchPlaceholder: "Search accounts...",
    showIndex: true,
  };

  return (
    <AdminLayout
      icon="fa-user"
      pageTitle="All Accounts"
      path="/account/employee"
      links={[
        { label: "Home", href: "/" },
        { label: "Accounts", href: "/admin/accounts" },
      ]}
    >
      {actionError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
          <i className="fa-solid fa-exclamation-circle text-red-500 mr-2"></i>
          <p className="text-red-700 text-sm">{actionError}</p>
        </div>
      )}
      <Table
        data={data}
        columns={columns}
        config={tableConfig}
        onPageSizeChange={handlePageSizeChange}
        onAction={handleAction}
        isLoading={isLoading}
        url="/account/employee/new"
        button="New Account"
        PageTitle="All Accounts"
      />
    </AdminLayout>
  );
};

export default AccountsPage;
