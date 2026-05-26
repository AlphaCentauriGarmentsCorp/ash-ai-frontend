import React, { useEffect, useState } from "react";
import { quotationApi } from "../../api/quotationApi";

/**
 * Issue 12 — Quotation lifecycle status actions + audit timeline.
 *
 * Renders ONLY the legal next-status buttons for the quotation's current
 * status (driven by `allowed_transitions`, which the backend computes from its
 * STATUS_TRANSITIONS state machine — single source of truth, so the UI can
 * never offer a move the backend would reject). Also shows the immutable
 * status-change history (always visible).
 *
 * Note: "Converted" is intentionally NOT rendered here even when it's a legal
 * transition — the page already has a dedicated "Convert to Order" button that
 * runs the richer confirmAndConvert flow (builds the order prefill). Surfacing
 * a second plain "Converted" button would be confusing and skip the prefill.
 *
 * Props:
 *   quotationId          number
 *   currentStatus        string   (e.g. "Draft")
 *   allowedTransitions   string[] (from the quotation resource)
 *   onStatusChanged(q)   called with the updated quotation after a successful
 *                        transition, so the parent can refresh its badge/state
 */

// Per-status button styling + icon. Mirrors the badge palette in ViewQuotation.
const ACTION_STYLES = {
  Sent:     { cls: "bg-blue-600 hover:bg-blue-700",    icon: "fa-paper-plane", label: "Mark Sent" },
  Approved: { cls: "bg-green-600 hover:bg-green-700",  icon: "fa-check",       label: "Mark Approved" },
  Rejected: { cls: "bg-red-600 hover:bg-red-700",      icon: "fa-times",       label: "Reject" },
  Expired:  { cls: "bg-gray-500 hover:bg-gray-600",    icon: "fa-hourglass-end", label: "Mark Expired" },
  Draft:    { cls: "bg-yellow-500 hover:bg-yellow-600", icon: "fa-pen",        label: "Reopen (Draft)" },
};

// Converted is handled by the dedicated Convert-to-Order button on the page.
const HANDLED_ELSEWHERE = ["Converted"];

const STATUS_BADGE = {
  draft:     "bg-yellow-100 text-yellow-800",
  pending:   "bg-yellow-100 text-yellow-800",
  sent:      "bg-blue-100 text-blue-800",
  approved:  "bg-green-100 text-green-800",
  converted: "bg-purple-100 text-purple-800",
  rejected:  "bg-red-100 text-red-800",
  expired:   "bg-gray-200 text-gray-700",
};

const QuotationStatusActions = ({
  quotationId,
  currentStatus,
  allowedTransitions = [],
  onStatusChanged,
}) => {
  const [log, setLog] = useState([]);
  const [logLoading, setLogLoading] = useState(true);
  const [busyStatus, setBusyStatus] = useState(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const loadLog = async () => {
    try {
      setLogLoading(true);
      const res = await quotationApi.statusLog(quotationId);
      setLog(res?.data || []);
    } catch (e) {
      // History is non-critical; don't block the page on it.
      console.error("Failed to load status log:", e);
    } finally {
      setLogLoading(false);
    }
  };

  useEffect(() => {
    if (quotationId) loadLog();
    // reload history whenever the status changes (a transition just happened)
  }, [quotationId, currentStatus]);

  const doTransition = async (targetStatus) => {
    setError("");
    setInfo("");

    // Optional note — prompted for every transition, most useful for Reject.
    const promptLabel =
      targetStatus === "Rejected"
        ? "Reason for rejecting this quotation (optional):"
        : `Add a note for marking this ${targetStatus} (optional):`;
    const notes = window.prompt(promptLabel, "");
    // window.prompt returns null if the user cancels — abort the transition.
    if (notes === null) return;

    try {
      setBusyStatus(targetStatus);
      const result = await quotationApi.changeStatus(quotationId, {
        status: targetStatus,
        notes: notes || null,
      });

      // Surface the email outcome for the Sent transition.
      if (targetStatus === "Sent") {
        if (result?.email_sent === true) {
          setInfo("Status set to Sent. Quotation PDF emailed to the client.");
        } else {
          setInfo(
            "Status set to Sent, but the email was not delivered" +
              (result?.email_error ? ` (${result.email_error})` : "") +
              ". Check mail configuration."
          );
        }
      } else {
        setInfo(result?.message || `Status changed to ${targetStatus}.`);
      }

      if (onStatusChanged && result?.quotation) {
        onStatusChanged(result.quotation);
      }
      await loadLog();
    } catch (e) {
      const msg =
        e?.response?.data?.errors?.status?.[0] ||
        e?.response?.data?.message ||
        "Could not change status.";
      setError(msg);
    } finally {
      setBusyStatus(null);
    }
  };

  // Only show buttons for transitions handled here (exclude Converted).
  const actionable = allowedTransitions.filter((s) => !HANDLED_ELSEWHERE.includes(s));

  const fmt = (iso) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <div className="mt-6 space-y-4">
      {/* Action buttons (only legal next statuses) */}
      {actionable.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <h3 className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">
            Update Status
          </h3>
          <div className="flex flex-wrap gap-2">
            {actionable.map((s) => {
              const style = ACTION_STYLES[s] || {
                cls: "bg-gray-600 hover:bg-gray-700",
                icon: "fa-arrow-right",
                label: s,
              };
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => doTransition(s)}
                  disabled={!!busyStatus}
                  className={`px-4 py-2 text-white rounded-lg shadow text-sm flex items-center gap-2 transition-all disabled:opacity-50 ${style.cls}`}
                >
                  {busyStatus === s ? (
                    <><i className="fas fa-spinner fa-spin"></i>Working...</>
                  ) : (
                    <><i className={`fas ${style.icon}`}></i>{style.label}</>
                  )}
                </button>
              );
            })}
          </div>

          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          {info && <p className="mt-2 text-xs text-green-700">{info}</p>}
        </div>
      )}

      {/* Status history timeline (always visible) */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
        <h3 className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">
          Status History
        </h3>

        {logLoading ? (
          <p className="text-[11px] text-gray-400">Loading history…</p>
        ) : log.length === 0 ? (
          <p className="text-[11px] text-gray-500">No status changes recorded yet.</p>
        ) : (
          <ol className="relative border-l border-gray-200 ml-2">
            {log.map((row) => (
              <li key={row.id} className="mb-4 ml-4">
                <span className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full bg-primary"></span>
                <div className="flex flex-wrap items-center gap-2">
                  {row.from_status && (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        STATUS_BADGE[row.from_status?.toLowerCase()] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {row.from_status}
                    </span>
                  )}
                  <i className="fas fa-arrow-right text-[10px] text-gray-400"></i>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      STATUS_BADGE[row.to_status?.toLowerCase()] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {row.to_status}
                  </span>
                  {row.to_status === "Sent" && row.email_sent === true && (
                    <span className="text-[10px] text-green-600">
                      <i className="fas fa-envelope-circle-check"></i> emailed
                    </span>
                  )}
                  {row.to_status === "Sent" && row.email_sent === false && (
                    <span className="text-[10px] text-amber-600">
                      <i className="fas fa-envelope"></i> email failed
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  {row.user ? `by ${row.user}` : "by system"} • {fmt(row.created_at)}
                </p>
                {row.notes && (
                  <p className="text-[11px] text-gray-600 mt-0.5 italic">“{row.notes}”</p>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
};

export default QuotationStatusActions;
