import React, { useState } from "react";
import { logisticsPortalApi } from "../../../../api/logisticsPortalApi";

/**
 * Phase 5-I — Lightweight return verification.
 *
 * Submitted when the vendor returns work and Logistics inspects it.
 * Submission flips assignment.status to 'returned' (via 5-D
 * SubcontractService::markReturned) and records who verified.
 *
 * Hides itself if the assignment is missing OR already verified.
 */
const ReturnVerificationSection = ({ assignment, onChanged }) => {
  const alreadyVerified = !!assignment?.return_verified_at;

  const [qty, setQty] = useState(
    assignment?.return_qty_received != null
      ? String(assignment.return_qty_received)
      : String(assignment?.quantity_pcs ?? "")
  );
  const [notes, setNotes] = useState(assignment?.return_condition_notes ?? "");
  const [photoFront, setPhotoFront] = useState(null);
  const [photoBack, setPhotoBack] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  if (!assignment) return null;

  const handleVerify = async () => {
    if (qty === "" || qty === null) {
      setError("Ilang pcs ang natanggap?");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await logisticsPortalApi.verifyReturn(assignment.id, {
        qtyReceived: Number(qty),
        conditionNotes: notes || null,
        photoFront,
        photoBack,
      });
      setPhotoFront(null);
      setPhotoBack(null);
      ["return-front-input", "return-back-input"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = "";
      });
      onChanged?.();
    } catch (err) {
      setError(err?.response?.data?.message || "Hindi nakapag-verify.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <i className="fa-solid fa-rotate-left text-gray-500" />
        Return Verification
      </h2>
      <p className="text-xs text-gray-500 mb-3">
        I-verify ang qty at kondisyon ng natanggap mula sa vendor. Magmamark
        ng "returned" ang assignment kapag na-submit.
      </p>

      {alreadyVerified ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded p-3 text-sm text-emerald-800">
          <i className="fa-solid fa-circle-check mr-1" />
          Na-verify na: <strong>{assignment.return_qty_received}</strong> /
          <strong> {assignment.quantity_pcs}</strong> pcs received
          {assignment.return_condition_notes && (
            <p className="mt-1 text-xs text-emerald-700 whitespace-pre-wrap">
              Notes: {assignment.return_condition_notes}
            </p>
          )}
          <p className="text-[10px] text-emerald-600 mt-1">
            Verified at: {assignment.return_verified_at}
          </p>
          <div className="flex gap-2 mt-2">
            {assignment.return_photo_front_url && (
              <a href={assignment.return_photo_front_url} target="_blank" rel="noreferrer">
                <img src={assignment.return_photo_front_url} alt="front" className="w-16 h-16 object-cover rounded border" />
              </a>
            )}
            {assignment.return_photo_back_url && (
              <a href={assignment.return_photo_back_url} target="_blank" rel="noreferrer">
                <img src={assignment.return_photo_back_url} alt="back" className="w-16 h-16 object-cover rounded border" />
              </a>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1">
                Qty Received (max {assignment.quantity_pcs})
              </label>
              <input
                type="number"
                min="0"
                max={assignment.quantity_pcs}
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1.5"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1">
                Original Sent Qty
              </label>
              <input
                type="number"
                value={assignment.quantity_pcs}
                disabled
                className="w-full text-xs border border-gray-200 bg-gray-50 rounded px-2 py-1.5 text-gray-500"
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1">
              Condition Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="5 pcs with misprint, set aside."
              maxLength={1000}
              className="w-full text-xs border border-gray-300 rounded px-2 py-1.5"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1">
                Front Photo
              </label>
              <input
                id="return-front-input"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.heic"
                onChange={(e) => setPhotoFront(e.target.files?.[0] || null)}
                className="w-full text-[11px]"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1">
                Back Photo
              </label>
              <input
                id="return-back-input"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.heic"
                onChange={(e) => setPhotoBack(e.target.files?.[0] || null)}
                className="w-full text-[11px]"
              />
            </div>
          </div>

          {error && <p className="text-[11px] text-red-600 mb-2">{error}</p>}

          <button
            type="button"
            onClick={handleVerify}
            disabled={saving}
            className="bg-primary text-white text-xs px-4 py-2 rounded font-medium hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Verifying…" : "Verify Return"}
          </button>
        </>
      )}
    </section>
  );
};

export default ReturnVerificationSection;
