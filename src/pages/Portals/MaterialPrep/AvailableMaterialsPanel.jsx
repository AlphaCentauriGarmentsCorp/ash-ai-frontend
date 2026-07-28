import React, { useEffect, useMemo, useState } from "react";
import { materialsApi } from "../../../api/materialsApi";

/**
 * Available-materials reference panel (shared, read-only).
 *
 * Shows what is currently on hand in the materials catalog so the Material
 * Prep role can see — before pulling for a sample or mapping a mass-prod
 * requirement — which materials from existing stock they can draw from.
 *
 * Only items with stock_on_hand > 0 are listed, grouped by material_type.
 * Pass `materials` when the parent already loaded the catalog (mass-prod
 * editor); otherwise the panel self-fetches (sample-prep card).
 */

const fmt = (n) =>
  Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });

const AvailableMaterialsPanel = ({ materials: provided, defaultOpen = false }) => {
  const [fetched, setFetched] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(defaultOpen);

  // Self-fetch only when the parent didn't hand us a list.
  useEffect(() => {
    if (provided) return;
    let cancelled = false;
    setLoading(true);
    materialsApi
      .index()
      .then((res) => {
        if (cancelled) return;
        const list = res?.data ?? res;
        setFetched(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!cancelled) setFetched([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [provided]);

  const source = provided ?? fetched ?? [];

  // In stock only, grouped by material_type (dynamic — robust to catalog
  // changes). Uncategorised items fall under "Iba pa".
  const groups = useMemo(() => {
    const inStock = source.filter((m) => Number(m?.stock_on_hand || 0) > 0);
    const byType = {};
    inStock.forEach((m) => {
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
  }, [source]);

  const totalInStock = groups.reduce((n, g) => n + g.items.length, 0);
  const isLoading = loading && !provided;

  return (
    <div className="rounded-md border border-gray-200 bg-gray-50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left"
      >
        <span className="text-xs font-semibold text-gray-800 inline-flex items-center gap-1.5">
          <i className="fa-solid fa-boxes-stacked text-gray-500" />
          Available sa stock
          {!isLoading && (
            <span className="text-[10px] font-bold text-gray-500">
              ({totalInStock})
            </span>
          )}
        </span>
        <i
          className={`fa-solid fa-chevron-${open ? "up" : "down"} text-gray-400 text-xs`}
        />
      </button>

      {open && (
        <div className="border-t border-gray-100 p-3">
          {isLoading ? (
            <div className="py-2 text-center text-xs text-gray-400">
              <i className="fa-solid fa-spinner fa-spin mr-1.5" />
              Kinukuha ang stock…
            </div>
          ) : totalInStock === 0 ? (
            <div className="py-2 text-center text-xs text-gray-400">
              <i className="fa-regular fa-folder-open mr-1.5" />
              Walang materials na may stock ngayon.
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[11px] text-gray-500">
                Ito ang mga materials na nasa stock. Kunin lang dito para sa
                order — walang bibilhin kung sapat ang available.
              </p>
              {groups.map((g) => (
                <div key={g.type}>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wide mb-1">
                    {g.type}
                  </p>
                  <ul className="space-y-0.5">
                    {g.items.map((m) => (
                      <li
                        key={m.id}
                        className="flex items-center justify-between gap-2 text-xs"
                      >
                        <span className="text-gray-700 truncate">{m.name}</span>
                        <span className="font-mono text-gray-600 whitespace-nowrap">
                          {fmt(m.stock_on_hand)}
                          {m.unit ? ` ${m.unit}` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AvailableMaterialsPanel;
