import React from "react";

/**
 * Change 2 — "My Active Tasks" queue for a role portal.
 *
 * Renders the list returned by portalApi.myActiveTasks(role): each row shows
 * the order/project no, client/brand, quantity, color, print area, queue age,
 * a status badge, and a Rush flag. The list is already sorted by the backend
 * (Rush pinned to top, then FIFO oldest-first); we render it as-is.
 *
 * Clicking a row calls onSelect(order_stage_id) so the portal can open its
 * existing single-order detail view.
 *
 * Props:
 *   tasks           array of task rows from the API
 *   loading         boolean
 *   error           string | null
 *   onSelect        (orderStageId) => void
 *   onRefresh       () => void           (optional; shows a Refresh control)
 *   selectedStageId number | null        (highlights the open row)
 *   title           string               (default "My Active Tasks")
 *   emptyText       string               (empty-state body copy)
 */

const STATUS_BADGE = {
  in_progress:  { label: "In Progress", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  for_revision: { label: "For Revision", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  for_approval: { label: "For Approval", cls: "bg-purple-50 text-purple-700 border-purple-200" },
  delayed:      { label: "Delayed", cls: "bg-red-50 text-red-700 border-red-200" },
  pending:      { label: "Pending", cls: "bg-gray-100 text-gray-600 border-gray-200" },
};

function StatusBadge({ status }) {
  const meta = STATUS_BADGE[status] || {
    label: status || "—",
    cls: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full border ${meta.cls}`}>
      {meta.label}
    </span>
  );
}

function relativeAge(iso) {
  if (!iso) return null;
  const then = new Date(iso.replace(" ", "T"));
  if (Number.isNaN(then.getTime())) return null;
  const secs = Math.max(0, Math.floor((Date.now() - then.getTime()) / 1000));
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const MetaPill = ({ icon, children }) =>
  children ? (
    <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
      <i className={`fa-solid ${icon} text-gray-400`} />
      {children}
    </span>
  ) : null;

const MyActiveTasksList = ({
  tasks = [],
  loading = false,
  error = null,
  onSelect,
  onRefresh,
  selectedStageId = null,
  title = "My Active Tasks",
  emptyText = "Wala kang active na task ngayon. Aabisuhan ka kapag may bago.",
}) => {
  const count = tasks.length;

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {count > 0 && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {count} active {count === 1 ? "task" : "tasks"}
            </span>
          )}
        </div>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="text-xs text-gray-500 hover:text-primary inline-flex items-center gap-1"
          >
            <i className={`fa-solid fa-rotate-right ${loading ? "fa-spin" : ""}`} />
            Refresh
          </button>
        )}
      </div>

      {/* Body */}
      {loading && count === 0 ? (
        <div className="flex items-center justify-center py-10 text-gray-400 text-sm">
          <i className="fa-solid fa-spinner fa-spin mr-2" />
          Kinukuha ang mga task mo…
        </div>
      ) : error ? (
        <div className="m-3 bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
          <i className="fa-solid fa-triangle-exclamation mr-2" />
          {error}
        </div>
      ) : count === 0 ? (
        <div className="px-4 py-10 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
            <i className="fa-solid fa-inbox text-xl text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">{emptyText}</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {tasks.map((t) => {
            const selected = t.order_stage_id === selectedStageId;
            return (
              <li key={t.order_stage_id}>
                <button
                  type="button"
                  onClick={() => onSelect?.(t.order_stage_id)}
                  className={`w-full text-left px-4 py-3 flex items-start justify-between gap-3 transition-colors ${
                    selected ? "bg-primary/5" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {t.project_no || `Order #${t.order_id}`}
                      </span>
                      {t.rush && (
                        <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-red-600 text-white inline-flex items-center gap-1">
                          <i className="fa-solid fa-bolt" /> Rush
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-1.5 truncate">
                      {t.client_brand || t.client_name || "—"}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <MetaPill icon="fa-layer-group">
                        {t.quantity != null ? `${t.quantity} pcs` : null}
                      </MetaPill>
                      <MetaPill icon="fa-palette">{t.color}</MetaPill>
                      <MetaPill icon="fa-vector-square">{t.print_area}</MetaPill>
                      <MetaPill icon="fa-clock">{relativeAge(t.queue_age_at)}</MetaPill>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <StatusBadge status={t.display_status || t.status} />
                    <i className="fa-solid fa-chevron-right text-gray-300 text-xs" />
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default MyActiveTasksList;
