import React, { useState } from "react";
import { purchaseRequestsApi } from "../../../../api/purchaseRequestsApi";

/**
 * Phase 5-G — PR Lifecycle Actions.
 *
 * Combines:
 *   - Payment instructions (from current supplier)
 *   - "I Have Made the Payment" button → triggers mark_ordered
 *   - "Mark as Received" button → triggers mark_received
 *   - Cancel option
 *   - Totals recap
 *
 * Backed by the existing purchaseRequestsApi (Phase 3 — already
 * permission-gated, already tested).
 */
const PRActionsSection = ({ pr, supplier, totals, permissions, onChanged }) => {
  const [pending, setPending] = useState(null); // 'ordered' | 'received' | 'cancelled'
  const [error, setError] = useState(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const handleAction = async (action) => {
    setPending(action);
    setError(null);
    try {
      if (action === "ordered")  await purchaseRequestsApi.markOrdered(pr.id);
      if (action === "received") await purchaseRequestsApi.markReceived(pr.id);
      if (action === "cancelled") await purchaseRequestsApi.cancel(pr.id);
      onChanged?.();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        "Hindi natuloy ang action. Subukan ulit."
      );
    } finally {
      setPending(null);
      setConfirmingCancel(false);
    }
  };

  return (
    <>
      {/* Payment Section (4) */}
      <section className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
            4
          </span>
          Payment &amp; Actions
        </h2>

        {supplier ? (
          <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
            <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-2">
              Pay to: <span className="text-gray-700 font-semibold">{supplier.name}</span>
            </p>
            {supplier.contact_number && (
              <p className="text-xs text-gray-600">
                <i className="fa-solid fa-phone mr-1" />
                {supplier.contact_number}
              </p>
            )}
            {supplier.email && (
              <p className="text-xs text-gray-600">
                <i className="fa-solid fa-envelope mr-1" />
                {supplier.email}
              </p>
            )}
            {supplier.notes && (
              <p className="text-[11px] text-gray-500 italic mt-1">"{supplier.notes}"</p>
            )}

            <div className="mt-3 pt-2 border-t border-gray-200 text-[11px] text-gray-600">
              <p className="font-semibold text-gray-700 mb-1">Payment Instructions:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Send screenshot of payment here in the system.</li>
                <li>Include PR No. ({pr.pr_code}) in the reference.</li>
                <li>Wait for confirmation before claiming items.</li>
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-gray-400 italic mb-3">
            Walang supplier na napili. Pumili muna sa Section 3.
          </p>
        )}

        {error && (
          <div className="mb-3 bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700">
            <i className="fa-solid fa-triangle-exclamation mr-1" />
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          {permissions?.can_mark_ordered && (
            <button
              type="button"
              onClick={() => handleAction("ordered")}
              disabled={pending !== null || !supplier}
              className="w-full bg-primary text-white text-sm py-2.5 rounded font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {pending === "ordered" ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-1" />
                  Confirming…
                </>
              ) : (
                <>
                  <i className="fa-solid fa-check mr-1" />
                  I Have Made the Payment
                </>
              )}
            </button>
          )}

          {permissions?.can_mark_received && (
            <button
              type="button"
              onClick={() => handleAction("received")}
              disabled={pending !== null}
              className="w-full bg-emerald-600 text-white text-sm py-2.5 rounded font-medium hover:bg-emerald-700 disabled:opacity-50"
            >
              {pending === "received" ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-1" />
                  Updating stock…
                </>
              ) : (
                <>
                  <i className="fa-solid fa-box-open mr-1" />
                  Mark as Received
                </>
              )}
            </button>
          )}

          {permissions?.can_cancel && !confirmingCancel && (
            <button
              type="button"
              onClick={() => setConfirmingCancel(true)}
              disabled={pending !== null}
              className="w-full bg-white border border-red-200 text-red-700 text-xs py-2 rounded hover:bg-red-50 disabled:opacity-50"
            >
              <i className="fa-solid fa-xmark mr-1" />
              Cancel PR
            </button>
          )}

          {confirmingCancel && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-xs text-red-900 mb-2">
                Sigurado ka? Hindi na mababalik ang PR na ito.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setConfirmingCancel(false)}
                  disabled={pending !== null}
                  className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded text-gray-700"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => handleAction("cancelled")}
                  disabled={pending !== null}
                  className="text-xs px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {pending === "cancelled" ? "Cancelling…" : "Confirm Cancel"}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Totals (5) */}
      <section className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
            5
          </span>
          Total Amount (Estimated)
        </h2>

        <div className="text-center py-4 bg-gray-50 rounded">
          <p className="text-[10px] uppercase tracking-wide text-gray-500">Estimated Total</p>
          <p className="text-3xl font-bold text-primary mt-1">
            ₱{(totals?.total_amount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-gray-400 mt-1">Based on current supplier price</p>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="bg-gray-50 rounded p-2 text-center">
            <p className="text-[10px] uppercase tracking-wide text-gray-500">Total Items</p>
            <p className="text-base font-semibold text-gray-900 mt-0.5">
              {totals?.total_items ?? 0}
            </p>
          </div>
          <div className="bg-gray-50 rounded p-2 text-center">
            <p className="text-[10px] uppercase tracking-wide text-gray-500">Total Quantity</p>
            <p className="text-base font-semibold text-gray-900 mt-0.5">
              {totals?.total_quantity ?? 0}
            </p>
          </div>
        </div>

        <p className="text-[10px] text-gray-400 mt-2 text-center italic">
          <i className="fa-solid fa-info-circle mr-1" />
          This is the total amount you will pay if supplier price does not increase.
        </p>
      </section>
    </>
  );
};

export default PRActionsSection;
