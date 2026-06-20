import React, { useEffect, useState } from "react";
import { csrPortalApi } from "../../api/csrPortalApi";
import { paymentMethodsApi } from "../../api/paymentMethodsApi";

/**
 * EnterPaymentModal — Phase 2.
 *
 * Per-order payment recording. Unlike the legacy upload modal, the order is
 * FIXED from context (no dropdown to pick or remember). The payment type
 * defaults from the order's current payment gate and can be overridden. Adds
 * payer name and the actual payment date/time.
 *
 * With a proof file the backend sets status 'for_verification' (Finance's
 * Dashboard queue); without one it stays 'waiting' (the awaiting-payment list).
 *
 * Props:
 *   order            - the order object (id, po_code; uses workflow_status,
 *                      client_name, client_brand when present)
 *   onClose()
 *   onSaved(payment) - fired on 201
 *   paymentsApi      - defaults to csrPortalApi
 */
const PAYMENT_TYPES = [
  { value: "sample", label: "Sample" },
  { value: "down_payment", label: "Down Payment" },
  { value: "balance", label: "Balance" },
  { value: "full", label: "Full Payment" },
];

// Map the order's active payment gate to the type it owes, so the form can
// default it instead of asking the user.
const GATE_TYPE = {
  payment_verification_sample: "sample",
  payment_verification_mass: "down_payment",
  payment_verification_balance: "balance",
};

const EnterPaymentModal = ({ order, onClose, onSaved, paymentsApi = csrPortalApi, defaultType = null, defaultAmount = null }) => {
  const initialType = defaultType || GATE_TYPE[order?.workflow_status] || "down_payment";

  const [methods, setMethods] = useState([]);
  const [loadingMethods, setLoadingMethods] = useState(true);

  const [form, setForm] = useState({
    payment_type: initialType,
    amount: defaultAmount != null && defaultAmount !== "" ? String(defaultAmount) : "",
    payment_method_id: "",
    reference_number: "",
    payer_name: "",
    paid_at: "",
    notes: "",
  });
  const [proof, setProof] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoadingMethods(true);
    paymentMethodsApi
      .index()
      .then((res) => {
        if (cancelled) return;
        setMethods(Array.isArray(res) ? res : res?.data || []);
      })
      .catch(() => {
        if (!cancelled) setMethods([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingMethods(false);
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

    if (!order?.id) {
      setGeneralError("No order in context.");
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
      const payload = { order_id: order.id, ...form };
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
      } else if (status === 403) {
        setGeneralError("You don't have permission to record payments.");
      } else {
        setGeneralError(data?.message || "Failed to record payment. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = (field) =>
    `w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
      errors[field] ? "border-red-300" : "border-gray-300"
    }`;

  return (
    <div className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-xl w-full p-5 my-8">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">Enter Payment</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Record the client's payment for this order. With a proof file it
              goes to Finance for verification.
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

        {generalError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-2 mb-3 text-xs text-red-700">
            <i className="fa-solid fa-triangle-exclamation mr-1" />
            {generalError}
          </div>
        )}

        <div className="space-y-3">
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
                className={inputCls("payment_type")}
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
                className={inputCls("amount")}
              />
              {errors.amount && (
                <p className="text-xs text-red-600 mt-1">{errors.amount}</p>
              )}
            </div>
          </div>

          {/* Payer + Paid at */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Payer Name
              </label>
              <input
                type="text"
                value={form.payer_name}
                onChange={(e) => update("payer_name", e.target.value)}
                disabled={submitting}
                placeholder="Who paid (if not the client)"
                className={inputCls("payer_name")}
              />
              {errors.payer_name && (
                <p className="text-xs text-red-600 mt-1">{errors.payer_name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Payment Date &amp; Time
              </label>
              <input
                type="datetime-local"
                value={form.paid_at}
                onChange={(e) => update("paid_at", e.target.value)}
                disabled={submitting}
                className={inputCls("paid_at")}
              />
              {errors.paid_at && (
                <p className="text-xs text-red-600 mt-1">{errors.paid_at}</p>
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
                disabled={submitting || loadingMethods}
                className={inputCls("payment_method_id")}
              >
                <option value="">&mdash; Select method &mdash;</option>
                {methods.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              {errors.payment_method_id && (
                <p className="text-xs text-red-600 mt-1">{errors.payment_method_id}</p>
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
                className={inputCls("reference_number")}
              />
              {errors.reference_number && (
                <p className="text-xs text-red-600 mt-1">{errors.reference_number}</p>
              )}
            </div>
          </div>

          {/* Proof */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Proof of Payment{" "}
              <span className="text-gray-400 font-normal">
                (jpg/png/webp/pdf &le;10MB &mdash; sends it to Finance for verification)
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
                <img src={proofPreview} alt="Proof preview" className="max-h-40 mx-auto" />
              </div>
            )}
            {proof && !proofPreview && (
              <p className="mt-1 text-xs text-gray-600">
                <i className="fa-regular fa-file-pdf mr-1" />
                {proof.name}
              </p>
            )}
          </div>

          {/* Notes */}
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
              className={inputCls("notes")}
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
                Saving&hellip;
              </>
            ) : (
              <>
                <i className="fa-solid fa-money-bill-wave mr-1" />
                Record Payment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnterPaymentModal;
