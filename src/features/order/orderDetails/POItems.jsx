import React from "react";

const fmt = (v) =>
  `₱${(Number(v) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * POItems
 *
 * Displays the size breakdown from items_json (carried from quotation).
 * The legacy `order.items` (PoItem rows) may also be available if the backend
 * creates them; we show whichever is non-empty.
 */
const POItems = ({ order }) => {
  const itemsJson = order?.items_json || [];
  const baseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

  // Prefer items_json for display; fall back to items_list relation
  const hasJsonItems = itemsJson.length > 0;

  return (
    <section className="flex-col flex gap-y-2 sm:gap-y-3">
      <h1 className="font-semibold text-base sm:text-lg">PO Items</h1>

      {hasJsonItems ? (
        <div className="border border-gray-200 sm:border-gray-300 rounded-lg sm:rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-600">Size</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-right font-semibold text-gray-600">Qty</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-right font-semibold text-gray-600">Unit Price</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-right font-semibold text-gray-600">Price/Pc</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-right font-semibold text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {itemsJson.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-4 py-2 sm:py-3 font-semibold text-primary">
                      {item.size_label || item.size || "—"}
                    </td>
                    <td className="px-3 sm:px-4 py-2 sm:py-3 text-right">{item.quantity ?? 0}</td>
                    <td className="px-3 sm:px-4 py-2 sm:py-3 text-right">{fmt(item.unit_price)}</td>
                    <td className="px-3 sm:px-4 py-2 sm:py-3 text-right">{fmt(item.price_per_piece)}</td>
                    <td className="px-3 sm:px-4 py-2 sm:py-3 text-right font-semibold text-primary">
                      {fmt(item.total_amount ?? item.total ?? (item.price_per_piece ?? 0) * (item.quantity ?? 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 text-sm text-center py-8 border border-gray-200 rounded-lg">
          No PO items found for this order.
        </p>
      )}
    </section>
  );
};

export default POItems;