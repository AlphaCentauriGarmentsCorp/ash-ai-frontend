import React from "react";
import { CHANNEL_META } from "./OrderChannelButtons";

/**
 * Issue 20 (FE-2) — Supplier order-channels editor.
 *
 * Controlled editor for a supplier's `order_channels`: an array of
 * { type, label, url, is_primary }. Exactly one row can be primary (radio
 * semantics). Used by the Add / Edit Supplier forms. The backend re-normalizes
 * on save (drops url-less rows, enforces a single primary), so this only needs
 * to keep the UX coherent.
 */

const CHANNEL_OPTIONS = Object.keys(CHANNEL_META);

const blankRow = (makePrimary) => ({
  type: "viber",
  label: "",
  url: "",
  is_primary: !!makePrimary,
});

const SupplierChannelsEditor = ({ channels = [], onChange }) => {
  const rows = Array.isArray(channels) ? channels : [];

  const emit = (next) => onChange?.(next);

  const addRow = () => emit([...rows, blankRow(rows.length === 0)]);

  const updateRow = (index, patch) =>
    emit(rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  const removeRow = (index) => {
    const next = rows.filter((_, i) => i !== index);
    // Keep a primary if rows remain and none is flagged.
    if (next.length > 0 && !next.some((r) => r.is_primary)) {
      next[0] = { ...next[0], is_primary: true };
    }
    emit(next);
  };

  const setPrimary = (index) =>
    emit(rows.map((r, i) => ({ ...r, is_primary: i === index })));

  return (
    <div className="px-7">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-600">
          One-click order channels the buyer can open from a Purchase Request.
          Mark the one you use most as primary.
        </p>
        <button
          type="button"
          onClick={addRow}
          className="shrink-0 text-xs px-3 py-2 border border-primary/40 text-primary bg-primary/5 rounded-lg hover:bg-primary/10"
        >
          <i className="fa-solid fa-plus mr-1.5" />
          Add channel
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="text-xs text-gray-400 italic mb-2">
          No order channels yet. Add Viber, Messenger, Shopee, Lazada, etc.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((row, i) => {
            const meta = CHANNEL_META[row.type] || CHANNEL_META.other;
            return (
              <div
                key={i}
                className={`flex flex-wrap items-center gap-2 p-2 rounded-lg border ${
                  row.is_primary ? "border-amber-300 bg-amber-50" : "border-gray-200 bg-white"
                }`}
              >
                <span className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center shrink-0">
                  <i className={meta.icon} style={{ color: meta.color }} />
                </span>

                <select
                  value={row.type}
                  onChange={(e) => updateRow(i, { type: e.target.value })}
                  className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                >
                  {CHANNEL_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {CHANNEL_META[t].label}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={row.url}
                  onChange={(e) => updateRow(i, { url: e.target.value })}
                  placeholder="Link or number (e.g. https://… or viber://chat?…)"
                  className="flex-1 min-w-[180px] px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                />

                <input
                  type="text"
                  value={row.label || ""}
                  onChange={(e) => updateRow(i, { label: e.target.value })}
                  placeholder="Label (optional)"
                  className="w-40 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                />

                <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer select-none px-1">
                  <input
                    type="radio"
                    name="supplier-primary-channel"
                    checked={!!row.is_primary}
                    onChange={() => setPrimary(i)}
                  />
                  Primary
                </label>

                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  title="Remove channel"
                  className="w-8 h-8 rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 shrink-0"
                >
                  <i className="fa-solid fa-trash text-xs" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SupplierChannelsEditor;
