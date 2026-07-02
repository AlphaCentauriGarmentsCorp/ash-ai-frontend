import React from "react";

/**
 * GA Portal CP6 — enriched Order Details, GA-specific copy of the shared
 * Cutter section (which stays untouched for the other portals).
 *
 * Adds the order page's Product Details data below the summary grid:
 * Apparel Information + Production Details + Labels. PO Items & Size
 * Breakdown deliberately excluded (owner decision). Colour fields render
 * a visual chip beside the name whenever the backend resolved a hex
 * (fabric-swatch / pantone name match); unmatched names show plain text.
 */

const STATUS_STYLES = {
  pending:      "bg-gray-100 text-gray-700",
  in_progress:  "bg-blue-50 text-blue-700",
  for_approval: "bg-amber-50 text-amber-700",
  completed:    "bg-green-50 text-green-700",
  delayed:      "bg-red-50 text-red-700",
  on_hold:      "bg-zinc-100 text-zinc-700",
};

/** Colour name + optional hex chip. */
const ColorValue = ({ name, hex }) => {
  if (!name) return <span>—</span>;
  return (
    <span className="inline-flex items-center gap-1.5">
      {hex && (
        <span
          className="inline-block w-3.5 h-3.5 rounded-sm border border-gray-300 shrink-0"
          style={{ background: hex }}
          title={hex}
        />
      )}
      {name}
    </span>
  );
};

const Row = ({ label, value }) => (
  <div className="flex justify-between gap-3 border-b border-b-gray-100 py-1.5 last:border-b-0">
    <p className="text-xs text-gray-500 shrink-0">{label}</p>
    <p className="text-xs font-medium text-gray-800 text-right break-words min-w-0">
      {value || value === 0 ? value : "—"}
    </p>
  </div>
);

const OrderDetailsSectionGA = ({ order, stage }) => {
  const statusClass = STATUS_STYLES[stage?.status] || STATUS_STYLES.pending;
  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
          <i className="fa-solid fa-clipboard-list text-[11px]" />
        </span>
        Order Details
      </h2>

      {/* ── Summary grid ─────────────────────────────────────────── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6 text-sm">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400">
            Order / Project No.
          </p>
          <p className="font-semibold text-gray-900">{order?.po_code || "—"}</p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400">
            Client / Brand
          </p>
          <p className="font-medium text-gray-800">
            {order?.client_brand || order?.client_name || "—"}
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400">
            Status
          </p>
          <span className={`inline-block text-[11px] px-2 py-0.5 rounded ${statusClass} capitalize`}>
            {String(stage?.status || "—").replace(/_/g, " ")}
          </span>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400">
            Color
          </p>
          <p className="font-medium text-gray-800">
            <ColorValue name={order?.shirt_color} hex={order?.shirt_color_hex} />
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400">
            Print Method
          </p>
          <p className="font-medium text-gray-800">
            {order?.print_method || order?.special_print || "—"}
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400">
            Quantity (total pcs)
          </p>
          <p className="font-semibold text-gray-900">{order?.total_pcs ?? 0} pcs</p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400">
            Print Area
          </p>
          <p className="font-medium text-gray-800">{order?.print_area || "—"}</p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400">
            Started
          </p>
          <p className="font-medium text-gray-800 text-xs">
            {stage?.started_at
              ? new Date(stage.started_at).toLocaleString()
              : "—"}
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400">
            Design Name
          </p>
          <p className="font-medium text-gray-800">{order?.design_name || "—"}</p>
        </div>
      </div>

      {/* ── Product Details (CP6) ────────────────────────────────── */}
      <div className="mt-4 grid sm:grid-cols-2 gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">
            Apparel Information
          </p>
          <div className="rounded border border-gray-200 px-2.5 py-1">
            <Row label="Apparel Type" value={order?.apparel_type} />
            <Row label="Pattern Type" value={order?.pattern_type} />
            <Row label="Neckline" value={order?.apparel_neckline} />
            <Row label="Print Method" value={order?.print_method} />
            <Row
              label="Shirt Color"
              value={<ColorValue name={order?.shirt_color} hex={order?.shirt_color_hex} />}
            />
            <Row label="Print Area" value={order?.print_area} />
            <Row label="Special Print" value={order?.special_print} />
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">
            Production Details
          </p>
          <div className="rounded border border-gray-200 px-2.5 py-1">
            <Row label="Service Type" value={order?.service_type} />
            <Row label="Print Service" value={order?.print_service} />
            <Row label="Fabric Type" value={order?.fabric_type} />
            <Row label="Fabric Supplier" value={order?.fabric_supplier} />
            <Row
              label="Fabric Color"
              value={<ColorValue name={order?.fabric_color} hex={order?.fabric_color_hex} />}
            />
            <Row
              label="Thread Color"
              value={<ColorValue name={order?.thread_color} hex={order?.thread_color_hex} />}
            />
            <Row
              label="Ribbing Color"
              value={<ColorValue name={order?.ribbing_color} hex={order?.ribbing_color_hex} />}
            />
          </div>
        </div>
      </div>

      {order?.notes && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">
            Order Notes
          </p>
          <p className="text-xs text-gray-600 italic">{order.notes}</p>
        </div>
      )}
    </section>
  );
};

export default OrderDetailsSectionGA;
