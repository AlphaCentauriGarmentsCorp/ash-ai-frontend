import React, { useCallback, useEffect, useMemo, useState } from "react";
import { csrPortalApi } from "../../../../api/csrPortalApi";
import RecordApprovalModal from "../modals/RecordApprovalModal";
import RespondApprovalModal from "../modals/RespondApprovalModal";

/**
 * Phase 6-A Bundle 2 — Approvals tab.
 *
 * Lists client approval requests with kind + status filters.
 * Open new request → RecordApprovalModal.
 * Record response on a 'waiting' row → RespondApprovalModal.
 */
const STATUS_FILTERS = [
  { key: "all",                  label: "All" },
  { key: "waiting",              label: "Waiting" },
  { key: "approved",             label: "Approved" },
  { key: "revision_requested",   label: "Revisions" },
  { key: "rejected",             label: "Rejected" },
];

const STATUS_STYLES = {
  waiting:            "bg-amber-100 text-amber-800",
  approved:           "bg-emerald-100 text-emerald-700",
  revision_requested: "bg-blue-100 text-blue-700",
  rejected:           "bg-red-100 text-red-700",
};

const KIND_LABELS = {
  quotation:         "Quotation",
  design:            "Design",
  mockup:            "Mockup",
  sample:            "Sample",
  production_change: "Production Change",
  delivery:          "Delivery",
};

const KIND_ICONS = {
  quotation:         "fa-file-invoice-dollar",
  design:            "fa-pen-ruler",
  mockup:            "fa-image",
  sample:            "fa-shirt",
  production_change: "fa-rotate",
  delivery:          "fa-box-archive",
};

const ApprovalsTab = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  const [showRecord, setShowRecord] = useState(false);
  const [respondTarget, setRespondTarget] = useState(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await csrPortalApi.listApprovals();
      setItems(res?.data ?? []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load approvals.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((a) => a.status === filter);
  }, [items, filter]);

  const handleRecorded = (approval) => {
    setItems((prev) => [approval, ...prev]);
    setShowRecord(false);
  };

  const handleResponded = (approval) => {
    setItems((prev) => prev.map((a) => (a.id === approval.id ? approval : a)));
    setRespondTarget(null);
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
                onClick={() => setShowRecord(true)}
                className="text-xs font-semibold px-3 py-1.5 rounded-md bg-primary text-white hover:bg-primary/90 inline-flex items-center gap-1.5"
              >
                <i className="fa-solid fa-plus" />
                <span className="hidden sm:inline">Open Request</span>
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
            <EmptyState filter={filter} onOpen={() => setShowRecord(true)} />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-200">
                      <th className="py-2 px-2 font-semibold">Order</th>
                      <th className="py-2 px-2 font-semibold">Kind</th>
                      <th className="py-2 px-2 font-semibold">Status</th>
                      <th className="py-2 px-2 font-semibold">Requested</th>
                      <th className="py-2 px-2 font-semibold">Screenshot</th>
                      <th className="py-2 px-2 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((a) => (
                      <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 px-2 font-mono">#{a.order_id}</td>
                        <td className="py-2 px-2">
                          <span className="inline-flex items-center gap-1.5">
                            <i className={`fa-solid ${KIND_ICONS[a.kind] || "fa-circle"} text-gray-400`} />
                            {KIND_LABELS[a.kind] || a.kind}
                          </span>
                        </td>
                        <td className="py-2 px-2">
                          <span
                            className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                              STATUS_STYLES[a.status]
                            }`}
                          >
                            {a.status?.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-gray-600">
                          {formatDate(a.requested_at)}
                        </td>
                        <td className="py-2 px-2">
                          {a.screenshot_url ? (
                            <a
                              href={a.screenshot_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline inline-flex items-center gap-1"
                            >
                              <i className="fa-regular fa-image" /> view
                            </a>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-right whitespace-nowrap">
                          {a.status === "waiting" && (
                            <button
                              type="button"
                              onClick={() => setRespondTarget(a)}
                              className="text-xs px-2 py-1 rounded bg-primary text-white hover:bg-primary/90 inline-flex items-center gap-1"
                            >
                              <i className="fa-solid fa-reply text-[10px]" />
                              Respond
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <ul className="md:hidden space-y-2">
                {filtered.map((a) => (
                  <li
                    key={a.id}
                    className="border border-gray-200 rounded-md p-3 bg-white"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-mono text-gray-500">
                        Order #{a.order_id}
                      </span>
                      <span
                        className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                          STATUS_STYLES[a.status]
                        }`}
                      >
                        {a.status?.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-gray-900 inline-flex items-center gap-1.5">
                      <i className={`fa-solid ${KIND_ICONS[a.kind] || "fa-circle"} text-gray-400`} />
                      {KIND_LABELS[a.kind] || a.kind}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      requested {formatDate(a.requested_at)}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                      {a.screenshot_url ? (
                        <a
                          href={a.screenshot_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          <i className="fa-regular fa-image" /> View screenshot
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">no screenshot</span>
                      )}
                      {a.status === "waiting" && (
                        <button
                          type="button"
                          onClick={() => setRespondTarget(a)}
                          className="text-xs px-2 py-1 rounded bg-primary text-white"
                        >
                          Respond
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

      {showRecord && (
        <RecordApprovalModal
          onClose={() => setShowRecord(false)}
          onSaved={handleRecorded}
        />
      )}
      {respondTarget && (
        <RespondApprovalModal
          approval={respondTarget}
          onClose={() => setRespondTarget(null)}
          onResponded={handleResponded}
        />
      )}
    </>
  );
};

const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const EmptyState = ({ filter, onOpen }) => (
  <div className="text-center py-10 text-gray-400">
    <i className="fa-regular fa-hand text-3xl mb-2" />
    <p className="text-sm">
      {filter === "all"
        ? "No approval requests yet."
        : `No approvals in '${filter.replace(/_/g, " ")}' status.`}
    </p>
    {filter === "all" && (
      <button
        type="button"
        onClick={onOpen}
        className="mt-3 text-xs font-semibold text-blue-600 hover:underline"
      >
        Open your first approval request →
      </button>
    )}
  </div>
);

export default ApprovalsTab;
