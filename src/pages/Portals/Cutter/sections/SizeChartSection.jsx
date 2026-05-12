import React from "react";

const SizeChartSection = ({ sizeChart = [], order }) => {
  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
          2
        </span>
        Size Chart &amp; Quantity
      </h2>

      {sizeChart.length === 0 ? (
        <p className="text-xs text-gray-400 italic">
          Walang size data sa order. Tanungin ang CSR.
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wide text-gray-500 border-b border-gray-200">
              <th className="text-left py-2">Size</th>
              <th className="text-right py-2">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {sizeChart.map((row, i) => (
              <tr
                key={`${row.size}-${i}`}
                className="border-b border-gray-50 last:border-0"
              >
                <td className="py-2 font-medium text-gray-800">
                  {row.size}
                </td>
                <td className="py-2 text-right text-gray-800">
                  {row.quantity} pcs
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50">
              <td className="py-2 font-semibold text-gray-900">Total</td>
              <td className="py-2 text-right font-semibold text-gray-900">
                {sizeChart.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0)} pcs
              </td>
            </tr>
          </tbody>
        </table>
      )}

      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-700 flex items-start gap-1">
        <i className="fa-solid fa-circle-info mt-0.5" />
        <span>
          Siguraduhin tama ang tela at pattern bago mag-cut. I-double-check
          ang sukat per size.
        </span>
      </div>
    </section>
  );
};

export default SizeChartSection;
