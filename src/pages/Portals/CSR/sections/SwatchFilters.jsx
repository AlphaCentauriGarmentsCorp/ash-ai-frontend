import React from "react";

/**
 * Phase 6-B — Swatch catalog filter bar.
 *
 * Three filter dimensions:
 *   - fabric_type  (CVC, 100% Cotton, Cotton Fleece, etc.)
 *   - gsm          (240, 280, 320)
 *   - color_family (Black, White, Blue, Green, etc.)
 *
 * Filter values are extracted from the loaded swatches (no separate
 * lookup endpoint needed). Active filters render as removable pills
 * below the controls.
 *
 * Props:
 *   swatches  array — used to derive the dropdown option lists
 *   filters   { fabric_type, gsm, color_family, search }
 *   onChange(next)
 *   onClear()
 */

const SwatchFilters = ({ swatches = [], filters, onChange, onClear }) => {
  const fabricTypes = [...new Set(swatches.map((s) => s.fabric_type).filter(Boolean))].sort();
  const gsms        = [...new Set(swatches.map((s) => s.gsm).filter(Boolean))].sort((a, b) => a - b);
  const families    = [...new Set(swatches.map((s) => s.color_family).filter(Boolean))].sort();

  const setField = (key, val) => onChange({ ...filters, [key]: val || null });
  const hasAnyFilter =
    filters.fabric_type || filters.gsm || filters.color_family || filters.search;

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row md:items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={filters.search || ""}
            onChange={(e) => setField("search", e.target.value)}
            placeholder="Search name, pantone, hex…"
            className="w-full text-sm border border-gray-300 rounded-md pl-8 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <i className="fa-solid fa-magnifying-glass text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 text-xs" />
        </div>

        {/* Fabric type */}
        <select
          value={filters.fabric_type || ""}
          onChange={(e) => setField("fabric_type", e.target.value)}
          className="text-xs border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Fabrics</option>
          {fabricTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {/* GSM */}
        <select
          value={filters.gsm || ""}
          onChange={(e) => setField("gsm", e.target.value)}
          className="text-xs border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All GSM</option>
          {gsms.map((g) => (
            <option key={g} value={g}>
              {g} GSM
            </option>
          ))}
        </select>

        {/* Color family */}
        <select
          value={filters.color_family || ""}
          onChange={(e) => setField("color_family", e.target.value)}
          className="text-xs border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Colors</option>
          {families.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>

        {/* Clear */}
        {hasAnyFilter && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-gray-600 hover:text-gray-900 hover:underline inline-flex items-center gap-1 px-2 py-1.5"
          >
            <i className="fa-solid fa-xmark" />
            Clear all
          </button>
        )}
      </div>

      {/* Active filter pill row */}
      {hasAnyFilter && (
        <div className="flex flex-wrap gap-1">
          {filters.search && (
            <FilterPill
              label={`Search: "${filters.search}"`}
              onRemove={() => setField("search", null)}
            />
          )}
          {filters.fabric_type && (
            <FilterPill
              label={`Fabric: ${filters.fabric_type}`}
              onRemove={() => setField("fabric_type", null)}
            />
          )}
          {filters.gsm && (
            <FilterPill
              label={`GSM: ${filters.gsm}`}
              onRemove={() => setField("gsm", null)}
            />
          )}
          {filters.color_family && (
            <FilterPill
              label={`Color: ${filters.color_family}`}
              onRemove={() => setField("color_family", null)}
            />
          )}
        </div>
      )}
    </div>
  );
};

const FilterPill = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-semibold">
    {label}
    <button
      type="button"
      onClick={onRemove}
      className="hover:text-blue-900 ml-0.5"
      aria-label={`Remove ${label}`}
    >
      <i className="fa-solid fa-xmark text-[9px]" />
    </button>
  </span>
);

export default SwatchFilters;
