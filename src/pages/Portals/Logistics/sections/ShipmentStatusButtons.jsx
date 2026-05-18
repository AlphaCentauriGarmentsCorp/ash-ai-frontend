import React, { useState } from "react";
import { logisticsPortalApi } from "../../../../api/logisticsPortalApi";

/**
 * Phase 5-I — Section 4: Update Status quick actions.
 *
 * Server enforces the allowed transitions:
 *   for_pickup → in_transit | issue
 *   in_transit → delivered | issue
 *   delivered  → issue (rare)
 *   issue      → in_transit | delivered (recovery)
 *
 * The button row shows all four statuses; the buttons disable when the
 * server would reject. When clicking "issue", we prompt for a note.
 */
const STATUS_CARDS = [
  { key: "for_pickup", label: "For Pickup", icon: "fa-box",                  color: "bg-blue-100 text-blue-700 border-blue-300" },
  { key: "in_transit", label: "In Transit", icon: "fa-truck",                color: "bg-amber-100 text-amber-700 border-amber-300" },
  { key: "delivered",  label: "Delivered",  icon: "fa-circle-check",         color: "bg-emerald-100 text-emerald-700 border-emerald-300" },
  { key: "issue",      label: "Issue",      icon: "fa-triangle-exclamation", color: "bg-red-100 text-red-700 border-red-300" },
];

const ALLOWED = {
  for_pickup: ["in_transit", "issue"],
  in_transit: ["delivered", "issue"],
  delivered:  ["issue"],
  issue:      ["in_transit", "delivered"],
};

const ShipmentStatusButtons = ({ shipment, onChanged }) => {
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState(null);

  const handleClick = async (toStatus) => {
    if (toStatus === shipment.status) return;
    let note = null;
    if (toStatus === "issue") {
      note = window.prompt("Anong issue? (i-describe ang problem)");
      if (note === null) return; // user cancelled
    }
    setSaving(toStatus);
    setError(null);
    try {
      await logisticsPortalApi.updateShipmentStatus(shipment.id, toStatus, note);
      onChanged?.();
    } catch (err) {
      setError(err?.response?.data?.message || "Hindi nakapag-update ng status.");
    } finally {
      setSaving(null);
    }
  };

  const allowedNext = ALLOWED[shipment.status] || [];

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <i className="fa-solid fa-arrows-rotate text-gray-500" />
        Update Status
      </h2>
      <p className="text-xs text-gray-500 mb-3">
        Piliin ang tamang status ng shipment.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {STATUS_CARDS.map((s) => {
          const isCurrent = shipment.status === s.key;
          const isAllowed = allowedNext.includes(s.key);
          const isDisabled = !isAllowed && !isCurrent;
          const isLoading = saving === s.key;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => handleClick(s.key)}
              disabled={isDisabled || isLoading || isCurrent}
              className={
                "p-3 rounded border text-center transition-colors " +
                (isCurrent
                  ? `${s.color} ring-2 ring-primary cursor-default`
                  : isAllowed
                    ? `${s.color} hover:opacity-90`
                    : "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-60")
              }
            >
              <i className={`fa-solid ${s.icon} text-xl block mb-1`} />
              <span className="text-[11px] font-semibold">{s.label}</span>
              {isCurrent && <p className="text-[9px] mt-1 opacity-75">(current)</p>}
              {isLoading && <i className="fa-solid fa-spinner fa-spin text-[10px] block mt-1" />}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="text-[11px] text-red-600 mt-3">{error}</p>
      )}
    </section>
  );
};

export default ShipmentStatusButtons;
