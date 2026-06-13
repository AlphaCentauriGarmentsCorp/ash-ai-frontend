import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import { purchaseRequestsApi } from "../../api/purchaseRequestsApi";
import { useAuth } from "../../hooks/useAuth";
import { hasRequiredPermissions } from "../../utils/authz";
import useConfirm from "../../hooks/useConfirm";

/**
 * Phase 3 — Purchase Request detail page.
 *
 * Shows the PR with its line items and a context-sensitive action bar:
 *   - status=pending   → Approve / Cancel (manager+ / purchasing)
 *   - status=approved  → Mark Ordered / Cancel (purchasing)
 *   - status=ordered   → Mark Received (warehouse_manager / manager)
 *   - status=received  → no actions (terminal)
 *   - status=cancelled → no actions (terminal)
 *
 * Each action button is also gated by its specific permission, so a
 * purchasing user can mark-ordered but the "Approve" button won't show
 * up for them (managers approve).
 */

const STATUS_BADGE = {
  pending:   { label: "Pending",   bg: "bg-amber-100",  fg: "text-amber-700",  icon: "fa-hourglass-half" },
  approved:  { label: "Approved",  bg: "bg-blue-100",   fg: "text-blue-700",   icon: "fa-check" },
  ordered:   { label: "Ordered",   bg: "bg-purple-100", fg: "text-purple-700", icon: "fa-truck" },
  received:  { label: "Received",  bg: "bg-green-100",  fg: "text-green-700",  icon: "fa-box-open" },
  cancelled: { label: "Cancelled", bg: "bg-gray-100",   fg: "text-gray-600",   icon: "fa-circle-xmark" },
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

const formatPHP = (amount) => {
  const n = Number(amount ?? 0);
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(n);
};

const PurchaseRequestDetail = () => {
  const { confirm, dialog } = useConfirm();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [pr, setPr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  // Permission-driven button visibility.
  const canApprove   = hasRequiredPermissions(user, ["purchase_requests.approve"]);
  const canOrder     = hasRequiredPermissions(user, ["purchase_requests.mark_ordered"]);
  const canReceive   = hasRequiredPermissions(user, ["purchase_requests.mark_received"]);
  const canCancel    = hasRequiredPermissions(user, ["purchase_requests.cancel"]);

  const fetchPR = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await purchaseRequestsApi.show(id);
      setPr(result?.data ?? result);
    } catch (err) {
      console.error("Failed to load PR:", err);
      const status = err?.response?.status;
      if (status === 404) {
        setError("Purchase request not found.");
      } else if (status === 403) {
        setError("You don't have permission to view this purchase request.");
      } else {
        setError(err?.response?.data?.message || "Failed to load purchase request.");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchPR(); }, [fetchPR]);

  /**
   * Run a lifecycle action with shared loading + error handling.
   * `actionFn` is one of the purchaseRequestsApi methods.
   */
  const runAction = async (label, actionFn, confirmMsg) => {
    if (confirmMsg) {
      const ok = await confirm({ message: confirmMsg });
      if (!ok) return;
    }
    setActionLoading(true);
    setActionError(null);
    try {
      await actionFn(id);
      await fetchPR();
    } catch (err) {
      console.error(`${label} failed:`, err);
      const data = err?.response?.data;
      const fieldErr = data?.errors?.status
        ? (Array.isArray(data.errors.status) ? data.errors.status[0] : data.errors.status)
        : null;
      setActionError(fieldErr || data?.message || `${label} failed. Try again.`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 text-center text-gray-500">
          <i className="fa-solid fa-spinner fa-spin mr-2" />
          Loading purchase request…
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
            onClick={() => navigate("/purchase-requests")}
            className="mt-4 text-sm text-blue-600 hover:text-blue-800"
          >
            ← Back to all purchase requests
          </button>
        </div>
      </AdminLayout>
    );
  }

  if (!pr) return null;

  // Build the action bar based on current status.
  const showApprove   = pr.status === "pending"  && canApprove;
  const showOrder     = pr.status === "approved" && canOrder;
  const showReceive   = pr.status === "ordered"  && canReceive;
  const showCancel    = ["pending", "approved", "ordered"].includes(pr.status) && canCancel;
  const hasAnyAction  = showApprove || showOrder || showReceive || showCancel;

  return (
    <AdminLayout>
      <div className="p-6 max-w-5xl">
        <Link
          to="/purchase-requests"
          className="text-sm text-blue-600 hover:text-blue-800 mb-3 inline-block"
        >
          ← Back to all purchase requests
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-semibold text-gray-900">{pr.pr_code}</h1>
              <StatusBadge status={pr.status} />
            </div>
            <p className="text-sm text-gray-500">
              Created {formatDate(pr.created_at)}
            </p>
          </div>

          {hasAnyAction && (
            <div className="flex gap-2">
              {showCancel && (
                <button
                  type="button"
                  onClick={() => runAction(
                    "Cancel",
                    purchaseRequestsApi.cancel,
                    "Cancel this purchase request? Stock won't be incremented.",
                  )}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  <i className="fa-solid fa-circle-xmark mr-2" />
                  Cancel
                </button>
              )}
              {showApprove && (
                <button
                  type="button"
                  onClick={() => runAction(
                    "Approve",
                    purchaseRequestsApi.approve,
                    "Approve this purchase request?",
                  )}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <i className="fa-solid fa-check mr-2" />
                  Approve
                </button>
              )}
              {showOrder && (
                <button
                  type="button"
                  onClick={() => runAction(
                    "Mark Ordered",
                    purchaseRequestsApi.markOrdered,
                    "Mark this PR as ordered with the supplier?",
                  )}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                >
                  <i className="fa-solid fa-truck mr-2" />
                  Mark Ordered
                </button>
              )}
              {showReceive && (
                <button
                  type="button"
                  onClick={() => runAction(
                    "Mark Received",
                    purchaseRequestsApi.markReceived,
                    "Confirm goods received? Stock will be incremented for all line items.",
                  )}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  <i className="fa-solid fa-box-open mr-2" />
                  Mark Received
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
              {pr.order?.po_code || "—"}
            </div>
            {pr.order?.client_brand && (
              <div className="text-xs text-gray-500 mt-1">{pr.order.client_brand}</div>
            )}
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-xs text-gray-500 uppercase">Supplier</div>
            <div className="font-semibold text-gray-900 mt-1">
              {pr.supplier?.name || "—"}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-xs text-gray-500 uppercase">Total Amount</div>
            <div className="font-semibold text-gray-900 mt-1">
              {formatPHP(pr.total_amount)}
            </div>
          </div>
        </div>

        {/* Linked Material Request */}
        {pr.material_request && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-blue-900 uppercase mb-1">
                Originating Material Request
              </div>
              <p className="text-sm text-blue-900">
                Auto-spawned from{" "}
                <span className="font-semibold">{pr.material_request.mr_code}</span>{" "}
                (status: {pr.material_request.status})
              </p>
            </div>
            <Link
              to={`/material-requests/${pr.material_request.id}`}
              className="text-sm font-medium text-blue-700 hover:text-blue-900"
            >
              View MR →
            </Link>
          </div>
        )}

        {/* Reason */}
        {pr.reason && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <div className="text-xs font-semibold text-gray-700 uppercase mb-1">Reason</div>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{pr.reason}</p>
          </div>
        )}

        {/* Items */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-700">Line Items</h2>
          </div>
          {pr.items && pr.items.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-xs font-semibold text-gray-600 uppercase">
                  <th className="px-4 py-3">Material</th>
                  <th className="px-4 py-3 text-right">Quantity</th>
                  <th className="px-4 py-3 text-right">Unit Price</th>
                  <th className="px-4 py-3 text-right">Line Total</th>
                  <th className="px-4 py-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pr.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {item.material?.name || `Material #${item.material_id}`}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {item.quantity} {item.unit || ""}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {formatPHP(item.unit_price)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {formatPHP(item.line_total)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {item.notes || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    Total
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">
                    {formatPHP(pr.total_amount)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          ) : (
            <div className="p-6 text-center text-gray-500">No items.</div>
          )}
        </div>

        {/* Lifecycle audit timeline */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-sm space-y-2">
          <div className="text-xs font-semibold text-gray-700 uppercase mb-2">
            Lifecycle
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Created</span>
            <span>{formatDate(pr.created_at)}</span>
          </div>
          {pr.approved_at && (
            <div className="flex justify-between text-gray-600">
              <span>Approved {pr.approved_by?.name && <>by <span className="font-medium">{pr.approved_by.name}</span></>}</span>
              <span>{formatDate(pr.approved_at)}</span>
            </div>
          )}
          {pr.ordered_at && (
            <div className="flex justify-between text-gray-600">
              <span>Ordered</span>
              <span>{formatDate(pr.ordered_at)}</span>
            </div>
          )}
          {pr.received_at && (
            <div className="flex justify-between text-gray-600">
              <span>Received</span>
              <span>{formatDate(pr.received_at)}</span>
            </div>
          )}
        </div>
      </div>
      {dialog}
    </AdminLayout>
  );
};

export default PurchaseRequestDetail;
