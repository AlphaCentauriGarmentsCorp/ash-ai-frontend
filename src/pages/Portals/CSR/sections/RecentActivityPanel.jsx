import React from "react";

/**
 * Phase 6-A — Recent Activity panel.
 *
 * Renders the CsrActivityLog feed — append-only audit trail of CSR
 * actions across the shop.
 *
 * Action → icon mapping is based on the action slug convention
 * '{subject}.{verb_past}' used by CsrActivityLogger.
 */

const ACTION_ICON_MAP = {
  "inquiry.created":                    { icon: "fa-envelope-open",    color: "blue" },
  "inquiry.converted_to_quotation":     { icon: "fa-file-export",      color: "indigo" },
  "payment_proof.uploaded":             { icon: "fa-receipt",          color: "orange" },
  "payment.verified":                   { icon: "fa-circle-check",     color: "emerald" },
  "payment.rejected":                   { icon: "fa-circle-xmark",     color: "red" },
  "approval.requested":                 { icon: "fa-hand",             color: "amber" },
  "approval.responded":                 { icon: "fa-reply",            color: "teal" },
};

const COLOR_BG = {
  blue:    "bg-blue-50 text-blue-600 border-blue-200",
  indigo:  "bg-indigo-50 text-indigo-600 border-indigo-200",
  orange:  "bg-orange-50 text-orange-600 border-orange-200",
  emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
  red:     "bg-red-50 text-red-600 border-red-200",
  amber:   "bg-amber-50 text-amber-600 border-amber-200",
  teal:    "bg-teal-50 text-teal-600 border-teal-200",
  gray:    "bg-gray-50 text-gray-600 border-gray-200",
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

const RecentActivityPanel = ({ items = [], loading = false }) => {
  if (loading) {
    return (
      <section className="bg-white rounded-lg border border-gray-200 p-5">
        <Header />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
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
          <i className="fa-regular fa-clock text-2xl mb-2" />
          <p className="text-xs">No recent activity yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <Header />
      <ul className="space-y-2">
        {items.map((item) => {
          const meta = ACTION_ICON_MAP[item.action] || { icon: "fa-circle-dot", color: "gray" };
          return (
            <li key={item.id} className="flex items-start gap-3">
              <div className={`shrink-0 w-7 h-7 rounded-full border flex items-center justify-center ${COLOR_BG[meta.color]}`}>
                <i className={`fa-solid ${meta.icon} text-[10px]`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-900 truncate">
                  {item.summary || item.action}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {formatRelativeTime(item.created_at)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

const Header = () => (
  <div className="flex items-center justify-between mb-3">
    <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
      <i className="fa-solid fa-clock-rotate-left text-gray-500" />
      Recent Activity
    </h2>
  </div>
);

export default RecentActivityPanel;
