import React, { useState } from "react";
import { csrPortalApi } from "../../../../api/csrPortalApi";

/**
 * Phase 6-A Bundle 2 — Verify Payment modal (Finance-gated).
 *
 * Only renders if the caller already client-side-gated on
 * `action.verify-payment`. Backend re-checks via PermissionMiddleware
 * (after BUG-017 fix, it does NOT also require portal.csr).
 *
 * Two paths:
 *   - Approve  → PATCH /csr/payments/{id}/verify { decision: 'verified' }
 *   - Reject   → PATCH /csr/payments/{id}/verify { decision: 'rejected',
 *                                                  rejection_reason: '...' }
 *
 * Props:
 *   payment        {...} (required) — must be in 'for_verification' status
 *   onClose()
 *   onVerified(payment)
 */
const VerifyPaymentModal = ({ payment, onClose, onVerified }) => {
  const [decision, setDecision] = useState(null); // null | 'verified' | 'rejected'
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrors({});
    setGeneralError(null);

    if (decision === "rejected" && !reason.trim()) {
      setErrors({ rejection_reason: "A reason is required when rejecting." });
      setSubmitting(false);
      return;
    }

    try {
      const res = await csrPortalApi.verifyPayment(
        payment.id,
        decision,
        decision === "rejected" ? reason : null,
      );
      onVerified?.(res?.data ?? res);
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
        setGeneralError("You don't have permission to verify payments.");
      } else {
        setGeneralError(data?.message || "Failed to verify payment.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!payment) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-5 my-8">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">Verify Payment</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Confirm or reject this payment after reviewing the proof.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-gray-400 hover:text-gray-700 text-lg leading-none p-1"
            aria-label="Close"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Payment summary */}
        <div className="rounded-md bg-gray-50 border border-gray-200 px-3 py-3 text-xs space-y-1 mb-3">
          <div className="flex justify-between">
            <span className="text-gray-500">Type:</span>
            <span className="font-medium text-gray-900 capitalize">
              {payment.payment_type?.replace(/_/g, " ")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Amount:</span>
            <span className="font-mono font-semibold text-gray-900">
              ₱{Number(payment.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          {payment.reference_number && (
            <div className="flex justify-between">
              <span className="text-gray-500">Reference:</span>
              <span className="font-mono text-gray-900">{payment.reference_number}</span>
            </div>
          )}
          {payment.notes && (
            <div className="pt-1 border-t border-gray-200 mt-1">
              <span className="text-gray-500 block">Notes:</span>
              <span className="text-gray-700">{payment.notes}</span>
            </div>
          )}
        </div>

        {/* Proof viewer */}
        {payment.proof_url && (
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Proof
            </label>
            {/\.(jpe?g|png|webp|gif)$/i.test(payment.proof_path || "") ? (
              <a
                href={payment.proof_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block border border-gray-200 rounded-md overflow-hidden hover:border-gray-300"
              >
                <img
                  src={payment.proof_url}
                  alt="Payment proof"
                  className="max-h-64 mx-auto"
                />
              </a>
            ) : (
              <a
                href={payment.proof_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:underline"
              >
                <i className="fa-regular fa-file-pdf" />
                Open proof in new tab
              </a>
            )}
          </div>
        )}

        {generalError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-2 mb-3 text-xs text-red-700">
            <i className="fa-solid fa-triangle-exclamation mr-1" />
            {generalError}
          </div>
        )}

        {/* Decision picker */}
        <div className="space-y-2 mb-4">
          <button
            type="button"
            onClick={() => setDecision("verified")}
            disabled={submitting}
            className={
              "w-full text-left rounded-md border px-3 py-2.5 text-xs transition-colors " +
              (decision === "verified"
                ? "border-emerald-300 bg-emerald-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50")
            }
          >
            <div className="flex items-center gap-2">
              <i
                className={
                  "fa-solid fa-circle-check " +
                  (decision === "verified" ? "text-emerald-600" : "text-gray-400")
                }
              />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Verify</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Confirm the payment was received. Status will flip to{" "}
                  <span className="font-semibold">verified</span>.
                </p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setDecision("rejected")}
            disabled={submitting}
            className={
              "w-full text-left rounded-md border px-3 py-2.5 text-xs transition-colors " +
              (decision === "rejected"
                ? "border-red-300 bg-red-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50")
            }
          >
            <div className="flex items-center gap-2">
              <i
                className={
                  "fa-solid fa-circle-xmark " +
                  (decision === "rejected" ? "text-red-600" : "text-gray-400")
                }
              />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Reject</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  The proof is invalid or the payment did not come through.
                </p>
              </div>
            </div>
          </button>
        </div>

        {decision === "rejected" && (
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={submitting}
              placeholder="e.g. Reference number doesn't match the bank statement"
              className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.rejection_reason ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors.rejection_reason && (
              <p className="text-xs text-red-600 mt-1">{errors.rejection_reason}</p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-gray-100">
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
            disabled={submitting || !decision}
            className={
              "px-4 py-2 text-sm rounded text-white disabled:opacity-50 transition-colors " +
              (decision === "rejected"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-emerald-600 hover:bg-emerald-700")
            }
          >
            {submitting ? (
              <>
                <i className="fa-solid fa-spinner fa-spin mr-1" />
                Submitting…
              </>
            ) : decision === "rejected" ? (
              "Reject Payment"
            ) : decision === "verified" ? (
              "Verify Payment"
            ) : (
              "Choose decision"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyPaymentModal;
