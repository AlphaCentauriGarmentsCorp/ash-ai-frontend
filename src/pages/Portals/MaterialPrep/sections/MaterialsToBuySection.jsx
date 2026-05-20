import React from "react";

const MaterialsToBuySection = ({ items = [] }) => {
  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
          2
        </span>
        Materials to Buy
      </h2>
      <p className="text-xs text-gray-500 mb-3">
        Listahan ng materials kailangan bilhin, kasama ang estimated price.
      </p>

      {items.length === 0 ? (
        <p className="text-[11px] text-gray-400 italic">Walang item sa PR na ito.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wide text-gray-500 border-b border-gray-200">
                <th className="text-left py-2 px-2">Item</th>
                <th className="text-left py-2 px-2">Type</th>
                <th className="text-right py-2 px-2">Qty</th>
                <th className="text-left py-2 px-2">Unit</th>
                <th className="text-right py-2 px-2">Est. Price / Unit</th>
                <th className="text-right py-2 px-2">Est. Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-2 px-2 font-medium text-gray-800">
                    {item.material_name || "—"}
                  </td>
                  <td className="py-2 px-2 text-xs text-gray-600 capitalize">
                    {item.material_type || "—"}
                  </td>
                  <td className="py-2 px-2 text-right text-gray-700">
                    {item.quantity}
                  </td>
                  <td className="py-2 px-2 text-gray-600">{item.unit || "—"}</td>
                  <td className="py-2 px-2 text-right text-gray-700">
                    ₱{(item.unit_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-2 text-right font-semibold text-gray-900">
                    ₱{(item.line_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-800 flex items-start gap-1">
        <i className="fa-solid fa-circle-info mt-0.5" />
        <span>
          All prices are based on the latest supplier quotation. Final price
          may change if supplier increases the price.
        </span>
      </div>
    </section>
  );
};

export default MaterialsToBuySection;
