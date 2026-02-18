import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import Table from "../../components/table/Table";
import { orderApi } from "../../api/orderApi";

const ClientsPage = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);

  const columns = [
    {
      key: "po_code",
      label: "P.O Number",
      sortable: true,
      render: (item) => {
        // Choose a color for the circle (example: brand-based)
        const circleColor =
          item.brand === "reefer"
            ? "bg-[#FF7802]"
            : item.brand === "sorbetes"
              ? "bg-black"
              : "bg-gray-400";

        return (
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${circleColor}`}></span>
            <span>{item.po_code}</span>
          </div>
        );
      },
    },
    {
      key: "service_type",
      label: "Service Type",
      sortable: true,
      filterable: true,
    },

    {
      key: "priority",
      label: "Priority",
      sortable: true,
      filterable: true,
    },
    {
      key: "client_brand",
      label: "Clothing",
      sortable: true,
    },

    {
      key: "design_name",
      label: "Design Name",
      sortable: true,
      filters: true,
    },

    {
      key: "status",
      label: "Status",
      sortable: true,
      filters: true,
    },
    {
      key: "leadTimeLeft",
      label: "Lead Time Left",
      sortable: true,
      render: (item) => {
        if (!item.deadline) return "N/A";

        const today = new Date();
        const deadline = new Date(item.deadline);
        const diffTime = deadline - today;

        // Convert to days
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let text = "";
        let color = "black"; // default text color

        if (diffDays > 0) {
          text = `${diffDays} day${diffDays > 1 ? "s" : ""} left`;
        } else if (diffDays === 0) {
          text = "Today";
          color = "orange"; // optional: highlight today
        } else {
          text = `${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? "s" : ""} overdue`;
          color = "red"; // overdue in red
        }

        return <span style={{ color }}>{text}</span>;
      },
    },
  ];

  const fetchData = useCallback(
    async (perPage = pageSize) => {
      setIsLoading(true);
      try {
        let response;

        if (perPage === "all") {
          response = await orderApi.index();
        } else {
          response = await orderApi.index({ per_page: perPage });
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
    emptyMessage: "No order found",
    searchPlaceholder: "Search order...",
    showIndex: true,
  };

  return (
    <AdminLayout
      icon="fa-shirt"
      pageTitle="All Orders"
      path="/account/employee"
      links={[
        { label: "Home", href: "/" },
        { label: "Orders", href: "/orders" },
      ]}
    >
      <Table
        data={data}
        columns={columns}
        config={tableConfig}
        onPageSizeChange={handlePageSizeChange}
        onAction={handleAction}
        isLoading={isLoading}
        url="/orders/new"
        button="New Order"
        PageTitle={
          <>
            <div className="flex items-center justify-start gap-4 mt-4">
              <div>
                <small className="text-normal">Legends</small>
              </div>
              <div className="flex items-center gap-2 border rounded px-2 py-1 border-gray-300">
                <span className="text-sm">Reefer</span>
                <span className="w-3 h-3 rounded-full bg-[#FF7802]"></span>
              </div>

              {/* Legend for Sorbetes */}
              <div className="flex items-center gap-2 border rounded px-2 py-1 border-gray-300">
                <span className="text-sm">Sorbetes</span>
                <span className="w-3 h-3 rounded-full bg-black"></span>
              </div>
            </div>
          </>
        }
      />
    </AdminLayout>
  );
};

export default ClientsPage;
