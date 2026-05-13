import React, { useState } from "react";
import { sewerPortalApi } from "../../../../api/sewerPortalApi";

const MATERIAL_TYPES = [
  { value: "main_fabric", label: "Main Fabric", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { value: "rib_trim",    label: "Rib / Trim",  color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "thread",      label: "Thread",      color: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "interfacing", label: "Interfacing", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { value: "other",       label: "Other",       color: "bg-gray-50 text-gray-700 border-gray-200" },
  { value: "waste",       label: "Waste",       color: "bg-red-50 text-red-700 border-red-200" },
];

const MaterialsUsageSection = ({
  materialsUsage,
  orderId,
  orderStageId,
  onChanged,
}) => {
  const [materialType, setMaterialType] = useState("main_fabric");
  const [used, setUsed] = useState("");
  const [waste, setWaste] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const usedNum = Number(used) || 0;
  const wasteNum = Number(waste) || 0;

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    setFieldErrors({});

    if (!used || usedNum < 0.01) {
      setFieldErrors({ fabric_used_kg: "Kailangan ng valid na amount." });
      setSaving(false);
      return;
    }
    if (wasteNum > usedNum) {
      setFieldErrors({ waste_kg: "Hindi pwedeng mas malaki ang waste sa used." });
      setSaving(false);
      return;
    }

    try {
      await sewerPortalApi.createMaterialLog({
        order_id: orderId,
        order_stage_id: orderStageId,
        material_type: materialType,
        fabric_used_kg: usedNum,
        waste_kg: wasteNum,
        notes: notes || undefined,
      });
      setUsed("");
      setWaste("");
      setNotes("");
      onChanged?.();
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      if (status === 422 && data?.errors) {
        const flat = {};
        Object.entries(data.errors).forEach(([k, v]) => {
          flat[k] = Array.isArray(v) ? v[0] : String(v);
        });
        setFieldErrors(flat);
      } else {
        setError(data?.message || "Hindi na-save. Subukan ulit.");
      }
    } finally {
      setSaving(false);
    }
  };

  const byMaterial = materialsUsage?.by_material || [];
  const grandTotals = materialsUsage?.grand_totals || { used_kg: 0, waste_kg: 0, remaining_kg: 0 };
  const logs = materialsUsage?.logs || [];

  // Helper for badge color of a material type
  const badgeFor = (type) =>
    MATERIAL_TYPES.find((m) => m.value === type)?.color || "bg-gray-50 text-gray-700 border-gray-200";

  const labelFor = (type) =>
    MATERIAL_TYPES.find((m) => m.value === type)?.label || type;

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
          6
        </span>
        Materials &amp; Usage
      </h2>
      <p className="text-xs text-gray-500 mb-3">
        Ilagay ang nagamit na materials at waste per type.
      </p>

      {/* Per-material breakdown */}
      {byMaterial.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-2">
            By Material Type
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {byMaterial.map((m) => (
              <div
                key={m.material_type}
                className={`border rounded p-2 ${badgeFor(m.material_type)}`}
              >
                <p className="text-[10px] uppercase tracking-wide font-semibold mb-1">
                  {labelFor(m.material_type)}
                </p>
                <p className="text-sm font-semibold">
                  {m.used_kg.toFixed(2)} kg used
                </p>
                <p className="text-[10px] opacity-80">
                  {m.waste_kg.toFixed(2)} waste · {m.remaining_kg.toFixed(2)} remaining
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grand totals */}
      <div className="grid grid-cols-3 gap-2 mb-4 pt-3 border-t border-gray-100">
        <div className="bg-gray-50 border border-gray-200 rounded p-2">
          <p className="text-[10px] uppercase tracking-wide text-gray-500">Total Used</p>
          <p className="text-base font-semibold text-gray-900">
            {grandTotals.used_kg.toFixed(2)} <span className="text-xs font-normal">kg</span>
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded p-2">
          <p className="text-[10px] uppercase tracking-wide text-red-600">Total Waste</p>
          <p className="text-base font-semibold text-red-700">
            {grandTotals.waste_kg.toFixed(2)} <span className="text-xs font-normal">kg</span>
          </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded p-2">
          <p className="text-[10px] uppercase tracking-wide text-emerald-700">Remaining</p>
          <p className="text-base font-semibold text-emerald-800">
            {grandTotals.remaining_kg.toFixed(2)} <span className="text-xs font-normal">kg</span>
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-2 bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700">
          <i className="fa-solid fa-triangle-exclamation mr-1" />
          {error}
        </div>
      )}

      {/* Input form */}
      <div className="mb-2">
        <label className="text-[11px] text-gray-600 mb-1 block">
          Material Type <span className="text-red-500">*</span>
        </label>
        <select
          value={materialType}
          onChange={(e) => setMaterialType(e.target.value)}
          disabled={saving}
          className="w-full text-sm border border-gray-300 rounded px-2 py-1.5"
        >
          {MATERIAL_TYPES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <label className="text-[11px] text-gray-600 mb-1 block">
            Used (kg) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={used}
            onChange={(e) => setUsed(e.target.value)}
            disabled={saving}
            className={`w-full text-sm border rounded px-2 py-1.5 ${
              fieldErrors.fabric_used_kg ? "border-red-300" : "border-gray-300"
            }`}
          />
          {fieldErrors.fabric_used_kg && (
            <p className="text-[10px] text-red-600 mt-0.5">{fieldErrors.fabric_used_kg}</p>
          )}
        </div>

        <div>
          <label className="text-[11px] text-gray-600 mb-1 block">
            Waste (kg)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={waste}
            onChange={(e) => setWaste(e.target.value)}
            disabled={saving}
            className={`w-full text-sm border rounded px-2 py-1.5 ${
              fieldErrors.waste_kg ? "border-red-300" : "border-gray-300"
            }`}
          />
          {fieldErrors.waste_kg && (
            <p className="text-[10px] text-red-600 mt-0.5">{fieldErrors.waste_kg}</p>
          )}
        </div>
      </div>

      <div className="mb-3">
        <label className="text-[11px] text-gray-600 mb-1 block">
          Notes
        </label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Hal. May maliit na maputol sa bandang likod."
          disabled={saving}
          className="w-full text-sm border border-gray-300 rounded px-2 py-1.5"
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={saving}
        className="w-full bg-primary text-white text-sm py-2 rounded font-medium hover:bg-primary/90 disabled:opacity-50"
      >
        {saving ? (
          <>
            <i className="fa-solid fa-spinner fa-spin mr-1" />
            Sini-save…
          </>
        ) : (
          <>
            <i className="fa-solid fa-floppy-disk mr-1" />
            Save Material Usage
          </>
        )}
      </button>

      {/* Log history */}
      {logs.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-2">
            History
          </p>
          <div className="flex flex-col gap-1.5">
            {logs.slice(0, 8).map((log) => (
              <div
                key={log.id}
                className="text-[11px] flex items-center justify-between text-gray-600 py-1 border-b border-gray-50 last:border-0"
              >
                <span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded mr-1 ${badgeFor(log.material_type)}`}>
                    {labelFor(log.material_type)}
                  </span>
                  <strong className="text-gray-900">{log.fabric_used_kg.toFixed(2)} kg</strong> used,{" "}
                  <span className="text-red-600">{log.waste_kg.toFixed(2)} kg waste</span>
                </span>
                <span className="text-gray-400">
                  {log.created_at ? new Date(log.created_at).toLocaleString() : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default MaterialsUsageSection;
