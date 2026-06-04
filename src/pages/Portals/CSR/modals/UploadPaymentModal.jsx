import React, { useEffect, useState } from "react";
import { csrPortalApi } from "../../../../api/csrPortalApi";
import { orderApi } from "../../../../api/orderApi";
import { paymentMethodsApi } from "../../../../api/paymentMethodsApi";

/**
 * Phase 6-A Bundle 2 — Upload Payment Proof modal.
 *
 * Multipart form. When `proof` file is present, backend sets the
 * resulting payment to 'for_verification' status. Without the file,
 * status stays 'waiting'.
 *
 * Required fields:
 *   - order_id          (dropdown)
 *   - payment_type      (sample / down_payment / balance / full)
 *   - amount            (PHP, decimal 10,2)
 * Optional:
 *   - payment_method_id (dropdown from /payment-methods)
 *   - reference_number  (GCash ref, bank ref, etc.)
 *   - notes
 *   - proof             (jpg/png/webp/pdf ≤10MB)
 *
 * Props:
 *   onClose()
 *   onSaved(payment) — fired on 201
 *   initialOrderId   — optional, pre-selects an order
 */
const PAYMENT_TYPES = [
  { value: "sample", label: "Sample" },
  { value: "down_payment", label: "Down Payment" },
  { value: "balance", label: "Balance" },
  { value: "full", label: "Full Payment" },
];

const UploadPaymentModal = ({ onClose, onSaved, initialOrderId = null, paymentsApi = csrPortalApi }) => {
  const [orders, setOrders] = useState([]);
  const [methods, setMethods] = useState([]);
  const [loadingLookups, setLoadingLookups] = useState(true);

  const [form, setForm] = useState({
    order_id: initialOrderId || "",
    payment_type: "down_payment",
    amount: "",
    payment_method_id: "",
    reference_number: "",
    notes: "",
  });
  const [proof, setProof] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);

  // Load orders + payment methods in parallel
  useEffect(() => {
    let cancelled = false;
    setLoadingLookups(true);

    Promise.all([
      orderApi.index().catch(() => ({ data: [] })),
      paymentMethodsApi.index().catch(() => ({ data: [] })),
    ])
      .then(([oRes, mRes]) => {
        if (cancelled) return;
        setOrders(Array.isArray(oRes) ? oRes : oRes?.data || []);
        setMethods(Array.isArray(mRes) ? mRes : mRes?.data || []);
      })
      .finally(() => {
        if (!cancelled) setLoadingLookups(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleFile = (file) => {
    setProof(file);
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setProofPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setProofPreview(null);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrors({});
    setGeneralError(null);

    // Client-side guardrails before hitting the network
    if (!form.order_id) {
      setErrors({ order_id: "Select an order." });
      setSubmitting(false);
      return;
    }
    const amt = Number(form.amount);
    if (!amt || amt <= 0) {
      setErrors({ amount: "Amount must be greater than zero." });
      setSubmitting(false);
      return;
    }

    try {
      const payload = { ...form };
      // Strip empties
      Object.keys(payload).forEach((k) => {
        if (payload[k] === "" || payload[k] === null) delete payload[k];
      });
      if (proof) payload.proof = proof;

      const res = await paymentsApi.uploadPayment(payload);
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
        setGeneralError(
          data?.message || "Failed to upload payment. Please try again.",
        );
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
            <h3 className="font-semibold text-gray-900">Upload Payment Proof</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Record a client payment. With a proof file, it goes straight to
              Finance for verification.
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
          {/* Order */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Order <span className="text-red-500">*</span>
            </label>
            <select
              value={form.order_id}
              onChange={(e) => update("order_id", e.target.value)}
              disabled={submitting || loadingLookups || !!initialOrderId}
              className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${errors.order_id ? "border-red-300" : "border-gray-300"
                }`}
            >
              <option value="">
                {loadingLookups ? "Loading…" : "— Select an order —"}
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

          {/* Type + Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Payment Type <span className="text-red-500">*</span>
              </label>
              <select
                value={form.payment_type}
                onChange={(e) => update("payment_type", e.target.value)}
                disabled={submitting}
                className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${errors.payment_type ? "border-red-300" : "border-gray-300"
                  }`}
              >
                {PAYMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              {errors.payment_type && (
                <p className="text-xs text-red-600 mt-1">{errors.payment_type}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Amount (PHP) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={(e) => update("amount", e.target.value)}
                disabled={submitting}
                placeholder="0.00"
                className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${errors.amount ? "border-red-300" : "border-gray-300"
                  }`}
              />
              {errors.amount && (
                <p className="text-xs text-red-600 mt-1">{errors.amount}</p>
              )}
            </div>
          </div>

          {/* Method + Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                value={form.payment_method_id}
                onChange={(e) => update("payment_method_id", e.target.value)}
                disabled={submitting || loadingLookups}
                className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${errors.payment_method_id ? "border-red-300" : "border-gray-300"
                  }`}
              >
                <option value="">— Select method —</option>
                {methods.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              {errors.payment_method_id && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.payment_method_id}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Reference Number
              </label>
              <input
                type="text"
                value={form.reference_number}
                onChange={(e) => update("reference_number", e.target.value)}
                disabled={submitting}
                placeholder="GCash ref / bank txn ID"
                className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${errors.reference_number ? "border-red-300" : "border-gray-300"
                  }`}
              />
              {errors.reference_number && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.reference_number}
                </p>
              )}
            </div>
          </div>

          {/* Proof file */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Proof File{" "}
              <span className="text-gray-400 font-normal">
                (jpg/png/webp/pdf ≤10MB — uploading proof moves status to
                For Verification)
              </span>
            </label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              disabled={submitting}
              className="w-full text-sm text-gray-700 file:mr-3 file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-xs file:text-gray-700 hover:file:bg-gray-200"
            />
            {errors.proof && (
              <p className="text-xs text-red-600 mt-1">{errors.proof}</p>
            )}
            {proofPreview && (
              <div className="mt-2 rounded-md border border-gray-200 p-2 bg-gray-50">
                <img
                  src={proofPreview}
                  alt="Proof preview"
                  className="max-h-40 mx-auto"
                />
              </div>
            )}
            {proof && !proofPreview && (
              <p className="mt-1 text-xs text-gray-600">
                <i className="fa-regular fa-file-pdf mr-1" />
                {proof.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              disabled={submitting}
              placeholder="Any extra context for Finance"
              className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${errors.notes ? "border-red-300" : "border-gray-300"
                }`}
            />
            {errors.notes && (
              <p className="text-xs text-red-600 mt-1">{errors.notes}</p>
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
                Uploading…
              </>
            ) : (
              <>
                <i className="fa-solid fa-cloud-arrow-up mr-1" />
                Upload Payment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadPaymentModal;