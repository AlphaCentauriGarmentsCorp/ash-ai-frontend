import React, { useState } from "react";
import { portalApi } from "../../api/portalApi";
import useConfirm from "../../hooks/useConfirm";

/**
 * Bundle 3 — the shared "Done" action for production portals.
 *
 * Default behaviour completes the worker's current stage and auto-advances
 * the workflow server-side via POST /portal/{role}/stages/{orderStageId}/done.
 * A confirm guards the tap so the workflow can't advance by accident; on
 * success onDone() runs (the portals send the worker back to their queue and
 * refresh it, so the finished task drops off the list).
 *
 * For non-stage completions (e.g. the Material Prep "Prep Done" fallback for an
 * order with nothing to buy) pass a custom `action` async function; everything
 * else (confirm, spinner, error dialog) is identical.
 *
 * Props:
 *   role, orderStageId           default stage /done target (ignored if `action` set)
 *   action                       optional async () => any — overrides the default call
 *   label                        button text (default "Tapos na")
 *   confirmTitle, confirmMessage confirm dialog copy
 *   hint                         optional helper line shown beside the button
 *   onDone                       () => void, run after a successful completion
 *   disabled                     boolean
 */
export default function StageDoneButton({
  role,
  orderStageId,
  action,
  label = "Tapos na",
  confirmTitle = "Tapos na ba ito?",
  confirmMessage = "Markahan ang task na ito bilang tapos. Awtomatikong magpapatuloy ang order sa susunod na hakbang.",
  hint = "Kapag tapos na ang trabaho dito, pindutin ang Tapos na para ipasa sa susunod.",
  onDone,
  disabled = false,
}) {
  const { confirm, alert, dialog } = useConfirm();
  const [submitting, setSubmitting] = useState(false);

  const handleClick = async () => {
    const ok = await confirm({
      title: confirmTitle,
      message: confirmMessage,
      confirmLabel: "Oo, tapos na",
      cancelLabel: "Hindi pa",
      tone: "primary",
    });
    if (!ok) return;

    setSubmitting(true);
    try {
      if (action) {
        await action();
      } else {
        await portalApi.markDone(role, orderStageId);
      }
      onDone?.();
    } catch (err) {
      await alert({
        title: "Hindi natapos",
        message:
          err?.response?.data?.message ||
          "May naganap na error. Subukan ulit, o tawagan ang admin kung magpatuloy.",
        tone: "danger",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      {hint ? <p className="text-sm text-gray-600">{hint}</p> : <span />}
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || submitting}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-white text-base font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 w-full sm:w-auto"
      >
        {submitting ? (
          <>
            <i className="fa-solid fa-spinner fa-spin" /> Sinusubmit…
          </>
        ) : (
          <>
            <i className="fa-solid fa-circle-check" /> {label}
          </>
        )}
      </button>
      {dialog}
    </div>
  );
}
