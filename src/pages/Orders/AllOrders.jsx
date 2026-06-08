import React, { useState, useEffect, useCallback, useMemo } from "react";
import IncompleteBadge from "../../components/common/IncompleteBadge";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import Table from "../../components/table/Table";
import { orderApi } from "../../api/orderApi";
import { useNavigate, useSearchParams } from "react-router-dom";
import { firstPartThumbnail } from "../../utils/designImage";
import DesignThumb from "../../components/common/DesignThumb";

// Change 16 — deep-link filters used by the CSR Hub overview cards. Predicates
// mirror CsrDashboardService so the drilled-in list matches the card's count.
const STATE_FILTERS = {
  in_production: {
    label: "In Production",
    fn: (o) =>
      o.workflow_status &&
      !["completed", "delivered", "cancelled"].includes(o.workflow_status),
  },
  delayed: {
    label: "Delayed",
    fn: (o) => Boolean(o.delayed_at),
  },
  ready_for_delivery: {
    label: "Ready for Delivery",
    fn: (o) => o.workflow_status === "ready_for_delivery",
  },
  completed: {
    label: "Completed",
    fn: (o) => o.workflow_status === "completed",
  },
};

const AllOrders = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);

  const stateKey = searchParams.get("state");
  const activeStateFilter = stateKey ? STATE_FILTERS[stateKey] : null;
  const displayData = useMemo(() => {
    if (!activeStateFilter) return data;
    return data.filter(activeStateFilter.fn);
  }, [data, activeStateFilter]);

  const clearStateFilter = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("state");
    setSearchParams(next, { replace: true });
  };

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
      <span className={`inline-block whitespace-nowrap px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
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
          <IncompleteBadge
            incomplete={item.is_incomplete}
            fields={item.incomplete_fields}
          />
        </div>
      ),
    },
    {
      key: "design_thumbnail",
      label: "Design",
      sortable: false,
      render: (item) => <DesignThumb url={firstPartThumbnail(item)} />,
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
        navigate(`/orders/${rowData.po_code}/edit`);
        break;
      case "delete":
        if (window.confirm(`Delete order ${rowData.po_code}? It will be removed from the list but can be recovered if needed.`)) {
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
    actions: ["view", "edit", "delete"],
    // Edit only while the order is still editable (pre-production). The
    // backend enforces this too with ORDER_LOCKED_FOR_EDIT.
    rowActions: (item) =>
      item?.is_editable ? ["view", "edit", "delete"] : ["view", "delete"],
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
      {activeStateFilter && (
        <div className="mb-3 flex items-center gap-2 text-sm">
          <span className="text-gray-500">Showing:</span>
          <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium">
            {activeStateFilter.label}
            <span className="text-primary/60">({displayData.length})</span>
            <button
              type="button"
              onClick={clearStateFilter}
              className="hover:text-primary/70"
              title="Clear filter"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </span>
        </div>
      )}
      <Table
        data={displayData}
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