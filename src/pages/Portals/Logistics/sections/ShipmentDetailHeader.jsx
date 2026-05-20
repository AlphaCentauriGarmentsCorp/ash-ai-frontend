import React from "react";

/**
 * Phase 5-I — Detail header.
 *
 * Mirrors the mockup's "2. Shipment Details" block: order info on the
 * left, vendor + required process in the middle, status badge + flow on
 * the right.
 */
const STATUS_LABELS = {
  for_pickup: "For Pickup",
  in_transit: "In Transit",
  delivered:  "Delivered",
  issue:      "Issue",
};

const STATUS_COLORS = {
  for_pickup: "bg-blue-100 text-blue-700 border-blue-300",
  in_transit: "bg-amber-100 text-amber-700 border-amber-300",
  delivered:  "bg-emerald-100 text-emerald-700 border-emerald-300",
  issue:      "bg-red-100 text-red-700 border-red-300",
};

const ShipmentDetailHeader = ({
  order,
  subcontractor,
  stage,
  shipment,
  assignment,
}) => {
  const status = shipment?.status;
  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <i className="fa-solid fa-circle-info text-gray-500" />
            Shipment Details
          </h2>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Order #{order?.po_code || "—"}
          </p>
        </div>
        {status && (
          <span className={`text-[11px] px-2.5 py-1 rounded border font-semibold ${STATUS_COLORS[status]}`}>
            {STATUS_LABELS[status] || status}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Client / Brand">
          <p className="text-sm font-semibold text-gray-900">
            {order?.client_brand || order?.client_name || "—"}
          </p>
          <p className="text-[11px] text-gray-500">
            PO {order?.po_code || "—"}
          </p>
        </Field>

        <Field label="Subcontractor">
          <p className="text-sm font-semibold text-gray-900">
            {subcontractor?.name || "—"}
          </p>
          {subcontractor?.contact_number && (
            <p className="text-[11px] text-gray-500">
              <i className="fa-solid fa-phone text-[9px] mr-1" />
              {subcontractor.contact_number}
            </p>
          )}
          {subcontractor?.address && (
            <p className="text-[11px] text-gray-500">{subcontractor.address}</p>
          )}
        </Field>

        <Field label="Stage / Process">
          <p className="text-sm font-semibold text-gray-900 capitalize">
            {stage?.stage?.replace("_", " ") || "—"}
          </p>
          {assignment?.quantity_pcs != null && (
            <p className="text-[11px] text-gray-500">
              {assignment.quantity_pcs} pcs · ₱{assignment.rate_per_pcs}/pc
            </p>
          )}
        </Field>
      </div>

      {shipment?.issue_note && shipment.status === "issue" && (
        <div className="mt-3 bg-red-50 border border-red-200 rounded p-3 text-xs text-red-700">
          <p className="font-semibold mb-1">
            <i className="fa-solid fa-triangle-exclamation mr-1" />
            Issue:
          </p>
          <p className="whitespace-pre-wrap">{shipment.issue_note}</p>
        </div>
      )}
    </section>
  );
};

const Field = ({ label, children }) => (
  <div>
    <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">{label}</p>
    {children}
  </div>
);

export default ShipmentDetailHeader;
