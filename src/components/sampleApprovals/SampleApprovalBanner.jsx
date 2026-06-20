import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { csrPortalApi } from "../../api/csrPortalApi";

/**
 * SampleApprovalBanner — Phase 3.
 *
 * A self-contained call-to-action shown at the top of the CSR Approvals tab.
 * Fetches its own count from GET /csr/sample-approvals and, when there are
 * samples sitting at the sample_approval stage, surfaces a one-tap link to the
 * stage-driven "Samples for Approval" worklist. Renders nothing when the queue
 * is empty (or while loading / on error), so it never adds clutter.
 */
const SampleApprovalBanner = () => {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    csrPortalApi
      .getSampleApprovals()
      .then((res) => {
        if (!cancelled) setCount(res?.count ?? 0);
      })
      .catch(() => {
        if (!cancelled) setCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (count < 1) return null;

  return (
    <button
      type="button"
      onClick={() => navigate("/samples/approval")}
      className="w-full text-left bg-violet-50 border border-violet-200 rounded-lg p-4 flex items-center justify-between gap-3 hover:bg-violet-100 transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-violet-700">
          <i className="fa-solid fa-shirt" />
        </span>
        <div>
          <p className="text-sm font-semibold text-violet-900">
            {count} sample{count > 1 ? "s" : ""} awaiting your approval
          </p>
          <p className="text-xs text-violet-700">
            Review the packed sample and approve, or loop it back to the artist.
          </p>
        </div>
      </div>
      <span className="text-sm font-semibold text-violet-700 inline-flex items-center gap-1.5 whitespace-nowrap">
        Review
        <i className="fa-solid fa-chevron-right text-xs" />
      </span>
    </button>
  );
};

export default SampleApprovalBanner;
