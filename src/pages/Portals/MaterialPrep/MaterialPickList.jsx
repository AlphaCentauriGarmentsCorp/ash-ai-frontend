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
 *
 * 2026-07-29 — visual pass (Josh): the stock column is now a colour-coded
 * badge + mini gauge bar (StockBadge below) instead of plain gray text, read
 * against each material's `minimum` reorder point when one is set. Also
 * added a material-type filter chip row (counts per type, built off the
 * unfiltered catalog) alongside the existing name/type search box.
 */

const fmt = (n) =>
  Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });

/**
 * Stock level indicator — colour-coded pill + mini gauge bar read against
 * the material's `minimum` (reorder point) when one is configured:
 *   red    — 0 on hand ("Wala")
 *   amber  — on hand but below minimum ("Mababa")
 *   green  — at/above minimum, or no minimum configured ("Sapat")
 */
const StockBadge = ({ stock, minimum, unit }) => {
  const min = Number(minimum || 0);
  const isOut = stock <= 0;
  const isLow = !isOut && min > 0 && stock < min;
  const status = isOut ? "out" : isLow ? "low" : "ok";

  const theme = {
    out: {
      dot: "bg-red-500",
      bar: "bg-red-400",
      track: "bg-red-100",
      text: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-200",
    },
    low: {
      dot: "bg-amber-500",
      bar: "bg-amber-400",
      track: "bg-amber-100",
      text: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-200",
    },
    ok: {
      dot: "bg-emerald-500",
      bar: "bg-emerald-400",
      track: "bg-emerald-100",
      text: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
    },
  }[status];

  // Gauge fill — read against 2x the reorder point when one's set (so a
  // healthy stock level reads as a comfortably full bar, not maxed right at
  // the reorder line); with no minimum configured there's no threshold to
  // gauge against, so any stock > 0 just reads as a full bar.
  const capacity = min > 0 ? min * 2 : Math.max(stock, 1);
  const pct = isOut ? 0 : Math.min(100, Math.round((stock / capacity) * 100));

  return (
    <div
      className={`flex flex-col items-end gap-1 shrink-0 rounded-md border ${theme.border} ${theme.bg} px-1.5 py-1 w-[88px]`}
      title={
        min > 0
          ? `Minimum stock: ${fmt(min)} ${unit || ""}`
          : "Walang minimum na nakatakda"
      }
    >
      <span
        className={`inline-flex items-center gap-1 text-[10px] font-mono font-semibold ${theme.text} whitespace-nowrap leading-none`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${theme.dot} shrink-0`} />
        {fmt(stock)}
        {unit ? ` ${unit}` : ""}
      </span>
      <span className={`h-1 w-full rounded-full ${theme.track} overflow-hidden`}>
        <span
          className={`block h-full rounded-full ${theme.bar} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </span>
    </div>
  );
};

const MaterialPickList = ({
  materials = [],
  rows = [],
  onCheck,      // (material, checked) => void
  onQtyChange,  // (materialId, value) => void
  unmatchedSuggestions = [], // suggestion rows with no catalog match — informational only
  loading = false,
}) => {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const rowByMaterialId = useMemo(() => {
    const m = {};
    rows.forEach((r) => {
      if (r.material_id) m[String(r.material_id)] = r;
    });
    return m;
  }, [rows]);

  // Distinct material types across the whole catalog, each with a count —
  // powers the filter chip row under the search box. Built off the
  // unfiltered `materials` list so switching chips never makes a chip
  // disappear out from under the person using it.
  const typeOptions = useMemo(() => {
    const counts = {};
    materials.forEach((m) => {
      const type = (m.material_type || "").trim() || "Iba pa";
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.keys(counts)
      .sort((a, b) => a.localeCompare(b))
      .map((type) => ({ type, count: counts[type] }));
  }, [materials]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    let filtered = materials;

    if (typeFilter !== "all") {
      filtered = filtered.filter(
        (m) => ((m.material_type || "").trim() || "Iba pa") === typeFilter,
      );
    }

    if (q) {
      filtered = filtered.filter(
        (m) =>
          String(m.name || "").toLowerCase().includes(q) ||
          String(m.material_type || "").toLowerCase().includes(q),
      );
    }

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
  }, [materials, query, typeFilter]);

  const selectedCount = rows.filter((r) => r.material_id).length;

  return (
    <div className="rounded-md border border-gray-200">
      <div className="border-b border-gray-100 bg-gray-50 rounded-t-md">
        <div className="flex items-center justify-between gap-2 px-3 py-2">
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

        {typeOptions.length > 1 && (
          <div className="flex items-center gap-1.5 px-3 pb-2 overflow-x-auto scrollbar-thin">
            <button
              type="button"
              onClick={() => setTypeFilter("all")}
              className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold border whitespace-nowrap transition-colors ${
                typeFilter === "all"
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              Lahat ({materials.length})
            </button>
            {typeOptions.map(({ type, count }) => (
              <button
                key={type}
                type="button"
                onClick={() => setTypeFilter(type)}
                className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold border whitespace-nowrap transition-colors ${
                  typeFilter === type
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {type} ({count})
              </button>
            ))}
          </div>
        )}
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
            {query || typeFilter !== "all"
              ? "Walang tugmang material."
              : "Walang laman ang materials catalog."}
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
                        <StockBadge stock={stock} minimum={m.minimum} unit={m.unit} />
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
