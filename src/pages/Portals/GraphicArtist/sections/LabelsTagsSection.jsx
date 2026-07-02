import React, { useState } from "react";
import { graphicArtistPortalApi } from "../../../../api/graphicArtistPortalApi";

/**
 * GA Portal CP8 — Labels & Tags, aligned with the order's label structure.
 *
 * Replaces the legacy per-kind label_assets editor (main/size/hangtag
 * with dimensions) which had drifted from how labels actually live on
 * the order. This version mirrors Add Order / the order page exactly:
 *
 *   - Brand Label + Care/Size Label SPECS — read-only (the CSR/client
 *     sets these at order creation; the artist works from them)
 *   - the ONE shared Label Design artwork — GA-uploadable/replaceable,
 *     writing the same orders.label_design_path the whole system reads
 *
 * Specs arrive on context.order (brand_label / care_label /
 * label_design_url — CP5/CP7 backend).
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

const LabelsTagsSection = ({ order, orderId, orderStageId, onChanged }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const designUrl = order?.label_design_url || null;
  const isPdf = designUrl ? /\.pdf($|\?)/i.test(designUrl) : false;

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      await graphicArtistPortalApi.uploadLabelDesign({
        order_id: orderId,
        order_stage_id: orderStageId,
        file,
      });
      setFile(null);
      onChanged?.();
    } catch (err) {
      setError(
        err?.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(" ")
          : err?.response?.data?.message || "Hindi na-upload. Subukan ulit.",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
          <i className="fa-solid fa-tag text-[11px]" />
        </span>
        Labels &amp; Tags
      </h2>
      <p className="text-xs text-gray-500 mb-3">
        Label specs mula sa order (read-only) at ang shared Label Design —
        isang file para sa Brand at Care/Size label, katulad sa Add Order.
      </p>

      {/* ── Read-only specs ─────────────────────────────────────── */}
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

      {/* ── Shared Label Design (GA-uploadable) ─────────────────── */}
      <div className="mt-4 border-t border-gray-100 pt-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2">
          Label Design (shared)
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="shrink-0 h-20 w-20 rounded border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
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

          <div className="flex-1 min-w-0">
            {designUrl && (
              <a
                href={designUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary hover:underline inline-flex items-center gap-1 mb-1"
              >
                <i className="fa-solid fa-up-right-from-square" />
                Buksan ang kasalukuyang label design
              </a>
            )}
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.pdf,.svg"
                onChange={(e) => {
                  setFile(e.target.files?.[0] || null);
                  setError(null);
                }}
                className="text-xs text-gray-600 file:mr-2 file:px-3 file:py-1.5 file:rounded file:border-0 file:bg-light/60 file:text-primary file:text-xs file:font-semibold hover:file:bg-primary/10"
              />
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading || !file}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 inline-flex items-center justify-center gap-2 shrink-0"
              >
                {uploading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" /> Ina-upload…
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-upload" />
                    {designUrl ? "Palitan ang design" : "I-upload ang design"}
                  </>
                )}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              PNG/JPG/WebP/PDF/SVG, max 10 MB. Papalitan nito ang
              kasalukuyang file para sa buong order.
            </p>
            {error && (
              <p className="text-xs text-red-600 mt-1">
                <i className="fa-solid fa-triangle-exclamation mr-1" />
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LabelsTagsSection;
