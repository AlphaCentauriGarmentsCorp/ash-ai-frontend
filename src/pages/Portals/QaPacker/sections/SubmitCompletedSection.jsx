import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { qaPackerPortalApi } from "../../../../api/qaPackerPortalApi";
import useDraftState from "../../../../hooks/useDraftState";

/**
 * Phase 7-B Bundle 4a — SUBMIT COMPLETED section + confirmation flow
 * + post-submit success card.
 *
 * Three rendering modes:
 *   1. "ready"      — big green button, summary of what's about to happen
 *   2. "confirming" — modal with full preview + soft-block warnings
 *   3. "submitted"  — success card with Continue to next stage / Dashboard
 *
 * Reads the localStorage draft (`useDraftState`) to get the QA + Packing
 * tick states, computes counts for the soft-block warning, then on
 * confirm calls qaPackerPortalApi.submit() with the full payload.
 *
 * Post-submit:
 *   - If stage was mass_qa → next stage is mass_packing → primary CTA
 *     is "Continue to Packing" (only useful if the same user is also
 *     assigned to packing; otherwise it just navigates to /portal/qa-packer
 *     and the my-active resolver does its thing).
 *   - If stage was mass_packing → next stage is delivery (logistics, different
 *     portal) → primary CTA is "Back to Dashboard."
 *
 * Props:
 *   task             - context.task
 *   qaChecklist      - context.qa_checklist
 *   packingChecklist - context.packing_checklist
 *   rejectsRepairs   - context.rejects_repairs
 *   userId
 *   finalPhotos      - parent-held map { kind: path }
 *   onSubmitted()    - notified after successful submit
 *   sectionNumber    - usually a final section, no number badge
 */
const SubmitCompletedSection = ({
  task,
  qaChecklist = [],
  packingChecklist = [],
  rejectsRepairs = [],
  userId,
  finalPhotos = {},
  onSubmitted,
}) => {
  const navigate = useNavigate();
  const draftKey = `qa-packer:${task?.order_stage_id}:${userId || "anon"}`;
  const [draft, , clearDraft] = useDraftState(draftKey, { qa: {}, packing: {} });

  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submittedResult, setSubmittedResult] = useState(null); // server response on success

  // Compute summary stats for the confirmation modal.
  const summary = useMemo(() => {
    const qaChecked = qaChecklist.filter((i) => draft.qa?.[i.slug]).length;
    const qaTotal = qaChecklist.length;
    const packingChecked = packingChecklist.filter(
      (i) => draft.packing?.[i.slug],
    ).length;
    const packingTotal = packingChecklist.length;

    const rejectPcs = rejectsRepairs
      .filter((e) => e.disposition === "reject")
      .reduce((s, e) => s + (parseInt(e.quantity_pcs, 10) || 0), 0);
    const repairPcs = rejectsRepairs
      .filter((e) => e.disposition === "repair")
      .reduce((s, e) => s + (parseInt(e.quantity_pcs, 10) || 0), 0);

    const totalPcs = task?.total_pcs || 0;
    const rejectPct = totalPcs > 0 ? rejectPcs / totalPcs : 0;
    const exceedsThreshold = rejectPcs >= 5 || rejectPct >= 0.10;

    const photoCount = Object.keys(finalPhotos).filter(
      (k) => !!finalPhotos[k],
    ).length;

    return {
      qaChecked,
      qaTotal,
      qaIncomplete: qaChecked < qaTotal,
      packingChecked,
      packingTotal,
      packingIncomplete: packingChecked < packingTotal,
      rejectPcs,
      repairPcs,
      rejectPct,
      exceedsThreshold,
      photoCount,
      photosIncomplete: photoCount < 3,
    };
  }, [qaChecklist, packingChecklist, draft, rejectsRepairs, task, finalPhotos]);

  // ── Submit action ────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!task?.order_stage_id) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        qa_checklist_state: draft.qa || {},
        packing_checklist_state: draft.packing || {},
        final_photos: finalPhotos,
      };
      const result = await qaPackerPortalApi.submit(task.order_stage_id, payload);
      setSubmittedResult(result.data);
      clearDraft();
      setConfirming(false);
      onSubmitted?.(result.data);
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message ||
          "Hindi na-submit. Subukan ulit.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render modes ─────────────────────────────────────────────

  // Post-submit success card.
  if (submittedResult) {
    const wasQc = submittedResult.stage === "mass_qa";
    const nextStage = submittedResult.new_stage;
    const exceeded =
      !!submittedResult.reject_summary?.exceeds_threshold;

    return (
      <section className="bg-white rounded-lg border-2 border-emerald-200 p-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-emerald-100 flex items-center justify-center">
            <i className="fa-solid fa-circle-check text-3xl text-emerald-600" />
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {wasQc ? "Quality Control" : "Packing"} completed!
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            {task.po_code} —{" "}
            {nextStage ? (
              <>
                Order moved to{" "}
                <span className="capitalize font-medium">
                  {nextStage.replace(/_/g, " ")}
                </span>
                .
              </>
            ) : (
              <>Order workflow finished.</>
            )}
          </p>

          {/* Reject/notification badges */}
          <div className="flex items-center justify-center gap-2 flex-wrap mb-4">
            {submittedResult.notifications?.csr && (
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1">
                <i className="fa-solid fa-bell text-[9px]" /> CSR notified
              </span>
            )}
            {submittedResult.notifications?.logistics && (
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1">
                <i className="fa-solid fa-truck text-[9px]" /> Logistics notified
              </span>
            )}
            {exceeded && (
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 inline-flex items-center gap-1">
                <i className="fa-solid fa-triangle-exclamation text-[9px]" /> Super Admin alerted
              </span>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            {wasQc && nextStage === "mass_packing" ? (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="text-sm bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 inline-flex items-center gap-2"
              >
                <i className="fa-solid fa-arrow-right" />
                Continue to Packing
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-sm bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:border-primary inline-flex items-center gap-2"
            >
              <i className="fa-solid fa-house" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Ready / button mode.
  return (
    <>
      <section className="bg-emerald-50 rounded-lg border-2 border-emerald-200 p-6 text-center">
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          Ready to submit?
        </h3>
        <p className="text-xs text-gray-600 mb-4">
          Iko-confirm muna namin ang task summary bago tuluyang i-submit.
        </p>

        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="text-sm bg-emerald-600 text-white px-6 py-3 rounded-md hover:bg-emerald-700 inline-flex items-center gap-2 font-semibold shadow-sm"
        >
          <i className="fa-solid fa-circle-check" />
          SUBMIT COMPLETED
        </button>

        {(summary.qaIncomplete || summary.packingIncomplete || summary.photosIncomplete) && (
          <p className="text-[11px] text-amber-700 mt-3">
            <i className="fa-solid fa-circle-info mr-1" />
            May mga unchecked items o photos pa. Pwede pa rin i-submit pero may
            confirmation muna.
          </p>
        )}
      </section>

      {/* Confirmation modal */}
      {confirming && (
        <div className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-5 my-8">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Confirm submission
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tingnan ang summary bago tuluyang i-submit. Hindi na maibabalik
                  ang aksyon na ito.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={submitting}
                className="text-gray-400 hover:text-gray-700 text-lg leading-none p-1 disabled:opacity-50"
                aria-label="Close"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-2 mb-3 text-xs text-red-700">
                <i className="fa-solid fa-triangle-exclamation mr-1" />
                {submitError}
              </div>
            )}

            <div className="space-y-2 mb-4">
              <SummaryRow
                label="QA Checklist"
                value={`${summary.qaChecked} of ${summary.qaTotal} checked`}
                warn={summary.qaIncomplete}
              />
              <SummaryRow
                label="Packing Checklist"
                value={`${summary.packingChecked} of ${summary.packingTotal} checked`}
                warn={summary.packingIncomplete}
              />
              <SummaryRow
                label="Rejects logged"
                value={
                  summary.rejectPcs > 0
                    ? `${summary.rejectPcs} pcs (${(summary.rejectPct * 100).toFixed(1)}%)`
                    : "None"
                }
                warn={summary.exceedsThreshold}
                warnText={
                  summary.exceedsThreshold
                    ? "Super Admin will be alerted"
                    : undefined
                }
              />
              <SummaryRow
                label="Repairs logged"
                value={
                  summary.repairPcs > 0 ? `${summary.repairPcs} pcs` : "None"
                }
              />
              <SummaryRow
                label="Final photos"
                value={`${summary.photoCount} of 3 uploaded`}
                warn={summary.photosIncomplete}
              />
            </div>

            {(summary.qaIncomplete ||
              summary.packingIncomplete ||
              summary.photosIncomplete) && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4 text-xs text-amber-800">
                <p className="font-semibold mb-1">
                  <i className="fa-solid fa-triangle-exclamation mr-1" />
                  Hindi pa kumpleto:
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  {summary.qaIncomplete && <li>QA checklist not fully ticked</li>}
                  {summary.packingIncomplete && (
                    <li>Packing checklist not fully ticked</li>
                  )}
                  {summary.photosIncomplete && (
                    <li>One or more final photos missing</li>
                  )}
                </ul>
                <p className="mt-2 text-[11px]">
                  Pwede pa rin i-submit pero ire-record lahat ng nasa itaas.
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={submitting}
                className="text-xs text-gray-600 hover:text-gray-900 px-3 py-2 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="text-xs bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 disabled:opacity-60 inline-flex items-center gap-1.5 font-semibold"
              >
                {submitting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check" />
                    Confirm &amp; Submit
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const SummaryRow = ({ label, value, warn = false, warnText }) => (
  <div className="flex items-center justify-between text-xs gap-2">
    <span className="text-gray-600">{label}</span>
    <span
      className={`font-medium ${warn ? "text-amber-700" : "text-gray-900"} inline-flex items-center gap-1`}
    >
      {warn && <i className="fa-solid fa-circle-exclamation text-[10px]" />}
      {value}
      {warnText && (
        <span className="text-[10px] text-gray-500 font-normal ml-1">
          ({warnText})
        </span>
      )}
    </span>
  </div>
);

export default SubmitCompletedSection;
