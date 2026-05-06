import React from "react";

const Row = ({ label, value }) => (
  <div className="flex justify-between border-b border-b-gray-100 p-1.5 sm:p-2 last:border-b-0">
    <p className="text-gray-500 text-xs sm:text-sm">{label}</p>
    <p className="text-xs sm:text-sm font-medium text-right max-w-[60%] break-words">{value || "N/A"}</p>
  </div>
);

const fmt = (v) =>
  `₱${(Number(v) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const ProductDetails = ({ order }) => {
  const breakdown = order?.breakdown_json || {};
  const items = order?.items_json || [];
  const addons = order?.addons_json || [];
  const samples = breakdown?.sample_breakdown;

  return (
    <>
      {/* ── Apparel Info ─────────────────────────────────────────────────── */}
      <section className="flex-col flex gap-y-2 sm:gap-y-3">
        <h1 className="font-semibold text-base sm:text-lg">Apparel Information</h1>
        <div className="border border-gray-200 sm:border-gray-300 p-2 sm:p-3 rounded-lg sm:rounded-xl">
          <Row label="Apparel Type" value={order?.apparel_type} />
          <Row label="Pattern Type" value={order?.pattern_type} />
          <Row label="Neckline" value={order?.apparel_neckline} />
          <Row label="Print Method" value={order?.print_method} />
          <Row label="Shirt Color" value={order?.shirt_color} />
          <Row label="Print Area" value={order?.print_area} />
          <Row label="Special Print" value={order?.special_print} />
        </div>
      </section>

      {/* ── Size Breakdown ───────────────────────────────────────────────── */}
      {items.length > 0 && (
        <section className="flex-col flex gap-y-2 sm:gap-y-3">
          <h1 className="font-semibold text-base sm:text-lg">Size Breakdown</h1>
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
      )}

      {/* ── Addons ───────────────────────────────────────────────────────── */}
      {addons.length > 0 && (
        <section className="flex-col flex gap-y-2 sm:gap-y-3">
          <h1 className="font-semibold text-base sm:text-lg">Addons</h1>
          <div className="border border-gray-200 sm:border-gray-300 rounded-lg sm:rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600">Name</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-600">Price/Pc</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-600">Qty</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-600">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {addons.map((addon, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-3 py-2">{addon.name || "—"}</td>
                      <td className="px-3 py-2 text-right">{fmt(addon.price_per_piece ?? addon.price)}</td>
                      <td className="px-3 py-2 text-right">{addon.quantity ?? 1}</td>
                      <td className="px-3 py-2 text-right font-semibold text-primary">{fmt(addon.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ── Sample Breakdown ─────────────────────────────────────────────── */}
      {samples && (
        <section className="flex-col flex gap-y-2 sm:gap-y-3">
          <h1 className="font-semibold text-base sm:text-lg">Sample</h1>
          <div className="border border-gray-200 sm:border-gray-300 p-2 sm:p-3 rounded-lg sm:rounded-xl">
            <Row label="Sample Apparel" value={samples.sample_apparel} />
            <Row label="Unit Price" value={fmt(samples.unit_price)} />
            <Row label="Quantity" value={samples.quantity} />
            <Row label="Price/Pc" value={fmt(samples.price_per_piece)} />
          </div>
        </section>
      )}

      {/* ── Free Items / Notes ───────────────────────────────────────────── */}
      {order?.free_items && (
        <section className="flex-col flex gap-y-2 sm:gap-y-3">
          <h1 className="font-semibold text-base sm:text-lg">Free Items</h1>
          <p className="text-xs sm:text-sm p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200 whitespace-pre-line">
            {order.free_items}
          </p>
        </section>
      )}

      {order?.notes && (
        <section className="flex-col flex gap-y-2 sm:gap-y-3">
          <h1 className="font-semibold text-base sm:text-lg">Notes</h1>
          <p className="text-xs sm:text-sm p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200 whitespace-pre-line">
            {order.notes}
          </p>
        </section>
      )}
    </>
  );
};

export default ProductDetails;