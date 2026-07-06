import React, { useEffect, useMemo, useState } from "react";

/**
 * GA Portal CP9 — detailed Pantone picker modal.
 *
 * CP-Custom (this rev) adds artist control over colours the canonical
 * catalog doesn't have:
 *   - a "Custom colors" group (context.custom_color_options, ordered by
 *     pick_count) rendered alongside the official Pantones
 *   - a creator footer: native colour widget + a TYPEABLE HEX field +
 *     optional name → "Save & use" find-or-creates the colour in the
 *     custom catalog (deduped on hex) and selects it
 *   - onSelect now carries `source` ('official' | 'custom') so the caller
 *     stores a snapshot+reference for customs and a bare id for officials
 *
 * Existing behaviour is unchanged: search (name / code / hex), a COLOR
 * FAMILY dropdown derived from each pantone's hue, and a "Ginamit sa
 * order na ito" shelf of pantones already used on this order.
 *
 * Props:
 *   open           boolean
 *   options        [{id, name, hexcolor, pantone_code}] official (deduped)
 *   customOptions  [{id, name, hexcolor, pantone_code, pick_count}] custom
 *   usedPantones   same shape — already used on this order's placements
 *   currentValue   the slot's current pick ({id?, pantone_code?, source?})
 *   initialSearch  seeds the search box (Enter-to-resolve → pre-filtered)
 *   onClose()
 *   onSelect(option)        option carries `source`
 *   onCreateCustom(payload) async — {name, hexcolor, pantone_code}
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
  customOptions = [],
  usedPantones = [],
  currentValue = null,
  initialSearch = "",
  onClose,
  onSelect,
  onCreateCustom,
}) => {
  const [search, setSearch] = useState("");
  const [family, setFamily] = useState("");

  // Seed the search when opened from the slot box (Enter → pre-filtered).
  useEffect(() => {
    if (open) {
      setSearch(initialSearch || "");
      setFamily("");
    }
  }, [open, initialSearch]);

  // Custom-color creator state.
  const [customName, setCustomName] = useState("");
  const [customHex, setCustomHex] = useState("#888888");
  const [savingCustom, setSavingCustom] = useState(false);
  const [customErr, setCustomErr] = useState(null);

  const hexValid = /^#?(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(customHex.trim());

  const handleSaveCustom = async () => {
    if (!hexValid || savingCustom) return;
    setSavingCustom(true);
    setCustomErr(null);
    try {
      await onCreateCustom?.({
        name: customName.trim() || null,
        hexcolor: customHex.trim(),
        pantone_code: null,
      });
      setCustomName("");
    } catch (err) {
      setCustomErr("Hindi na-save ang custom color. Subukan ulit.");
    } finally {
      setSavingCustom(false);
    }
  };

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

  // Custom colors filtered by the same search (no family bucket — customs
  // are shown only when no family filter is active).
  const filteredCustom = useMemo(() => {
    let list = customOptions;
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
  }, [customOptions, search]);

  const isSelected = (o, src) => {
    if (!currentValue) return false;
    const csrc = currentValue.source || null;
    if (src && csrc && src !== csrc) return false;
    if (currentValue.id && o.id === currentValue.id) return true;
    return (
      !!currentValue.pantone_code &&
      (o.pantone_code || "").toLowerCase() ===
        currentValue.pantone_code.toLowerCase()
    );
  };

  // "Ginamit sa order na ito" shelf — shown on the unfiltered view only,
  // deduped against the grid so a tile never appears twice.
  const noFilter = !family && search.trim() === "";
  const usedShelf = useMemo(() => {
    if (!noFilter) return [];
    const seen = new Set();
    const shelf = [];
    for (const u of usedPantones) {
      const key = `${(u.pantone_code || "").toLowerCase()}|${(u.hexcolor || "").toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
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

  const hasCustomGroup = !family && filteredCustom.length > 0;

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
          {options.length === 0 && customOptions.length === 0 ? (
            <p className="text-xs text-gray-400 py-8 text-center">
              Walang laman ang Pantone catalog. Gumawa ng custom color sa ibaba.
            </p>
          ) : filtered.length === 0 && filteredCustom.length === 0 ? (
            <p className="text-xs text-gray-400 py-8 text-center">
              Walang tugma. Subukan ang ibang code, pangalan, o hex — o
              i-clear ang filter. Pwede ka ring gumawa ng custom color sa ibaba.
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
                        selected={isSelected(o, "official")}
                        onClick={(opt) => {
                          onSelect({ ...opt, source: "official" });
                          setSearch("");
                          setFamily("");
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {hasCustomGroup && (
                <div className="mb-4">
                  <div className="text-[11px] font-semibold text-primary uppercase tracking-wide mb-2">
                    <i className="fas fa-eye-dropper mr-1"></i>
                    Custom colors
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {filteredCustom.map((o) => (
                      <PantoneTile
                        key={`custom-${o.id}`}
                        option={o}
                        selected={isSelected(o, "custom")}
                        onClick={(opt) => {
                          onSelect({ ...opt, source: "custom" });
                          setSearch("");
                          setFamily("");
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {filtered.length > 0 && (
                <>
                  {(usedShelf.length > 0 || hasCustomGroup) && (
                    <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Official Pantones
                    </div>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {gridItems.map((o) => (
                      <PantoneTile
                        key={o.id}
                        option={o}
                        selected={isSelected(o, "official")}
                        onClick={(opt) => {
                          onSelect({ ...opt, source: "official" });
                          setSearch("");
                          setFamily("");
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Custom color creator */}
        <div className="px-4 py-3 border-t border-gray-200 bg-light/20">
          <label className="block text-[11px] font-medium text-gray-600 mb-1">
            Gumawa ng custom color (wala sa Pantone catalog)
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="color"
              value={
                /^#(?:[0-9a-fA-F]{6})$/.test(customHex) ? customHex : "#888888"
              }
              onChange={(e) => setCustomHex(e.target.value)}
              disabled={savingCustom}
              title="Pumili ng kulay"
              aria-label="Custom color swatch"
              className="h-8 w-9 flex-none p-0.5 border border-gray-200 rounded cursor-pointer disabled:cursor-not-allowed"
            />
            <input
              type="text"
              value={customHex}
              onChange={(e) => setCustomHex(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveCustom();
              }}
              placeholder="#RRGGBB"
              spellCheck={false}
              disabled={savingCustom}
              className={`w-28 px-2 py-1.5 text-xs font-mono border rounded focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary disabled:opacity-60 ${
                hexValid ? "border-gray-200" : "border-amber-300"
              }`}
            />
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveCustom();
              }}
              placeholder="Pangalan ng kulay (optional)…"
              disabled={savingCustom}
              className="flex-1 min-w-0 px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary disabled:opacity-60"
            />
            <button
              type="button"
              onClick={handleSaveCustom}
              disabled={!hexValid || savingCustom}
              className="px-3 py-1.5 text-xs rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {savingCustom ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-1"></i>Sine-save…
                </>
              ) : (
                <>
                  <i className="fas fa-plus mr-1"></i>Save &amp; use
                </>
              )}
            </button>
          </div>
          {customErr ? (
            <p className="text-[10px] text-amber-600 mt-1">{customErr}</p>
          ) : (
            <p className="text-[10px] text-gray-400 mt-1">
              I-save sa custom catalog at gamitin sa slot na ito. Naka-dedupe
              base sa hex.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PantonePickerModal;
