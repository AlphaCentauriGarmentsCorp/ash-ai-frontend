import React from "react";

/**
 * The default size set offered for per-size base pricing. Leaving a size blank
 * means "use the Base Price for this size" — the backend's priceForSize() falls
 * back to the single `price` for any size not present in size_prices.
 *
 * Sizes are intentionally just labels; the Superadmin can extend this list
 * later (e.g. add 4XL) without a schema change, because size_prices is a free
 * JSON map keyed by the size label.
 */
export const DEFAULT_SIZE_KEYS = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

/**
 * Per-size base price editor.
 *
 * Props:
 *  - value:    object map { "S": 200, "L": 210, ... } (may be empty)
 *  - onChange: (nextMap) => void
 *  - disabled: boolean
 *  - sizeKeys: optional override of the size labels to show
 */
const SizePriceGrid = ({ value = {}, onChange, disabled = false, sizeKeys = DEFAULT_SIZE_KEYS }) => {
  const handleSizeChange = (size, raw) => {
    const next = { ...(value || {}) };

    if (raw === "" || raw === null || raw === undefined) {
      // Blank clears the per-size override for this size.
      delete next[size];
    } else {
      next[size] = raw;
    }

    onChange?.(next);
  };

  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Per-Size Prices <span className="text-gray-400">(optional)</span>
      </label>
      <p className="text-xs text-gray-500 mb-2">
        Set a base price for each size. Leave a size blank to use the Base Price
        above. This replaces the old &quot;Unit Price&quot; that used to be typed
        on each quotation.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {sizeKeys.map((size) => (
          <div key={size}>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {size}
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                ₱
              </span>
              <input
                type="number"
                min="0"
                max="999999.99"
                step="0.01"
                value={value?.[size] ?? ""}
                onChange={(e) => handleSizeChange(size, e.target.value)}
                disabled={disabled}
                placeholder="—"
                className="w-full pl-6 pr-2 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary/30 disabled:bg-gray-100"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Normalize the UI map into a clean { size: number } object for the API,
 * dropping blank / non-numeric / negative entries. Returns {} when nothing is
 * set, so the backend simply uses the single base price.
 */
export const buildSizePricesPayload = (map) => {
  const out = {};
  Object.entries(map || {}).forEach(([size, raw]) => {
    if (raw === "" || raw === null || raw === undefined) return;
    const num = Number(raw);
    if (Number.isFinite(num) && num >= 0) {
      out[size] = num;
    }
  });
  return out;
};

export default SizePriceGrid;
