import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import { materialRequestsApi } from "../../api/materialRequestsApi";
import { useAuth } from "../../hooks/useAuth";
import { hasRequiredPermissions } from "../../utils/authz";

/**
 * Phase 3 — Material Request detail page.
 *
 * Shows everything about a single MR:
 *   - Header with code + status badge
 *   - Order, stage, requester info
 *   - Items table with stock-snapshot + shortage flag
 *   - Approve/Reject buttons (only for managers, only when status=pending)
 *   - If status=auto_pr, shows linked PR with a deep link
 */

const STATUS_BADGE = {
  pending:  { label: "Pending",     bg: "bg-amber-100",  fg: "text-amber-700",  icon: "fa-hourglass-half" },
  approved: { label: "Approved",    bg: "bg-green-100",  fg: "text-green-700",  icon: "fa-check-circle" },
  rejected: { label: "Rejected",    bg: "bg-red-100",    fg: "text-red-700",    icon: "fa-circle-xmark" },
  auto_pr:  { label: "→ Purchase",  bg: "bg-blue-100",   fg: "text-blue-700",   icon: "fa-arrow-right" },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_BADGE[status] || { label: status, bg: "bg-gray-100", fg: "text-gray-700", icon: "fa-circle" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.fg}`}>
      <i className={`fa-solid ${cfg.icon}`} />
      {cfg.label}
    </span>
  );
};

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
};

const MaterialRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [mr, setMr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const canApprove = hasRequiredPermissions(user, ["material_requests.approve"]);
  const canReject  = hasRequiredPermissions(user, ["material_requests.reject"]);

  const fetchMR = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await materialRequestsApi.show(id);
      setMr(result?.data ?? result);
    } catch (err) {
      console.error("Failed to load MR:", err);
      const status = err?.response?.status;
      if (status === 404) {
        setError("Material request not found.");
      } else if (status === 403) {
        setError("You don't have permission to view this material request.");
      } else {
        setError(err?.response?.data?.message || "Failed to load material request.");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchMR(); }, [fetchMR]);

  const handleApprove = async () => {
    if (!confirm("Approve this material request? If stock is short, a Purchase Request will be auto-created.")) {
      return;
    }
    setActionLoading(true);
    setActionError(null);
    try {
      await materialRequestsApi.approve(id);
      await fetchMR();
    } catch (err) {
      console.error("Approve failed:", err);
      setActionError(
        err?.response?.data?.message ||
          err?.response?.data?.errors?.status ||
          "Failed to approve. Try again.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (rejectReason.trim().length < 3) {
      setActionError("Please provide a rejection reason (at least 3 characters).");
      return;
    }
    setActionLoading(true);
    setActionError(null);
    try {
      await materialRequestsApi.reject(id, rejectReason.trim());
      setShowRejectModal(false);
      setRejectReason("");
      await fetchMR();
    } catch (err) {
      console.error("Reject failed:", err);
      const data = err?.response?.data;
      const fieldMsg = data?.errors?.rejection_reason
        ? (Array.isArray(data.errors.rejection_reason)
          ? data.errors.rejection_reason[0]
          : data.errors.rejection_reason)
        : null;
      setActionError(fieldMsg || data?.message || "Failed to reject. Try again.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 text-center text-gray-500">
          <i className="fa-solid fa-spinner fa-spin mr-2" />
          Loading material request…
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <i className="fa-solid fa-triangle-exclamation mr-2" />
            {error}
          </div>
          <button
            type="button"
            onClick={() => navigate("/material-requests")}
            className="mt-4 text-sm text-blue-600 hover:text-blue-800"
          >
            ← Back to all material requests
          </button>
        </div>
      </AdminLayout>
    );
  }

  if (!mr) return null;

  const isPending = mr.status === "pending";
  const showActions = isPending && (canApprove || canReject);

  return (
    <AdminLayout>
      <div className="p-6 max-w-5xl">
        {/* Back link */}
        <Link
          to="/material-requests"
          className="text-sm text-blue-600 hover:text-blue-800 mb-3 inline-block"
        >
          ← Back to all material requests
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-semibold text-gray-900">
                {mr.mr_code}
              </h1>
              <StatusBadge status={mr.status} />
            </div>
            <p className="text-sm text-gray-500">
              Created {formatDate(mr.created_at)}
              {mr.requested_by?.name && <> by <span className="font-medium">{mr.requested_by.name}</span></>}
            </p>
          </div>

          {showActions && (
            <div className="flex gap-2">
              {canReject && (
                <button
                  type="button"
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium border border-red-300 text-red-700 bg-white rounded-md hover:bg-red-50 disabled:opacity-50"
                >
                  <i className="fa-solid fa-circle-xmark mr-2" />
                  Reject
                </button>
              )}
              {canApprove && (
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <><i className="fa-solid fa-spinner fa-spin mr-2" />Working…</>
                  ) : (
                    <><i className="fa-solid fa-check-circle mr-2" />Approve</>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {actionError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm">
            <i className="fa-solid fa-triangle-exclamation mr-2" />
            {actionError}
          </div>
        )}

        {/* Meta cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-xs text-gray-500 uppercase">Order</div>
            <div className="font-semibold text-gray-900 mt-1">
              {mr.order?.po_code || "—"}
            </div>
            {mr.order?.client_brand && (
              <div className="text-xs text-gray-500 mt-1">{mr.order.client_brand}</div>
            )}
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-xs text-gray-500 uppercase">Stage</div>
            <div className="font-semibold text-gray-900 mt-1">
              {mr.stage?.stage ? mr.stage.stage.replace(/_/g, " ") : "—"}
            </div>
            {mr.stage?.sequence != null && (
              <div className="text-xs text-gray-500 mt-1">
                Step {mr.stage.sequence} • {mr.stage.status}
              </div>
            )}
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-xs text-gray-500 uppercase">Requested By</div>
            <div className="font-semibold text-gray-900 mt-1">
              {mr.requested_by?.name || "—"}
            </div>
          </div>
        </div>

        {/* Reason / rejection reason */}
        {mr.reason && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="text-xs font-semibold text-blue-900 uppercase mb-1">Reason</div>
            <p className="text-sm text-blue-900 whitespace-pre-wrap">{mr.reason}</p>
          </div>
        )}
        {mr.rejection_reason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="text-xs font-semibold text-red-900 uppercase mb-1">Rejection Reason</div>
            <p className="text-sm text-red-900 whitespace-pre-wrap">{mr.rejection_reason}</p>
          </div>
        )}

        {/* Linked Purchase Request */}
        {mr.purchase_request && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-blue-900 uppercase mb-1">
                Auto-Spawned Purchase Request
              </div>
              <p className="text-sm text-blue-900">
                Stock was short — purchase request created:{" "}
                <span className="font-semibold">{mr.purchase_request.pr_code}</span>{" "}
                (status: {mr.purchase_request.status})
              </p>
            </div>
            <Link
              to={`/purchase-requests/${mr.purchase_request.id}`}
              className="text-sm font-medium text-blue-700 hover:text-blue-900"
            >
              View PR →
            </Link>
          </div>
        )}

        {/* Items */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-700">Materials Requested</h2>
          </div>
          {mr.items && mr.items.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-xs font-semibold text-gray-600 uppercase">
                  <th className="px-4 py-3">Material</th>
                  <th className="px-4 py-3 text-right">Requested</th>
                  <th className="px-4 py-3 text-right">Available (snapshot)</th>
                  <th className="px-4 py-3 text-right">Short</th>
                  <th className="px-4 py-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mr.items.map((item) => {
                  const short = Number(item.quantity_short ?? 0);
                  return (
                    <tr key={item.id}>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {item.material?.name || `Material #${item.material_id}`}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        {item.quantity_requested} {item.unit || ""}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        {item.quantity_available} {item.unit || ""}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {short > 0 ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                            {short} {item.unit || ""}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {item.notes || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-gray-500">No items.</div>
          )}
        </div>

        {/* Approval audit footer */}
        {(mr.approved_by || mr.approved_at) && (
          <div className="mt-4 text-xs text-gray-500">
            Decided {formatDate(mr.approved_at)}
            {mr.approved_by?.name && <> by <span className="font-medium">{mr.approved_by.name}</span></>}
          </div>
        )}

        {/* Reject modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Reject material request
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Tell the requester why this is being rejected. They'll be notified.
              </p>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason (required, min 3 characters)"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={actionLoading}
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason("");
                    setActionError(null);
                  }}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <><i className="fa-solid fa-spinner fa-spin mr-2" />Rejecting…</>
                  ) : (
                    "Confirm Reject"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default MaterialRequestDetail;
