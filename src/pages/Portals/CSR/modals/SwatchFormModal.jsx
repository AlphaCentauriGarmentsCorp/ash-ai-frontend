import React, { useEffect, useState } from "react";
import { csrPortalApi } from "../../../../api/csrPortalApi";
import { supplierApi } from "../../../../api/supplierApi";

/**
 * Phase 6-B — Fabric Swatch create + edit modal.
 *
 * Dual-mode based on the `swatch` prop:
 *   - swatch === null  → create new (POST /csr/fabric-swatches)
 *   - swatch === {...} → edit existing (PUT /csr/fabric-swatches/{id})
 *
 * Multipart for both paths because of the optional `photo` field
 * (Laravel needs `_method=PUT` trick for the update — handled inside
 * csrPortalApi.updateSwatch).
 *
 * Pantone is read-only when editing (preserves the seeded data
 * integrity). New swatches can pick from existing pantones, but
 * the typical creation flow is to leave pantone_id null and set
 * hex_color directly — most new swatches are special orders.
 *
 * Props:
 *   swatch       null | {...} (null = create mode)
 *   onClose()
 *   onSaved(swatch)
 *   suppliers    optional pre-fetched suppliers list (avoids double-fetch)
 */
const COLOR_FAMILIES = [
  "Black", "White", "Gray", "Red", "Pink", "Orange",
  "Yellow", "Green", "Blue", "Purple", "Brown",
];

const SwatchFormModal = ({ swatch, onClose, onSaved, suppliers: suppliersProp }) => {
  const isEdit = !!swatch?.id;

  const [form, setForm] = useState({
    name:         swatch?.name         || "",
    hex_color:    swatch?.hex_color    || "#000000",
    fabric_type:  swatch?.fabric_type  || "",
    gsm:          swatch?.gsm          || "",
    collection:   swatch?.collection   || "",
    supplier_id:  swatch?.supplier_id  || "",
    color_family: swatch?.color_family || "",
    notes:        swatch?.notes        || "",
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [suppliers, setSuppliers] = useState(suppliersProp || []);
  const [loadingSuppliers, setLoadingSuppliers] = useState(!suppliersProp);

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);

  // Fetch suppliers if not pre-fetched
  useEffect(() => {
    if (suppliersProp) return;
    let cancelled = false;
    supplierApi
      .index()
      .then((res) => {
        if (!cancelled) {
          setSuppliers(Array.isArray(res) ? res : res?.data || []);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingSuppliers(false);
      });
    return () => {
      cancelled = true;
    };
  }, [suppliersProp]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleFile = (file) => {
    setPhoto(file);
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrors({});
    setGeneralError(null);

    if (!form.name?.trim()) {
      setErrors({ name: "Name is required." });
      setSubmitting(false);
      return;
    }

    try {
      // Build payload — drop empties
      const payload = {};
      Object.entries(form).forEach(([k, v]) => {
        if (v !== "" && v !== null && v !== undefined) payload[k] = v;
      });
      if (photo) payload.photo = photo;

      const res = isEdit
        ? await csrPortalApi.updateSwatch(swatch.id, payload)
        : await csrPortalApi.createSwatch(payload);

      onSaved?.(res?.data ?? res);
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      if (status === 422 && data?.errors) {
        const flat = {};
        Object.entries(data.errors).forEach(([k, v]) => {
          flat[k] = Array.isArray(v) ? v[0] : String(v);
        });
        setErrors(flat);
        setGeneralError(data.message || "Validation failed.");
      } else {
        setGeneralError(
          data?.message || `Failed to ${isEdit ? "update" : "create"} swatch.`,
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Live preview color block
  const previewBg = form.hex_color || "#e5e7eb";

  return (
    <div className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-5 my-8">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">
              {isEdit ? "Edit Fabric Swatch" : "New Fabric Swatch"}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {isEdit
                ? `Updating ${swatch.name}${swatch.pantone_code ? ` (${swatch.pantone_code})` : ""}`
                : "Add a new fabric option to the catalog."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-gray-400 hover:text-gray-700 text-lg leading-none p-1"
            aria-label="Close"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {generalError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-2 mb-3 text-xs text-red-700">
            <i className="fa-solid fa-triangle-exclamation mr-1" />
            {generalError}
          </div>
        )}

        {/* Live preview swatch */}
        <div className="mb-4 flex items-center gap-3 p-3 rounded-md border border-gray-200 bg-gray-50">
          <div
            className="w-16 h-16 rounded-md border border-gray-300 shrink-0"
            style={{ backgroundColor: previewBg }}
            aria-hidden="true"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 truncate">
              {form.name || "(Unnamed)"}
            </p>
            <p className="text-[11px] text-gray-500 font-mono">
              {(form.hex_color || "—").toUpperCase()}
            </p>
            <p className="text-[11px] text-gray-500">
              {form.fabric_type || "—"}
              {form.gsm ? ` · ${form.gsm} GSM` : ""}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Name + color family */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                disabled={submitting}
                placeholder="e.g. Jet Black 240"
                className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.name ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.name && (
                <p className="text-xs text-red-600 mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Color Family
              </label>
              <select
                value={form.color_family}
                onChange={(e) => update("color_family", e.target.value)}
                disabled={submitting}
                className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.color_family ? "border-red-300" : "border-gray-300"
                }`}
              >
                <option value="">— Select —</option>
                {COLOR_FAMILIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.color_family && (
                <p className="text-xs text-red-600 mt-1">{errors.color_family}</p>
              )}
            </div>
          </div>

          {/* Hex color */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Hex Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.hex_color || "#000000"}
                onChange={(e) => update("hex_color", e.target.value)}
                disabled={submitting}
                className="w-12 h-9 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={form.hex_color}
                onChange={(e) => update("hex_color", e.target.value)}
                disabled={submitting}
                placeholder="#000000"
                className={`flex-1 text-sm font-mono border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.hex_color ? "border-red-300" : "border-gray-300"
                }`}
              />
            </div>
            {errors.hex_color && (
              <p className="text-xs text-red-600 mt-1">{errors.hex_color}</p>
            )}
          </div>

          {/* Fabric type + GSM */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Fabric Type
              </label>
              <input
                type="text"
                value={form.fabric_type}
                onChange={(e) => update("fabric_type", e.target.value)}
                disabled={submitting}
                placeholder="e.g. CVC, 100% Cotton, Cotton Fleece"
                className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.fabric_type ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.fabric_type && (
                <p className="text-xs text-red-600 mt-1">{errors.fabric_type}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                GSM
              </label>
              <input
                type="number"
                min="0"
                max="1000"
                value={form.gsm}
                onChange={(e) => update("gsm", e.target.value)}
                disabled={submitting}
                placeholder="240"
                className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.gsm ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.gsm && (
                <p className="text-xs text-red-600 mt-1">{errors.gsm}</p>
              )}
            </div>
          </div>

          {/* Collection + Supplier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Collection
              </label>
              <input
                type="text"
                value={form.collection}
                onChange={(e) => update("collection", e.target.value)}
                disabled={submitting}
                placeholder="e.g. 220-240 GSM Brights"
                className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.collection ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.collection && (
                <p className="text-xs text-red-600 mt-1">{errors.collection}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Supplier
              </label>
              <select
                value={form.supplier_id}
                onChange={(e) => update("supplier_id", e.target.value)}
                disabled={submitting || loadingSuppliers}
                className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.supplier_id ? "border-red-300" : "border-gray-300"
                }`}
              >
                <option value="">
                  {loadingSuppliers ? "Loading…" : "— Select —"}
                </option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {errors.supplier_id && (
                <p className="text-xs text-red-600 mt-1">{errors.supplier_id}</p>
              )}
            </div>
          </div>

          {/* Photo */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Swatch Photo{" "}
              <span className="text-gray-400 font-normal">
                (jpg/png/webp ≤5MB — physical fabric shot is ideal)
              </span>
            </label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              disabled={submitting}
              className="w-full text-sm text-gray-700 file:mr-3 file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-xs file:text-gray-700 hover:file:bg-gray-200"
            />
            {errors.photo && (
              <p className="text-xs text-red-600 mt-1">{errors.photo}</p>
            )}
            {(photoPreview || swatch?.photo_url) && (
              <div className="mt-2 rounded-md border border-gray-200 p-2 bg-gray-50">
                <img
                  src={photoPreview || swatch?.photo_url}
                  alt="Swatch preview"
                  className="max-h-32 mx-auto"
                />
                {!photoPreview && swatch?.photo_url && (
                  <p className="text-[10px] text-gray-500 text-center mt-1">
                    Current photo (upload a new one to replace)
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              disabled={submitting}
              placeholder="Special handling, supplier MOQ, dye lot notes…"
              className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.notes ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors.notes && (
              <p className="text-xs text-red-600 mt-1">{errors.notes}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm rounded text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 text-sm rounded bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {submitting ? (
              <>
                <i className="fa-solid fa-spinner fa-spin mr-1" />
                Saving…
              </>
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Create Swatch"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SwatchFormModal;
