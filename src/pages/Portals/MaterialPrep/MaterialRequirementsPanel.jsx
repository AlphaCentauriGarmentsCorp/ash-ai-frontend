import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { materialPrepPortalApi } from "../../../api/materialPrepPortalApi";
import { materialsApi } from "../../../api/materialsApi";
import MaterialPickList from "./MaterialPickList";
import MaterialRequirementSummaryTable from "./MaterialRequirementSummaryTable";

/**
 * Change 18 — Material Prep requirement panel (shared).
 * Owner decision (2026-07-28) — picking is now a checkbox pick-list over the
 * full Materials catalog (MaterialPickList), used identically for BOTH the
 * sample-prep and mass-prod phases (the backend resolves whichever Material
 * Prep stage — sample or mass — is currently active). Sample has no prior
 * usage logs to suggest from, so it starts with nothing pre-checked; mass
 * pre-checks/pre-fills rows that match a sample-usage suggestion.
 *
 * Used interactively in the Material Prep Portal and read-only on the order
 * Workflow Timeline. Shows either:
 *   - the saved requirement (material request items + resulting Purchase
 *     Request status, or "no purchase needed"), or
 *   - the pick-list the role checks materials on and saves (which
 *     auto-creates a Purchase Request for shortfalls).
 */

const MaterialRequirementsPanel = ({ orderId, readOnly = false, onSaved }) => {
  const [state, setState] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [unmatched, setUnmatched] = useState([]);
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
        const suggestions = data?.suggestion || [];
        // Only a suggestion that matched a catalog material becomes a
        // pre-checked pick-list row; unmatched ones are shown as a notice
        // so the role picks them manually instead of silently losing them.
        setRows(
          suggestions
            .filter((s) => s.material_id)
            .map((s, i) => ({
              key: `s${i}`,
              material_id: s.material_id,
              quantity_requested: s.suggested_qty ?? "",
              label: s.label,
              sample_used: s.sample_used,
            })),
        );
        setUnmatched(suggestions.filter((s) => !s.material_id));
      } else {
        setRows([]);
        setUnmatched([]);
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
    setMaterialsLoading(true);
    materialsApi
      .index()
      .then((res) => {
        if (cancelled) return;
        const list = res?.data ?? res;
        setMaterials(Array.isArray(list) ? list : []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setMaterialsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [readOnly]);

  const handleCheck = (material, checked) => {
    if (checked) {
      setRows((rs) => [
        ...rs,
        { key: `m${material.id}`, material_id: material.id, quantity_requested: "" },
      ]);
    } else {
      setRows((rs) => rs.filter((r) => String(r.material_id) !== String(material.id)));
    }
  };

  const handleQtyChange = (materialId, value) => {
    setRows((rs) =>
      rs.map((r) =>
        String(r.material_id) === String(materialId)
          ? { ...r, quantity_requested: value }
          : r,
      ),
    );
  };

  const handleSave = async () => {
    const items = rows
      .filter((r) => r.material_id && Number(r.quantity_requested) > 0)
      .map((r) => ({
        material_id: Number(r.material_id),
        quantity_requested: Number(r.quantity_requested),
      }));
    if (items.length === 0) {
      setSaveError("Check at least one material and enter a quantity greater than zero.");
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
    return <MaterialRequirementSummaryTable mr={mr} purchase_needed={purchase_needed} pr={pr} />;
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
                    ~{Number(s.suggested_qty || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} {s.unit || ""}
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

  // ── Interactive pick-list editor (portal) ────────────────────────────
  const isSample = state?.phase === "sample";
  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">
        {isSample ? (
          <>
            Kunin sa stock ang materials na kailangan para sa sample. Kulang
            na dami ay awtomatikong gagawan ng Purchase Request.
          </>
        ) : (
          <>
            Suggested from sample usage, scaled by order qty{" "}
            <span className="font-semibold">{state?.order_qty}</span> — na
            naka-check na sa listahan sa ibaba. Piliin ang iba pang materials
            na kailangan at kumpirmahin ang dami, tapos i-save — kulang na
            dami ay awtomatikong gagawan ng Purchase Request.
          </>
        )}
      </p>

      <MaterialPickList
        materials={materials}
        rows={rows}
        onCheck={handleCheck}
        onQtyChange={handleQtyChange}
        unmatchedSuggestions={unmatched}
        loading={materialsLoading}
      />

      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-2 text-xs text-red-700">
          <i className="fa-solid fa-triangle-exclamation mr-1" />
          {saveError}
        </div>
      )}

      <div className="flex items-center justify-end">
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
