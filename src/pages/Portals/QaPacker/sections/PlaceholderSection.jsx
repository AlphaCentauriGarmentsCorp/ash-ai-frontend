import React from "react";

/**
 * Phase 7-B Bundle 2 — Placeholder card for not-yet-built sections.
 *
 * Renders a labelled empty-state card so the page layout is visually
 * complete in Bundle 2. Bundles 3 and 4 will replace each placeholder
 * with the real implementation.
 *
 * Props:
 *   sectionNumber  - the position in the page (3-7 for QA/Packer)
 *   title          - section heading
 *   bundle         - which future bundle ships this ('Bundle 3' / 'Bundle 4')
 *   description    - one-line preview of what's coming
 *   icon           - FontAwesome class (without 'fa-solid'), e.g. 'fa-clipboard-check'
 */
const PlaceholderSection = ({
  sectionNumber,
  title,
  bundle,
  description,
  icon = "fa-square-check",
}) => {
  return (
    <section className="bg-white rounded-lg border border-dashed border-gray-300 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-gray-300 text-white text-xs flex items-center justify-center">
          <i className={`fa-solid ${icon} text-[11px]`} />
        </span>
        {title}
        <span className="ml-auto text-[10px] uppercase tracking-wide font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
          {bundle}
        </span>
      </h2>

      <div className="flex items-center gap-3 text-gray-500 text-xs py-4">
        <i className={`fa-solid ${icon} text-2xl text-gray-300`} />
        <div className="flex-1">
          <p className="font-medium text-gray-600">Coming in {bundle}</p>
          <p className="text-[11px] mt-0.5">{description}</p>
        </div>
      </div>
    </section>
  );
};

export default PlaceholderSection;
