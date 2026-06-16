import React from "react";

const PrintPlacementSection = ({ placements = [] }) => {
  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
          <i className="fa-solid fa-location-dot text-[11px]" />
        </span>
        Print Placement Guide <span className="text-[10px] text-gray-400 font-normal">(from GA)</span>
      </h2>
      <p className="text-xs text-gray-500 mb-3">
        Sundin ang eksaktong placement at size.
      </p>

      {placements.length === 0 ? (
        <p className="text-[11px] text-gray-400 italic">
          Wala pang design placements. Tanungin ang Graphic Artist.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {placements.map((p) => (
            <div
              key={p.id}
              className="border border-gray-200 rounded-md p-3 bg-gray-50"
            >
              <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-2">
                {p.type || "Placement"}
              </p>

              {p.mockup_url ? (
                <a href={p.mockup_url} target="_blank" rel="noreferrer">
                  <img
                    src={p.mockup_url}
                    alt={p.type}
                    className="w-full max-h-48 object-contain rounded bg-white border border-gray-200"
                  />
                </a>
              ) : (
                <div className="w-full h-32 rounded bg-white border border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-xs">
                  no mockup
                </div>
              )}

              {p.pantones && p.pantones.length > 0 && (
                <div className="mt-2">
                  <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">
                    Pantones
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {p.pantones.map((pc, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-white border border-gray-200 rounded px-1.5 py-0.5"
                      >
                        {typeof pc === "string" ? pc : (pc.name || JSON.stringify(pc))}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-700 flex items-start gap-1">
        <i className="fa-solid fa-circle-info mt-0.5" />
        <span>Lahat ng measurements ay nasa inches. Sundin nang mahigpit.</span>
      </div>
    </section>
  );
};

export default PrintPlacementSection;
