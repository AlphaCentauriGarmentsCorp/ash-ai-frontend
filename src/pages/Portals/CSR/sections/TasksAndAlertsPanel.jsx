import React from "react";

/**
 * Phase 6-A — Tasks & Alerts panel.
 *
 * Renders unread notifications from the Phase 2 notifications table
 * (filtered to the current CSR user, type-agnostic).
 *
 * Each row shows the notification icon (mapped from `type` slug),
 * title, body, and a relative timestamp.
 */

const TYPE_ICON_MAP = {
  // Pattern: prefix-match on `type` slug — fallback is "fa-bell".
  "stage.": "fa-rotate",
  "order.": "fa-file-invoice",
  "payment.": "fa-money-check-dollar",
  "approval.": "fa-hand",
  "inquiry.": "fa-envelope",
};

const iconFor = (type) => {
  if (!type) return "fa-bell";
  for (const prefix of Object.keys(TYPE_ICON_MAP)) {
    if (type.startsWith(prefix)) return TYPE_ICON_MAP[prefix];
  }
  return "fa-bell";
};

const formatRelativeTime = (iso) => {
  if (!iso) return "";
  const then = new Date(iso);
  const diff = (Date.now() - then.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return then.toLocaleDateString();
};

const TasksAndAlertsPanel = ({ items = [], loading = false }) => {
  if (loading) {
    return (
      <section className="bg-white rounded-lg border border-gray-200 p-5">
        <Header />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
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
          <i className="fa-regular fa-bell-slash text-2xl mb-2" />
          <p className="text-xs">No pending tasks or alerts right now.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <Header count={items.length} />
      <ul className="divide-y divide-gray-100">
        {items.map((item) => (
          <li key={item.id} className="py-2.5 flex items-start gap-3">
            <div className="shrink-0 w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
              <i className={`fa-solid ${iconFor(item.type)} text-amber-600 text-xs`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">
                {item.title || "(no title)"}
              </p>
              {item.body && (
                <p className="text-[11px] text-gray-600 mt-0.5 line-clamp-2">
                  {item.body}
                </p>
              )}
              <p className="text-[10px] text-gray-400 mt-0.5">
                {formatRelativeTime(item.created_at)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

const Header = ({ count }) => (
  <div className="flex items-center justify-between mb-3">
    <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
      <i className="fa-solid fa-bell text-gray-500" />
      Tasks & Alerts
    </h2>
    {count > 0 && (
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
        {count} unread
      </span>
    )}
  </div>
);

export default TasksAndAlertsPanel;
