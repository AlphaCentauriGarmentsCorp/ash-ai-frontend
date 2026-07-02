import React, { useCallback, useEffect, useMemo, useState } from "react";
import { OrderStages, isPaymentGate, stageOrdinal, getStatusMeta, findStage, getParallelTiers } from "../../../constants/formOptions/orderStages";
import { getRoleDisplayName } from "../../../config/roleConfig";
import { stageReviewApi } from "../../../api/stageReviewApi";

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

// Notes-only hub (owner decision): the Approve/Reject buttons and the
// review-state badge were removed — staff leave freeform notes instead.
// Legacy approve/reject/resubmit rows recorded before the change still
// render in the thread with their original labels.
const DECISION_META = {
  approve: { label: "Approved", icon: "fa-circle-check", cls: "text-green-600" },
  reject: { label: "Rejected", icon: "fa-circle-xmark", cls: "text-red-600" },
  resubmit: { label: "Resubmitted", icon: "fa-rotate-left", cls: "text-amber-600" },
  note: { label: "Note", icon: "fa-note-sticky", cls: "text-gray-400" },
};

// Payment-gate details (Fix: verified payments must stay viewable after the
// Dashboard queue drops them — the Review Hub is their permanent home).
const PAYMENT_TYPE_LABELS = {
  sample: "Sample",
  down_payment: "Downpayment (60%)",
  balance: "Balance (40%)",
  full: "Full Payment",
};

const PAYMENT_STATUS_BADGE = {
  waiting: { label: "Waiting", cls: "bg-gray-100 text-gray-600" },
  for_verification: { label: "For Verification", cls: "bg-amber-100 text-amber-700" },
  verified: { label: "Verified", cls: "bg-green-100 text-green-700" },
  rejected: { label: "Rejected", cls: "bg-red-100 text-red-700" },
};

const fmtWhen = (iso) => {
  if (!iso) return "\u2014";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? String(iso) : d.toLocaleString();
};

const fmtPeso = (v) =>
  `\u20B1${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

const labelFor = (slug) =>
  OrderStages.find((d) => d.value === slug)?.label || slug;
const iconFor = (slug) =>
  OrderStages.find((d) => d.value === slug)?.icon || "fa-circle";

// Tiers shared by >1 stage (the sample-phase fork). Used to badge parallel
// stages, mirroring the Workflow Timeline.
const PARALLEL_TIERS = new Set(getParallelTiers());

// Per-card note composer — any staff who can open the hub can post.
const NoteComposer = ({ stage, onSubmit, busy }) => {
  const [text, setText] = useState("");
  const [err, setErr] = useState(null);

  const submit = async () => {
    const comment = text.trim();
    if (!comment) {
      setErr("Type a note first.");
      return;
    }
    const ok = await onSubmit(stage, comment);
    if (ok) {
      setText("");
      setErr(null);
    }
  };

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-400">
        Add a note
      </label>
      <textarea
        rows={2}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setErr(null);
        }}
        disabled={busy}
        placeholder="Anything worth recording about this stage…"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
      {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
      <div className="mt-1.5 flex justify-end">
        <button
          onClick={submit}
          disabled={busy}
          className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Saving…" : "Add Note"}
        </button>
      </div>
    </div>
  );
};

const StageCard = ({ stage, history, uploads, payment, onAddNote, busyId }) => {
  const busy = busyId === stage.id;
  const paymentGate = isPaymentGate(stage.stage);
  const statusMeta = getStatusMeta(stage.status);
  const isParallel = PARALLEL_TIERS.has(stage.sequence);

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <i className={`fa-solid ${iconFor(stage.stage)} mt-1 text-gray-400`} />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded border border-gray-200 bg-gray-50 px-2 py-0.5 font-mono text-xs text-gray-600">
                #{stageOrdinal(stage.stage) ?? stage.sequence}
              </span>
              <p className="font-semibold text-gray-800">{labelFor(stage.stage)}</p>
              {isParallel && (
                <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-indigo-700">
                  <i className="fa-solid fa-code-branch" /> Parallel
                </span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
              <span className="inline-flex items-center gap-1">
                <i className="fa-solid fa-user-tag text-gray-400" />
                {getRoleDisplayName(stage.assigned_role || findStage(stage.stage)?.role)}
              </span>
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}>
                {statusMeta.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment gates — the full record of the gate's payment. Stays here
          permanently, so a verified payment is still viewable after it
          leaves the Dashboard "Pending Approvals" queue. */}
      {paymentGate && payment && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Payment Details
            </p>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                (PAYMENT_STATUS_BADGE[payment.status] || PAYMENT_STATUS_BADGE.waiting).cls
              }`}
            >
              {(PAYMENT_STATUS_BADGE[payment.status] || PAYMENT_STATUS_BADGE.waiting).label}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-3">
            <div>
              <p className="text-gray-400">Payment Type</p>
              <p className="font-medium text-gray-700">
                {PAYMENT_TYPE_LABELS[payment.payment_type] || payment.payment_type}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Amount</p>
              <p className="font-semibold text-gray-800">{fmtPeso(payment.amount)}</p>
            </div>
            <div>
              <p className="text-gray-400">Method</p>
              <p className="font-medium text-gray-700">{payment.method_name || "\u2014"}</p>
            </div>
            <div>
              <p className="text-gray-400">Payer</p>
              <p className="font-medium text-gray-700">{payment.payer_name || "\u2014"}</p>
            </div>
            <div>
              <p className="text-gray-400">Reference No.</p>
              <p className="font-medium text-gray-700">{payment.reference_number || "\u2014"}</p>
            </div>
            <div>
              <p className="text-gray-400">Paid At</p>
              <p className="font-medium text-gray-700">{fmtWhen(payment.paid_at)}</p>
            </div>
            <div>
              <p className="text-gray-400">Recorded By</p>
              <p className="font-medium text-gray-700">
                {payment.uploaded_by_name || "\u2014"}
                <span className="block text-[10px] text-gray-400">{fmtWhen(payment.uploaded_at)}</span>
              </p>
            </div>
            <div>
              <p className="text-gray-400">Verified By</p>
              <p className="font-medium text-gray-700">
                {payment.verified_by_name || "\u2014"}
                <span className="block text-[10px] text-gray-400">{fmtWhen(payment.verified_at)}</span>
              </p>
            </div>
          </div>
          {payment.rejection_reason && (
            <p className="mt-2 text-xs text-red-600">
              <i className="fa-solid fa-circle-xmark mr-1" />
              {payment.rejection_reason}
            </p>
          )}
          {payment.notes && (
            <p className="mt-2 text-xs italic text-gray-500">{payment.notes}</p>
          )}
          {payment.proof_url && (
            <a
              href={payment.proof_url}
              target="_blank"
              rel="noreferrer"
              title="Open proof of payment"
              className="mt-2 block w-fit overflow-hidden rounded-lg border border-gray-200"
            >
              <img
                src={payment.proof_url}
                alt="Proof of payment"
                className="h-24 object-cover"
              />
              <p className="px-1 py-0.5 text-[10px] text-gray-500">Proof of payment</p>
            </a>
          )}
        </div>
      )}

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
      ) : paymentGate && payment ? null : (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <p className="text-xs italic text-gray-400">
            No artifact uploaded for this stage yet.
          </p>
        </div>
      )}

      {/* Notes thread — chronological. Legacy approve/reject/resubmit rows
          from before the notes-only change render with their old labels. */}
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

      {/* Notes composer — replaces the old Approve/Reject actions. */}
      <NoteComposer stage={stage} onSubmit={onAddNote} busy={busy} />
    </div>
  );
};

const ReviewHub = ({ order }) => {
  const [data, setData] = useState({ history: {}, uploads: {}, payments: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  // Only stages that have actually started are worth reviewing — pending
  // stages have no output yet. Sorted by sequence (already is, defensively).
  const stages = useMemo(() => {
    const list = Array.isArray(order?.orderStages) ? order.orderStages : [];
    // Order by the human ordinal (1..N) so on-screen order matches the "#N"
    // badges — not the raw dependency tier, which reuses a number at the fork.
    const ord = (s) => stageOrdinal(s.stage) ?? s.sequence ?? 0;
    return [...list]
      .filter((s) => s.status && s.status !== "pending")
      .sort((a, b) => ord(a) - ord(b));
  }, [order]);

  const load = useCallback(async () => {
    if (!order?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await stageReviewApi.forOrder(order.id);
      setData({
        history: res.history || {},
        uploads: res.uploads || {},
        payments: res.payments || {},
      });
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

  // Append a note. Returns true on success so the composer can clear.
  const addNote = async (stage, comment) => {
    setBusyId(stage.id);
    try {
      await stageReviewApi.note(stage.id, comment);
      await load();
      return true;
    } catch (e) {
      setError(e?.response?.data?.message || "Could not save the note.");
      return false;
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Review Hub</h2>
        <p className="text-sm text-gray-500">
          Each stage keeps a running record — payment details on the gates,
          uploads, and staff notes. Type a note on any card to add to it.
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
          No started stages yet — nothing to show.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {stages.map((stage) => (
          <StageCard
            key={stage.id}
            stage={stage}
            history={data.history?.[stage.id]}
            uploads={data.uploads?.[stage.id]}
            payment={data.payments?.[stage.id]}
            onAddNote={addNote}
            busyId={busyId}
          />
        ))}
      </div>

    </div>
  );
};

export default ReviewHub;