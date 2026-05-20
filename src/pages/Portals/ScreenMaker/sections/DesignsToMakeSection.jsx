import React from "react";

const DesignsToMakeSection = ({ designs = [] }) => {
  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
          2
        </span>
        Designs to Make Screen
      </h2>
      <p className="text-xs text-gray-500 mb-3">
        Mga design na kailangan gumawa ng screen.
      </p>

      {designs.length === 0 ? (
        <p className="text-[11px] text-gray-400 italic">
          Wala pang designs na assigned sa order na ito.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {designs.map((d, i) => (
            <div
              key={d.id}
              className="grid sm:grid-cols-[40px_140px_1fr_140px] gap-3 p-3 bg-gray-50 border border-gray-200 rounded"
            >
              {/* Number circle */}
              <div className="w-7 h-7 rounded-full bg-primary text-white text-xs flex items-center justify-center font-semibold shrink-0">
                {i + 1}
              </div>

              {/* Design mockup */}
              <div>
                {d.mockup_url ? (
                  <a href={d.mockup_url} target="_blank" rel="noreferrer">
                    <img
                      src={d.mockup_url}
                      alt={d.type}
                      className="w-full max-h-28 object-contain rounded bg-white border border-gray-200"
                    />
                  </a>
                ) : (
                  <div className="w-full h-24 rounded bg-white border border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-xs">
                    no mockup
                  </div>
                )}
              </div>

              {/* Design metadata */}
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-500">
                  Placement
                </p>
                <p className="text-sm font-semibold text-gray-900 capitalize mb-2">
                  {d.type || "—"}
                </p>

                {d.pantones && d.pantones.length > 0 && (
                  <>
                    <p className="text-[10px] uppercase tracking-wide text-gray-500">
                      Ink Colors (Pantones)
                    </p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {d.pantones.map((pc, pi) => (
                        <span
                          key={pi}
                          className="text-[10px] bg-white border border-gray-200 rounded px-1.5 py-0.5"
                        >
                          {typeof pc === "string" ? pc : (pc.name || JSON.stringify(pc))}
                        </span>
                      ))}
                    </div>
                  </>
                )}

                <p className="text-[10px] uppercase tracking-wide text-gray-500">
                  Screen Count
                </p>
                <p className="text-xs text-gray-700">
                  {d.screens?.length || 0} screen{d.screens?.length === 1 ? "" : "s"}
                </p>
              </div>

              {/* Screens list */}
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">
                  Screens to Use
                </p>
                {d.screens?.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {d.screens.map((s) => (
                      <div
                        key={s.assignment_id}
                        className="text-[11px] bg-white border border-gray-200 rounded px-2 py-1"
                      >
                        <p className="font-semibold text-gray-900">
                          {s.screen?.name || "—"}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {s.screen?.size || "—"} · Mesh {s.screen?.mesh_count || "—"}
                        </p>
                        {s.screen?.address && (
                          <p className="text-[10px] text-gray-400 italic mt-0.5">
                            {s.screen.address}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-gray-400 italic">
                    Wala pang assigned screens.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-700 flex items-start gap-1">
        <i className="fa-solid fa-circle-info mt-0.5" />
        <span>
          Tamang screen at size = malinis na print. Pakisigurong tama ang gamitin.
        </span>
      </div>
    </section>
  );
};

export default DesignsToMakeSection;
