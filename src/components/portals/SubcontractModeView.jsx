import React from "react";

/**
 * Phase 5-D — Subcontract mode view.
 *
 * Shown in place of in-house tracking sections (fabric/ink/sample upload)
 * when stage.service_type === 'subcontract'. Surfaces the vendor info
 * and current shipment status so production roles understand the work
 * isn't theirs to do — it's at a subcontractor.
 *
 * Props:
 *   subcontract - object from buildContext's subcontract key
 *                 (see service `subcontractInfo()` shape)
 */

const STATUS_STYLES = {
  pending:   "bg-gray-100 text-gray-700",
  out:       "bg-amber-100 text-amber-700",
  returned:  "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

const SubcontractModeView = ({ subcontract }) => {
  // Case 1: stage is set to subcontract but no SCA row yet
  if (!subcontract || subcontract.has_assignment === false) {
    return (
      <section className="bg-amber-50 border border-amber-200 rounded-lg p-5">
        <div className="flex items-start gap-3">
          <i className="fa-solid fa-truck text-amber-600 text-lg mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-amber-900 mb-1">
              Stage is set to Subcontract
            </h3>
            <p className="text-xs text-amber-800">
              {subcontract?.message ||
                "No vendor has been assigned yet. A manager needs to set up the subcontract assignment via the Logistics portal."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const statusClass =
    STATUS_STYLES[subcontract.status] || STATUS_STYLES.pending;

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
          <i className="fa-solid fa-truck text-lg" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-gray-900">
              Subcontracted to{" "}
              {subcontract.vendor?.name || "(unnamed vendor)"}
            </h3>
            <span
              className={`text-[10px] px-2 py-0.5 rounded capitalize ${statusClass}`}
            >
              {String(subcontract.status).replace(/_/g, " ")}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            This stage is being handled by an external vendor. Production
            tracking moves to the Logistics portal.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-y-3 gap-x-6 text-sm pt-3 border-t border-gray-100">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400">
            Quantity
          </p>
          <p className="font-medium text-gray-800">
            {subcontract.quantity_pcs} pcs
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400">
            Total Amount
          </p>
          <p className="font-medium text-gray-800">
            ₱{(subcontract.total_amount ?? 0).toLocaleString()}
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400">
            Sent
          </p>
          <p className="font-medium text-gray-800 text-xs">
            {subcontract.sent_at
              ? new Date(subcontract.sent_at).toLocaleString()
              : "—"}
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400">
            Returned
          </p>
          <p className="font-medium text-gray-800 text-xs">
            {subcontract.returned_at
              ? new Date(subcontract.returned_at).toLocaleString()
              : "—"}
          </p>
        </div>

        {subcontract.payment_terms && (
          <div>
            <p className="text-[10px] uppercase tracking-wide text-gray-400">
              Payment Terms
            </p>
            <p className="font-medium text-gray-800 text-xs">
              {subcontract.payment_terms}
            </p>
          </div>
        )}

        {subcontract.waybill_number && (
          <div>
            <p className="text-[10px] uppercase tracking-wide text-gray-400">
              Waybill
            </p>
            <p className="font-medium text-gray-800 text-xs font-mono">
              {subcontract.waybill_number}
            </p>
          </div>
        )}

        {subcontract.vendor_contact_number && (
          <div>
            <p className="text-[10px] uppercase tracking-wide text-gray-400">
              Vendor Contact
            </p>
            <p className="font-medium text-gray-800 text-xs">
              {subcontract.vendor_contact_number}
            </p>
          </div>
        )}

        {subcontract.gc_chat_link && (
          <div>
            <p className="text-[10px] uppercase tracking-wide text-gray-400">
              Vendor Chat
            </p>
            <a
              href={subcontract.gc_chat_link}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary hover:underline text-xs"
            >
              Open chat →
            </a>
          </div>
        )}
      </div>

      {subcontract.notes && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">
            Notes
          </p>
          <p className="text-xs text-gray-600 italic">"{subcontract.notes}"</p>
        </div>
      )}
    </section>
  );
};

export default SubcontractModeView;
