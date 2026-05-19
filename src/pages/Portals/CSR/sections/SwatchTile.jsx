import React from "react";

/**
 * Phase 6-B — Single fabric swatch visual tile.
 *
 * Matches the PDF catalog aesthetic — solid color block (hex) with
 * pantone code + name underneath. Photo (if uploaded) shows in a
 * corner badge.
 *
 * Stock status indicator dot appears when material_id is linked and
 * the backend has resolved stock_status (in_stock / low_stock /
 * out_of_stock / unknown).
 *
 * Props:
 *   swatch    {...} (required) — full swatch object from API
 *   onClick() — open detail / edit
 *   selected  boolean — for picker integration (Phase 6-C). Unused here.
 */

const STOCK_DOT = {
  in_stock:     { color: "bg-emerald-500", label: "In Stock" },
  low_stock:    { color: "bg-amber-500",   label: "Low Stock" },
  out_of_stock: { color: "bg-red-500",     label: "Out of Stock" },
  unknown:      { color: "bg-gray-300",    label: "Unknown" },
};

/**
 * Pick a readable text color (black or white) for a given hex.
 * Used so the pantone code stays legible on any swatch.
 */
const getContrastColor = (hex) => {
  if (!hex) return "#000";
  const clean = hex.replace("#", "").substring(0, 6);
  if (clean.length < 6) return "#000";
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  // Relative luminance (per WCAG)
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.55 ? "#1f2937" : "#ffffff";
};

const SwatchTile = ({ swatch, onClick, selected = false }) => {
  const bgColor = swatch.hex_color || "#e5e7eb";
  const textColor = getContrastColor(swatch.hex_color);
  const stockMeta = STOCK_DOT[swatch.stock_status] || null;

  return (
    <button
      type="button"
      onClick={() => onClick?.(swatch)}
      className={
        "group block w-full text-left rounded-lg overflow-hidden border-2 transition-all hover:shadow-md " +
        (selected
          ? "border-primary ring-2 ring-primary/30"
          : "border-gray-200 hover:border-gray-400")
      }
      aria-label={`${swatch.name} — ${swatch.pantone_code || "no pantone"}`}
    >
      {/* Color block */}
      <div
        className="relative h-24 sm:h-28 w-full flex items-end p-2"
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        {/* Photo badge — only when there's an uploaded swatch photo */}
        {swatch.photo_url && (
          <img
            src={swatch.photo_url}
            alt=""
            className="absolute top-2 right-2 w-8 h-8 rounded border border-white/40 object-cover shadow-sm"
            loading="lazy"
          />
        )}

        {/* Stock dot — top-left */}
        {stockMeta && (
          <span
            className={`absolute top-2 left-2 w-2.5 h-2.5 rounded-full ${stockMeta.color} ring-2 ring-white/40`}
            title={stockMeta.label}
          />
        )}

        {/* Pantone code in the corner */}
        {swatch.pantone_code && (
          <span
            className="text-[10px] font-mono opacity-80"
            style={{ color: textColor }}
          >
            {swatch.pantone_code}
          </span>
        )}
      </div>

      {/* Caption strip */}
      <div className="bg-white px-2 py-1.5 border-t border-gray-100">
        <p className="text-xs font-semibold text-gray-900 truncate" title={swatch.name}>
          {swatch.name}
        </p>
        <p className="text-[10px] text-gray-500 flex items-center justify-between gap-1">
          <span className="truncate">
            {swatch.fabric_type || "—"}
            {swatch.gsm ? ` · ${swatch.gsm} GSM` : ""}
          </span>
          {swatch.hex_color && (
            <span className="font-mono text-gray-400 shrink-0">
              {swatch.hex_color.toUpperCase()}
            </span>
          )}
        </p>
      </div>
    </button>
  );
};

export default SwatchTile;
