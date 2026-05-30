import React, { useCallback, useEffect, useRef, useState } from "react";
import { stageUploadApi } from "../../api/stageUploadApi";

/**
 * StageUploadSection
 * ------------------------------------------------------------------------
 * Drop-in proof-of-work upload panel for any production portal. Lets the
 * owning role attach photos/PDFs to their active stage so the CSR Review Hub
 * has a reviewable artifact (Phase 3). Lists existing uploads with thumbnails
 * and lets the uploader delete their own.
 *
 * Usage:
 *   <StageUploadSection
 *     orderStageId={currentStageId}
 *     category="screen"            // optional grouping tag
 *     title="Screen Photos"        // optional heading
 *   />
 */
const StageUploadSection = ({
  orderStageId,
  category = "proof",
  title = "Proof of Work",
  helpText = "Mag-attach ng larawan o PDF bilang patunay ng output para ma-review ng CSR.",
}) => {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState("");
  const fileRef = useRef(null);

  const load = useCallback(async () => {
    if (!orderStageId) return;
    setLoading(true);
    try {
      setUploads(await stageUploadApi.forStage(orderStageId));
    } catch {
      // Non-fatal — leave the list empty.
    } finally {
      setLoading(false);
    }
  }, [orderStageId]);

  useEffect(() => {
    load();
  }, [load]);

  const onPick = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !orderStageId) return;
    setBusy(true);
    setError(null);
    try {
      await stageUploadApi.upload(orderStageId, file, {
        category,
        notes: notes.trim() || null,
      });
      setNotes("");
      if (fileRef.current) fileRef.current.value = "";
      await load();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Upload failed. Use an image or PDF under 15 MB."
      );
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    setBusy(true);
    setError(null);
    try {
      await stageUploadApi.remove(id);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not delete.");
    } finally {
      setBusy(false);
    }
  };

  if (!orderStageId) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <i className="fa-solid fa-paperclip text-gray-400" />
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <span className="text-xs text-gray-400">
          ({uploads.length} attached)
        </span>
      </div>

      <p className="mb-3 text-sm text-gray-500">
        {helpText}
      </p>

      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional caption…"
          className="flex-1 rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <label
          className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white ${
            busy ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          <i className="fa-solid fa-upload" />
          {busy ? "Uploading…" : "Upload file"}
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
            onChange={onPick}
            disabled={busy}
            className="hidden"
          />
        </label>
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-400">Loading attachments…</p>
      ) : uploads.length === 0 ? (
        <p className="text-sm text-gray-400">Wala pang attachment.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {uploads.map((u) => (
            <div
              key={u.id}
              className="group relative overflow-hidden rounded-lg border border-gray-200"
            >
              <a href={u.url} target="_blank" rel="noreferrer">
                {u.is_image ? (
                  <img
                    src={u.url}
                    alt={u.original_name || "attachment"}
                    className="h-24 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-full items-center justify-center bg-gray-50 text-gray-400">
                    <i className="fa-solid fa-file-pdf text-2xl" />
                  </div>
                )}
              </a>
              <div className="p-1">
                <p className="truncate text-xs text-gray-600" title={u.original_name}>
                  {u.original_name || "file"}
                </p>
                {u.notes && (
                  <p className="truncate text-[11px] text-gray-400" title={u.notes}>
                    {u.notes}
                  </p>
                )}
              </div>
              <button
                onClick={() => remove(u.id)}
                disabled={busy}
                title="Delete"
                className="absolute right-1 top-1 hidden rounded-full bg-red-600 px-2 py-0.5 text-xs text-white group-hover:block disabled:opacity-50"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StageUploadSection;
