import React from "react";

/**
 * Small amber pill shown on orders a superadmin saved with missing
 * recommended fields (Change 11). Renders nothing unless the order is flagged.
 *
 * Props:
 *   incomplete - boolean  (order.is_incomplete)
 *   fields     - string[] (order.incomplete_fields) shown in the hover tooltip
 *   className  - optional extra classes
 */
const IncompleteBadge = ({ incomplete, fields = [], className = "" }) => {
  if (!incomplete) return null;

  const list = Array.isArray(fields) ? fields.filter(Boolean) : [];
  const title = list.length
    ? `Missing: ${list.join(", ")}`
    : "Saved with missing details";

  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 whitespace-nowrap px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200 ${className}`}
    >
      <i className="fas fa-triangle-exclamation text-[10px]"></i>
      Incomplete
    </span>
  );
};

export default IncompleteBadge;
