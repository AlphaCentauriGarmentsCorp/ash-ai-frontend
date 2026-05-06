import React from "react";
import { Section } from "../common/Section";
import { FileUploadSection } from "../common/FileUploadSection";
import Select from "../../../../../components/form/Select";
import Textarea from "../../../../../components/form/Textarea";
import { apparelPlacementMeasurements } from "../../../../../constants/formOptions/orderOptions";

const resolveImageUrl = (part) => {
  const rawPath = String(
    part?.image_link || part?.image_url || part?.image_path || part?.image || ""
  ).trim();
  if (!rawPath) return "";
  if (rawPath.startsWith("http") || rawPath.startsWith("data:")) return rawPath;
  const apiUrl = import.meta.env.VITE_API_URL || "";
  let origin = "";
  try { origin = new URL(apiUrl).origin; } catch { origin = ""; }
  if (rawPath.startsWith("/storage/")) return origin ? `${origin}${rawPath}` : rawPath;
  if (rawPath.startsWith("storage/")) return origin ? `${origin}/${rawPath}` : `/${rawPath}`;
  const cleaned = rawPath.replace(/^\/+/, "");
  return origin ? `${origin}/storage/${cleaned}` : `/storage/${cleaned}`;
};

/**
 * DesignFilesSection
 *
 * Props:
 *  - formData, handleFileChange, errors  — standard form props
 *  - printParts  — array from print_parts_json (passed from AddNewOrder when converting quotation)
 */
export const DesignFilesSection = ({
  formData,
  handleChange,
  handleFileChange,
  errors,
  printParts = [],
}) => (
  <Section title="Design Files & Mockups">
    <div className="px-2 lg:px-25 space-y-2">

      {/* ── Print Parts from Quotation (read-only) ──────────────────────── */}
      {printParts.length > 0 && (
        <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50/50 overflow-hidden">
          <div className="px-5 py-3 border-b border-blue-100 flex items-center gap-2">
            <i className="fas fa-images text-blue-500 text-sm"></i>
            <span className="text-sm font-semibold text-blue-800">
              Print Parts (from Quotation)
            </span>
            <span className="text-[11px] text-blue-400 italic ml-1">read-only</span>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto rounded-lg border border-blue-100">
              <table className="w-full text-xs bg-white">
                <thead className="bg-blue-50 border-b border-blue-100">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-blue-700">Part</th>
                    <th className="px-3 py-2 text-left font-semibold text-blue-700">Uploaded Image</th>
                    <th className="px-3 py-2 text-right font-semibold text-blue-700"># of Units</th>
                    <th className="px-3 py-2 text-right font-semibold text-blue-700">Price/Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-50">
                  {printParts.map((part, idx) => {
                    const imageUrl = resolveImageUrl(part);
                    const partName = part.part || part.name || `Part ${idx + 1}`;
                    const unitCount = Number(
                      part.unit_count ?? part.unitCount ?? part.color_count ?? part.colorCount ?? 0
                    );
                    const pricePerUnit =
                      part.price_per_unit ?? part.pricePerUnit ??
                      part.price_per_color ?? part.pricePerColor ?? 0;
                    const fmt = (v) =>
                      `₱${(Number(v) || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`;

                    return (
                      <tr key={idx} className="hover:bg-blue-50/40">
                        <td className="px-3 py-2 font-medium text-gray-800">{partName}</td>
                        <td className="px-3 py-2">
                          {imageUrl ? (
                            <a href={imageUrl} target="_blank" rel="noreferrer"
                              className="inline-flex items-center gap-2">
                              <img
                                src={imageUrl}
                                alt={partName}
                                className="h-12 w-12 rounded border border-gray-200 object-cover bg-white"
                              />
                              <span className="text-xs text-primary hover:underline">View</span>
                            </a>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="h-12 w-12 rounded border border-gray-200 bg-gray-100 flex items-center justify-center">
                                <i className="fas fa-image text-gray-300 text-lg"></i>
                              </div>
                              <span className="text-xs text-gray-400">No image</span>
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right">{unitCount}</td>
                        <td className="px-3 py-2 text-right font-semibold text-primary">
                          {fmt(pricePerUnit)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Uploadable files ────────────────────────────────────────────── */}
      <FileUploadSection
        label="Design Files"
        name="design_files"
        value={formData.design_files || []}
        onChange={handleFileChange}
        error={errors.design_files}
      />

      <FileUploadSection
        label="Design Mockup"
        name="design_mockup"
        value={formData.design_mockup || []}
        onChange={handleFileChange}
        error={errors.design_mockup}
        acceptedTypes=".jpg,.jpeg,.png,.webp"
      />

      <FileUploadSection
        label="Size Label"
        name="size_label_files"
        value={formData.size_label_files || []}
        onChange={handleFileChange}
        error={errors.size_label_files}
      />

      <div className="px-6 py-4">
        <Select
          label="Placement Measurements"
          name="placement_measurements"
          options={apparelPlacementMeasurements}
          value={formData.placement_measurements || ""}
          onChange={handleChange}
          placeholder="Select Placement Measurements"
          searchable
          error={errors.placement_measurements}
        />

        <Textarea
          label="Notes"
          name="notes"
          value={formData.notes || ""}
          onChange={handleChange}
          rows={6}
          resizable={true}
        />
      </div>
    </div>
  </Section>
);