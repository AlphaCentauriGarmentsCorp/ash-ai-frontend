import React, { useCallback, useEffect, useMemo, useState } from "react";
import { OrderStages, isPaymentGate } from "../../../constants/formOptions/orderStages";
import { stageReviewApi } from "../../../api/stageReviewApi";
import { useAuth } from "../../../hooks/useAuth";
import { hasRequiredPermissions } from "../../../utils/authz";

/**
 * CSR Review Hub
 * ------------------------------------------------------------------------
 * Read-only review-and-history surface for the order's Production tab.
 * CSR / Super Admin / Admin can APPROVE or REJECT each stage's output and
 * browse the full review history. The reject/resubmit loop is advisory: it
 * never moves the workflow pointer (see StageReviewService for the rationale).
 *
 * Data:
 *   - order.orderStages           → the 16-stage spine (id, stage, sequence,
 *                                    status, assigned_role)
 *   - stageReviewApi.forOrder()   → { history (by stage id), states (by stage id) }
 *
 * Reviewer actions are gated client-side by the access.production-review
 * permission (the backend enforces it too). Non-reviewers see a read-only hub.
 */

const STATE_BADGE = {
  none: { label: "Not reviewed", cls: "bg-gray-100 text-gray-600" },
  approved: { label: "Approved", cls: "bg-green-100 text-green-700" },
  rejected: { label: "Rejected — awaiting rework", cls: "bg-red-100 text-red-700" },
  resubmitted: { label: "Resubmitted — re-review", cls: "bg-amber-100 text-amber-700" },
};

const DECISION_META = {
  approve: { label: "Approved", icon: "fa-circle-check", cls: "text-green-600" },
  reject: { label: "Rejected", icon: "fa-circle-xmark", cls: "text-red-600" },
  resubmit: { label: "Resubmitted", icon: "fa-rotate-left", cls: "text-amber-600" },
};

const labelFor = (slug) =>
  OrderStages.find((d) => d.value === slug)?.label || slug;
const iconFor = (slug) =>
  OrderStages.find((d) => d.value === slug)?.icon || "fa-circle";

const RejectModal = ({ stage, onClose, onSubmit, busy }) => {
  const [comment, setComment] = useState("");
  const [image, setImage] = useState(null);
  const [err, setErr] = useState(null);

  const submit = () => {
    if (!comment.trim()) {
      setErr("A comment is required when rejecting.");
      return;
    }
    onSubmit(comment.trim(), image);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
        <h3 className="mb-1 text-lg font-semibold text-gray-800">
          Reject: {labelFor(stage.stage)}
        </h3>
        <p className="mb-4 text-sm text-gray-500">
          The owning role will be notified and can resubmit after fixing it.
        </p>

        <label className="mb-1 block text-sm font-medium text-gray-700">
          Comment <span className="text-red-500">*</span>
        </label>
        <textarea
          className="mb-3 w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
          rows={4}
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            setErr(null);
          }}
          placeholder="What needs to be corrected?"
        />

        <label className="mb-1 block text-sm font-medium text-gray-700">
          Attach image (optional)
        </label>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
          className="mb-3 block w-full text-sm text-gray-600"
        />

        {err && <p className="mb-3 text-sm text-red-600">{err}</p>}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={busy}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={busy}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {busy ? "Rejecting…" : "Confirm reject"}
          </button>
        </div>
      </div>
    </div>
  );
};

const StageCard = ({ stage, state, history, uploads, canReview, onApprove, onReject, busyId }) => {
  const badge = STATE_BADGE[state?.review_state || "none"];
  const busy = busyId === stage.id;
  const paymentGate = isPaymentGate(stage.stage);
  // Whether THIS viewer can act on the stage. For a payment gate the backend
  // returns can_approve/can_reject false unless the viewer has verify-payment,
  // so a CSR ends up with no actionable buttons here (read-only).
  const canAct = canReview && (state?.can_approve || state?.can_reject);

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <i className={`fa-solid ${iconFor(stage.stage)} text-gray-400`} />
          <div>
            <p className="font-semibold text-gray-800">
              <span className="text-gray-400">#{stage.sequence}</span>{" "}
              {labelFor(stage.stage)}
            </p>
            <p className="text-xs text-gray-500">
              {stage.assigned_role
                ? stage.assigned_role.replace(/_/g, " ")
                : "—"}{" "}
              · workflow status: {stage.status}
            </p>
          </div>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge.cls}`}>
          {badge.label}
        </span>
      </div>

      {/* Artifacts — proof-of-work uploads for this stage (Phase 3). Lets the
          reviewer see what they're approving. */}
      {Array.isArray(uploads) && uploads.length > 0 ? (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
            Attachments ({uploads.length})
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6">
            {uploads.map((u) => (
              <a
                key={u.id}
                href={u.url}
                target="_blank"
                rel="noreferrer"
                title={u.label || u.original_name || "attachment"}
                className="block overflow-hidden rounded-lg border border-gray-200"
              >
                {u.is_image ? (
                  <img
                    src={u.url}
                    alt={u.original_name || "attachment"}
                    className="h-16 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-full items-center justify-center bg-gray-50 text-gray-400">
                    <i className="fa-solid fa-file-pdf text-xl" />
                  </div>
                )}
                <p className="truncate px-1 py-0.5 text-[10px] text-gray-500">
                  {u.label || u.original_name || u.source}
                </p>
              </a>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <p className="text-xs italic text-gray-400">
            No artifact uploaded for this stage yet.
          </p>
        </div>
      )}

      {/* History */}
      {Array.isArray(history) && history.length > 0 && (
        <ul className="mt-3 space-y-2 border-t border-gray-100 pt-3">
          {history.map((r) => {
            const dm = DECISION_META[r.decision] || {};
            return (
              <li key={r.id} className="flex gap-2 text-sm">
                <i className={`fa-solid ${dm.icon} mt-0.5 ${dm.cls}`} />
                <div className="flex-1">
                  <span className="font-medium text-gray-700">{dm.label}</span>
                  <span className="text-gray-400">
                    {" "}
                    by {r.actor?.name || "—"} · {r.created_at}
                  </span>
                  {r.comment && (
                    <p className="text-gray-600">{r.comment}</p>
                  )}
                  {r.image_url && (
                    <a
                      href={r.image_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 underline"
                    >
                      View attached image
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Reviewer actions — each button shows only when actionable, so an
          already-approved or locked stage doesn't expose a spammy Approve. */}
      {canAct && (
        <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
          {state?.can_approve && (
            <button
              onClick={() => onApprove(stage)}
              disabled={busy}
              className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              {busy ? "…" : "Approve"}
            </button>
          )}
          {state?.can_reject && (
            <button
              onClick={() => onReject(stage)}
              disabled={busy}
              className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              Reject
            </button>
          )}
        </div>
      )}

      {/* Change 17 — payment verification is a Finance action. For anyone who
          can't verify payment (e.g. CSR) the gate is read-only here, so we show
          a clear note in place of the (now-hidden) Approve/Reject buttons. */}
      {paymentGate && !canAct && (
        <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3 text-xs text-gray-500">
          <i className="fa-solid fa-money-check-dollar text-gray-400" />
          Payment verification is handled by Finance — read-only here.
        </div>
      )}
    </div>
  );
};

const ReviewHub = ({ order, onChanged }) => {
  const { user } = useAuth();
  const canReview = hasRequiredPermissions(
    user,
    ["access.production-review"],
    "any"
  );

  const [data, setData] = useState({ history: {}, states: {}, uploads: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rejectStage, setRejectStage] = useState(null);
  const [busyId, setBusyId] = useState(null);

  // Only stages that have actually started are worth reviewing — pending
  // stages have no output yet. Sorted by sequence (already is, defensively).
  const stages = useMemo(() => {
    const list = Array.isArray(order?.orderStages) ? order.orderStages : [];
    return [...list]
      .filter((s) => s.status && s.status !== "pending")
      .sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
  }, [order]);

  const load = useCallback(async () => {
    if (!order?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await stageReviewApi.forOrder(order.id);
      setData({ history: res.history || {}, states: res.states || {}, uploads: res.uploads || {} });
    } catch (e) {
      setError(
        e?.response?.data?.message || "Could not load review history."
      );
    } finally {
      setLoading(false);
    }
  }, [order?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const approve = async (stage) => {
    setBusyId(stage.id);
    try {
      await stageReviewApi.approve(stage.id);
      await load();
      // Approve advances the workflow, so the parent order (timeline, badges,
      // stage statuses) is now stale — ask it to refetch.
      onChanged?.();
    } catch (e) {
      setError(e?.response?.data?.message || "Approve failed.");
    } finally {
      setBusyId(null);
    }
  };

  const doReject = async (comment, image) => {
    if (!rejectStage) return;
    setBusyId(rejectStage.id);
    try {
      await stageReviewApi.reject(rejectStage.id, comment, image);
      setRejectStage(null);
      await load();
      onChanged?.();
    } catch (e) {
      setError(e?.response?.data?.message || "Reject failed.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Review Hub</h2>
        <p className="text-sm text-gray-500">
          {canReview
            ? "Approve or reject each stage's output. Rejections notify the owning role and don't halt the order."
            : "Read-only view of each stage's review history."}
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-sm text-gray-500">Loading review history…</div>
      )}

      {!loading && stages.length === 0 && (
        <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
          No started stages yet — nothing to review.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {stages.map((stage) => (
          <StageCard
            key={stage.id}
            stage={stage}
            state={data.states?.[stage.id]}
            history={data.history?.[stage.id]}
            uploads={data.uploads?.[stage.id]}
            canReview={canReview}
            onApprove={approve}
            onReject={setRejectStage}
            busyId={busyId}
          />
        ))}
      </div>

      {rejectStage && (
        <RejectModal
          stage={rejectStage}
          busy={busyId === rejectStage.id}
          onClose={() => setRejectStage(null)}
          onSubmit={doReject}
        />
      )}
    </div>
  );
};

export default ReviewHub;