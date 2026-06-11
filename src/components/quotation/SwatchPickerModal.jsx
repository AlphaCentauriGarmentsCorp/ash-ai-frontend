import React, { useEffect, useMemo, useState } from "react";
import { csrPortalApi } from "../../api/csrPortalApi";
import SwatchTile from "../../pages/Portals/CSR/sections/SwatchTile";
import SwatchFilters from "../../pages/Portals/CSR/sections/SwatchFilters";

/**
 * Issue 4 — Shirt Color swatch picker (Phase 6-C).
 *
 * A lightweight modal that lets the CSR pick a garment colour from the seeded
 * Fabric Swatches instead of typing it. It REUSES the existing catalog pieces
 * (csrPortalApi.listSwatches + SwatchTile + SwatchFilters) — selecting a tile
 * returns the swatch NAME to the caller, which writes it into the Per-Color
 * group's colour field. A "custom colour" escape hatch handles colours not in
 * the catalog: "Save & use" persists the typed colour (name + hex) to the
 * catalog via createSwatch and selects it; "Use once" applies it to this order
 * without saving. An existing name is reused rather than duplicated.
 *
 * Props:
 *   open          boolean
 *   currentValue  string  — the group's current colour (preselects a tile)
 *   onClose()
 *   onSelect(name)        — called with the chosen colour name
 */
const SwatchPickerModal = ({ open, currentValue = "", onClose, onSelect }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    fabric_type: null,
    gsm: null,
    color_family: null,
    search: null,
  });
  const [custom, setCustom] = useState("");
  const [customHex, setCustomHex] = useState("#888888");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    if (!open) return;
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await csrPortalApi.listSwatches();
        const list = Array.isArray(res) ? res : res?.data || [];
        if (active) setItems(list);
      } catch (err) {
        console.error("Failed to load fabric swatches:", err);
        if (active) setError("Couldn't load swatches. You can still type a custom color.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [open]);

  // Same filtering the catalog tab uses (client-side over the full list).
  const filtered = useMemo(() => {
    let list = items;
    if (filters.fabric_type) {
      list = list.filter((s) => s.fabric_type === filters.fabric_type);
    }
    if (filters.gsm) {
      list = list.filter((s) => String(s.gsm) === String(filters.gsm));
    }
    if (filters.color_family) {
      list = list.filter((s) => s.color_family === filters.color_family);
    }
    if (filters.search) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          (s.name || "").toLowerCase().includes(q) ||
          (s.pantone_code || "").toLowerCase().includes(q) ||
          (s.hex_color || "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [items, filters]);

  const clearFilters = () =>
    setFilters({ fabric_type: null, gsm: null, color_family: null, search: null });

  const choose = (name) => {
    const trimmed = String(name || "").trim();
    if (!trimmed) return;
    onSelect?.(trimmed);
  };

  // Selecting a catalog tile records a pick (fire-and-forget — never blocks
  // the selection) and optimistically bumps the local count so the
  // "Most used" shelf reflects it right away.
  const chooseSwatch = (swatch) => {
    if (!swatch) return;
    if (swatch.id != null) {
      csrPortalApi.incrementSwatchPick(swatch.id).catch(() => {});
      setItems((prev) =>
        prev.map((s) =>
          s.id === swatch.id
            ? { ...s, pick_count: Number(s.pick_count || 0) + 1 }
            : s,
        ),
      );
    }
    choose(swatch.name);
  };

  // Save a typed custom colour to the catalog, then select it. If the name
  // already exists (case-insensitive) we reuse that swatch instead of
  // creating a duplicate. On any failure we fall back to using the colour
  // for this order only — the CSR is never blocked mid-quotation.
  const saveCustomToCatalog = async () => {
    const trimmed = custom.trim();
    if (!trimmed || saving) return;
    setSaveError(null);

    const existing = items.find(
      (s) => (s.name || "").trim().toLowerCase() === trimmed.toLowerCase(),
    );
    if (existing) {
      chooseSwatch(existing);
      setCustom("");
      return;
    }

    setSaving(true);
    try {
      const res = await csrPortalApi.createSwatch({
        name: trimmed,
        hex_color: customHex,
      });
      const created = res?.data ?? res;
      if (created && created.id != null) {
        setItems((prev) => [created, ...prev]);
        chooseSwatch(created);
        setCustom("");
      } else {
        choose(trimmed); // unexpected shape — still use the colour
      }
    } catch (err) {
      console.error("Failed to save swatch to catalog:", err);
      setSaveError(
        "Couldn't save to catalog — using this color for this order only.",
      );
      choose(trimmed);
    } finally {
      setSaving(false);
    }
  };

  const isSelected = (swatch) =>
    !!currentValue &&
    (swatch.name || "").toLowerCase() === currentValue.toLowerCase();

  // "Most used" favourites shelf — top picks, shown only on the unfiltered
  // view so it never fights an active search/filter. Excluded from the grid
  // below so the same tile never appears twice.
  const noFilter =
    !filters.fabric_type &&
    !filters.gsm &&
    !filters.color_family &&
    !filters.search;
  const mostUsed = noFilter
    ? [...items]
        .filter((s) => Number(s.pick_count) > 0)
        .sort((a, b) => Number(b.pick_count) - Number(a.pick_count))
        .slice(0, 8)
    : [];
  const mostUsedIds = new Set(mostUsed.map((s) => s.id));
  const gridItems = noFilter
    ? filtered.filter((s) => !mostUsedIds.has(s.id))
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
            <i className="fas fa-palette mr-2"></i>Choose Color
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

        {/* Filters */}
        <div className="px-4 pt-3">
          <SwatchFilters
            swatches={items}
            filters={filters}
            onChange={setFilters}
            onClear={clearFilters}
          />
        </div>

        {/* Body */}
        <div className="px-4 py-3 overflow-y-auto flex-1">
          {loading ? (
            <p className="text-xs text-gray-400 py-8 text-center">Loading swatches…</p>
          ) : error ? (
            <p className="text-xs text-amber-600 py-4 text-center">{error}</p>
          ) : filtered.length === 0 ? (
            <p className="text-xs text-gray-400 py-8 text-center">
              No swatches match. Try clearing filters or type a custom color below.
            </p>
          ) : (
            <>
              {mostUsed.length > 0 && (
                <div className="mb-4">
                  <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    <i className="fas fa-star mr-1 text-amber-400"></i>Most used
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {mostUsed.map((swatch) => (
                      <SwatchTile
                        key={`fav-${swatch.id}`}
                        swatch={swatch}
                        selected={isSelected(swatch)}
                        onClick={chooseSwatch}
                      />
                    ))}
                  </div>
                </div>
              )}
              {gridItems.length > 0 && (
                <>
                  {mostUsed.length > 0 && (
                    <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      All colors
                    </div>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {gridItems.map((swatch) => (
                      <SwatchTile
                        key={swatch.id}
                        swatch={swatch}
                        selected={isSelected(swatch)}
                        onClick={chooseSwatch}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Custom color escape hatch */}
        <div className="px-4 py-3 border-t border-gray-200 bg-light/20">
          <label className="block text-[11px] font-medium text-gray-600 mb-1">
            Custom color (not in catalog)
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="color"
              value={customHex}
              onChange={(e) => setCustomHex(e.target.value)}
              disabled={saving}
              title="Pick a color (used when saving to the catalog)"
              aria-label="Custom color swatch"
              className="h-8 w-9 flex-none p-0.5 border border-gray-200 rounded cursor-pointer disabled:cursor-not-allowed"
            />
            <input
              type="text"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveCustomToCatalog();
              }}
              placeholder="Type a color name…"
              disabled={saving}
              className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary disabled:opacity-60"
            />
            <button
              type="button"
              onClick={saveCustomToCatalog}
              disabled={!custom.trim() || saving}
              className="px-3 py-1.5 text-xs rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {saving ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-1"></i>Saving…
                </>
              ) : (
                <>
                  <i className="fas fa-plus mr-1"></i>Save &amp; use
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => choose(custom)}
              disabled={!custom.trim() || saving}
              className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              Use once
            </button>
          </div>
          {saveError ? (
            <p className="text-[10px] text-amber-600 mt-1">{saveError}</p>
          ) : (
            <p className="text-[10px] text-gray-400 mt-1">
              "Save &amp; use" adds it to the catalog. "Use once" won't save it.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SwatchPickerModal;
