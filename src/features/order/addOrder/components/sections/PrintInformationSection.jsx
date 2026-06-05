import React from "react";
import { Section } from "../common/Section";
import Select from "../../../../../components/form/Select";
import Input from "../../../../../components/form/Input";

/**
 * Resolve the print method "family" from the selected method NAME so the
 * section can show the right fields. Mirrors the Quotation form's
 * resolvePrintMethodKey, but reads the name string (the order form stores
 * print_method as a name, not an id).
 */
const resolveMethodKey = (printMethodName = "") => {
  const name = String(printMethodName).toLowerCase();
  if (name.includes("dtf") || name.includes("direct-to-film")) return "dtf";
  if (name.includes("embroid")) return "embroidery";
  if (name.includes("subli")) return "sublimation";
  if (name.includes("silk") || name.includes("screen")) return "silkscreen";
  return name ? "other" : "";
};

/**
 * PrintInformationSection — order-form counterpart of the Quotation form's
 * Print Information block. The visible fields depend on the chosen Print
 * Method:
 *   - Silkscreen  → Special Print (DB-managed) + Print Area (Regular / Full)
 *   - Embroidery  → Size (small flat-rate / large manual) + manual price
 *   - Sublimation → Type (jersey/mesh full / partial manual) + manual price
 *   - DTF         → per-square-inch guidance note
 *
 * Special Print and Print Area write to flat formData fields via handleChange.
 * Embroidery / Sublimation config writes to formData.print_method_config via
 * onPrintConfigChange(field, value).
 */
export const PrintInformationSection = ({
  formData,
  handleChange,
  onPrintConfigChange,
  errors = {},
  specialPrintOptions = [],
  onPrintPartsChange,
}) => {
  const methodKey = resolveMethodKey(formData.print_method);

  // Nothing useful to configure until a print method is chosen.
  if (!methodKey) {
    return (
      <Section title="Print Information">
        <p className="text-sm text-gray-500">
          Select a <strong>Print Method</strong> above to configure print
          options.
        </p>
      </Section>
    );
  }

  const config = formData.print_method_config || {};

  // ── Print-parts configurator helpers (silkscreen / DTF) ──────────────
  const parts = formData.print_parts || [];
  const genId = () =>
    (typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `pp_${Date.now()}_${Math.random().toString(36).slice(2)}`);

  const addPart = () => {
    const base =
      methodKey === "dtf"
        ? { id: genId(), part: "", width: "", height: "", pieces: "" }
        : {
            id: genId(),
            part: "",
            // Change 12: one print type + one colour count per placement.
            // Seed the type from the job-level Print Area (still overridable).
            printType:
              String(formData.print_area || "").toLowerCase() === "full"
                ? "full_print"
                : "regular",
            numColors: "",
          };
    onPrintPartsChange?.([...parts, base]);
  };
  const updatePart = (id, field, value) =>
    onPrintPartsChange?.(
      parts.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
  const removePart = (id) =>
    onPrintPartsChange?.(parts.filter((p) => p.id !== id));

  return (
    <Section title="Print Information">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* ── Silkscreen: Special Print + Print Area ─────────────────── */}
        {methodKey === "silkscreen" && (
          <>
            <Select
              label="Special Print (optional)"
              name="special_print"
              options={specialPrintOptions}
              value={formData.special_print || ""}
              onChange={handleChange}
              placeholder="Select special print"
              searchable
              error={errors.special_print}
            />

            <Select
              label="Print Area"
              name="print_area"
              options={[
                { value: "Regular", label: "Regular" },
                { value: "Full", label: "Full" },
              ]}
              value={formData.print_area || "Regular"}
              onChange={handleChange}
              placeholder="Select print area"
              error={errors.print_area}
            />
          </>
        )}

        {/* ── Embroidery: size + manual price for large ──────────────── */}
        {methodKey === "embroidery" && (
          <>
            <Select
              label="Embroidery Size"
              name="embroidery_size"
              options={[
                { value: "small", label: "Small (pocket / left chest) — flat rate" },
                { value: "large", label: "Large — manual price" },
              ]}
              value={config.embroidery_size || "small"}
              onChange={(e) => onPrintConfigChange("embroidery_size", e.target.value)}
              placeholder="Select embroidery size"
            />

            {config.embroidery_size === "large" && (
              <Input
                label="Manual Price / piece (₱)"
                name="embroidery_manual_price"
                type="number"
                min="0"
                step="0.01"
                value={config.embroidery_manual_price ?? ""}
                onChange={(e) =>
                  onPrintConfigChange("embroidery_manual_price", e.target.value)
                }
                placeholder="Subcontractor quote + markup"
              />
            )}
          </>
        )}

        {/* ── Sublimation: type + manual price for partial ───────────── */}
        {methodKey === "sublimation" && (
          <>
            <Select
              label="Sublimation Type"
              name="sublimation_type"
              options={[
                { value: "jersey_full", label: "Full Jersey — flat rate" },
                { value: "mesh_shorts_full", label: "Full Mesh Shorts — flat rate" },
                { value: "partial", label: "Partial / Other — manual price" },
              ]}
              value={config.sublimation_type || "partial"}
              onChange={(e) => onPrintConfigChange("sublimation_type", e.target.value)}
              placeholder="Select sublimation type"
            />

            {config.sublimation_type === "partial" && (
              <Input
                label="Manual Price / piece (₱)"
                name="sublimation_manual_price"
                type="number"
                min="0"
                step="0.01"
                value={config.sublimation_manual_price ?? ""}
                onChange={(e) =>
                  onPrintConfigChange("sublimation_manual_price", e.target.value)
                }
                placeholder="e.g. 200"
              />
            )}
          </>
        )}

        {/* ── DTF: guidance note (priced per square inch) ────────────── */}
        {methodKey === "dtf" && (
          <div className="sm:col-span-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
            <p className="text-xs text-amber-800">
              DTF is priced per square inch. Each placement&apos;s design{" "}
              <strong>width</strong>, <strong>height</strong>, and{" "}
              <strong>pieces</strong> are entered below. The rate is set by the
              Superadmin in Pricing Settings.
            </p>
          </div>
        )}
      </div>

      {/* ── Placement configurator (drives engine pricing) ───────────── */}
      {(methodKey === "silkscreen" || methodKey === "dtf") && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-primary">
              {methodKey === "dtf" ? "DTF Placements" : "Print Placements & Colors"}
            </label>
            <button
              type="button"
              onClick={addPart}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:opacity-90"
            >
              <i className="fa-solid fa-plus mr-1"></i> Add Placement
            </button>
          </div>

          {parts.length === 0 && (
            <p className="text-xs text-gray-500 mb-2">
              {methodKey === "dtf"
                ? "Add each DTF placement with its design size and piece count so the price can be computed."
                : "Add each print placement and its number of colors so the silkscreen price can be computed."}
            </p>
          )}

          <div className="space-y-2">
            {parts.map((p, idx) => (
              <div
                key={p.id}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end border border-gray-200 rounded-lg p-2 bg-white"
              >
                <div className="sm:col-span-4">
                  <Input
                    label={idx === 0 ? "Placement" : ""}
                    name={`part_${p.id}`}
                    type="text"
                    value={p.part || ""}
                    onChange={(e) => updatePart(p.id, "part", e.target.value)}
                    placeholder="e.g. Front, Back, Left Chest"
                  />
                </div>

                {methodKey === "silkscreen" ? (
                  <>
                    <div className="sm:col-span-3">
                      <Select
                        label={idx === 0 ? "Print Type" : ""}
                        name={`pt_${p.id}`}
                        options={[
                          { value: "regular", label: "Regular" },
                          { value: "full_print", label: "Full-Print" },
                        ]}
                        value={p.printType || "regular"}
                        onChange={(e) =>
                          updatePart(p.id, "printType", e.target.value)
                        }
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <Input
                        label={idx === 0 ? "Number of Colors" : ""}
                        name={`nc_${p.id}`}
                        type="number"
                        min="0"
                        value={p.numColors ?? ""}
                        onChange={(e) =>
                          updatePart(p.id, "numColors", e.target.value)
                        }
                        placeholder="0"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="sm:col-span-2">
                      <Input
                        label={idx === 0 ? "Width (in)" : ""}
                        name={`w_${p.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={p.width ?? ""}
                        onChange={(e) => updatePart(p.id, "width", e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Input
                        label={idx === 0 ? "Height (in)" : ""}
                        name={`h_${p.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={p.height ?? ""}
                        onChange={(e) => updatePart(p.id, "height", e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Input
                        label={idx === 0 ? "Pieces" : ""}
                        name={`pc_${p.id}`}
                        type="number"
                        min="0"
                        value={p.pieces ?? ""}
                        onChange={(e) => updatePart(p.id, "pieces", e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </>
                )}

                <div className="sm:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removePart(p.id)}
                    className="px-2 py-2 text-red-500 hover:text-red-700"
                    title="Remove placement"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Section>
  );
};
