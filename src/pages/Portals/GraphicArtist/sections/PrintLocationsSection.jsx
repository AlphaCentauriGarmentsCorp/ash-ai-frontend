import React from "react";

/**
 * Phase 5-H — Print Locations & Size.
 *
 * Read-only view of the existing placements (which are upserted via the
 * admin-side /graphic-design endpoint). Shows mockup thumbnail, placement
 * type, and the Pantones assigned to that placement.
 *
 * Dropdown reference data is exposed in placementOptions and
 * measurementOptions in case we add a future write-path here. For now,
 * the artist edits placements through the admin Graphic Design page.
 */

const PrintLocationsSection = ({
  placements = [],
  placementOptions = [],
  measurementOptions = [],
}) => {
  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
          3
        </span>
        Print Locations & Size
      </h2>
      <p className="text-xs text-gray-500 mb-3">
        Mga placement at sukat ng print. Editable sa Graphic Design admin
        page; ito ay reference view para sa artist.
      </p>

      {placements.length === 0 ? (
        <p className="text-[11px] text-gray-400 italic">
          Wala pang placement na nase-set. Pumunta sa Graphic Design page para
          mag-add ng placements para sa order na ito.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {placements.map((p) => (
            <div
              key={p.id}
              className="border border-gray-200 rounded p-3 bg-gray-50"
            >
              <div className="flex gap-3">
                <div className="w-24 h-24 shrink-0 rounded bg-white border border-gray-200 overflow-hidden flex items-center justify-center">
                  {p.mockup_url ? (
                    <img
                      src={p.mockup_url}
                      alt={p.type}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-[10px] text-gray-300">no mockup</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wide text-gray-500">
                    Placement
                  </p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">
                    {p.type || "—"}
                  </p>
                  {p.pantones?.length > 0 && (
                    <>
                      <p className="text-[10px] uppercase tracking-wide text-gray-500 mt-2">
                        Pantones
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {p.pantones.map((pc, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-white border border-gray-200 rounded px-1.5 py-0.5 inline-flex items-center gap-1"
                            title={pc.pantone_code || pc.name}
                          >
                            {pc.hexcolor && (
                              <span
                                className="inline-block w-2 h-2 rounded-sm border border-gray-300"
                                style={{ background: pc.hexcolor }}
                              />
                            )}
                            {pc.pantone_code || pc.name || "—"}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(placementOptions.length > 0 || measurementOptions.length > 0) && (
        <details className="mt-4">
          <summary className="text-[11px] text-gray-500 cursor-pointer hover:text-primary">
            Reference: available placement + measurement types ({placementOptions.length} + {measurementOptions.length})
          </summary>
          <div className="grid sm:grid-cols-2 gap-3 mt-2">
            {placementOptions.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Placements</p>
                <ul className="text-[11px] text-gray-700 list-disc list-inside">
                  {placementOptions.map((o) => (
                    <li key={o.id}>{o.name}</li>
                  ))}
                </ul>
              </div>
            )}
            {measurementOptions.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Measurements</p>
                <ul className="text-[11px] text-gray-700 list-disc list-inside">
                  {measurementOptions.map((o) => (
                    <li key={o.id}>{o.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </details>
      )}
    </section>
  );
};

export default PrintLocationsSection;
