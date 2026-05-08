import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import { purchaseRequestsApi } from "../../api/purchaseRequestsApi";

/**
 * Phase 3 — Purchase Requests list page.
 *
 * Most PRs are auto-spawned by MR approval when stock is short.
 * Each PR has a lifecycle status (pending / approved / ordered /
 * received / cancelled). Detail view + lifecycle action buttons
 * land in Layer 5b.
 */

const STATUS_BADGE = {
  pending:   { label: "Pending",   bg: "bg-amber-100",  fg: "text-amber-700"  },
  approved:  { label: "Approved",  bg: "bg-blue-100",   fg: "text-blue-700"   },
  ordered:   { label: "Ordered",   bg: "bg-purple-100", fg: "text-purple-700" },
  received:  { label: "Received",  bg: "bg-green-100",  fg: "text-green-700"  },
  cancelled: { label: "Cancelled", bg: "bg-gray-100",   fg: "text-gray-600"   },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_BADGE[status] || { label: status, bg: "bg-gray-100", fg: "text-gray-700" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.fg}`}>
      {cfg.label}
    </span>
  );
};

const STATUS_FILTERS = [
  { value: "",          label: "All" },
  { value: "pending",   label: "Pending" },
  { value: "approved",  label: "Approved" },
  { value: "ordered",   label: "Ordered" },
  { value: "received",  label: "Received" },
  { value: "cancelled", label: "Cancelled" },
];

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString();
};

const formatPHP = (amount) => {
  const n = Number(amount ?? 0);
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(n);
};

const PurchaseRequestsList = () => {
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const [data, setData] = useState({ data: [], current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await purchaseRequestsApi.list({
        status: statusFilter || undefined,
        page,
        perPage: 20,
      });
      setData(result);
    } catch (err) {
      console.error("Failed to load purchase requests:", err);
      const msg = err?.response?.data?.message || "Failed to load purchase requests.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Purchase Requests</h1>
            <p className="text-sm text-gray-500 mt-1">
              Auto-spawned from material requests when stock is short.
              Track approval, ordering, and receipt of goods.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-gray-600 uppercase">Status:</span>
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value || "all"}
                type="button"
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1 text-xs rounded-full transition ${
                  statusFilter === f.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading && (
            <div className="p-8 text-center text-gray-500">
              <i className="fa-solid fa-spinner fa-spin mr-2" />
              Loading…
            </div>
          )}

          {!loading && error && (
            <div className="p-8 text-center text-red-600">
              <i className="fa-solid fa-triangle-exclamation mr-2" />
              {error}
            </div>
          )}

          {!loading && !error && data.data.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <i className="fa-solid fa-cart-shopping text-4xl text-gray-300 mb-3" />
              <p className="font-medium">No purchase requests yet</p>
              <p className="text-sm mt-1">
                PRs are created automatically when a material request is approved
                but stock is insufficient.
              </p>
            </div>
          )}

          {!loading && !error && data.data.length > 0 && (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-xs font-semibold text-gray-600 uppercase">
                  <th className="px-4 py-3">PR Code</th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3">From MR</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.data.map((pr) => (
                  <tr key={pr.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {pr.pr_code}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {pr.order?.po_code || "—"}
                      {pr.order?.client_brand && (
                        <span className="text-gray-400 text-xs block">
                          {pr.order.client_brand}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {pr.supplier?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {pr.material_request?.mr_code || (
                        <span className="italic">Ad-hoc</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900 font-medium">
                      {formatPHP(pr.total_amount)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={pr.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {formatDate(pr.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/purchase-requests/${pr.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && !error && data.last_page > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
            <div>
              Showing page {data.current_page} of {data.last_page} ({data.total} total)
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(data.last_page, p + 1))}
                disabled={page >= data.last_page}
                className="px-3 py-1.5 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default PurchaseRequestsList;
