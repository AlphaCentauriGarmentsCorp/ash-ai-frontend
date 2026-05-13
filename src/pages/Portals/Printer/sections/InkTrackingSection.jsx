import React, { useState } from "react";
import { printerPortalApi } from "../../../../api/printerPortalApi";

const InkTrackingSection = ({
  inkTracking,
  orderId,
  orderStageId,
  onChanged,
}) => {
  const [inkColor, setInkColor] = useState("");
  const [inkUsed, setInkUsed] = useState("");
  const [waste, setWaste] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const usedNum = Number(inkUsed) || 0;
  const wasteNum = Number(waste) || 0;
  const projectedRemaining =
    inkUsed && wasteNum <= usedNum ? (usedNum - wasteNum).toFixed(3) : null;

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    setFieldErrors({});

    if (!inkUsed || usedNum < 0.001) {
      setFieldErrors({ ink_used_kg: "Kailangan ng valid na ink used." });
      setSaving(false);
      return;
    }
    if (wasteNum > usedNum) {
      setFieldErrors({ ink_waste_kg: "Hindi pwedeng mas malaki ang waste sa ink used." });
      setSaving(false);
      return;
    }

    try {
      await printerPortalApi.createInkLog({
        order_id: orderId,
        order_stage_id: orderStageId,
        ink_color: inkColor || undefined,
        ink_used_kg: usedNum,
        ink_waste_kg: wasteNum,
        notes: notes || undefined,
      });
      setInkColor("");
      setInkUsed("");
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

  const totals = inkTracking?.totals || {
    ink_used_kg: 0,
    ink_waste_kg: 0,
    usable_remaining_kg: 0,
  };
  const logs = inkTracking?.logs || [];

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
          4
        </span>
        Ink / Paint Usage &amp; Waste Tracking
      </h2>
      <p className="text-xs text-gray-500 mb-3">
        Ilagay ang nagamit na pintura at waste.
      </p>

      {/* Totals strip */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-gray-50 border border-gray-200 rounded p-2">
          <p className="text-[10px] uppercase tracking-wide text-gray-500">Ink Used</p>
          <p className="text-base font-semibold text-gray-900">
            {totals.ink_used_kg.toFixed(3)} <span className="text-xs font-normal">kg</span>
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded p-2">
          <p className="text-[10px] uppercase tracking-wide text-red-600">Waste</p>
          <p className="text-base font-semibold text-red-700">
            {totals.ink_waste_kg.toFixed(3)} <span className="text-xs font-normal">kg</span>
          </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded p-2">
          <p className="text-[10px] uppercase tracking-wide text-emerald-700">Remaining</p>
          <p className="text-base font-semibold text-emerald-800">
            {totals.usable_remaining_kg.toFixed(3)} <span className="text-xs font-normal">kg</span>
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
          Ink Color
        </label>
        <input
          type="text"
          value={inkColor}
          onChange={(e) => setInkColor(e.target.value)}
          placeholder="e.g. White, Pantone 186 C"
          disabled={saving}
          className="w-full text-sm border border-gray-300 rounded px-2 py-1.5"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <label className="text-[11px] text-gray-600 mb-1 block">
            Ink Used (kg) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0.001"
            step="0.001"
            value={inkUsed}
            onChange={(e) => setInkUsed(e.target.value)}
            disabled={saving}
            className={`w-full text-sm border rounded px-2 py-1.5 ${
              fieldErrors.ink_used_kg ? "border-red-300" : "border-gray-300"
            }`}
          />
          {fieldErrors.ink_used_kg && (
            <p className="text-[10px] text-red-600 mt-0.5">{fieldErrors.ink_used_kg}</p>
          )}
        </div>

        <div>
          <label className="text-[11px] text-gray-600 mb-1 block">
            Waste (kg)
          </label>
          <input
            type="number"
            min="0"
            step="0.001"
            value={waste}
            onChange={(e) => setWaste(e.target.value)}
            disabled={saving}
            className={`w-full text-sm border rounded px-2 py-1.5 ${
              fieldErrors.ink_waste_kg ? "border-red-300" : "border-gray-300"
            }`}
          />
          {fieldErrors.ink_waste_kg && (
            <p className="text-[10px] text-red-600 mt-0.5">{fieldErrors.ink_waste_kg}</p>
          )}
        </div>
      </div>

      {projectedRemaining !== null && (
        <p className="text-[11px] text-gray-500 mb-2">
          Projected usable: <span className="font-semibold text-emerald-700">{projectedRemaining} kg</span>
        </p>
      )}

      <div className="mb-3">
        <label className="text-[11px] text-gray-600 mb-1 block">
          Notes
        </label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Hal. Manipis ang print sa likod."
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
            Save Input
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
            {logs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="text-[11px] flex items-center justify-between text-gray-600 py-1 border-b border-gray-50 last:border-0"
              >
                <span>
                  {log.ink_color && (
                    <strong className="text-gray-900 mr-1">{log.ink_color}:</strong>
                  )}
                  <strong className="text-gray-900">{log.ink_used_kg.toFixed(3)} kg</strong> used,{" "}
                  <span className="text-red-600">{log.ink_waste_kg.toFixed(3)} kg waste</span>
                </span>
                <span className="text-gray-400">
                  {log.created_at
                    ? new Date(log.created_at).toLocaleString()
                    : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default InkTrackingSection;
