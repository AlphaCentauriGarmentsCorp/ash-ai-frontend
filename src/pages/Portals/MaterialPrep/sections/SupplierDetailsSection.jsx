import React, { useState } from "react";
import { materialPrepPortalApi } from "../../../../api/materialPrepPortalApi";

/**
 * Phase 5-G — Supplier Details + Selector.
 *
 * Shows current supplier as "RECOMMENDED" (gold highlight). Lists
 * alternative suppliers below. The Purchaser can switch ONLY while
 * the PR status is 'pending' — once approved, the supplier is locked
 * (the can_change_supplier permission flag governs this).
 */
const SupplierDetailsSection = ({
  supplier,
  alternativeSuppliers = [],
  canChangeSupplier,
  prId,
  onChanged,
}) => {
  const [switching, setSwitching] = useState(false);
  const [pickingId, setPickingId] = useState(null);
  const [error, setError] = useState(null);

  const handleSelect = async (newSupplierId) => {
    if (!canChangeSupplier) return;
    if (newSupplierId === supplier?.id) return;

    setSwitching(true);
    setPickingId(newSupplierId);
    setError(null);

    try {
      await materialPrepPortalApi.assignSupplier(prId, newSupplierId);
      onChanged?.();
    } catch (err) {
      setError(
        err?.response?.data?.errors?.status?.[0] ||
        err?.response?.data?.errors?.permission?.[0] ||
        err?.response?.data?.message ||
        "Hindi nakapag-switch ng supplier."
      );
    } finally {
      setSwitching(false);
      setPickingId(null);
    }
  };

  const renderSupplierCard = (s, isCurrent = false) => (
    <div
      key={s.id}
      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
        isCurrent
          ? "bg-amber-50 border-amber-300"
          : "bg-white border-gray-200 hover:border-primary/50"
      }`}
    >
      {isCurrent && (
        <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
          <i className="fa-solid fa-check text-xs" />
        </div>
      )}

      <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center shrink-0">
        <i className="fa-solid fa-store text-gray-400" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between flex-wrap gap-1">
          <p className="font-semibold text-gray-900 text-sm">{s.name}</p>
          {isCurrent && (
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
              CURRENT
            </span>
          )}
        </div>
        {s.address && (
          <p className="text-[11px] text-gray-500 mt-0.5">
            <i className="fa-solid fa-location-dot mr-1" />
            {s.address}
          </p>
        )}
        {s.contact_number && (
          <p className="text-[11px] text-gray-500">
            <i className="fa-solid fa-phone mr-1" />
            {s.contact_number}
          </p>
        )}
        {s.contact_person && (
          <p className="text-[11px] text-gray-500">
            <i className="fa-solid fa-user mr-1" />
            Contact: {s.contact_person}
          </p>
        )}
        {s.notes && (
          <p className="text-[11px] text-gray-600 italic mt-1">"{s.notes}"</p>
        )}
      </div>

      {!isCurrent && canChangeSupplier && (
        <button
          type="button"
          onClick={() => handleSelect(s.id)}
          disabled={switching}
          className="text-xs px-3 py-1.5 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50 shrink-0"
        >
          {pickingId === s.id ? "Switching…" : "Select Supplier"}
        </button>
      )}
    </div>
  );

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
          3
        </span>
        Supplier &amp; Contact Details
      </h2>

      {!canChangeSupplier && (
        <p className="text-[11px] text-gray-500 italic mb-3">
          <i className="fa-solid fa-lock mr-1" />
          Supplier locked — can only change while PR is pending.
        </p>
      )}

      {error && (
        <div className="mb-3 bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700">
          <i className="fa-solid fa-triangle-exclamation mr-1" />
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {supplier && renderSupplierCard(supplier, true)}

        {canChangeSupplier && alternativeSuppliers.length > 0 && (
          <>
            <p className="text-[10px] uppercase tracking-wide text-gray-500 mt-2">
              Alternative Suppliers
            </p>
            {alternativeSuppliers.map((s) => renderSupplierCard(s, false))}
          </>
        )}
      </div>

      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-700 flex items-start gap-1">
        <i className="fa-solid fa-lightbulb mt-0.5" />
        <span>
          Always choose recommended suppliers for quality assurance and
          smoother transactions.
        </span>
      </div>
    </section>
  );
};

export default SupplierDetailsSection;
