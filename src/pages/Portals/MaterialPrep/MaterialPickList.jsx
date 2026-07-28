import React, { useMemo, useState } from "react";

/**
 * Owner decision (2026-07-28) — Material Prep no longer just READS a stock
 * list; the role picks materials straight from the catalog ("Materials &
 * Suppliers → All Materials" — the same table Josh showed) with a checkbox
 * + quantity, grouped by material type. Used for BOTH the sample-prep card
 * and the mass-prod editor (owner decision: same interaction for both).
 *
 * This is a controlled picker: selection state lives in the parent's `rows`
 * array (unchanged shape from the old dropdown editor: {key, material_id,
 * quantity_requested, ...}) so Save/validation logic didn't need to change.
 * Checking a material adds a row; unchecking removes it; typing a quantity
 * updates that row.
 *
 * Materials with 0 stock are still shown and pickable — that's exactly the
 * shortfall case that spawns a Purchase Request on save.
 */

const fmt = (n) =>
  Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });

const MaterialPickList = ({
  materials = [],
  rows = [],
  onCheck,      // (material, checked) => void
  onQtyChange,  // (materialId, value) => void
  unmatchedSuggestions = [], // suggestion rows with no catalog match — informational only
  loading = false,
}) => {
  const [query, setQuery] = useState("");

  const rowByMaterialId = useMemo(() => {
    const m = {};
    rows.forEach((r) => {
      if (r.material_id) m[String(r.material_id)] = r;
    });
    return m;
  }, [rows]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? materials.filter(
          (m) =>
            String(m.name || "").toLowerCase().includes(q) ||
            String(m.material_type || "").toLowerCase().includes(q),
        )
      : materials;

    const byType = {};
    filtered.forEach((m) => {
      const type = (m.material_type || "").trim() || "Iba pa";
      (byType[type] = byType[type] || []).push(m);
    });
    return Object.keys(byType)
      .sort((a, b) => a.localeCompare(b))
      .map((type) => ({
        type,
        items: byType[type].sort((a, b) =>
          String(a.name || "").localeCompare(String(b.name || "")),
        ),
      }));
  }, [materials, query]);

  const selectedCount = rows.filter((r) => r.material_id).length;

  return (
    <div className="rounded-md border border-gray-200">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50 rounded-t-md">
        <span className="text-xs font-semibold text-gray-800 inline-flex items-center gap-1.5">
          <i className="fa-solid fa-boxes-stacked text-gray-500" />
          Piliin sa Materials catalog
          {selectedCount > 0 && (
            <span className="text-[10px] font-bold text-primary">
              ({selectedCount} napili)
            </span>
          )}
        </span>
        <div className="relative">
          <i className="fa-solid fa-magnifying-glass absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search material…"
            className="pl-6 pr-2 py-1 text-xs border border-gray-300 rounded w-36 sm:w-48"
          />
        </div>
      </div>

      {unmatchedSuggestions.length > 0 && (
        <div className="mx-3 mt-2 rounded-md bg-indigo-50 border border-indigo-200 p-2 text-[11px] text-indigo-800">
          <i className="fa-solid fa-lightbulb mr-1" />
          Suggested mula sa sample usage pero walang tugmang material sa
          catalog — piliin nang manual sa listahan sa ibaba:{" "}
          {unmatchedSuggestions
            .map((s) => `${s.label} (~${fmt(s.suggested_qty)} ${s.unit || ""})`)
            .join(" · ")}
        </div>
      )}

      <div className="max-h-72 overflow-y-auto p-3">
        {loading ? (
          <div className="py-4 text-center text-xs text-gray-400">
            <i className="fa-solid fa-spinner fa-spin mr-1.5" />
            Loading catalog…
          </div>
        ) : groups.length === 0 ? (
          <div className="py-4 text-center text-xs text-gray-400">
            <i className="fa-regular fa-folder-open mr-1.5" />
            {query ? "Walang tugmang material." : "Walang laman ang materials catalog."}
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((g) => (
              <div key={g.type}>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wide mb-1">
                  {g.type}
                </p>
                <ul className="space-y-1">
                  {g.items.map((m) => {
                    const row = rowByMaterialId[String(m.id)];
                    const checked = !!row;
                    const stock = Number(m.stock_on_hand || 0);
                    const qty = Number(row?.quantity_requested) || 0;
                    const short = checked ? Math.max(0, qty - stock) : 0;
                    return (
                      <li
                        key={m.id}
                        className={`flex items-center gap-2 rounded px-1.5 py-1 ${
                          checked ? "bg-primary/5" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => onCheck(m, e.target.checked)}
                          className="h-3.5 w-3.5 shrink-0 accent-primary"
                        />
                        <span className="text-xs text-gray-800 flex-1 truncate">
                          {m.name}
                        </span>
                        <span
                          className={`text-[10px] font-mono whitespace-nowrap ${
                            stock > 0 ? "text-gray-500" : "text-amber-600"
                          }`}
                        >
                          stock: {fmt(stock)}
                          {m.unit ? ` ${m.unit}` : ""}
                        </span>
                        {checked && (
                          <>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={row.quantity_requested}
                              onChange={(e) => onQtyChange(m.id, e.target.value)}
                              placeholder="qty"
                              className="w-16 border border-gray-300 rounded px-1.5 py-0.5 text-xs text-right"
                            />
                            {short > 0 && (
                              <span className="text-[10px] font-semibold text-amber-700 whitespace-nowrap">
                                short {fmt(short)}
                              </span>
                            )}
                          </>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialPickList;
