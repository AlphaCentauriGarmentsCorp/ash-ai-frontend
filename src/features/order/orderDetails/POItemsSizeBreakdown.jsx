import React from "react";

const fmt = (v) =>
  `₱${(Number(v) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * PO Items & Size Breakdown — the per-size line items (qty / unit price /
 * price-per-piece / total). Extracted from ProductDetails so the SAME table
 * renders both on the Order Details page and inside the read-only detail
 * popup, which let the old duplicate standalone "PO Items" table be removed.
 */
const POItemsSizeBreakdown = ({ order }) => {
  const items = order?.items_json || [];
  if (items.length === 0) return null;

  return (
    <section className="flex-col flex gap-y-2 sm:gap-y-3">
      <h1 className="font-semibold text-base sm:text-lg">PO Items & Size Breakdown</h1>
      <div className="border border-gray-200 sm:border-gray-300 rounded-lg sm:rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-gray-600">Size</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-600">Qty</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-600">Unit Price</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-600">Price/Pc</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-600">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-semibold text-primary">{item.size_label || item.size || "—"}</td>
                  <td className="px-3 py-2 text-right">{item.quantity ?? 0}</td>
                  <td className="px-3 py-2 text-right">{fmt(item.unit_price)}</td>
                  <td className="px-3 py-2 text-right">{fmt(item.price_per_piece)}</td>
                  <td className="px-3 py-2 text-right font-semibold text-primary">
                    {fmt(item.total_amount ?? item.total ?? (item.price_per_piece ?? 0) * (item.quantity ?? 0))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default POItemsSizeBreakdown;
