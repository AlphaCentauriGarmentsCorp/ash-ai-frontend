import React, { useEffect, useState } from "react";
import { csrPortalApi } from "../../../../api/csrPortalApi";
import { orderApi } from "../../../../api/orderApi";

/**
 * Phase 6-A Bundle 2 — Record Approval Request modal.
 *
 * CSR opens a new approval request on a specific order. Multipart
 * (optional screenshot of the mockup/sample being approved).
 *
 * Backend POST /csr/approvals creates the row with status='waiting'
 * and requested_at=now().
 *
 * Props:
 *   onClose()
 *   onSaved(approval)
 *   initialOrderId — optional, pre-selects an order
 */
const KIND_OPTIONS = [
  { value: "quotation",         label: "Quotation",         hint: "Initial price acceptance" },
  { value: "design",            label: "Design",            hint: "Final artwork before screen-making" },
  { value: "mockup",            label: "Mockup",            hint: "Visual proof before sample" },
  { value: "sample",            label: "Sample",            hint: "Physical sample sign-off" },
  { value: "production_change", label: "Production Change", hint: "Mid-production change request" },
  { value: "delivery",          label: "Delivery",          hint: "Final receipt confirmation" },
];

const RecordApprovalModal = ({ onClose, onSaved, initialOrderId = null }) => {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [form, setForm] = useState({
    order_id: initialOrderId || "",
    kind: "mockup",
    internal_notes: "",
  });
  const [screenshot, setScreenshot] = useState(null);
  const [preview, setPreview] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    orderApi
      .index()
      .then((res) => {
        if (!cancelled) {
          setOrders(Array.isArray(res) ? res : res?.data || []);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingOrders(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

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
    setSubmitting(true);
    setErrors({});
    setGeneralError(null);

    if (!form.order_id) {
      setErrors({ order_id: "Select an order." });
      setSubmitting(false);
      return;
    }

    try {
      const payload = { ...form };
      if (screenshot) payload.screenshot = screenshot;
      Object.keys(payload).forEach((k) => {
        if (payload[k] === "" || payload[k] === null) delete payload[k];
      });
      const res = await csrPortalApi.recordApproval(payload);
      onSaved?.(res?.data ?? res);
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
        setGeneralError(data?.message || "Failed to record approval.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const selectedKind = KIND_OPTIONS.find((k) => k.value === form.kind);

  return (
    <div className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-xl w-full p-5 my-8">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">Open Approval Request</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Start tracking a client decision — mockup, sample, etc.
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

        {generalError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-2 mb-3 text-xs text-red-700">
            <i className="fa-solid fa-triangle-exclamation mr-1" />
            {generalError}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Order <span className="text-red-500">*</span>
            </label>
            <select
              value={form.order_id}
              onChange={(e) => update("order_id", e.target.value)}
              disabled={submitting || loadingOrders || !!initialOrderId}
              className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.order_id ? "border-red-300" : "border-gray-300"
              }`}
            >
              <option value="">
                {loadingOrders ? "Loading…" : "— Select an order —"}
              </option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.po_code} — {o.client_name || "(no client)"}
                </option>
              ))}
            </select>
            {errors.order_id && (
              <p className="text-xs text-red-600 mt-1">{errors.order_id}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Approval Kind <span className="text-red-500">*</span>
            </label>
            <select
              value={form.kind}
              onChange={(e) => update("kind", e.target.value)}
              disabled={submitting}
              className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.kind ? "border-red-300" : "border-gray-300"
              }`}
            >
              {KIND_OPTIONS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
            {selectedKind && (
              <p className="text-[11px] text-gray-500 mt-1">{selectedKind.hint}</p>
            )}
            {errors.kind && (
              <p className="text-xs text-red-600 mt-1">{errors.kind}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Screenshot{" "}
              <span className="text-gray-400 font-normal">
                (mockup / sample image, ≤10MB)
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

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Internal Notes
            </label>
            <textarea
              rows={2}
              value={form.internal_notes}
              onChange={(e) => update("internal_notes", e.target.value)}
              disabled={submitting}
              placeholder="What was sent / asked of the client"
              className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.internal_notes ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors.internal_notes && (
              <p className="text-xs text-red-600 mt-1">{errors.internal_notes}</p>
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
            disabled={submitting}
            className="px-4 py-2 text-sm rounded bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {submitting ? (
              <>
                <i className="fa-solid fa-spinner fa-spin mr-1" />
                Opening…
              </>
            ) : (
              <>
                <i className="fa-solid fa-hand mr-1" />
                Open Approval
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecordApprovalModal;
