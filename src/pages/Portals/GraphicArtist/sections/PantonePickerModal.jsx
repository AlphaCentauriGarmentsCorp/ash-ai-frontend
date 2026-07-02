import React, { useMemo, useState } from "react";

/**
 * GA Portal CP9 — detailed Pantone picker modal.
 *
 * Full parity with the Add Order SwatchPickerModal the CSR already
 * knows: search (name / code / hex), an organizing filter dropdown, a
 * favorites shelf, and rich tiles — the code overlaid on the colour
 * block, a selection dot, the name, and the hex value.
 *
 * Two adaptations, because pantone rows carry no fabric/GSM/pick-count
 * data:
 *   - the filter is a COLOR FAMILY dropdown, derived from each
 *     pantone's hue (Red…White) — no backend column needed
 *   - the shelf is "Ginamit sa order na ito": pantones already used
 *     across THIS order's placements (passed in via usedPantones), the
 *     most useful shortlist for an artist repeating colours across
 *     locations. A global most-used (pick counts) would need a small
 *     backend addition — parked.
 *
 * Props:
 *   open          boolean
 *   options       [{id, name, hexcolor, pantone_code}] (deduped)
 *   usedPantones  same shape — already used on this order's placements
 *   currentValue  the slot's current pick ({id?, pantone_code?}) — dots
 *                 the matching tile
 *   onClose()
 *   onSelect(option)
 */

// ── Colour-family derivation (hex → HSL → bucket) ────────────────

const hexToHsl = (hex) => {
  if (!hex) return null;
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r) h = 60 * (((g - b) / d) % 6);
    else if (max === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
    if (h < 0) h += 360;
  }
  return { h, s, l };
};

const FAMILY_ORDER = [
  "Red", "Orange", "Yellow", "Green", "Blue", "Violet",
  "Pink", "Brown", "Gray", "Black", "White",
];

const colorFamilyOf = (hex) => {
  const hsl = hexToHsl(hex);
  if (!hsl) return "Gray";
  const { h, s, l } = hsl;
  if (l <= 0.12) return "Black";
  if (l >= 0.93 && s <= 0.25) return "White";
  if (s <= 0.12) return "Gray";
  if (h >= 15 && h < 48 && l < 0.45) return "Brown";
  if (h < 15 || h >= 345) return "Red";
  if (h < 48) return "Orange";
  if (h < 70) return "Yellow";
  if (h < 165) return "Green";
  if (h < 255) return "Blue";
  if (h < 290) return "Violet";
  return "Pink";
};

// ── Tile (mirrors SwatchTile's layout for pantones) ──────────────

const PantoneTile = ({ option, selected, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(option)}
    className={`text-left border rounded-lg overflow-hidden bg-white hover:border-primary ${
      selected ? "border-primary ring-1 ring-primary" : "border-gray-200"
    }`}
  >
    <div
      className="relative h-20 w-full"
      style={{ background: option.hexcolor || "#e5e7eb" }}
    >
      <span
        className={`absolute top-2 left-2 inline-block w-3.5 h-3.5 rounded-full border-2 ${
          selected
            ? "bg-primary border-white"
            : "bg-white/70 border-white/90"
        }`}
      />
      <span className="absolute bottom-1.5 left-2 text-[10px] font-mono text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.7)]">
        {option.pantone_code || "—"}
      </span>
    </div>
    <div className="px-2 py-1.5 flex items-center justify-between gap-2">
      <p className="text-xs font-semibold text-gray-900 truncate">
        {option.name || "—"}
      </p>
      <p className="text-[10px] text-gray-400 uppercase shrink-0">
        {option.hexcolor || ""}
      </p>
    </div>
  </button>
);

// ── Modal ────────────────────────────────────────────────────────

const PantonePickerModal = ({
  open,
  options = [],
  usedPantones = [],
  currentValue = null,
  onClose,
  onSelect,
}) => {
  const [search, setSearch] = useState("");
  const [family, setFamily] = useState("");

  // Family index computed once per catalog.
  const withFamily = useMemo(
    () => options.map((o) => ({ ...o, _family: colorFamilyOf(o.hexcolor) })),
    [options],
  );

  const familiesPresent = useMemo(() => {
    const present = new Set(withFamily.map((o) => o._family));
    return FAMILY_ORDER.filter((f) => present.has(f));
  }, [withFamily]);

  const filtered = useMemo(() => {
    let list = withFamily;
    if (family) list = list.filter((o) => o._family === family);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (o) =>
          (o.pantone_code || "").toLowerCase().includes(q) ||
          (o.name || "").toLowerCase().includes(q) ||
          (o.hexcolor || "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [withFamily, family, search]);

  const isSelected = (o) => {
    if (!currentValue) return false;
    if (currentValue.id && o.id === currentValue.id) return true;
    return (
      !!currentValue.pantone_code &&
      (o.pantone_code || "").toLowerCase() ===
        currentValue.pantone_code.toLowerCase()
    );
  };

  // "Ginamit sa order na ito" shelf — shown on the unfiltered view only
  // (same rule as the swatch picker's Most Used), deduped against the
  // grid so a tile never appears twice.
  const noFilter = !family && search.trim() === "";
  const usedShelf = useMemo(() => {
    if (!noFilter) return [];
    const seen = new Set();
    const shelf = [];
    for (const u of usedPantones) {
      const key = `${(u.pantone_code || "").toLowerCase()}|${(u.hexcolor || "").toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      // Prefer the catalog row (has a stable id for the payload).
      const match = withFamily.find(
        (o) =>
          (u.id && o.id === u.id) ||
          ((o.pantone_code || "").toLowerCase() ===
            (u.pantone_code || "").toLowerCase() &&
            (o.hexcolor || "").toLowerCase() ===
              (u.hexcolor || "").toLowerCase()),
      );
      if (match) shelf.push(match);
      if (shelf.length >= 8) break;
    }
    return shelf;
  }, [noFilter, usedPantones, withFamily]);

  const shelfIds = new Set(usedShelf.map((o) => o.id));
  const gridItems = noFilter
    ? filtered.filter((o) => !shelfIds.has(o.id))
    : filtered;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-primary">
            <i className="fas fa-palette mr-2"></i>Pumili ng Pantone
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
            aria-label="Close"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Search + filter row */}
        <div className="px-4 pt-3 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1 min-w-0">
            <i className="fas fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, code, hex…"
              autoFocus
              className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <select
            value={family}
            onChange={(e) => setFamily(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary sm:w-40"
          >
            <option value="">All Colors</option>
            {familiesPresent.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          {(family || search) && (
            <button
              type="button"
              onClick={() => {
                setFamily("");
                setSearch("");
              }}
              className="text-xs text-gray-500 hover:text-primary underline shrink-0 sm:self-center"
            >
              Clear
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-4 py-3 overflow-y-auto flex-1">
          {options.length === 0 ? (
            <p className="text-xs text-gray-400 py-8 text-center">
              Walang laman ang Pantone catalog.
            </p>
          ) : filtered.length === 0 ? (
            <p className="text-xs text-gray-400 py-8 text-center">
              Walang tugma. Subukan ang ibang code, pangalan, o hex — o
              i-clear ang filter.
            </p>
          ) : (
            <>
              {usedShelf.length > 0 && (
                <div className="mb-4">
                  <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    <i className="fas fa-star mr-1 text-amber-400"></i>
                    Ginamit sa order na ito
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {usedShelf.map((o) => (
                      <PantoneTile
                        key={`used-${o.id}`}
                        option={o}
                        selected={isSelected(o)}
                        onClick={(opt) => {
                          onSelect(opt);
                          setSearch("");
                          setFamily("");
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {noFilter && usedShelf.length > 0 && (
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  All Colors
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {gridItems.map((o) => (
                  <PantoneTile
                    key={o.id}
                    option={o}
                    selected={isSelected(o)}
                    onClick={(opt) => {
                      onSelect(opt);
                      setSearch("");
                      setFamily("");
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PantonePickerModal;
