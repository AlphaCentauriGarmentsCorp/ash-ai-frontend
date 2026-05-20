import React, { useEffect, useState } from "react";
import { qaPackerPortalApi } from "../../../../api/qaPackerPortalApi";

/**
 * Phase 7-B Bundle 4a — Packing Boxes section.
 *
 * Per the §7-B "one box per order" decision, this section shows ONE
 * box per order auto-created on mount via ensureFirstBox.
 *
 * Box-management UI:
 *   - Inline editing of contents (size / sku / qty rows)
 *   - Weight input
 *   - Seal button (locks contents)
 *   - Print QR Label button (opens PDF in new tab)
 *
 * If multiple boxes ever exist for an order (multi-box not yet
 * exposed in v1 but the schema supports it), this section will render
 * them all and the auto-create logic is idempotent.
 *
 * Props:
 *   packingBoxes - array from context.packing_boxes (may be empty on first mount)
 *   orderId
 *   onChanged()  - called after seal or contents update so parent refetches
 *   sectionNumber - usually 6
 */
const PackingBoxesSection = ({
  packingBoxes = [],
  orderId,
  onChanged,
  sectionNumber = 6,
}) => {
  const [bootstrapping, setBootstrapping] = useState(false);
  const [bootstrapError, setBootstrapError] = useState(null);

  // On first mount with zero boxes, auto-create box #1.
  // ensureFirstBox is idempotent so this is safe even if a parallel
  // request beat us to it.
  useEffect(() => {
    if (packingBoxes.length > 0 || bootstrapping) return;

    let cancelled = false;
    (async () => {
      setBootstrapping(true);
      setBootstrapError(null);
      try {
        await qaPackerPortalApi.ensureFirstBox(orderId);
        if (!cancelled) onChanged?.();
      } catch (err) {
        if (cancelled) return;
        setBootstrapError(
          err?.response?.data?.message || "Hindi ma-setup ang box. Subukan ulit.",
        );
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, packingBoxes.length]);

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
          {sectionNumber}
        </span>
        Packing Box &amp; QR
      </h2>

      {bootstrapError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-2 mb-3 text-xs text-red-700">
          <i className="fa-solid fa-triangle-exclamation mr-1" />
          {bootstrapError}
        </div>
      )}

      {bootstrapping && packingBoxes.length === 0 && (
        <div className="flex items-center justify-center py-6 text-gray-400 text-xs">
          <i className="fa-solid fa-spinner fa-spin mr-2" />
          Hinahanda ang box…
        </div>
      )}

      {packingBoxes.map((box) => (
        <BoxCard
          key={box.id}
          box={box}
          onChanged={onChanged}
        />
      ))}
    </section>
  );
};

// ─── BoxCard — one box's editor + actions ────────────────────────

const BoxCard = ({ box, onChanged }) => {
  const [editing, setEditing] = useState(false);
  const [contents, setContents] = useState(box.contents_json || []);
  const [weight, setWeight] = useState(box.weight_kg ?? "");
  const [saving, setSaving] = useState(false);
  const [sealing, setSealing] = useState(false);
  const [error, setError] = useState(null);
  const [unsealing, setUnsealing] = useState(false);

  // Reset state if the parent re-fetches and gives us a new box snapshot.
  useEffect(() => {
    setContents(box.contents_json || []);
    setWeight(box.weight_kg ?? "");
  }, [box.id, box.contents_json, box.weight_kg]);

  const updateRow = (idx, key, value) => {
    setContents((rows) =>
      rows.map((r, i) => (i === idx ? { ...r, [key]: value } : r)),
    );
  };

  const addRow = () => {
    setContents((rows) => [...rows, { size: "", sku: "", qty: 0 }]);
  };

  const removeRow = (idx) => {
    setContents((rows) => rows.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const cleaned = contents
        .map((r) => ({
          size: r.size?.trim() || null,
          sku: r.sku?.trim() || null,
          qty: parseInt(r.qty, 10) || 0,
        }))
        .filter((r) => r.qty > 0 || r.size || r.sku);

      await qaPackerPortalApi.updateBoxContents(box.id, {
        contents_json: cleaned,
        weight_kg: weight === "" ? null : parseFloat(weight),
      });
      setEditing(false);
      onChanged?.();
    } catch (err) {
      setError(
        err?.response?.data?.message || "Hindi na-save. Subukan ulit.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSeal = async () => {
    if (!window.confirm("Sigurado? Hindi na maeedit ang contents pag sealed.")) {
      return;
    }
    setSealing(true);
    setError(null);
    try {
      await qaPackerPortalApi.sealBox(box.id);
      onChanged?.();
    } catch (err) {
      setError(
        err?.response?.data?.message || "Hindi na-seal. Subukan ulit.",
      );
    } finally {
      setSealing(false);
    }
  };

  const handleUnseal = async () => {
    if (!window.confirm("I-unseal ang box para maibalik ang pag-edit?")) {
      return;
    }
    setUnsealing(true);
    setError(null);
    try {
      await qaPackerPortalApi.unsealBox(box.id);
      onChanged?.();
    } catch (err) {
      setError(
        err?.response?.data?.message || "Hindi na-unseal. Subukan ulit.",
      );
    } finally {
      setUnsealing(false);
    }
  };

  const [printing, setPrinting] = useState(false);

  const handlePrint = async () => {
    if (printing) return;
    setPrinting(true);
    setError(null);
    try {
      const url = await qaPackerPortalApi.boxLabelBlobUrl(box.id);
      window.open(url, "_blank", "noopener,noreferrer");
      // Revoke after a minute — gives the browser time to load the PDF.
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        "Hindi ma-load ang QR label. Subukan ulit.",
      );
    } finally {
      setPrinting(false);
    }
  };

  const totalPcs = (contents || []).reduce(
    (sum, r) => sum + (parseInt(r.qty, 10) || 0),
    0,
  );

  return (
    <div
      className={`border rounded-md p-4 ${box.is_sealed
        ? "bg-emerald-50/30 border-emerald-200"
        : "bg-gray-50 border-gray-200"
        }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Box #{box.box_number}
          </p>
          <p className="font-mono text-xs font-semibold text-gray-900">
            {box.qr_code}
          </p>
          {box.is_sealed && (
            <p className="text-[10px] text-emerald-700 mt-0.5 inline-flex items-center gap-1">
              <i className="fa-solid fa-lock" />
              Sealed
              {box.sealed_at && (
                <span className="ml-1 text-gray-500">
                  · {new Date(box.sealed_at).toLocaleString()}
                </span>
              )}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!box.is_sealed && !editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-xs bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded hover:border-primary inline-flex items-center gap-1"
            >
              <i className="fa-solid fa-pen text-[10px]" />
              Edit Contents
            </button>
          )}
          {!box.is_sealed && (
            <button
              type="button"
              onClick={handleSeal}
              disabled={sealing || editing}
              className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded hover:bg-amber-700 disabled:opacity-50 inline-flex items-center gap-1"
            >
              {sealing ? (
                <i className="fa-solid fa-spinner fa-spin text-[10px]" />
              ) : (
                <i className="fa-solid fa-lock text-[10px]" />
              )}
              Seal Box
            </button>
          )}
          {box.is_sealed && (
            <button
              type="button"
              onClick={handleUnseal}
              disabled={unsealing}
              className="text-xs bg-white border border-amber-300 text-amber-700 px-3 py-1.5 rounded hover:bg-amber-50 disabled:opacity-50 inline-flex items-center gap-1"
            >
              {unsealing ? (
                <i className="fa-solid fa-spinner fa-spin text-[10px]" />
              ) : (
                <i className="fa-solid fa-lock-open text-[10px]" />
              )}
              Unseal
            </button>
          )}
          <button
            type="button"
            onClick={handlePrint}
            disabled={printing}
            className="text-xs bg-primary text-white px-3 py-1.5 rounded hover:bg-primary/90 disabled:opacity-60 inline-flex items-center gap-1"
          >
            {printing ? (
              <>
                <i className="fa-solid fa-spinner fa-spin text-[10px]" />
                Loading PDF…
              </>
            ) : (
              <>
                <i className="fa-solid fa-qrcode text-[10px]" />
                Print QR Label
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-2 mb-3 text-xs text-red-700">
          <i className="fa-solid fa-triangle-exclamation mr-1" />
          {error}
        </div>
      )}

      {/* Contents */}
      <div className="mb-3">
        <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">
          Contents · {totalPcs} pcs total
        </p>

        {!editing ? (
          (contents || []).length === 0 ? (
            <p className="text-[11px] text-gray-400 italic">
              Walang contents pa.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {contents.map((row, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-white border border-gray-200 rounded px-2 py-1"
                >
                  <span className="font-semibold">
                    {row.size || "—"}
                  </span>
                  : {row.qty} pcs
                  {row.sku && (
                    <span className="ml-1 text-gray-400">({row.sku})</span>
                  )}
                </span>
              ))}
            </div>
          )
        ) : (
          <div className="flex flex-col gap-1.5">
            {contents.map((row, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={row.size || ""}
                  onChange={(e) => updateRow(idx, "size", e.target.value)}
                  placeholder="Size"
                  disabled={saving}
                  className="w-20 text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="text"
                  value={row.sku || ""}
                  onChange={(e) => updateRow(idx, "sku", e.target.value)}
                  placeholder="SKU (optional)"
                  disabled={saving}
                  className="flex-1 text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={row.qty || 0}
                  onChange={(e) => updateRow(idx, "qty", e.target.value)}
                  placeholder="Qty"
                  disabled={saving}
                  className="w-20 text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => removeRow(idx)}
                  disabled={saving}
                  className="text-gray-400 hover:text-red-600 p-1 disabled:opacity-50"
                  aria-label="Remove row"
                >
                  <i className="fa-solid fa-trash text-[10px]" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addRow}
              disabled={saving}
              className="self-start text-[11px] text-primary hover:underline mt-0.5"
            >
              + Add row
            </button>
          </div>
        )}
      </div>

      {/* Weight */}
      <div className="flex items-center gap-2 mb-1">
        <label className="text-[10px] uppercase tracking-wide text-gray-500">
          Weight (kg)
        </label>
        {!editing ? (
          <span className="text-xs text-gray-700">
            {box.weight_kg != null ? `${box.weight_kg} kg` : "—"}
          </span>
        ) : (
          <input
            type="number"
            min="0"
            step="0.01"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="0.00"
            disabled={saving}
            className="w-24 text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        )}
      </div>

      {/* Edit actions */}
      {editing && (
        <div className="flex items-center justify-end gap-2 pt-2 mt-2 border-t border-gray-200">
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setContents(box.contents_json || []);
              setWeight(box.weight_kg ?? "");
            }}
            disabled={saving}
            className="text-xs text-gray-600 hover:text-gray-900 px-3 py-1.5 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="text-xs bg-primary text-white px-4 py-1.5 rounded hover:bg-primary/90 disabled:opacity-60 inline-flex items-center gap-1"
          >
            {saving ? (
              <>
                <i className="fa-solid fa-spinner fa-spin text-[10px]" />
                Saving…
              </>
            ) : (
              <>
                <i className="fa-solid fa-check text-[10px]" />
                Save
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default PackingBoxesSection;
