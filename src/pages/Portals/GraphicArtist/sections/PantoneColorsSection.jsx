import React from "react";

/**
 * Phase 5-H — Pantone Colors used in the order.
 *
 * Aggregated from all placements. Read-only — Pantones are edited per
 * placement on the Graphic Design admin page.
 */
const PantoneColorsSection = ({ pantones = [] }) => {
  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
          4
        </span>
        Pantone Colors
      </h2>
      <p className="text-xs text-gray-500 mb-3">
        Mga Pantone na gamit sa lahat ng placements. Gamitin ang exact Pantone
        codes para sa accurate printing.
      </p>

      {pantones.length === 0 ? (
        <p className="text-[11px] text-gray-400 italic">
          Wala pang naka-assign na Pantone. I-set sa Graphic Design page.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {pantones.map((p, i) => (
            <div
              key={p.id ?? `inline-${i}`}
              className="border border-gray-200 rounded overflow-hidden bg-gray-50"
            >
              <div
                className="h-16 w-full"
                style={{ background: p.hexcolor || "#e5e7eb" }}
              />
              <div className="p-2">
                <p className="text-xs font-semibold text-gray-900 truncate">
                  {p.pantone_code || "—"}
                </p>
                <p className="text-[10px] text-gray-500 truncate">
                  {p.name || ""}
                </p>
                {p.hexcolor && (
                  <p className="text-[10px] text-gray-400 uppercase">
                    {p.hexcolor}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default PantoneColorsSection;
