import React, { useState } from "react";
import { csrPortalApi } from "../../../../api/csrPortalApi";

/**
 * Phase 6-A Bundle 2 — Respond to Approval modal.
 *
 * Records the client's response on a 'waiting' approval row.
 * Multipart (optional new screenshot of the client's reply).
 *
 * Three decisions:
 *   - approved              → terminal
 *   - revision_requested    → non-terminal (a new approval row will be opened later)
 *   - rejected              → terminal
 *
 * Props:
 *   approval        {...} (required)
 *   onClose()
 *   onResponded(approval)
 */
const DECISIONS = [
  {
    value: "approved",
    label: "Approved",
    icon: "fa-circle-check",
    color: "emerald",
    hint: "The client said yes. Workflow can move forward.",
  },
  {
    value: "revision_requested",
    label: "Revision Requested",
    icon: "fa-rotate",
    color: "amber",
    hint: "The client asked for changes. Open a new approval after revising.",
  },
  {
    value: "rejected",
    label: "Rejected",
    icon: "fa-circle-xmark",
    color: "red",
    hint: "The client said no. Order may need to be paused or cancelled.",
  },
];

const COLOR_BG = {
  emerald: { selected: "border-emerald-300 bg-emerald-50", icon: "text-emerald-600" },
  amber:   { selected: "border-amber-300 bg-amber-50",     icon: "text-amber-600" },
  red:     { selected: "border-red-300 bg-red-50",         icon: "text-red-600" },
};

const RespondApprovalModal = ({ approval, onClose, onResponded }) => {
  const [decision, setDecision] = useState(null);
  const [responseNotes, setResponseNotes] = useState("");
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

  const handleSubmit = async () => {
    if (!decision) return;
    setSubmitting(true);
    setErrors({});
    setGeneralError(null);

    try {
      const payload = {
        decision,
        client_response_notes: responseNotes || undefined,
        internal_notes: internalNotes || undefined,
      };
      if (screenshot) payload.screenshot = screenshot;
      Object.keys(payload).forEach((k) => {
        if (payload[k] === undefined || payload[k] === "") delete payload[k];
      });

      const res = await csrPortalApi.respondToApproval(approval.id, payload);
      onResponded?.(res?.data ?? res);
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
      } else {
        setGeneralError(data?.message || "Failed to record response.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!approval) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-xl w-full p-5 my-8">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">Record Client Response</h3>
            <p className="text-xs text-gray-500 mt-0.5 capitalize">
              {approval.kind?.replace(/_/g, " ")} approval · Order #{approval.order_id}
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

        {/* Existing screenshot if any */}
        {approval.screenshot_url && (
          <div className="mb-3">
            <p className="text-[11px] text-gray-500 mb-1">Original screenshot:</p>
            <a
              href={approval.screenshot_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block border border-gray-200 rounded-md overflow-hidden hover:border-gray-300"
            >
              <img
                src={approval.screenshot_url}
                alt="Original approval screenshot"
                className="max-h-40 mx-auto"
              />
            </a>
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
          {DECISIONS.map((d) => {
            const style = COLOR_BG[d.color];
            const isSelected = decision === d.value;
            return (
              <button
                key={d.value}
                type="button"
                onClick={() => setDecision(d.value)}
                disabled={submitting}
                className={
                  "w-full text-left rounded-md border px-3 py-2.5 text-xs transition-colors " +
                  (isSelected
                    ? style.selected
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50")
                }
              >
                <div className="flex items-center gap-2">
                  <i
                    className={
                      `fa-solid ${d.icon} ` +
                      (isSelected ? style.icon : "text-gray-400")
                    }
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{d.label}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{d.hint}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Client's Response{" "}
              <span className="text-gray-400 font-normal">(what they said)</span>
            </label>
            <textarea
              rows={2}
              value={responseNotes}
              onChange={(e) => setResponseNotes(e.target.value)}
              disabled={submitting}
              placeholder='e.g. "Okay na, proceed na" / "Pakialis nung text sa likod"'
              className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.client_response_notes ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors.client_response_notes && (
              <p className="text-xs text-red-600 mt-1">{errors.client_response_notes}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Internal Notes
            </label>
            <textarea
              rows={2}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              disabled={submitting}
              placeholder="CSR-only context"
              className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.internal_notes ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors.internal_notes && (
              <p className="text-xs text-red-600 mt-1">{errors.internal_notes}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Update Screenshot{" "}
              <span className="text-gray-400 font-normal">
                (optional — e.g. screenshot of the client's reply)
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
                <img src={preview} alt="Preview" className="max-h-40 mx-auto" />
              </div>
            )}
          </div>
        </div>

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
            className="px-4 py-2 text-sm rounded bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {submitting ? (
              <>
                <i className="fa-solid fa-spinner fa-spin mr-1" />
                Saving…
              </>
            ) : (
              "Record Response"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RespondApprovalModal;
