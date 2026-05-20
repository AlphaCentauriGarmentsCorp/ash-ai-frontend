import React from "react";

/**
 * Phase 5-I — 4-card overview of shipment counts by status.
 *
 * Mirrors the mockup's "1. Shipment / Pickup Overview" block.
 */
const CARDS = [
  { key: "for_pickup", label: "For Pickup",  color: "blue",    icon: "fa-box" },
  { key: "in_transit", label: "In Transit",  color: "amber",   icon: "fa-truck" },
  { key: "delivered",  label: "Delivered",   color: "emerald", icon: "fa-circle-check" },
  { key: "issue",      label: "Issue",       color: "red",     icon: "fa-triangle-exclamation" },
];

const COLOR_STYLES = {
  blue:    { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200" },
  amber:   { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  red:     { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200" },
};

const ShipmentOverviewCards = ({ counts = {} }) => {
  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <i className="fa-solid fa-chart-simple text-gray-500" />
        Shipment / Pickup Overview
      </h2>
      <p className="text-xs text-gray-500 mb-3">
        Listahan ng mga orders na ipapadala bilang subcontract.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CARDS.map((c) => {
          const style = COLOR_STYLES[c.color];
          const n = counts[c.key] ?? 0;
          return (
            <div
              key={c.key}
              className={`rounded-lg border ${style.border} ${style.bg} p-4`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] uppercase tracking-wide ${style.text}`}>
                  {c.label}
                </span>
                <i className={`fa-solid ${c.icon} ${style.text} text-base`} />
              </div>
              <div className={`text-3xl font-bold ${style.text}`}>{n}</div>
              <div className="text-[10px] text-gray-500 mt-1">
                {n === 1 ? "Order" : "Orders"}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ShipmentOverviewCards;
