import React, { useEffect, useState } from "react";
import FileUpload from "../form/FileUpload";
import { quotationLabelApi } from "../../api/quotationLabelApi";

/**
 * Issue 7 — Brand Label + Care/Size Label spec (SHARED component).
 *
 * Built once and rendered by BOTH Quotation.jsx (Add) and EditQuotation.jsx
 * (Edit) to stop the historical two-file drift. The parent owns the state
 * (so each page keeps its own form lifecycle); this component is the shared
 * presentation + the locked-option fetching + the upload UI.
 *
 * It does NOT touch the "Apparel Tags / Pattern Tags" filters (those are a
 * separate, working feature). It is a new section under Apparel Information.
 *
 * ── Data shape (controlled) ──────────────────────────────────────────────
 * brandLabel / careLabel are objects of the form:
 *   { enabled, material, method, placement, measurement, notes }
 * labelDesign is the ONE shared artwork upload, shape:
 *   { inputType: "file" | "link", file: File|null, link: string,
 *     existingPath: string|null }   // existingPath = already-saved value (Edit)
 *
 * ── Props ────────────────────────────────────────────────────────────────
 *   brandLabel, careLabel           current label specs
 *   onBrandLabelChange(next)        replace brand label spec
 *   onCareLabelChange(next)         replace care/size label spec
 *   labelDesign                     current shared design upload state
 *   onLabelDesignChange(next)       replace design upload state
 *
 * The empty/default spec is exported as EMPTY_LABEL for parents to seed state.
 */

export const EMPTY_LABEL = {
  enabled: false,
  material: "",
  method: "",
  placement: "",
  measurement: "",
  notes: "",
};

export const EMPTY_LABEL_DESIGN = {
  inputType: "file", // "file" | "link"
  file: null,
  link: "",
  existingPath: null,
};

const SelectField = ({ label, value, options, onChange, placeholder }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={`${opt.value}-${opt.id ?? ""}`} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

/**
 * One label spec card (Brand or Care/Size). Both labels share the exact same
 * structure (material + method + placement), per the confirmed spec.
 */
const LabelCard = ({ title, hint, spec, onChange, options }) => {
  const set = (patch) => onChange({ ...spec, ...patch });

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 space-y-2">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={!!spec.enabled}
          onChange={(e) => set({ enabled: e.target.checked })}
          className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary/30"
        />
        <span className="text-xs font-semibold text-primary">{title}</span>
      </label>
      {hint ? <p className="text-[11px] text-gray-500">{hint}</p> : null}

      {spec.enabled && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <SelectField
            label="Material"
            value={spec.material}
            options={options.materials}
            onChange={(v) => set({ material: v })}
            placeholder="Select material"
          />
          <SelectField
            label="Method"
            value={spec.method}
            options={options.methods}
            onChange={(v) => set({ method: v })}
            placeholder="Select method"
          />
          <SelectField
            label="Placement"
            value={spec.placement}
            options={options.placements}
            onChange={(v) => set({ placement: v })}
            placeholder="Select placement"
          />
          <SelectField
            label="Measurement (optional)"
            value={spec.measurement}
            options={options.measurements}
            onChange={(v) => set({ measurement: v })}
            placeholder="Select measurement"
          />
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes (optional)</label>
            <input
              type="text"
              value={spec.notes || ""}
              onChange={(e) => set({ notes: e.target.value })}
              placeholder="Any special instruction for this label"
              className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
      )}
    </div>
  );
};

const LabelSpecSection = ({
  brandLabel,
  careLabel,
  onBrandLabelChange,
  onCareLabelChange,
  labelDesign,
  onLabelDesignChange,
}) => {
  const [options, setOptions] = useState({
    materials: [],
    methods: [],
    placements: [],
    measurements: [],
  });
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoadingOptions(true);
        const data = await quotationLabelApi.options();
        if (!active) return;
        setOptions({
          materials: data?.materials || [],
          methods: data?.methods || [],
          placements: data?.placements || [],
          measurements: data?.measurements || [],
        });
        setOptionsError("");
      } catch (err) {
        if (!active) return;
        console.error("Failed to load label options:", err);
        setOptionsError("Could not load label options. Try reloading.");
      } finally {
        if (active) setLoadingOptions(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const design = labelDesign || EMPTY_LABEL_DESIGN;
  const setDesign = (patch) => onLabelDesignChange({ ...design, ...patch });

  const anyLabelEnabled = !!brandLabel?.enabled || !!careLabel?.enabled;

  return (
    <div className="pt-8 border-t border-gray-100 space-y-3">
      <h3 className="text-xs font-semibold text-primary uppercase tracking-wide">
        Labels (Brand &amp; Care/Size)
      </h3>

      {loadingOptions ? (
        <p className="text-[11px] text-gray-400">Loading label options…</p>
      ) : optionsError ? (
        <p className="text-[11px] text-red-500">{optionsError}</p>
      ) : (
        <>
          <LabelCard
            title="Brand Label"
            hint="Neck/brand label — material, method and placement."
            spec={brandLabel || EMPTY_LABEL}
            onChange={onBrandLabelChange}
            options={options}
          />

          <LabelCard
            title="Care / Size Label"
            hint="Care/size label — same structure (material, method, placement)."
            spec={careLabel || EMPTY_LABEL}
            onChange={onCareLabelChange}
            options={options}
          />

          {/* ONE shared label-design upload (covers both labels). Mirrors the
              Issue-6 custom-pattern upload: file OR link. Optional. */}
          {anyLabelEnabled && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2">
              <label className="block text-xs font-semibold text-primary">
                Label Design (optional)
              </label>
              <p className="text-[11px] text-gray-500">
                Attach the label artwork — one file or link, shared by both labels.
              </p>

              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setDesign({ inputType: "file" })}
                  className={`px-2 py-1 text-[11px] rounded border ${
                    (design.inputType || "file") === "file"
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-gray-600 border-gray-200"
                  }`}
                >
                  File Upload
                </button>
                <button
                  type="button"
                  onClick={() => setDesign({ inputType: "link" })}
                  className={`px-2 py-1 text-[11px] rounded border ${
                    design.inputType === "link"
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-gray-600 border-gray-200"
                  }`}
                >
                  Link
                </button>
              </div>

              {design.inputType === "link" ? (
                <input
                  type="url"
                  value={design.link || ""}
                  onChange={(e) => setDesign({ link: e.target.value })}
                  placeholder="https://drive.google.com/... or Canva link"
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                />
              ) : (
                <FileUpload
                  label="Upload Label Design"
                  name="label-design"
                  value={design.file ? [design.file] : []}
                  onChange={(e) => setDesign({ file: e.target.value?.[0] || null })}
                  acceptedTypes="image/*,.svg"
                  multiple={false}
                  hideUploadWhenHasFiles
                  hidePreviewWhenEmpty
                  className="px-0"
                />
              )}

              {/* Show the currently-saved design (Edit) when no new one is staged. */}
              {design.existingPath && !design.file && (design.inputType !== "link" || !design.link) ? (
                <p className="text-[11px] text-gray-500 break-all">
                  Current: {design.existingPath}
                </p>
              ) : null}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LabelSpecSection;
