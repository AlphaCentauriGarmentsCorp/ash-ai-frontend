import React from "react";

/**
 * Read-only summary of ONE saved Material Prep requirement (an MR + the PR
 * it may have spawned). Shared by:
 *   - MaterialRequirementsPanel's "saved requirement" view (Material Prep
 *     portal, looking at its own order), and
 *   - MaterialDetailsSection (every downstream portal's read-only view of
 *     what Material Prep confirmed for the order).
 */

const fmt = (n) =>
  Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });

const PR_STATUS_STYLES = {
  pending:  "bg-amber-100 text-amber-800",
  approved: "bg-blue-100 text-blue-700",
  ordered:  "bg-indigo-100 text-indigo-700",
  received: "bg-emerald-100 text-emerald-700",
};

const MaterialRequirementSummaryTable = ({ mr, purchase_needed, pr }) => {
  if (!mr) return null;

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="py-1.5 px-2 font-semibold">Material</th>
              <th className="py-1.5 px-2 font-semibold text-right">Required</th>
              <th className="py-1.5 px-2 font-semibold text-right">Available</th>
              <th className="py-1.5 px-2 font-semibold text-right">To purchase</th>
            </tr>
          </thead>
          <tbody>
            {mr.items.map((it, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-1.5 px-2">{it.material_name || `#${it.material_id}`}</td>
                <td className="py-1.5 px-2 text-right font-mono">
                  {fmt(it.quantity_requested)} {it.unit}
                </td>
                <td className="py-1.5 px-2 text-right font-mono">{fmt(it.quantity_available)}</td>
                <td className="py-1.5 px-2 text-right font-mono font-semibold">
                  {it.quantity_short > 0 ? (
                    <span className="text-amber-700">{fmt(it.quantity_short)}</span>
                  ) : (
                    <span className="text-emerald-600">0</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {purchase_needed && pr ? (
        <div className="flex items-center justify-between gap-2 rounded-md bg-amber-50 border border-amber-200 p-2.5 text-xs">
          <span className="text-amber-800">
            <i className="fa-solid fa-cart-shopping mr-1.5" />
            Purchase Request{" "}
            <span className="font-mono font-semibold">{pr.pr_code}</span>
            {pr.supplier ? ` · ${pr.supplier}` : " · supplier not assigned"}
            {" · ₱"}
            {fmt(pr.total)}
          </span>
          <span
            className={`uppercase text-[9px] font-bold px-1.5 py-0.5 rounded ${
              PR_STATUS_STYLES[pr.status] || "bg-gray-100 text-gray-700"
            }`}
          >
            {pr.status}
          </span>
        </div>
      ) : (
        <div className="rounded-md bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-700">
          <i className="fa-solid fa-circle-check mr-1.5" />
          No purchase needed — all materials are in stock.
        </div>
      )}
    </div>
  );
};

export default MaterialRequirementSummaryTable;
