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
 * group's colour field. A "custom colour" escape hatch is included for colours
 * not in the catalog (typed for immediate use; saving to the DB stays in the
 * CSR → Swatches tab).
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filtered.map((swatch) => (
                <SwatchTile
                  key={swatch.id}
                  swatch={swatch}
                  selected={
                    !!currentValue &&
                    (swatch.name || "").toLowerCase() === currentValue.toLowerCase()
                  }
                  onClick={(s) => choose(s.name)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Custom color escape hatch */}
        <div className="px-4 py-3 border-t border-gray-200 bg-light/20">
          <label className="block text-[11px] font-medium text-gray-600 mb-1">
            Custom color (not in catalog)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") choose(custom);
              }}
              placeholder="Type a color name…"
              className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
            />
            <button
              type="button"
              onClick={() => choose(custom)}
              disabled={!custom.trim()}
              className="px-3 py-1.5 text-xs rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              Use this color
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">
            To save a new color to the catalog, use the CSR → Swatches tab.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SwatchPickerModal;
