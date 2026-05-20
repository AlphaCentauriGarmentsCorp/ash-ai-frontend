import React, { useState, useEffect } from "react";
import { subcontractApi } from "../../api/subcontractApi";
import { sewingSubcontractorApi } from "../../api/sewingSubcontractorApi";

/**
 * Phase 4 — Modal for sending a stage's work to a subcontractor.
 *
 * Loads the vendor list from /sewing-subcontractor (the renamed
 * subcontractors table — class kept for backward compat). Snapshots
 * the vendor's rate at create time on the backend; the modal shows
 * the projected total to give the user confidence.
 */
const SendToSubcontractorModal = ({
  orderId,
  stageId,
  stageLabel,
  onClose,
  onSaved,
}) => {
  const [vendors, setVendors] = useState([]);
  const [vendorsLoading, setVendorsLoading] = useState(true);
  const [vendorsError, setVendorsError] = useState(null);

  const [vendorId, setVendorId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);

  // Fetch vendor directory on open.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await sewingSubcontractorApi.index();
        if (cancelled) return;
        // Resource collections shape: { data: [...] }; bare arrays: [...].
        const list = Array.isArray(result) ? result : (result?.data ?? []);
        setVendors(list);
      } catch (err) {
        if (cancelled) return;
        setVendorsError(
          err?.response?.data?.message ||
            "Failed to load subcontractor list. Check your permissions.",
        );
      } finally {
        if (!cancelled) setVendorsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedVendor = vendors.find((v) => String(v.id) === String(vendorId));
  const projectedTotal =
    selectedVendor && quantity
      ? Number(selectedVendor.rate_per_pcs) * Number(quantity)
      : 0;

  const formatPHP = (n) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(Number(n) || 0);

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrors({});
    setGeneralError(null);

    if (!vendorId) {
      setErrors({ subcontractor_id: "Please pick a subcontractor." });
      setSubmitting(false);
      return;
    }

    const qty = Number(quantity);
    if (!qty || qty < 1) {
      setErrors({ quantity_pcs: "Quantity must be at least 1." });
      setSubmitting(false);
      return;
    }

    try {
      const result = await subcontractApi.create({
        order_id: orderId,
        order_stage_id: stageId,
        subcontractor_id: Number(vendorId),
        quantity_pcs: qty,
        notes: notes || undefined,
      });
      onSaved?.(result?.data ?? result);
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
        setGeneralError("You don't have permission to subcontract.");
      } else {
        setGeneralError(data?.message || "Failed to create assignment. Try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5">
        <h3 className="font-semibold text-gray-900 mb-1">
          Send to subcontractor
        </h3>
        {stageLabel && (
          <p className="text-xs text-gray-500 mb-3">
            Stage: <span className="font-medium">{stageLabel}</span>
          </p>
        )}

        {generalError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-2 mb-3 text-xs text-red-700">
            <i className="fa-solid fa-triangle-exclamation mr-1" />
            {generalError}
          </div>
        )}

        {vendorsError && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-2 mb-3 text-xs text-amber-700">
            <i className="fa-solid fa-circle-exclamation mr-1" />
            {vendorsError}
          </div>
        )}

        {/* Vendor picker */}
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Subcontractor <span className="text-red-500">*</span>
        </label>
        <select
          value={vendorId}
          onChange={(e) => setVendorId(e.target.value)}
          disabled={submitting || vendorsLoading}
          className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary mb-1 ${
            errors.subcontractor_id ? "border-red-300" : "border-gray-300"
          }`}
        >
          <option value="">
            {vendorsLoading ? "Loading vendors…" : "— Pick a vendor —"}
          </option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} — {formatPHP(v.rate_per_pcs)}/pc
              {v.service_type && v.service_type !== "sewing"
                ? ` (${v.service_type})`
                : ""}
            </option>
          ))}
        </select>
        {errors.subcontractor_id && (
          <p className="text-xs text-red-600 mb-2">{errors.subcontractor_id}</p>
        )}

        {/* Quantity */}
        <label className="block text-xs font-medium text-gray-700 mt-3 mb-1">
          Quantity (pieces) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          disabled={submitting}
          className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary mb-1 ${
            errors.quantity_pcs ? "border-red-300" : "border-gray-300"
          }`}
        />
        {errors.quantity_pcs && (
          <p className="text-xs text-red-600 mb-2">{errors.quantity_pcs}</p>
        )}

        {/* Projected total — purely informational, server snapshots actual. */}
        {selectedVendor && quantity && (
          <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded-md text-xs">
            <span className="text-gray-500">Projected total:</span>{" "}
            <span className="font-semibold text-gray-900">
              {formatPHP(projectedTotal)}
            </span>{" "}
            <span className="text-gray-400">
              ({quantity} × {formatPHP(selectedVendor.rate_per_pcs)})
            </span>
          </div>
        )}

        {/* Notes */}
        <label className="block text-xs font-medium text-gray-700 mt-3 mb-1">
          Notes <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Rush job, deadline next Tuesday"
          disabled={submitting}
          className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.notes ? "border-red-300" : "border-gray-300"
          }`}
        />

        {errors.order_stage_id && (
          <p className="text-xs text-red-600 mt-2">{errors.order_stage_id}</p>
        )}

        <div className="flex justify-end gap-2 mt-4">
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
            disabled={submitting || vendorsLoading}
            className="px-4 py-2 text-sm rounded bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? (
              <>
                <i className="fa-solid fa-spinner fa-spin mr-1" />
                Saving…
              </>
            ) : (
              "Send to Subcontractor"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendToSubcontractorModal;
