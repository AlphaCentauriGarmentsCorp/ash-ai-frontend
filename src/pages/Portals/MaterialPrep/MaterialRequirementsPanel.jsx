import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { materialPrepPortalApi } from "../../../api/materialPrepPortalApi";
import { materialsApi } from "../../../api/materialsApi";

/**
 * Change 18 — Material Prep requirement panel (shared).
 *
 * Used interactively in the Material Prep Portal and read-only on the order
 * Workflow Timeline. Shows either:
 *   - the saved requirement (material request items + resulting Purchase
 *     Request status, or "no purchase needed"), or
 *   - a sample-log-based suggestion the role maps to catalog materials and
 *     saves (which auto-creates the PR for shortfalls).
 */

const fmt = (n) =>
  Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });

const PR_STATUS_STYLES = {
  pending:  "bg-amber-100 text-amber-800",
  approved: "bg-blue-100 text-blue-700",
  ordered:  "bg-indigo-100 text-indigo-700",
  received: "bg-emerald-100 text-emerald-700",
};

const MaterialRequirementsPanel = ({ orderId, readOnly = false, onSaved }) => {
  const [state, setState] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await materialPrepPortalApi.getOrderRequirements(orderId);
      const data = res?.data ?? res;
      setState(data);
      if (!data?.existing) {
        setRows(
          (data?.suggestion || []).map((s, i) => ({
            key: `s${i}`,
            material_id: s.material_id || "",
            quantity_requested: s.suggested_qty ?? "",
            label: s.label,
            kind: s.kind,
            sample_used: s.sample_used,
            suggested_qty: s.suggested_qty,
          })),
        );
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load requirements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  useEffect(() => {
    if (readOnly) return;
    let cancelled = false;
    materialsApi
      .index()
      .then((res) => {
        if (cancelled) return;
        const list = res?.data ?? res;
        setMaterials(Array.isArray(list) ? list : []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [readOnly]);

  const materialById = useMemo(() => {
    const m = {};
    materials.forEach((x) => {
      m[String(x.id)] = x;
    });
    return m;
  }, [materials]);

  const updateRow = (key, patch) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const addRow = () =>
    setRows((rs) => [
      ...rs,
      { key: `n${Date.now()}`, material_id: "", quantity_requested: "" },
    ]);
  const removeRow = (key) => setRows((rs) => rs.filter((r) => r.key !== key));

  const handleSave = async () => {
    const items = rows
      .filter((r) => r.material_id && Number(r.quantity_requested) > 0)
      .map((r) => ({
        material_id: Number(r.material_id),
        quantity_requested: Number(r.quantity_requested),
      }));
    if (items.length === 0) {
      setSaveError("Add at least one material with a quantity greater than zero.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const res = await materialPrepPortalApi.saveOrderRequirements(orderId, items);
      const data = res?.data ?? res;
      await load();
      onSaved?.(data);
    } catch (err) {
      setSaveError(
        err?.response?.data?.message || "Failed to save requirement. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-6 text-center text-xs text-gray-400">
        <i className="fa-solid fa-spinner fa-spin mr-1.5" />
        Loading material requirements…
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-3 text-xs text-red-700">
        <i className="fa-solid fa-triangle-exclamation mr-1" />
        {error}
      </div>
    );
  }

  // ── Saved requirement view ───────────────────────────────────────────
  if (state?.existing) {
    const { mr, purchase_needed, pr } = state.existing;
    return (
      <div className="space-y-3">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="py-1.5 px-2 font-semibold">Material</th>
                <th className="py-1.5 px-2 font-semibold text-right">Required</th>
                <th className="py-1.5 px-2 font-semibold text-right">Available</th>
                <th className="py-1.5 px-2 font-semibold text-right">To purchase</th>
              </tr>
            </thead>
            <tbody>
              {mr.items.map((it, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-1.5 px-2">{it.material_name || `#${it.material_id}`}</td>
                  <td className="py-1.5 px-2 text-right font-mono">
                    {fmt(it.quantity_requested)} {it.unit}
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono">{fmt(it.quantity_available)}</td>
                  <td className="py-1.5 px-2 text-right font-mono font-semibold">
                    {it.quantity_short > 0 ? (
                      <span className="text-amber-700">{fmt(it.quantity_short)}</span>
                    ) : (
                      <span className="text-emerald-600">0</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {purchase_needed && pr ? (
          <div className="flex items-center justify-between gap-2 rounded-md bg-amber-50 border border-amber-200 p-2.5 text-xs">
            <span className="text-amber-800">
              <i className="fa-solid fa-cart-shopping mr-1.5" />
              Purchase Request{" "}
              <span className="font-mono font-semibold">{pr.pr_code}</span>
              {pr.supplier ? ` · ${pr.supplier}` : " · supplier not assigned"}
              {" · ₱"}
              {fmt(pr.total)}
            </span>
            <span
              className={`uppercase text-[9px] font-bold px-1.5 py-0.5 rounded ${
                PR_STATUS_STYLES[pr.status] || "bg-gray-100 text-gray-700"
              }`}
            >
              {pr.status}
            </span>
          </div>
        ) : (
          <div className="rounded-md bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-700">
            <i className="fa-solid fa-circle-check mr-1.5" />
            No purchase needed — all materials are in stock.
          </div>
        )}
      </div>
    );
  }

  // ── Read-only, not yet prepared (timeline) ───────────────────────────
  if (readOnly) {
    return (
      <div className="space-y-2 text-xs">
        {(state?.suggestion?.length || 0) > 0 ? (
          <div className="rounded-md border border-gray-200 bg-gray-50 p-2.5">
            <p className="text-gray-500 mb-1.5">
              Suggested from sample usage (order qty {state.order_qty}):
            </p>
            <ul className="space-y-0.5">
              {state.suggestion.map((s, i) => (
                <li key={i} className="flex justify-between">
                  <span className="text-gray-700">{s.label}</span>
                  <span className="font-mono text-gray-600">
                    ~{fmt(s.suggested_qty)} {s.unit || ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-400 italic">No sample usage logged yet.</p>
        )}
        <Link
          to="/portal/material-prep"
          className="inline-flex items-center gap-1 text-blue-600 hover:underline font-semibold"
        >
          Open Material Prep Portal to prepare
          <i className="fa-solid fa-arrow-right text-[10px]" />
        </Link>
      </div>
    );
  }

  // ── Interactive suggestion editor (portal) ───────────────────────────
  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">
        Suggested from sample usage, scaled by order qty{" "}
        <span className="font-semibold">{state?.order_qty}</span>. Map each line
        to a catalog material and confirm the quantity, then save — shortfalls
        become a Purchase Request automatically.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="py-1.5 px-2 font-semibold">From sample</th>
              <th className="py-1.5 px-2 font-semibold">Material</th>
              <th className="py-1.5 px-2 font-semibold text-right">Quantity</th>
              <th className="py-1.5 px-2 font-semibold text-right">In stock</th>
              <th className="py-1.5 px-2 font-semibold text-right">Short</th>
              <th className="py-1.5 px-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const mat = materialById[String(r.material_id)];
              const stock = mat ? Number(mat.stock_on_hand || 0) : null;
              const qty = Number(r.quantity_requested) || 0;
              const short = stock === null ? null : Math.max(0, qty - stock);
              return (
                <tr key={r.key} className="border-b border-gray-100">
                  <td className="py-1.5 px-2 text-gray-500">
                    {r.label ? (
                      <span>
                        {r.label}
                        {r.sample_used != null && (
                          <span className="text-gray-400">
                            {" "}
                            ({fmt(r.sample_used)}/pc)
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-gray-400">manual</span>
                    )}
                  </td>
                  <td className="py-1.5 px-2">
                    <select
                      value={r.material_id}
                      onChange={(e) => updateRow(r.key, { material_id: e.target.value })}
                      className="w-full border border-gray-300 rounded px-1.5 py-1 text-xs bg-white"
                    >
                      <option value="">— pick material —</option>
                      {materials.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                          {m.unit ? ` (${m.unit})` : ""}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-1.5 px-2 text-right">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={r.quantity_requested}
                      onChange={(e) =>
                        updateRow(r.key, { quantity_requested: e.target.value })
                      }
                      className="w-20 border border-gray-300 rounded px-1.5 py-1 text-xs text-right"
                    />
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono text-gray-600">
                    {stock === null ? "—" : fmt(stock)}
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono font-semibold">
                    {short === null ? (
                      "—"
                    ) : short > 0 ? (
                      <span className="text-amber-700">{fmt(short)}</span>
                    ) : (
                      <span className="text-emerald-600">0</span>
                    )}
                  </td>
                  <td className="py-1.5 px-2 text-right">
                    <button
                      type="button"
                      onClick={() => removeRow(r.key)}
                      className="text-gray-400 hover:text-red-600"
                      title="Remove"
                    >
                      <i className="fa-solid fa-xmark" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="py-4 text-center text-gray-400">
                  No sample usage logged. Add the materials this order needs manually.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-2 text-xs text-red-700">
          <i className="fa-solid fa-triangle-exclamation mr-1" />
          {saveError}
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={addRow}
          className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
        >
          <i className="fa-solid fa-plus text-[10px]" /> Add material
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !state?.can_save}
          className="text-xs font-semibold px-3 py-1.5 rounded-md bg-primary text-white hover:bg-primary/90 disabled:opacity-50 inline-flex items-center gap-1.5"
        >
          <i className={`fa-solid ${saving ? "fa-spinner fa-spin" : "fa-floppy-disk"}`} />
          Save requirement
        </button>
      </div>
    </div>
  );
};

export default MaterialRequirementsPanel;
