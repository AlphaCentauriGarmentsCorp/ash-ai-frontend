import React, { useState, useEffect } from "react";
import { orderStagesApi } from "../../../../api/orderStagesApi";

/**
 * Phase 5-H — Notes section for Graphic Artist Portal.
 * (Copy of StageNotesSection with section number 9 for GA layout.)
 *
 * Wraps the existing orderStagesApi.setNotes endpoint (Phase 4).
 * Pre-populates with current stage notes; saves overwrite the field.
 */
const StageNotesSectionGA = ({ stageId, initialNotes, onChanged }) => {
  const [notes, setNotes] = useState(initialNotes || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setNotes(initialNotes || "");
  }, [initialNotes]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      await orderStagesApi.setNotes(stageId, notes);
      setSaved(true);
      onChanged?.();
      // Clear the saved flag after 2s
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Hindi na-save. Subukan ulit.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
          9
        </span>
        Notes <span className="text-[10px] text-gray-400 font-normal">(Optional)</span>
      </h2>

      <p className="text-xs text-gray-500 mb-2">
        May mga notes o special instructions?
      </p>

      {error && (
        <div className="mb-2 bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700">
          <i className="fa-solid fa-triangle-exclamation mr-1" />
          {error}
        </div>
      )}

      {saved && (
        <div className="mb-2 bg-emerald-50 border border-emerald-200 rounded p-2 text-xs text-emerald-700">
          <i className="fa-solid fa-circle-check mr-1" />
          Saved!
        </div>
      )}

      <textarea
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Halimbawa: Medyo manipis ang lines, ingatan sa exposure."
        disabled={saving}
        className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 mb-3"
      />

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="bg-primary text-white text-sm px-4 py-1.5 rounded font-medium hover:bg-primary/90 disabled:opacity-50"
      >
        {saving ? (
          <>
            <i className="fa-solid fa-spinner fa-spin mr-1" />
            Sini-save…
          </>
        ) : (
          <>
            <i className="fa-solid fa-floppy-disk mr-1" />
            Save Notes
          </>
        )}
      </button>
    </section>
  );
};

export default StageNotesSectionGA;
