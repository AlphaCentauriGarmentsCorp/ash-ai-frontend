import React, { useState } from "react";
import { qaPackerPortalApi } from "../../../../api/qaPackerPortalApi";
import PhotoUpload from "../../../../components/portals/PhotoUpload";

/**
 * Phase 7-B Bundle 3 — Add Reject / Add Repair modal.
 *
 * One component, two dispositions. The opener locks `disposition` via
 * the prop — no in-modal toggle (per §7-B.8 Q3 decision A: locked
 * disposition prevents the "did I pick the right button?" footgun).
 *
 * Non-optimistic save flow:
 *   - User taps Save → button shows spinner, all fields disabled
 *   - On 201 → onSaved() fires, modal closes
 *   - On error → modal STAYS OPEN with the error banner, fields stay
 *     filled in. Lets the packer fix and retry without re-entering.
 *
 * Photo capture uses `capture="environment"` via PhotoUpload — opens
 * the rear camera on mobile (per A2 decision).
 *
 * Props:
 *   disposition     'reject' | 'repair'
 *   orderId
 *   orderStageId
 *   rejectReasons   - array of {id, slug, label, is_fabric} from context.reject_reasons
 *   onClose()
 *   onSaved(log)    - fired on successful create
 */
const DISPOSITION_META = {
  reject: {
    title: "Add Reject",
    subtitle:
      "Mag-log ng piece na hindi pwede ipadala. Magkakaron ng tally para sa Super Admin alert.",
    accent: "red",
    saveLabel: "Save Reject",
    icon: "fa-circle-xmark",
  },
  repair: {
    title: "Add Repair",
    subtitle:
      "Mag-log ng piece na pwede pa ayusin. Magnonotify ang CSR pero hindi mabibilang sa rejects.",
    accent: "amber",
    saveLabel: "Save Repair",
    icon: "fa-screwdriver-wrench",
  },
};

const RejectRepairModal = ({
  disposition,
  orderId,
  orderStageId,
  rejectReasons = [],
  onClose,
  onSaved,
}) => {
  const meta = DISPOSITION_META[disposition] || DISPOSITION_META.reject;

  const [form, setForm] = useState({
    reject_reason_id: "",
    quantity_pcs: "1",
    notes: "",
  });
  const [photo, setPhoto] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);

  const update = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) {
      setErrors((e) => ({ ...e, [key]: undefined }));
    }
  };

  const validateClient = () => {
    const next = {};
    if (!form.reject_reason_id) {
      next.reject_reason_id = "Pumili ng reason.";
    }
    const qty = parseInt(form.quantity_pcs, 10);
    if (!Number.isFinite(qty) || qty < 1) {
      next.quantity_pcs = "Quantity must be at least 1.";
    }
    if (form.notes && form.notes.length > 1000) {
      next.notes = "Notes too long (max 1000 characters).";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!validateClient()) return;

    setSubmitting(true);
    setGeneralError(null);

    try {
      const fields = {
        order_id: orderId,
        order_stage_id: orderStageId,
        disposition,
        reject_reason_id: parseInt(form.reject_reason_id, 10),
        quantity_pcs: parseInt(form.quantity_pcs, 10),
      };
      if (form.notes.trim()) fields.notes = form.notes.trim();

      const result = await qaPackerPortalApi.createReject(fields, photo);
      onSaved?.(result.data);
      onClose?.();
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;

      if (status === 422 && data?.errors) {
        // Map backend field errors onto the form.
        const fieldErrors = {};
        Object.entries(data.errors).forEach(([k, msgs]) => {
          fieldErrors[k] = Array.isArray(msgs) ? msgs[0] : String(msgs);
        });
        setErrors(fieldErrors);
        setGeneralError(data.message || "May error sa form. Tingnan ulit.");
      } else {
        setGeneralError(
          data?.message ||
            "Hindi na-save. Subukan ulit o i-check ang internet mo.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Resolve accent classes — keeps the colour styling in one place.
  const accentClasses =
    meta.accent === "red"
      ? {
          headerIcon: "text-red-600",
          headerIconBg: "bg-red-50",
          saveBtn: "bg-red-600 hover:bg-red-700",
        }
      : {
          headerIcon: "text-amber-600",
          headerIconBg: "bg-amber-50",
          saveBtn: "bg-amber-600 hover:bg-amber-700",
        };

  return (
    <div className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-5 my-8">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <span
              className={`w-9 h-9 rounded-full ${accentClasses.headerIconBg} flex items-center justify-center shrink-0`}
            >
              <i className={`fa-solid ${meta.icon} ${accentClasses.headerIcon}`} />
            </span>
            <div>
              <h3 className="font-semibold text-gray-900">{meta.title}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{meta.subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-gray-400 hover:text-gray-700 text-lg leading-none p-1 disabled:opacity-50"
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

        <form onSubmit={handleSave} className="space-y-3">
          {/* Reason */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Reason <span className="text-red-500">*</span>
            </label>
            <select
              value={form.reject_reason_id}
              onChange={(e) => update("reject_reason_id", e.target.value)}
              disabled={submitting}
              className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50 ${
                errors.reject_reason_id ? "border-red-300" : "border-gray-300"
              }`}
            >
              <option value="">— Pumili ng reason —</option>
              {rejectReasons.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                  {r.is_fabric ? " (cutter will be notified)" : ""}
                </option>
              ))}
            </select>
            {errors.reject_reason_id && (
              <p className="text-[11px] text-red-600 mt-1">
                {errors.reject_reason_id}
              </p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Quantity (pieces) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={form.quantity_pcs}
              onChange={(e) => update("quantity_pcs", e.target.value)}
              disabled={submitting}
              className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50 ${
                errors.quantity_pcs ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors.quantity_pcs && (
              <p className="text-[11px] text-red-600 mt-1">
                {errors.quantity_pcs}
              </p>
            )}
          </div>

          {/* Photo */}
          <PhotoUpload
            value={photo}
            onChange={setPhoto}
            label="Photo (optional)"
            disabled={submitting}
            onError={(msg) => setGeneralError(msg)}
          />
          {errors.photo && (
            <p className="text-[11px] text-red-600 -mt-2">{errors.photo}</p>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              disabled={submitting}
              rows={2}
              maxLength={1000}
              placeholder="Anong nangyari? (e.g., 'Stain sa kanang sleeve')"
              className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50 resize-none ${
                errors.notes ? "border-red-300" : "border-gray-300"
              }`}
            />
            <div className="flex items-center justify-between mt-1">
              {errors.notes ? (
                <p className="text-[11px] text-red-600">{errors.notes}</p>
              ) : (
                <span />
              )}
              <p className="text-[10px] text-gray-400">
                {form.notes.length}/1000
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="text-xs text-gray-600 hover:text-gray-900 px-3 py-2 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`text-xs text-white px-4 py-2 rounded-md inline-flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed ${accentClasses.saveBtn}`}
            >
              {submitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <i className="fa-solid fa-check" />
                  {meta.saveLabel}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectRepairModal;
