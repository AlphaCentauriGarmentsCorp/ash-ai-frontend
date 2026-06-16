import React from "react";

/**
 * Phase 5-H — Screen Details (READ-ONLY).
 *
 * Sourced from screen_assignments joined to screens. The Graphic Artist
 * sees the screen mappings to coordinate color separations. Edits happen
 * in the Screen Maker portal.
 */
const ScreenDetailsReadOnlySection = ({ screens = [] }) => {
  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
          <i className="fa-solid fa-table-cells text-[11px]" />
        </span>
        Screen Details
        <span className="text-[10px] uppercase tracking-wide bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
          Read-Only
        </span>
      </h2>
      <p className="text-xs text-gray-500 mb-3">
        Screen mapping na ginagawa ng Screen Maker. Reference lang ito sa
        Graphic Artist — i-coordinate ang color separation file rito.
      </p>

      {screens.length === 0 ? (
        <p className="text-[11px] text-gray-400 italic">
          Wala pang screen na naka-assign sa order na ito.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-left text-[10px] uppercase tracking-wide text-gray-500">
                <th className="py-2 pr-3">Placement</th>
                <th className="py-2 pr-3">Color #</th>
                <th className="py-2 pr-3">Screen</th>
                <th className="py-2 pr-3">Size</th>
                <th className="py-2 pr-3">Mesh</th>
                <th className="py-2">Location</th>
              </tr>
            </thead>
            <tbody>
              {screens.map((s) => (
                <tr key={s.id} className="border-b border-gray-100">
                  <td className="py-2 pr-3 text-gray-700">#{s.placement_id}</td>
                  <td className="py-2 pr-3 text-gray-700">{s.color_index}</td>
                  <td className="py-2 pr-3 text-gray-900 font-medium">
                    {s.screen?.name || "—"}
                  </td>
                  <td className="py-2 pr-3 text-gray-700">{s.screen?.size || "—"}</td>
                  <td className="py-2 pr-3 text-gray-700">{s.screen?.mesh_count || "—"}</td>
                  <td className="py-2 text-gray-500">{s.screen?.address || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default ScreenDetailsReadOnlySection;
