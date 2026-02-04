import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import Table from "../../components/table/Table";
import { accountApi } from "../../api/accountApi";

const AccountsPage = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);

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
        let roles = [];
        if (Array.isArray(item.domain_role)) {
          roles = item.domain_role.map((role) =>
            role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          );
        } else if (item.domain_role) {
          roles = [
            item.domain_role
              .replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase()),
          ];
        }

        if (roles.length === 0) {
          return <span className="text-gray-400">No role</span>;
        }

        return (
          <span
            className="relative group cursor-pointer"
            title={roles.join(", ")}
          >
            {roles[0]}
            {roles.length > 1 && (
              <span className="text-gray-400 ml-1">+{roles.length - 1}</span>
            )}

            <div className="absolute z-10 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 mt-1 whitespace-nowrap">
              {roles.map((role, index) => (
                <p key={index}>
                  {role}
                  {index < roles.length - 1 && " "}
                </p>
              ))}
            </div>
          </span>
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

  const handleAction = (action, rowData) => {
    switch (action) {
      case "view":
        console.log("View:", rowData);
        break;
      case "edit":
        console.log("Edit:", rowData);
        break;
      case "delete":
        if (
          window.confirm(`Are you sure you want to delete ${rowData.name}?`)
        ) {
          console.log("Delete:", rowData);
        }
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
    pageSizeOptions: [3, 10, 20, 50, 100, "All"],
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
        { label: "Home", href: "/admin/dashboard" },
        { label: "Accounts", href: "/admin/accounts" },
      ]}
    >
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
