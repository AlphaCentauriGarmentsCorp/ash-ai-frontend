import React from "react";
import AdminLayout from "../Admin/AdminLayout";
import StatusFlowPipeline from "./StatusFlowPipeline";

/**
 * Phase 5 — Role Portal layout (revised for nesting inside AdminLayout).
 *
 * Replaces the original standalone shell. Now reuses the main app's
 * Sidebar + Navbar via AdminLayout, so we get mobile-responsive nav
 * + role badge + notification bell + user menu for free, and portals
 * feel like a part of the same app instead of a separate one.
 *
 * Props:
 *   roleTitle         — page heading ("Sample Creation – Cutter")
 *   roleSubtitle      — small line under the title; defaults to the
 *                       "What this staff needs to see only" mockup line
 *   breadcrumbLinks   — passed through to AdminLayout's Breadcrumbs
 *                       (optional). e.g. [{ name: "Cutter Portal", path: "/portal/cutter" }]
 *   statusFlowStages  — array for the horizontal pipeline widget
 *   currentStageSlug  — which step the pipeline highlights
 *   tipText           — bottom tip line. Pass null to hide.
 *   children          — the portal-specific section content
 */
const RolePortalLayout = ({
  roleTitle,
  roleSubtitle = "What this staff needs to see only",
  breadcrumbLinks = [],
  statusFlowStages = [],
  currentStageSlug = null,
  tipText = null,
  children,
}) => {
  return (
    <AdminLayout
      pageTitle={roleTitle}
      links={breadcrumbLinks}
      icon="fa-solid fa-industry"
    >
      {/* Page heading — replaces the standalone portal header */}
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-gray-900">
          {roleTitle}
        </h1>
        {roleSubtitle && (
          <p className="text-xs text-gray-500 mt-0.5">{roleSubtitle}</p>
        )}
      </div>

      {/* Status flow pipeline */}
      {statusFlowStages.length > 0 && (
        <div className="mb-4">
          <StatusFlowPipeline
            stages={statusFlowStages}
            currentStageSlug={currentStageSlug}
          />
        </div>
      )}

      {/* Portal-specific content */}
      <div>{children}</div>

      {/* Tip line at bottom */}
      {tipText && (
        <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-xs">
          <i className="fa-solid fa-lightbulb text-amber-500 mt-0.5" />
          <p className="text-amber-800 leading-relaxed">{tipText}</p>
        </div>
      )}
    </AdminLayout>
  );
};

export default RolePortalLayout;
