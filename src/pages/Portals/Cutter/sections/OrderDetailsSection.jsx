import React from "react";

const STATUS_STYLES = {
  pending:      "bg-gray-100 text-gray-700",
  in_progress:  "bg-blue-50 text-blue-700",
  for_approval: "bg-amber-50 text-amber-700",
  completed:    "bg-green-50 text-green-700",
  delayed:      "bg-red-50 text-red-700",
  on_hold:      "bg-zinc-100 text-zinc-700",
};

const OrderDetailsSection = ({ order, stage }) => {
  const statusClass = STATUS_STYLES[stage?.status] || STATUS_STYLES.pending;

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
          1
        </span>
        Order Details
      </h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6 text-sm">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400">
            Order / Project No.
          </p>
          <p className="font-semibold text-gray-900">
            {order?.po_code || "—"}
          </p>
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
            {order?.shirt_color || "—"}
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400">
            Print Method
          </p>
          <p className="font-medium text-gray-800">
            {order?.special_print || "—"}
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400">
            Quantity (total pcs)
          </p>
          <p className="font-semibold text-gray-900">
            {order?.total_pcs ?? 0} pcs
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400">
            Print Area
          </p>
          <p className="font-medium text-gray-800">
            {order?.print_area || "—"}
          </p>
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
            Phase
          </p>
          <p className="font-medium text-gray-800 capitalize">
            {stage?.phase || "—"}
          </p>
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

export default OrderDetailsSection;
