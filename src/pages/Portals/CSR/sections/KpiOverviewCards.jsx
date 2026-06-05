import React from "react";

/**
 * Phase 6-A — 8-card KPI overview for the CSR dashboard.
 *
 * Same visual pattern as ShipmentOverviewCards (Logistics portal) —
 * colored panels with icon + label + count + helper subtext.
 *
 * The backend guarantees every KPI is an integer (zero, never null),
 * so the `?? 0` fallback is defensive only.
 */
const CARDS = [
  {
    key: "pending_inquiries",
    label: "Pending Inquiries",
    color: "blue",
    icon: "fa-envelope",
    helper: "Awaiting first contact",
  },
  {
    key: "pending_quotations",
    label: "Pending Quotations",
    color: "indigo",
    icon: "fa-file-invoice-dollar",
    helper: "Awaiting client decision",
  },
  {
    key: "client_approvals_needed",
    label: "Approvals Needed",
    color: "amber",
    icon: "fa-hand",
    helper: "Waiting on client",
  },
  {
    key: "pending_payments",
    label: "Pending Payments",
    color: "orange",
    icon: "fa-money-check-dollar",
    helper: "Waiting / for verification",
  },
  {
    key: "in_production_orders",
    label: "In Production",
    color: "violet",
    icon: "fa-industry",
    helper: "Active production",
  },
  {
    key: "delayed_orders",
    label: "Delayed Orders",
    color: "red",
    icon: "fa-triangle-exclamation",
    helper: "Needs attention",
  },
  {
    key: "ready_for_delivery",
    label: "Ready for Delivery",
    color: "teal",
    icon: "fa-box-archive",
    helper: "Awaiting dispatch",
  },
  {
    key: "completed_orders",
    label: "Completed",
    color: "emerald",
    icon: "fa-circle-check",
    helper: "Closed orders",
  },
];

const COLOR_STYLES = {
  blue: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  indigo: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  orange: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  violet: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  red: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  teal: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
};

const KpiOverviewCards = ({ kpis = {}, loading = false, onCardClick }) => {
  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <i className="fa-solid fa-chart-simple text-gray-500" />
        CSR Hub Overview
      </h2>
      <p className="text-xs text-gray-500 mb-3">
        Mga importante kong panoorin ngayon — kasama na ang inquiries, payments at approvals.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CARDS.map((c) => {
          const style = COLOR_STYLES[c.color];
          const n = kpis[c.key] ?? 0;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => onCardClick?.(c.key)}
              disabled={loading}
              className={`group text-left rounded-lg border ${style.border} ${style.bg} p-4 transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-default`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] uppercase tracking-wide ${style.text}`}>
                  {c.label}
                </span>
                <i className={`fa-solid ${c.icon} ${style.text} text-base`} />
              </div>
              <div className={`text-3xl font-bold ${style.text}`}>
                {loading ? (
                  <span className="inline-block w-12 h-7 bg-gray-200 rounded animate-pulse" />
                ) : (
                  n
                )}
              </div>
              <div className="text-[10px] text-gray-500 mt-1 flex items-center justify-between">
                <span>{c.helper}</span>
                <i className="fa-solid fa-arrow-right opacity-0 group-hover:opacity-60 transition-opacity" />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default KpiOverviewCards;