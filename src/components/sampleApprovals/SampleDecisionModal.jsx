import React, { useState } from "react";
import { csrPortalApi } from "../../api/csrPortalApi";

/**
 * SampleDecisionModal — Phase 3.
 *
 * CSR records the client's verdict on a packed sample for ONE order (fixed
 * from context, no dropdown). Two big-button outcomes:
 *
 *   Approve → the order advances to Payment Verification (Mass); the 60%
 *             downpayment stub appears on the awaiting list automatically.
 *   Reject  → the whole sample sub-flow loops back to Graphic Artwork so the
 *             artwork can be reworked and the sample re-made. A reason is
 *             required so the Graphic Artist knows what to fix. No second
 *             sample fee.
 *
 * Posts multipart to POST /csr/sample-approvals (csrPortalApi.decideSampleApproval).
 *
 * Props:
 *   order       - { id, po_code, client_name, client_brand }
 *   onClose()
 *   onDecided(result) - fired on 201 ({ outcome, next_stage })
 */
const SampleDecisionModal = ({ order, onClose, onDecided }) => {
  const [reason, setReason] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [preview, setPreview] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);

  const handleFile = (file) => {
    setScreenshot(file);
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const submit = async (decision) => {
    setErrors({});
    setGeneralError(null);

    if (!order?.id) {
      setGeneralError("No order in context.");
      return;
    }
    // A reject must carry a reason (also enforced server-side).
    if (decision === "rejected" && !reason.trim()) {
      setErrors({ client_response_notes: "Please say what needs to change so the artist can rework it." });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        order_id: order.id,
        decision,
        client_response_notes: reason,
        internal_notes: internalNotes,
      };
      if (screenshot) payload.screenshot = screenshot;

      const res = await csrPortalApi.decideSampleApproval(payload);
      onDecided?.(res);
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
        setGeneralError("You don't have permission to decide sample approvals.");
      } else {
        setGeneralError(data?.message || "Failed to record the decision. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-xl w-full p-5 my-8">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">Sample Approval</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Record the client's verdict on this sample.
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

        {/* Order context - fixed, no dropdown */}
        <div className="mb-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
          <span className="text-gray-500">Order</span>{" "}
          <span className="font-medium text-gray-900">{order?.po_code}</span>
          {order?.client_name && (
            <span className="text-gray-600">
              {" "}&mdash; {order.client_name}
              {order?.client_brand ? ` (${order.client_brand})` : ""}
            </span>
          )}
        </div>

        {/* What each choice does */}
        <div className="mb-3 rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
          <p>
            <i className="fa-solid fa-circle-check text-emerald-600 mr-1" />
            <strong>Approve</strong> &mdash; advances to mass-production payment.
          </p>
          <p className="mt-1">
            <i className="fa-solid fa-rotate-left text-red-500 mr-1" />
            <strong>Reject</strong> &mdash; loops back to Graphic Artwork to redo
            the sample (no extra sample fee).
          </p>
        </div>

        {generalError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-2 mb-3 text-xs text-red-700">
            <i className="fa-solid fa-triangle-exclamation mr-1" />
            {generalError}
          </div>
        )}

        <div className="space-y-3">
          {/* Reason / notes from the client */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              What did the client say?{" "}
              <span className="text-gray-400 font-normal">(required if rejecting)</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={submitting}
              placeholder="e.g. Approved! / Please make the logo bigger and move it to the chest."
              className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.client_response_notes ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors.client_response_notes && (
              <p className="text-xs text-red-600 mt-1">{errors.client_response_notes}</p>
            )}
          </div>

          {/* Optional internal note */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Internal note{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              disabled={submitting}
              placeholder="Anything for the team (not shown to client)"
              className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Optional screenshot of the client's reply */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Screenshot{" "}
              <span className="text-gray-400 font-normal">
                (jpg/png/webp/pdf &le;10MB &mdash; optional proof of the reply)
              </span>
            </label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              disabled={submitting}
              className="w-full text-sm text-gray-700 file:mr-3 file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-xs file:text-gray-700 hover:file:bg-gray-200"
            />
            {errors.screenshot && (
              <p className="text-xs text-red-600 mt-1">{errors.screenshot}</p>
            )}
            {preview && (
              <div className="mt-2 rounded-md border border-gray-200 p-2 bg-gray-50">
                <img src={preview} alt="Screenshot preview" className="max-h-40 mx-auto" />
              </div>
            )}
            {screenshot && !preview && (
              <p className="mt-1 text-xs text-gray-600">
                <i className="fa-regular fa-file-pdf mr-1" />
                {screenshot.name}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2 mt-5 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm rounded text-gray-700 hover:bg-gray-100 transition-colors order-last sm:order-first"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => submit("rejected")}
            disabled={submitting}
            className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors inline-flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-rotate-left" />
            Reject &mdash; loop back
          </button>
          <button
            type="button"
            onClick={() => submit("approved")}
            disabled={submitting}
            className="px-4 py-2 text-sm rounded bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors inline-flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <i className="fa-solid fa-spinner fa-spin" />
                Saving&hellip;
              </>
            ) : (
              <>
                <i className="fa-solid fa-circle-check" />
                Approve
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SampleDecisionModal;
