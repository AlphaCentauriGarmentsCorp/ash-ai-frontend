import React, { useState } from "react";
import { stageInputsApi } from "../../api/stageInputsApi";

/**
 * Phase 4 — Modal for logging waste against a stage.
 *
 * Props:
 *  - orderId          (number, required)
 *  - stageId          (number, required) — the in_progress stage
 *  - stageLabel       (string) — for the modal title
 *  - onClose()        — close without saving
 *  - onSaved(log)     — fired with the new log on 201
 *
 * Backend validates:
 *   - Stage must be active (in_progress / for_approval / delayed)
 *   - Photo must be jpeg/png/webp ≤5MB
 *   - quantity_pcs ≥ 1
 *
 * 422 errors are surfaced inline next to fields where possible.
 */
const LogWasteModal = ({ orderId, stageId, stageLabel, onClose, onSaved }) => {
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrors({});
    setGeneralError(null);

    const qty = Number(quantity);
    if (!qty || qty < 1) {
      setErrors({ quantity_pcs: "Quantity must be at least 1." });
      setSubmitting(false);
      return;
    }

    try {
      const result = await stageInputsApi.createWaste(
        {
          order_id: orderId,
          order_stage_id: stageId,
          quantity_pcs: qty,
          notes: notes || undefined,
        },
        photo,
      );

      onSaved?.(result?.data ?? result);
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;

      if (status === 422 && data?.errors) {
        const flat = {};
        Object.entries(data.errors).forEach(([k, v]) => {
          flat[k] = Array.isArray(v) ? v[0] : String(v);
        });
        setErrors(flat);
        setGeneralError(data.message || "Validation failed.");
      } else if (status === 403) {
        setGeneralError("You don't have permission to log waste.");
      } else {
        setGeneralError(data?.message || "Failed to log waste. Try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5">
        <h3 className="font-semibold text-gray-900 mb-1">
          Log waste
        </h3>
        {stageLabel && (
          <p className="text-xs text-gray-500 mb-3">
            Stage: <span className="font-medium">{stageLabel}</span>
          </p>
        )}

        {generalError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-2 mb-3 text-xs text-red-700">
            <i className="fa-solid fa-triangle-exclamation mr-1" />
            {generalError}
          </div>
        )}

        {/* Quantity */}
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Quantity (pieces) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          disabled={submitting}
          className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary mb-1 ${
            errors.quantity_pcs ? "border-red-300" : "border-gray-300"
          }`}
        />
        {errors.quantity_pcs && (
          <p className="text-xs text-red-600 mb-2">{errors.quantity_pcs}</p>
        )}

        {/* Photo */}
        <label className="block text-xs font-medium text-gray-700 mt-3 mb-1">
          Photo <span className="text-gray-400 font-normal">(optional, jpeg/png/webp ≤5MB)</span>
        </label>
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
          disabled={submitting}
          className="w-full text-sm text-gray-700 mb-1 file:mr-3 file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-xs file:text-gray-700 hover:file:bg-gray-200"
        />
        {errors.photo && (
          <p className="text-xs text-red-600 mb-2">{errors.photo}</p>
        )}

        {/* Notes */}
        <label className="block text-xs font-medium text-gray-700 mt-3 mb-1">
          Notes <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Fabric tear in the second roll"
          disabled={submitting}
          className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.notes ? "border-red-300" : "border-gray-300"
          }`}
        />
        {errors.notes && (
          <p className="text-xs text-red-600 mt-1">{errors.notes}</p>
        )}

        {/* Generic stage-related error */}
        {errors.order_stage_id && (
          <p className="text-xs text-red-600 mt-2">{errors.order_stage_id}</p>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm rounded text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 text-sm rounded bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {submitting ? (
              <>
                <i className="fa-solid fa-spinner fa-spin mr-1" />
                Saving…
              </>
            ) : (
              "Log Waste"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogWasteModal;
