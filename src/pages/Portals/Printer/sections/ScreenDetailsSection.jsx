import React from "react";

const ScreenDetailsSection = ({ screenDetails = [] }) => {
  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
          2
        </span>
        Screen Details <span className="text-[10px] text-gray-400 font-normal">(from Screen Maker)</span>
      </h2>
      <p className="text-xs text-gray-500 mb-3">
        Gamitin ang screen sa size na nakalagay.
      </p>

      {screenDetails.length === 0 ? (
        <p className="text-[11px] text-gray-400 italic">
          Wala pang screen assignments para sa order na ito.
        </p>
      ) : (
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[10px] uppercase tracking-wide text-gray-500 border-b border-gray-200">
              <th className="text-left py-2">Location</th>
              <th className="text-left py-2">Screen No.</th>
              <th className="text-left py-2">Size</th>
              <th className="text-left py-2">Mesh</th>
              <th className="text-left py-2">Storage</th>
            </tr>
          </thead>
          <tbody>
            {screenDetails.map((s) => (
              <tr key={s.id} className="border-b border-gray-50 last:border-0">
                <td className="py-2 capitalize font-medium text-gray-800">
                  {s.placement_type || "—"}
                </td>
                <td className="py-2 text-gray-700">
                  {s.screen?.name || `Screen #${s.screen?.id || "?"}`}
                </td>
                <td className="py-2 text-gray-700">{s.screen?.size || "—"}</td>
                <td className="py-2 text-gray-700">{s.screen?.mesh_count || "—"}</td>
                <td className="py-2 text-gray-700 text-[11px]">
                  {s.screen?.address || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-700 flex items-start gap-1">
        <i className="fa-solid fa-circle-info mt-0.5" />
        <span>Dalhin ang mga screen sa designated location bago mag-print.</span>
      </div>
    </section>
  );
};

export default ScreenDetailsSection;
