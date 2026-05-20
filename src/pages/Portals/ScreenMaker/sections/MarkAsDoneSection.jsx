import React, { useState } from "react";
import { orderStagesApi } from "../../../../api/orderStagesApi";

/**
 * Phase 5-F — Mark as Done quick action.
 *
 * Hits orderStagesApi.markForApproval (the Phase 4 endpoint that
 * transitions stage status → 'for_approval'). After Screen Maker marks
 * done, the screens are ready and the next stage (Sample Creation)
 * can begin.
 */
const MarkAsDoneSection = ({ stageId, currentStatus, onChanged }) => {
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const isCompleted =
    currentStatus === "completed" || currentStatus === "for_approval";

  const handleMarkDone = async () => {
    setSaving(true);
    setError(null);

    try {
      await orderStagesApi.forApproval(stageId);
      setConfirming(false);
      onChanged?.();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        "Hindi nakapag-mark. Tanungin ang manager.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
          5
        </span>
        Quick Actions
      </h2>

      {error && (
        <div className="mb-2 bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700">
          <i className="fa-solid fa-triangle-exclamation mr-1" />
          {error}
        </div>
      )}

      {isCompleted ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded p-3 text-sm text-emerald-800 flex items-center gap-2">
          <i className="fa-solid fa-circle-check" />
          Screen making is complete. Waiting for approval to proceed.
        </div>
      ) : !confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="w-full bg-primary text-white text-sm py-2.5 rounded font-medium hover:bg-primary/90 inline-flex items-center justify-center gap-1"
        >
          <i className="fa-solid fa-check" />
          Mark as Done
        </button>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded p-3">
          <p className="text-xs text-amber-900 mb-2">
            <i className="fa-solid fa-triangle-exclamation mr-1" />
            Sigurado ka na ba? Manonotify si Purchaser kapag na-mark mo na ito.
          </p>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={saving}
              className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleMarkDone}
              disabled={saving}
              className="text-xs px-3 py-1.5 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? "Sini-submit…" : "Confirm Mark as Done"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default MarkAsDoneSection;