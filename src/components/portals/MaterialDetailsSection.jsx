import React, { useState } from "react";
import MaterialRequirementSummaryTable from "../../pages/Portals/MaterialPrep/MaterialRequirementSummaryTable";

/**
 * Owner decision (2026-07-28) — read-only view, for every downstream portal
 * (Cutter, Printer, Sewer, QA/Packer), of the materials Material Prep
 * confirmed for this order. Backed by context.material_details: one entry
 * per Material Prep requirement saved so far (sample and/or mass phase).
 */
const PHASE_LABEL = {
  sample: "Sample",
  mass: "Mass production",
};

const MaterialDetailsSection = ({ materialDetails = [] }) => {
  const [open, setOpen] = useState(true);

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2"
      >
        <div className="text-left">
          <h3 className="text-sm font-semibold text-gray-900">
            Material Details
          </h3>
          <p className="text-xs text-gray-500">
            What Material Prep confirmed for this order.
          </p>
        </div>
        <i
          className={`fa-solid fa-chevron-${open ? "up" : "down"} text-gray-400 text-xs`}
        />
      </button>

      {open && (
        <div className="mt-3 space-y-4">
          {materialDetails.length === 0 ? (
            <div className="text-center py-4 text-gray-400 text-xs">
              <i className="fa-regular fa-clipboard mr-1.5" />
              No material requirement saved for this order yet.
            </div>
          ) : (
            materialDetails.map((entry, i) => (
              <div key={i}>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wide mb-1.5">
                  {PHASE_LABEL[entry.phase] || entry.phase} phase
                </p>
                <MaterialRequirementSummaryTable
                  mr={entry.mr}
                  purchase_needed={entry.purchase_needed}
                  pr={entry.pr}
                />
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
};

export default MaterialDetailsSection;
