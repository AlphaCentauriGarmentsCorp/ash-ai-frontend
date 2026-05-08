import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import { materialRequestsApi } from "../../api/materialRequestsApi";

/**
 * Phase 3 — Material Requests list page.
 *
 * Lists all MRs the user can see (the backend already scopes by
 * permission). Provides a status filter and pagination. Each row
 * links to the detail page (Layer 5b) which currently doesn't exist
 * yet — clicking an MR before Layer 5b ships will land on a
 * placeholder route.
 */

// Maps backend status slugs → visual treatment.
const STATUS_BADGE = {
  pending:  { label: "Pending",   bg: "bg-amber-100",  fg: "text-amber-700"  },
  approved: { label: "Approved",  bg: "bg-green-100",  fg: "text-green-700"  },
  rejected: { label: "Rejected",  bg: "bg-red-100",    fg: "text-red-700"    },
  auto_pr:  { label: "→ Purchase",bg: "bg-blue-100",   fg: "text-blue-700"   },
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
  { value: "",         label: "All" },
  { value: "pending",  label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "auto_pr",  label: "Auto-PR" },
];

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString();
};

const MaterialRequestsList = () => {
  const [statusFilter, setStatusFilter] = useState("");
  const [mineOnly, setMineOnly] = useState(false);
  const [page, setPage] = useState(1);

  const [data, setData] = useState({ data: [], current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await materialRequestsApi.list({
        status: statusFilter || undefined,
        mine: mineOnly,
        page,
        perPage: 20,
      });
      setData(result);
    } catch (err) {
      console.error("Failed to load material requests:", err);
      const msg = err?.response?.data?.message || "Failed to load material requests.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, mineOnly, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset to page 1 when filters change so we don't end up on an
  // out-of-range page after a filter narrows the result set.
  useEffect(() => {
    setPage(1);
  }, [statusFilter, mineOnly]);

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Material Requests</h1>
            <p className="text-sm text-gray-500 mt-1">
              Production-stage material requests and their approval status.
            </p>
          </div>
          <Link
            to="/material-requests/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
          >
            <i className="fa-solid fa-plus" />
            New Material Request
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
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

            <label className="flex items-center gap-2 ml-4 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={mineOnly}
                onChange={(e) => setMineOnly(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              My requests only
            </label>
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
              <i className="fa-solid fa-boxes-packing text-4xl text-gray-300 mb-3" />
              <p className="font-medium">No material requests yet</p>
              <p className="text-sm mt-1">
                Production roles can create requests against their order's active stage.
              </p>
            </div>
          )}

          {!loading && !error && data.data.length > 0 && (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-xs font-semibold text-gray-600 uppercase">
                  <th className="px-4 py-3">MR Code</th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3">Requested By</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.data.map((mr) => (
                  <tr key={mr.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {mr.mr_code}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {mr.order?.po_code || "—"}
                      {mr.order?.client_brand && (
                        <span className="text-gray-400 text-xs block">
                          {mr.order.client_brand}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {mr.stage?.stage
                        ? mr.stage.stage.replace(/_/g, " ")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {mr.requested_by?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {mr.items?.length ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={mr.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {formatDate(mr.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/material-requests/${mr.id}`}
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

export default MaterialRequestsList;
