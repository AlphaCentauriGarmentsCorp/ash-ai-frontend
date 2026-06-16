import React from "react";

const MeasurementsSection = ({ measurements = {} }) => {
  const sizes = measurements.sizes || [];
  const placements = measurements.reference_placements || [];

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
          <i className="fa-solid fa-ruler text-[11px]" />
        </span>
        Measurements &amp; Reference
      </h2>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Size chart */}
        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-2">
            Size Chart
          </p>
          {sizes.length === 0 ? (
            <p className="text-[11px] text-gray-400 italic">
              Walang size data sa order.
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
                {sizes.map((row, i) => (
                  <tr
                    key={`${row.size}-${i}`}
                    className="border-b border-gray-50 last:border-0"
                  >
                    <td className="py-1.5 font-medium text-gray-800">
                      {row.size}
                    </td>
                    <td className="py-1.5 text-right text-gray-700">
                      {row.quantity} pcs
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pattern / Layout Reference */}
        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-2">
            Pattern / Layout Reference
          </p>
          {placements.length === 0 ? (
            <div className="w-full h-32 rounded bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-xs">
              no reference
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {placements.map((p) => (
                <div key={p.id} className="bg-gray-50 border border-gray-200 rounded p-2">
                  <p className="text-[10px] text-gray-500 mb-1 capitalize">
                    {p.type}
                  </p>
                  {p.mockup_url ? (
                    <a href={p.mockup_url} target="_blank" rel="noreferrer">
                      <img
                        src={p.mockup_url}
                        alt={p.type}
                        className="w-full max-h-32 object-contain rounded bg-white"
                      />
                    </a>
                  ) : (
                    <div className="w-full h-20 rounded bg-white border border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-xs">
                      no image
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-700 flex items-start gap-1">
        <i className="fa-solid fa-circle-info mt-0.5" />
        <span>Sundin ang sukat at pattern layout para sa sample.</span>
      </div>
    </section>
  );
};

export default MeasurementsSection;
