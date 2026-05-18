import React, { useMemo, useState } from "react";

/**
 * Phase 5-I — Active shipments table.
 *
 * Two sources are interleaved:
 *   - shipments[]            : actual shipment rows with status/courier/etc.
 *   - pendingAssignments[]   : assignments not yet shipped (the "create
 *                              shipment" entry points)
 *
 * Status filter pills + click-row → opens detail.
 */
const STATUS_FILTERS = [
  { key: "all",         label: "All" },
  { key: "for_pickup",  label: "For Pickup" },
  { key: "in_transit",  label: "In Transit" },
  { key: "delivered",   label: "Delivered" },
  { key: "issue",       label: "Issue" },
];

const STATUS_STYLES = {
  for_pickup: "bg-blue-100 text-blue-700",
  in_transit: "bg-amber-100 text-amber-700",
  delivered:  "bg-emerald-100 text-emerald-700",
  issue:      "bg-red-100 text-red-700",
};

const ShipmentListSection = ({
  shipments = [],
  pendingAssignments = [],
  onOpenShipment,
  onOpenAssignment,
}) => {
  const [filter, setFilter] = useState("all");

  const rows = useMemo(() => {
    // Combine bare assignments (treated as for_pickup) with shipments.
    const bareRows = pendingAssignments.map((a) => ({
      kind: "assignment",
      id: a.id,
      status: "for_pickup",
      po_code: a.order?.po_code || `#${a.order?.id || a.id}`,
      brand: a.order?.client_brand || "—",
      vendor: a.vendor?.name || "—",
      stage: a.stage?.stage || "—",
      meta: `${a.quantity_pcs ?? "?"} pcs`,
      updated_at: null,
    }));

    const shipRows = shipments.map((s) => ({
      kind: "shipment",
      id: s.id,
      status: s.status,
      po_code: s.order?.po_code || "—",
      brand: s.order?.client_brand || "—",
      vendor: s.vendor?.name || "—",
      stage: s.stage?.stage || "—",
      meta: [
        s.delivery_mode === "courier" ? s.courier : s.driver_name,
        s.waybill_number,
      ].filter(Boolean).join(" · ") || "—",
      updated_at: s.updated_at,
      direction: s.direction,
    }));

    const all = [...shipRows, ...bareRows];

    if (filter === "all") return all;
    return all.filter((r) => r.status === filter);
  }, [shipments, pendingAssignments, filter]);

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <i className="fa-solid fa-list text-gray-500" />
          Active Shipments
        </h2>
        <div className="flex flex-wrap gap-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={
                "text-[10px] px-2 py-1 rounded border " +
                (filter === f.key
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-600 border-gray-200 hover:border-primary")
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-[11px] text-gray-400 italic py-6 text-center">
          {filter === "all"
            ? "Wala pang active na shipments."
            : `Walang shipments sa status na "${filter.replace("_", " ")}"`}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-left text-[10px] uppercase tracking-wide text-gray-500">
                <th className="py-2 pr-3">Order</th>
                <th className="py-2 pr-3">Brand</th>
                <th className="py-2 pr-3">Vendor</th>
                <th className="py-2 pr-3">Stage</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Details</th>
                <th className="py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`${r.kind}-${r.id}`} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 pr-3 font-medium text-gray-900">{r.po_code}</td>
                  <td className="py-2 pr-3 text-gray-700">{r.brand}</td>
                  <td className="py-2 pr-3 text-gray-700">{r.vendor}</td>
                  <td className="py-2 pr-3 text-gray-500 capitalize">{r.stage.replace("_", " ")}</td>
                  <td className="py-2 pr-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded capitalize ${STATUS_STYLES[r.status] || "bg-gray-100 text-gray-600"}`}>
                      {r.status.replace("_", " ")}
                    </span>
                    {r.kind === "assignment" && (
                      <span className="text-[10px] text-gray-400 ml-1">(no shipment yet)</span>
                    )}
                  </td>
                  <td className="py-2 pr-3 text-gray-600">{r.meta}</td>
                  <td className="py-2 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        if (r.kind === "shipment") onOpenShipment?.(r.id);
                        else onOpenAssignment?.(r.id);
                      }}
                      className="text-[11px] text-primary hover:underline"
                    >
                      {r.kind === "shipment" ? "Open" : "Create Shipment"}
                      <i className="fa-solid fa-chevron-right text-[9px] ml-1" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default ShipmentListSection;
