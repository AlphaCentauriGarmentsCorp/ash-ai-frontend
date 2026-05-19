import React, { useCallback, useEffect, useMemo, useState } from "react";
import { csrPortalApi } from "../../../../api/csrPortalApi";
import DeleteConfirmationDialog from "../../../../components/common/DeleteConfirmationDialog";
import SwatchTile from "../sections/SwatchTile";
import SwatchFilters from "../sections/SwatchFilters";
import SwatchFormModal from "../modals/SwatchFormModal";

/**
 * Phase 6-B — Fabric Swatch Catalog tab.
 *
 * Features:
 *   - Grid view (color tiles, matches PDF catalog aesthetic)
 *   - Table view (sortable rows like other CSR tabs)
 *   - Collections grouped by section (collapsible)
 *   - Filter pills + search across name/pantone/hex
 *   - Create / Edit / Delete (full CRUD)
 *
 * The 162 seeded swatches are organized into 9 collections; the
 * "groupByCollection" toggle keeps that organization while filtering
 * still works inside each collection.
 *
 * Stock status (in_stock/low_stock/out_of_stock/unknown) is decorated
 * by the backend FabricSwatchService when material_id is linked.
 */

// Catalog collection display order — matches the PDF catalog Vol 01
const COLLECTION_ORDER = [
  "Hoodie Collection",
  "280 GSM",
  "220-240 GSM Greens & Blues",
  "220-240 GSM Neutrals",
  "220-240 GSM Warm Tones",
  "220-240 GSM Lights",
  "220-240 GSM Pastels",
  "220-240 GSM Earth Tones",
  "220-240 GSM Brights",
];

const SwatchesTab = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // View controls
  const [view, setView] = useState("grid");        // 'grid' | 'table'
  const [groupByCollection, setGroupByCollection] = useState(true);
  const [filters, setFilters] = useState({
    fabric_type:  null,
    gsm:          null,
    color_family: null,
    search:       null,
  });
  const [collapsed, setCollapsed] = useState({}); // collection name → bool

  // Modals
  const [editing, setEditing] = useState(undefined);
  // ^ undefined = closed, null = create-new, {...} = edit-existing
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await csrPortalApi.listSwatches();
      setItems(res?.data ?? []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load fabric swatches.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // ── Filtering ────────────────────────────────────────────────────
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

  // ── Group by collection (preserving catalog order) ───────────────
  const groups = useMemo(() => {
    if (!groupByCollection) return null;
    const map = {};
    filtered.forEach((s) => {
      const key = s.collection || "Uncategorized";
      if (!map[key]) map[key] = [];
      map[key].push(s);
    });
    // Order: known collections first, then anything else alphabetically
    const known = COLLECTION_ORDER.filter((c) => map[c]);
    const extras = Object.keys(map)
      .filter((c) => !COLLECTION_ORDER.includes(c))
      .sort();
    return [...known, ...extras].map((c) => ({ name: c, items: map[c] }));
  }, [filtered, groupByCollection]);

  // ── CRUD handlers ────────────────────────────────────────────────
  const handleSaved = (swatch) => {
    setItems((prev) => {
      const idx = prev.findIndex((s) => s.id === swatch.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = swatch;
        return next;
      }
      return [swatch, ...prev];
    });
    setEditing(undefined);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await csrPortalApi.deleteSwatch(deleteTarget.id);
      setItems((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      // Surface in the dialog area on next render via error state
      setError(
        err.response?.data?.message || "Failed to delete swatch. Try again.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const toggleCollapse = (name) => {
    setCollapsed((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  // Show inline empty state when filters wipe out the list
  const hasFilters =
    filters.fabric_type || filters.gsm || filters.color_family || filters.search;

  return (
    <>
      <div className="space-y-4">
        <section className="bg-white rounded-lg border border-gray-200 p-4">
          {/* Top bar: view toggle + count + actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              {/* View toggle */}
              <div className="inline-flex rounded-md border border-gray-300 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setView("grid")}
                  className={
                    "px-3 py-1.5 text-xs font-semibold transition-colors " +
                    (view === "grid"
                      ? "bg-primary text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50")
                  }
                >
                  <i className="fa-solid fa-th-large mr-1" />
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => setView("table")}
                  className={
                    "px-3 py-1.5 text-xs font-semibold transition-colors border-l border-gray-300 " +
                    (view === "table"
                      ? "bg-primary text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50")
                  }
                >
                  <i className="fa-solid fa-list mr-1" />
                  Table
                </button>
              </div>

              {/* Group toggle */}
              <label className="inline-flex items-center gap-1.5 text-xs text-gray-700">
                <input
                  type="checkbox"
                  checked={groupByCollection}
                  onChange={(e) => setGroupByCollection(e.target.checked)}
                  className="rounded"
                />
                Group by collection
              </label>

              <span className="text-[11px] text-gray-500">
                {filtered.length} of {items.length} swatches
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchList}
                disabled={loading}
                className="text-xs font-semibold px-3 py-1.5 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                <i className={`fa-solid fa-arrows-rotate ${loading ? "fa-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="text-xs font-semibold px-3 py-1.5 rounded-md bg-primary text-white hover:bg-primary/90 inline-flex items-center gap-1.5"
              >
                <i className="fa-solid fa-plus" />
                <span className="hidden sm:inline">New Swatch</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-4">
            <SwatchFilters
              swatches={items}
              filters={filters}
              onChange={setFilters}
              onClear={() =>
                setFilters({
                  fabric_type: null,
                  gsm: null,
                  color_family: null,
                  search: null,
                })
              }
            />
          </div>

          {/* Errors */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 text-xs text-red-700 mb-3">
              <i className="fa-solid fa-triangle-exclamation mr-1" />
              {error}
            </div>
          )}

          {/* Content */}
          {loading ? (
            <SkeletonContent view={view} />
          ) : filtered.length === 0 ? (
            <EmptyState hasFilters={hasFilters} onCreate={() => setEditing(null)} />
          ) : groupByCollection ? (
            <div className="space-y-3">
              {groups.map((g) => {
                const isCollapsed = collapsed[g.name];
                return (
                  <div
                    key={g.name}
                    className="border border-gray-200 rounded-md overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggleCollapse(g.name)}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-sm font-semibold text-gray-900 inline-flex items-center gap-2">
                        <i
                          className={`fa-solid fa-chevron-${
                            isCollapsed ? "right" : "down"
                          } text-gray-400 text-xs`}
                        />
                        {g.name}
                      </span>
                      <span className="text-[11px] font-semibold text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                        {g.items.length}
                      </span>
                    </button>
                    {!isCollapsed && (
                      <div className="p-3">
                        {view === "grid" ? (
                          <GridView
                            items={g.items}
                            onEdit={setEditing}
                            onDelete={setDeleteTarget}
                          />
                        ) : (
                          <TableView
                            items={g.items}
                            onEdit={setEditing}
                            onDelete={setDeleteTarget}
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : view === "grid" ? (
            <GridView
              items={filtered}
              onEdit={setEditing}
              onDelete={setDeleteTarget}
            />
          ) : (
            <TableView
              items={filtered}
              onEdit={setEditing}
              onDelete={setDeleteTarget}
            />
          )}
        </section>
      </div>

      {/* Create / Edit modal */}
      {editing !== undefined && (
        <SwatchFormModal
          swatch={editing}
          onClose={() => setEditing(undefined)}
          onSaved={handleSaved}
        />
      )}

      {/* Delete confirmation */}
      <DeleteConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={deleteTarget?.name || ""}
        isLoading={deleting}
      />
    </>
  );
};

// ── Sub-components ─────────────────────────────────────────────────

const GridView = ({ items, onEdit, onDelete }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
    {items.map((s) => (
      <div key={s.id} className="relative group">
        <SwatchTile swatch={s} onClick={() => onEdit(s)} />
        {/* Hover delete button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(s);
          }}
          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 text-red-600 border border-red-200 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
          title={`Delete ${s.name}`}
          aria-label={`Delete ${s.name}`}
        >
          <i className="fa-solid fa-trash text-[10px]" />
        </button>
      </div>
    ))}
  </div>
);

const TableView = ({ items, onEdit, onDelete }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-xs">
      <thead>
        <tr className="text-left text-gray-500 border-b border-gray-200">
          <th className="py-2 px-2 font-semibold">Color</th>
          <th className="py-2 px-2 font-semibold">Name</th>
          <th className="py-2 px-2 font-semibold">Pantone</th>
          <th className="py-2 px-2 font-semibold">Hex</th>
          <th className="py-2 px-2 font-semibold">Fabric</th>
          <th className="py-2 px-2 font-semibold">GSM</th>
          <th className="py-2 px-2 font-semibold">Family</th>
          <th className="py-2 px-2 font-semibold">Stock</th>
          <th className="py-2 px-2 font-semibold text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.map((s) => (
          <tr
            key={s.id}
            className="border-b border-gray-100 hover:bg-gray-50"
          >
            <td className="py-2 px-2">
              <div
                className="w-8 h-8 rounded border border-gray-300 shrink-0"
                style={{ backgroundColor: s.hex_color || "#e5e7eb" }}
                aria-hidden="true"
              />
            </td>
            <td className="py-2 px-2 font-semibold text-gray-900">{s.name}</td>
            <td className="py-2 px-2 font-mono text-gray-600">
              {s.pantone_code || "—"}
            </td>
            <td className="py-2 px-2 font-mono text-gray-600">
              {(s.hex_color || "—").toUpperCase()}
            </td>
            <td className="py-2 px-2 text-gray-600">{s.fabric_type || "—"}</td>
            <td className="py-2 px-2 text-gray-600">{s.gsm || "—"}</td>
            <td className="py-2 px-2 text-gray-600">{s.color_family || "—"}</td>
            <td className="py-2 px-2">
              <StockBadge status={s.stock_status} />
            </td>
            <td className="py-2 px-2 text-right whitespace-nowrap">
              <button
                type="button"
                onClick={() => onEdit(s)}
                className="text-xs px-2 py-1 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 inline-flex items-center gap-1 mr-1"
              >
                <i className="fa-solid fa-pen text-[10px]" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete(s)}
                className="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 inline-flex items-center gap-1"
              >
                <i className="fa-solid fa-trash text-[10px]" />
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const STOCK_BADGE_STYLES = {
  in_stock:     { bg: "bg-emerald-100", text: "text-emerald-700", label: "In Stock" },
  low_stock:    { bg: "bg-amber-100",   text: "text-amber-800",   label: "Low" },
  out_of_stock: { bg: "bg-red-100",     text: "text-red-700",     label: "Out" },
  unknown:      { bg: "bg-gray-100",    text: "text-gray-500",    label: "—" },
};

const StockBadge = ({ status }) => {
  const meta = STOCK_BADGE_STYLES[status] || STOCK_BADGE_STYLES.unknown;
  return (
    <span
      className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${meta.bg} ${meta.text}`}
    >
      {meta.label}
    </span>
  );
};

const SkeletonContent = ({ view }) =>
  view === "grid" ? (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="h-36 bg-gray-100 rounded animate-pulse" />
      ))}
    </div>
  ) : (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
      ))}
    </div>
  );

const EmptyState = ({ hasFilters, onCreate }) => (
  <div className="text-center py-12 text-gray-400">
    <i className="fa-regular fa-palette text-3xl mb-2" />
    <p className="text-sm">
      {hasFilters
        ? "No swatches match your filters."
        : "No fabric swatches in the catalog yet."}
    </p>
    {!hasFilters && (
      <button
        type="button"
        onClick={onCreate}
        className="mt-3 text-xs font-semibold text-blue-600 hover:underline"
      >
        Create your first swatch →
      </button>
    )}
    {hasFilters && (
      <p className="text-[11px] mt-1">
        Try clearing filters at the top of the page.
      </p>
    )}
  </div>
);

export default SwatchesTab;
