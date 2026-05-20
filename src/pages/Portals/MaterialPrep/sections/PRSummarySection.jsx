import React from "react";

const STATUS_STYLES = {
  pending:   { bg: "bg-amber-100",   text: "text-amber-700",   label: "TO APPROVE" },
  approved:  { bg: "bg-blue-100",    text: "text-blue-700",    label: "TO PURCHASE" },
  ordered:   { bg: "bg-indigo-100",  text: "text-indigo-700",  label: "WAITING DELIVERY" },
  received:  { bg: "bg-emerald-100", text: "text-emerald-700", label: "RECEIVED" },
  cancelled: { bg: "bg-red-100",     text: "text-red-700",     label: "CANCELLED" },
};

const PRSummarySection = ({ pr, order, totals }) => {
  const style = STATUS_STYLES[pr?.status] || STATUS_STYLES.pending;

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-500">
            Active Purchase Request
          </p>
          <h2 className="text-2xl font-bold text-primary mt-0.5">
            {pr?.pr_code || "—"}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            <span className="font-semibold">Order / Project:</span>{" "}
            {order?.po_code ? `${order.po_code} — ${order.client_brand || order.client_name || "—"}` : "—"}
          </p>
          {pr?.material_request_code && (
            <p className="text-[10px] text-gray-400 mt-0.5">
              From MR: <span className="font-mono">{pr.material_request_code}</span>
            </p>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 pt-3 border-t border-gray-100">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-500">Status</p>
          <span className={`inline-block mt-1 text-[11px] font-semibold px-2 py-1 rounded ${style.bg} ${style.text}`}>
            {style.label}
          </span>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-500">Total Items</p>
          <p className="text-base font-semibold text-gray-900 mt-1">
            {totals?.total_items ?? 0}
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-500">Total Amount (Est.)</p>
          <p className="text-base font-semibold text-gray-900 mt-1">
            ₱{(totals?.total_amount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-gray-400">Based on current supplier price</p>
        </div>
      </div>

      {pr?.approved_at && (
        <p className="text-[10px] text-gray-400 mt-3">
          Approved by {pr.approved_by?.name || "manager"} on{" "}
          {new Date(pr.approved_at).toLocaleString()}
        </p>
      )}
    </section>
  );
};

export default PRSummarySection;
