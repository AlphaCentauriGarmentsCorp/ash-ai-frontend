import React from "react";

/**
 * SM Rework CP2 — Design Details (READ-ONLY).
 *
 * The Graphic Artist's saved output, surfaced to the Screen Maker so the
 * screens match the approved design spec exactly:
 *
 *   - Print Locations & Pantones — per-placement artwork + hydrated
 *     Pantone chips (context.placements, CP1 backend)
 *   - Aggregated Pantone palette   (context.pantones_used)
 *   - Labels & Tags — the order's Brand / Care label specs + the ONE
 *     shared Label Design file (context.order.brand_label / care_label /
 *     label_design_url)
 *
 * Everything here is strictly read-only — edits happen sa GA portal.
 * Visual language mirrors the GA sections (PrintLocationsSection chip
 * style + LabelsTagsSection spec cards) so parehong hitsura ang nakikita
 * ng dalawang portal.
 */

const SpecRow = ({ label, value }) => (
  <div className="flex justify-between gap-3 border-b border-b-gray-100 py-1.5 last:border-b-0">
    <p className="text-xs text-gray-500 shrink-0">{label}</p>
    <p className="text-xs font-medium text-gray-800 text-right break-words min-w-0">
      {value || "—"}
    </p>
  </div>
);

const LabelSpecCard = ({ title, icon, spec }) => {
  if (!spec || !spec.enabled) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
        <p className="text-xs font-semibold text-gray-700 mb-1">
          <i className={`fa-solid ${icon} mr-1.5 text-gray-400`} />
          {title}
        </p>
        <p className="text-[11px] text-gray-400 italic">
          Hindi kasama sa order na ito.
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
      <p className="text-xs font-semibold text-primary mb-1">
        <i className={`fa-solid ${icon} mr-1.5`} />
        {title}
      </p>
      <SpecRow label="Material" value={spec.material} />
      <SpecRow label="Method" value={spec.method} />
      <SpecRow label="Placement" value={spec.placement} />
      {spec.measurement ? (
        <SpecRow label="Measurement" value={spec.measurement} />
      ) : null}
      {spec.notes ? <SpecRow label="Notes" value={spec.notes} /> : null}
    </div>
  );
};

/** One hydrated Pantone chip — hex swatch + code — name (GA chip style). */
const PantoneChip = ({ pantone }) => (
  <span className="inline-flex items-center gap-1.5 border border-gray-300 rounded px-2 py-1 bg-white max-w-full">
    <span
      className="inline-block w-4 h-4 rounded-sm border border-gray-300 shrink-0"
      style={{ background: pantone.hexcolor || "#e5e7eb" }}
      title={pantone.hexcolor || ""}
    />
    <span className="text-xs text-gray-800 truncate">
      {pantone.pantone_code || "—"}
      {pantone.name ? (
        <span className="text-gray-400"> — {pantone.name}</span>
      ) : null}
    </span>
  </span>
);

const PlacementCard = ({ placement, index }) => (
  <div className="grid sm:grid-cols-[40px_144px_1fr] gap-3 p-3 bg-gray-50 border border-gray-200 rounded">
    {/* Number circle */}
    <div className="w-7 h-7 rounded-full bg-primary text-white text-xs flex items-center justify-center font-semibold shrink-0">
      {index + 1}
    </div>

    {/* Artwork (read-only) */}
    <div className="shrink-0 w-full sm:w-36">
      <div className="block w-full aspect-square rounded border border-gray-200 bg-white overflow-hidden">
        {placement.mockup_url ? (
          <a href={placement.mockup_url} target="_blank" rel="noreferrer">
            <img
              src={placement.mockup_url}
              alt={placement.type}
              className="w-full h-full object-contain"
            />
          </a>
        ) : (
          <span className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
            no artwork
          </span>
        )}
      </div>
    </div>

    {/* Placement + Pantones */}
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wide text-gray-500">
        Placement
      </p>
      <p className="text-sm font-semibold text-gray-900 capitalize mb-2">
        {placement.type || "—"}
        {placement.color_count ? (
          <span className="ml-2 text-[10px] font-normal text-gray-500">
            {placement.color_count} color{placement.color_count > 1 ? "s" : ""}
          </span>
        ) : null}
      </p>

      <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">
        Pantones
      </p>
      {Array.isArray(placement.pantones) && placement.pantones.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {placement.pantones.map((p, pi) => (
            <PantoneChip key={p.id ?? `inline-${pi}`} pantone={p} />
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-gray-400 italic">
          Wala pang Pantone para sa placement na ito.
        </p>
      )}
    </div>
  </div>
);

const DesignDetailsSection = ({ placements = [], pantonesUsed = [], order }) => {
  const designUrl = order?.label_design_url || null;
  const isPdf = designUrl ? /\.pdf($|\?)/i.test(designUrl) : false;

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
          <i className="fa-solid fa-palette text-[11px]" />
        </span>
        Design Details
        <span className="text-[10px] uppercase tracking-wide bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
          Read-Only
        </span>
      </h2>
      <p className="text-xs text-gray-500 mb-3">
        Output ng Graphic Artist — placements, Pantone, at label specs.
        Reference lang ito para tumugma ang screens sa design; sa GA portal
        ito binabago.
      </p>

      {/* ── Print Locations & Pantones ─────────────────────────── */}
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2">
        Print Locations &amp; Pantones
      </p>
      {placements.length === 0 ? (
        <p className="text-[11px] text-gray-400 italic">
          Wala pang placement mula sa Graphic Artist.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {placements.map((p, i) => (
            <PlacementCard key={p.id} placement={p} index={i} />
          ))}
        </div>
      )}

      {/* ── Aggregated palette ─────────────────────────────────── */}
      {pantonesUsed.length > 0 && (
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2">
            Lahat ng Pantone sa order
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {pantonesUsed.map((p, i) => (
              <div
                key={p.id ?? `inline-${i}`}
                className="border border-gray-200 rounded overflow-hidden bg-gray-50"
              >
                <div
                  className="h-10 w-full"
                  style={{ background: p.hexcolor || "#e5e7eb" }}
                />
                <div className="p-1.5">
                  <p className="text-[11px] font-semibold text-gray-900 truncate">
                    {p.pantone_code || "—"}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate">
                    {p.name || ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Labels & Tags (read-only) ──────────────────────────── */}
      <div className="mt-4 border-t border-gray-100 pt-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2">
          Labels &amp; Tags
        </p>

        <div className="grid sm:grid-cols-2 gap-3">
          <LabelSpecCard
            title="Brand Label"
            icon="fa-tag"
            spec={order?.brand_label}
          />
          <LabelSpecCard
            title="Care / Size Label"
            icon="fa-ruler"
            spec={order?.care_label}
          />
        </div>

        {/* Shared Label Design — view only (GA ang nag-a-upload) */}
        <div className="mt-3 flex items-center gap-3">
          <div className="shrink-0 h-16 w-16 rounded border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
            {designUrl ? (
              isPdf ? (
                <a
                  href={designUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-400"
                  title="Open label design PDF"
                >
                  <i className="fa-solid fa-file-pdf text-2xl" />
                </a>
              ) : (
                <a href={designUrl} target="_blank" rel="noreferrer">
                  <img
                    src={designUrl}
                    alt="Label Design"
                    className="h-full w-full object-contain"
                  />
                </a>
              )
            ) : (
              <span className="text-[10px] text-gray-300 text-center px-1">
                wala pang label design
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wide text-gray-500">
              Label Design (shared)
            </p>
            {designUrl ? (
              <a
                href={designUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
              >
                <i className="fa-solid fa-up-right-from-square" />
                Buksan ang label design
              </a>
            ) : (
              <p className="text-[11px] text-gray-400 italic">
                Hihintayin pa ang upload ng Graphic Artist.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DesignDetailsSection;
