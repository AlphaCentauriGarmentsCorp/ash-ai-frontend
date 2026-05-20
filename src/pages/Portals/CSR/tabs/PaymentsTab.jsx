import React, { useCallback, useEffect, useMemo, useState } from "react";
import { csrPortalApi } from "../../../../api/csrPortalApi";
import { useAuth } from "../../../../hooks/useAuth";
import { hasRequiredPermissions } from "../../../../utils/authz";
import UploadPaymentModal from "../modals/UploadPaymentModal";
import VerifyPaymentModal from "../modals/VerifyPaymentModal";

/**
 * Phase 6-A Bundle 2 — Payments tab.
 *
 * Lists all payments with status filters. Verify button only renders
 * for users with `action.verify-payment` permission (Finance + Super Admin).
 */
const STATUS_FILTERS = [
  { key: "all",              label: "All" },
  { key: "waiting",          label: "Waiting" },
  { key: "for_verification", label: "For Verification" },
  { key: "verified",         label: "Verified" },
  { key: "rejected",         label: "Rejected" },
];

const STATUS_STYLES = {
  waiting:          "bg-gray-100 text-gray-700",
  for_verification: "bg-amber-100 text-amber-800",
  verified:         "bg-emerald-100 text-emerald-700",
  rejected:         "bg-red-100 text-red-700",
};

const TYPE_LABELS = {
  sample:       "Sample",
  down_payment: "Down Payment",
  balance:      "Balance",
  full:         "Full",
};

const formatPHP = (n) =>
  "₱" +
  Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2 });

const PaymentsTab = () => {
  const { user } = useAuth();
  const canVerify = useMemo(
    () => hasRequiredPermissions(user, ["action.verify-payment"], "any"),
    [user],
  );

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  const [showUpload, setShowUpload] = useState(false);
  const [verifyTarget, setVerifyTarget] = useState(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await csrPortalApi.listPayments();
      setItems(res?.data ?? []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load payments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((p) => p.status === filter);
  }, [items, filter]);

  const handleUploaded = (payment) => {
    setItems((prev) => [payment, ...prev]);
    setShowUpload(false);
  };

  const handleVerified = (payment) => {
    setItems((prev) => prev.map((p) => (p.id === payment.id ? payment : p)));
    setVerifyTarget(null);
  };

  return (
    <>
      <div className="space-y-4">
        <section className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
            <div className="flex flex-wrap gap-1">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={
                    "px-3 py-1.5 rounded-md text-xs font-semibold transition-colors " +
                    (filter === f.key
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200")
                  }
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchList}
                disabled={loading}
                className="text-xs font-semibold px-3 py-1.5 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                <i className={`fa-solid fa-arrows-rotate ${loading ? "fa-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                type="button"
                onClick={() => setShowUpload(true)}
                className="text-xs font-semibold px-3 py-1.5 rounded-md bg-primary text-white hover:bg-primary/90 inline-flex items-center gap-1.5"
              >
                <i className="fa-solid fa-cloud-arrow-up" />
                <span className="hidden sm:inline">Upload Payment</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 text-xs text-red-700 mb-3">
              <i className="fa-solid fa-triangle-exclamation mr-1" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState filter={filter} onUpload={() => setShowUpload(true)} />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-200">
                      <th className="py-2 px-2 font-semibold">Order</th>
                      <th className="py-2 px-2 font-semibold">Type</th>
                      <th className="py-2 px-2 font-semibold text-right">Amount</th>
                      <th className="py-2 px-2 font-semibold">Reference</th>
                      <th className="py-2 px-2 font-semibold">Status</th>
                      <th className="py-2 px-2 font-semibold">Proof</th>
                      <th className="py-2 px-2 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => (
                      <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 px-2 font-mono">#{p.order_id}</td>
                        <td className="py-2 px-2">{TYPE_LABELS[p.payment_type] || p.payment_type}</td>
                        <td className="py-2 px-2 text-right font-mono font-semibold">
                          {formatPHP(p.amount)}
                        </td>
                        <td className="py-2 px-2 font-mono text-gray-600">
                          {p.reference_number || "—"}
                        </td>
                        <td className="py-2 px-2">
                          <span
                            className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                              STATUS_STYLES[p.status]
                            }`}
                          >
                            {p.status?.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-2 px-2">
                          {p.proof_url ? (
                            <a
                              href={p.proof_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline inline-flex items-center gap-1"
                            >
                              <i className="fa-regular fa-image" />
                              view
                            </a>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-right whitespace-nowrap">
                          {canVerify && p.status === "for_verification" && (
                            <button
                              type="button"
                              onClick={() => setVerifyTarget(p)}
                              className="text-xs px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1"
                            >
                              <i className="fa-solid fa-gavel text-[10px]" />
                              Verify
                            </button>
                          )}
                          {p.status === "rejected" && p.rejection_reason && (
                            <span
                              className="text-xs text-red-700"
                              title={p.rejection_reason}
                            >
                              <i className="fa-solid fa-circle-info" /> reason
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <ul className="md:hidden space-y-2">
                {filtered.map((p) => (
                  <li
                    key={p.id}
                    className="border border-gray-200 rounded-md p-3 bg-white"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-mono text-gray-500">
                        Order #{p.order_id}
                      </span>
                      <span
                        className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                          STATUS_STYLES[p.status]
                        }`}
                      >
                        {p.status?.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-xs">
                      <span className="font-semibold">
                        {TYPE_LABELS[p.payment_type] || p.payment_type}
                      </span>
                      <span className="mx-1.5 text-gray-300">·</span>
                      <span className="font-mono font-semibold">
                        {formatPHP(p.amount)}
                      </span>
                    </p>
                    {p.reference_number && (
                      <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                        ref: {p.reference_number}
                      </p>
                    )}
                    {p.rejection_reason && (
                      <p className="text-[11px] text-red-700 mt-1">
                        <i className="fa-solid fa-circle-info mr-1" />
                        {p.rejection_reason}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                      {p.proof_url ? (
                        <a
                          href={p.proof_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          <i className="fa-regular fa-image" />
                          View proof
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">no proof</span>
                      )}
                      {canVerify && p.status === "for_verification" && (
                        <button
                          type="button"
                          onClick={() => setVerifyTarget(p)}
                          className="text-xs px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          Verify
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>

      {showUpload && (
        <UploadPaymentModal
          onClose={() => setShowUpload(false)}
          onSaved={handleUploaded}
        />
      )}
      {verifyTarget && (
        <VerifyPaymentModal
          payment={verifyTarget}
          onClose={() => setVerifyTarget(null)}
          onVerified={handleVerified}
        />
      )}
    </>
  );
};

const EmptyState = ({ filter, onUpload }) => (
  <div className="text-center py-10 text-gray-400">
    <i className="fa-regular fa-money-bill-1 text-3xl mb-2" />
    <p className="text-sm">
      {filter === "all" ? "No payments yet." : `No payments in '${filter.replace(/_/g, " ")}' status.`}
    </p>
    {filter === "all" && (
      <button
        type="button"
        onClick={onUpload}
        className="mt-3 text-xs font-semibold text-blue-600 hover:underline"
      >
        Upload your first payment proof →
      </button>
    )}
  </div>
);

export default PaymentsTab;
