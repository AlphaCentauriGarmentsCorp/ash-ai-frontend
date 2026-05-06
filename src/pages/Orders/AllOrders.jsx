import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import Table from "../../components/table/Table";
import { orderApi } from "../../api/orderApi";
import { useNavigate } from "react-router-dom";

const AllOrders = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);

  // ── Status badge ──────────────────────────────────────────────────────────
  const getStatusBadge = (status) => {
    const map = {
      "Pending Approval": "bg-yellow-100 text-yellow-700",
      "Approved": "bg-blue-100 text-blue-700",
      "In Production": "bg-purple-100 text-purple-700",
      "Completed": "bg-green-100 text-green-700",
      "Cancelled": "bg-red-100 text-red-700",
    };
    const cls = map[status] || "bg-gray-100 text-gray-600";
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
        {status || "—"}
      </span>
    );
  };

  const columns = [
    {
      key: "po_code",
      label: "P.O Number",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2 font-medium text-primary">
          <i className="fas fa-file-alt text-xs text-gray-400"></i>
          {item.po_code}
        </div>
      ),
    },
    {
      key: "client_name",
      label: "Client",
      sortable: true,
      render: (item) => (
        <div>
          <p className="font-medium text-sm">{item.client_name || item.client?.name || "—"}</p>
          {item.client_brand && (
            <p className="text-xs text-gray-400">{item.client_brand}</p>
          )}
        </div>
      ),
    },
    {
      key: "apparel_type",
      label: "Apparel",
      sortable: true,
      render: (item) => (
        <div>
          <p className="text-sm">{item.apparel_type || "—"}</p>
          {item.pattern_type && (
            <p className="text-xs text-gray-400">{item.pattern_type}</p>
          )}
        </div>
      ),
    },
    {
      key: "print_method",
      label: "Print Method",
      sortable: true,
      render: (item) => item.print_method || "—",
    },
    {
      key: "shirt_color",
      label: "Shirt Color",
      sortable: true,
      render: (item) => item.shirt_color || "—",
    },
    {
      key: "grand_total",
      label: "Grand Total",
      sortable: true,
      render: (item) => {
        const val = Number(item.grand_total) || 0;
        return (
          <span className="font-semibold text-primary">
            ₱{val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      filterable: true,
      render: (item) => getStatusBadge(item.status),
    },
    {
      key: "created_at",
      label: "Created",
      sortable: true,
      render: (item) => {
        if (!item.created_at) return "—";
        return new Date(item.created_at).toLocaleDateString("en-PH", {
          month: "short", day: "2-digit", year: "numeric",
        });
      },
    },
  ];

  const fetchData = useCallback(
    async (perPage = pageSize) => {
      setIsLoading(true);
      try {
        const response = await orderApi.index(
          perPage === "all" ? {} : { per_page: perPage }
        );
        const responseData = response.data || response;
        setData(Array.isArray(responseData) ? responseData : []);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    },
    [pageSize]
  );

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchData(pageSize); }, [pageSize]);

  const handlePageSizeChange = (newPageSize) => setPageSize(newPageSize);

  const handleAction = async (action, rowData) => {
    switch (action) {
      case "view":
        navigate(`/order/${rowData.po_code}`);
        break;
      case "edit":
        // Edit not yet implemented — can be wired to an edit page
        console.log("Edit:", rowData);
        break;
      case "delete":
        if (window.confirm(`Delete order ${rowData.po_code}? This cannot be undone.`)) {
          try {
            await orderApi.delete?.(rowData.id || rowData.po_code);
            fetchData();
          } catch (err) {
            console.error("Delete failed:", err);
            alert("Failed to delete order. Please try again.");
          }
        }
        break;
    }
  };

  const tableConfig = {
    sortable: true,
    pagination: true,
    search: true,
    filters: true,
    actions: ["view", "delete"],
    pageSize: pageSize,
    pageSizeOptions: [10, 20, 50, 100, "All"],
    emptyMessage: "No orders found",
    searchPlaceholder: "Search by PO code, client, apparel...",
    showIndex: true,
  };

  return (
    <AdminLayout
      icon="fa-shirt"
      pageTitle="All Orders"
      path="/orders"
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
      />
    </AdminLayout>
  );
};

export default AllOrders;