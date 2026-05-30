import React, { useCallback, useEffect, useState } from "react";
import { stageReviewApi } from "../../api/stageReviewApi";

/**
 * StageRejectionBanner
 * ------------------------------------------------------------------------
 * Drop-in for any production portal page. Probes the CSR Review Hub state
 * for the portal's active order stage and, when there is an OPEN REJECTION
 * (the reviewer rejected the output and it hasn't been resubmitted yet),
 * shows the rejection comment/image plus a "Resubmit" action.
 *
 * Renders NOTHING when there's no open rejection, so it's safe to mount
 * unconditionally at the top of any portal page.
 *
 * Usage:
 *   <StageRejectionBanner
 *     orderStageId={currentStageId}
 *     onResubmitted={() => setRefreshKey((k) => k + 1)}
 *   />
 */
const StageRejectionBanner = ({ orderStageId, onResubmitted }) => {
  const [state, setState] = useState(null);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const probe = useCallback(async () => {
    if (!orderStageId) {
      setState(null);
      return;
    }
    try {
      const res = await stageReviewApi.state(orderStageId);
      setState(res);
    } catch {
      // Silent — if we can't read review state, just don't show the banner.
      setState(null);
    }
  }, [orderStageId]);

  useEffect(() => {
    probe();
  }, [probe]);

  if (!state?.open_rejection || !state?.latest) return null;

  const latest = state.latest;

  const resubmit = async () => {
    setBusy(true);
    setError(null);
    try {
      await stageReviewApi.resubmit(orderStageId, comment.trim() || null);
      setComment("");
      await probe();
      onResubmitted?.();
    } catch (e) {
      setError(e?.response?.data?.message || "Resubmit failed. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4">
      <div className="flex items-start gap-3">
        <i className="fa-solid fa-circle-exclamation mt-0.5 text-xl text-red-600" />
        <div className="flex-1">
          <p className="font-semibold text-red-800">
            This stage was rejected and needs rework.
          </p>
          {latest.comment && (
            <p className="mt-1 text-sm text-red-700">
              <span className="font-medium">Reviewer:</span> {latest.comment}
            </p>
          )}
          {latest.image_url && (
            <a
              href={latest.image_url}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block text-sm text-red-700 underline"
            >
              View attached image
            </a>
          )}
          <p className="mt-1 text-xs text-red-500">
            {latest.actor?.name ? `by ${latest.actor.name} · ` : ""}
            {latest.created_at}
          </p>

          <div className="mt-3">
            <label className="mb-1 block text-sm font-medium text-red-800">
              What did you fix? (optional)
            </label>
            <textarea
              className="w-full rounded-lg border border-red-300 p-2 text-sm focus:border-red-500 focus:outline-none"
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe the correction so the reviewer can re-check it."
            />
          </div>

          {error && <p className="mt-2 text-sm text-red-700">{error}</p>}

          <button
            onClick={resubmit}
            disabled={busy}
            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {busy ? "Resubmitting…" : "Resubmit for review"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StageRejectionBanner;
