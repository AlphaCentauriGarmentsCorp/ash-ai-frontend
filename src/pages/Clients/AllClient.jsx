import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import Table from "../../components/table/Table";
import { clientApi } from "../../api/clientApi";

const ClientsPage = () => {
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
      key: "brands",
      label: "Brands",
      sortable: false,
      render: (item) => {
        const brands = Array.isArray(item.brands)
          ? item.brands.map((b) => b.name)
          : [];

        if (brands.length === 0) {
          return <span className="text-gray-400">No brands</span>;
        }

        return (
          <span
            className="relative group cursor-pointer"
            title={brands.join(", ")}
          >
            {brands[0]}
            {brands.length > 1 && (
              <span className="text-gray-400 ml-1">+{brands.length - 1}</span>
            )}

            <div className="absolute z-50 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 mt-1 whitespace-nowrap">
              {brands.map((brand, index) => (
                <p key={index}>
                  {brand}
                  {index < brands.length - 1 && ", "}
                </p>
              ))}
            </div>
          </span>
        );
      },
    },

    {
      key: "email",
      label: "Email",
      sortable: false,
    },

    {
      key: "contact_number",
      label: "Contact Number",
      sortable: false,
    },
    {
      key: "address",
      label: "Address",
      sortable: true,
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
          response = await clientApi.index();
        } else {
          response = await clientApi.index({ per_page: perPage });
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
    pageSizeOptions: [20, 50, 100, 500, "All"],
    emptyMessage: "No clients found",
    searchPlaceholder: "Search client...",
    showIndex: true,
  };

  return (
    <AdminLayout
      icon="fa-user"
      pageTitle="All Clients"
      path="/account/employee"
      links={[
        { label: "Home", href: "/" },
        { label: "Clients", href: "/clients" },
      ]}
    >
      <Table
        data={data}
        columns={columns}
        config={tableConfig}
        onPageSizeChange={handlePageSizeChange}
        onAction={handleAction}
        isLoading={isLoading}
        url="/clients/new"
        button="New Client"
        PageTitle="All Clients"
      />
    </AdminLayout>
  );
};

export default ClientsPage;
