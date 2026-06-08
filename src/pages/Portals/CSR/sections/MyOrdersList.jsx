import React from "react";
import IncompleteBadge from "../../../../components/common/IncompleteBadge";

/**
 * Phase 6-A — "My Orders" panel.
 *
 * Shows up to 10 in-flight orders assigned to the current CSR.
 */

const PRIORITY_STYLES = {
  low:    { bg: "bg-gray-100",   text: "text-gray-600",   label: "LOW" },
  normal: { bg: "bg-blue-100",   text: "text-blue-700",   label: "NORMAL" },
  high:   { bg: "bg-amber-100",  text: "text-amber-800",  label: "HIGH" },
  rush:   { bg: "bg-red-100",    text: "text-red-700",    label: "RUSH" },
};

const formatDeadline = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((d - today) / 86400000);
  const dateLabel = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });

  if (diffDays < 0) return { label: dateLabel, urgency: "overdue" };
  if (diffDays === 0) return { label: "Today", urgency: "today" };
  if (diffDays <= 3) return { label: `${diffDays}d (${dateLabel})`, urgency: "soon" };
  return { label: dateLabel, urgency: "ok" };
};

const URGENCY_STYLES = {
  overdue: "text-red-700 bg-red-50 border-red-200",
  today:   "text-orange-700 bg-orange-50 border-orange-200",
  soon:    "text-amber-700 bg-amber-50 border-amber-200",
  ok:      "text-gray-600 bg-gray-50 border-gray-200",
};

const MyOrdersList = ({ items = [], loading = false }) => {
  if (loading) {
    return (
      <section className="bg-white rounded-lg border border-gray-200 p-5">
        <Header />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className="bg-white rounded-lg border border-gray-200 p-5">
        <Header />
        <div className="text-center py-6 text-gray-400">
          <i className="fa-regular fa-folder-open text-2xl mb-2" />
          <p className="text-xs">No active orders assigned to you.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <Header count={items.length} />
      <ul className="divide-y divide-gray-100">
        {items.map((item) => {
          const priority = PRIORITY_STYLES[item.priority] || PRIORITY_STYLES.normal;
          const deadline = formatDeadline(item.deadline);
          return (
            <li key={item.id} className="py-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-mono text-gray-500">
                      {item.po_code}
                    </span>
                    <span
                      className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${priority.bg} ${priority.text}`}
                    >
                      {priority.label}
                    </span>
                    {item.rush_order && (
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 flex items-center gap-0.5">
                        <i className="fa-solid fa-bolt text-[8px]" />
                        RUSH
                      </span>
                    )}
                    <IncompleteBadge
                      incomplete={item.is_incomplete}
                      fields={item.incomplete_fields}
                    />
                  </div>
                  <p className="text-xs font-semibold text-gray-900 truncate mt-0.5">
                    {item.client_name}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5 capitalize">
                    {item.workflow_status?.replace(/_/g, " ")}
                  </p>
                </div>

                {deadline && (
                  <div
                    className={`shrink-0 text-[10px] font-semibold px-2 py-1 rounded border ${URGENCY_STYLES[deadline.urgency]}`}
                  >
                    <i className="fa-regular fa-clock mr-1" />
                    {deadline.label}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

const Header = ({ count }) => (
  <div className="flex items-center justify-between mb-3">
    <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
      <i className="fa-solid fa-folder-open text-gray-500" />
      My Orders
    </h2>
    {count > 0 && (
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-800">
        {count}
      </span>
    )}
  </div>
);

export default MyOrdersList;
