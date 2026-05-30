import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { portalApi } from "../../../api/portalApi";
import { graphicArtistPortalApi } from "../../../api/graphicArtistPortalApi";
import RolePortalLayout from "../../../layouts/RolePortal/RolePortalLayout";
import StageRejectionBanner from "../../../components/portals/StageRejectionBanner";
import OrderDetailsSection from "../Cutter/sections/OrderDetailsSection";

import DesignFilesSection from "./sections/DesignFilesSection";
import PrintLocationsSection from "./sections/PrintLocationsSection";
import PantoneColorsSection from "./sections/PantoneColorsSection";
import LabelsTagsSection from "./sections/LabelsTagsSection";
import ScreenDetailsReadOnlySection from "./sections/ScreenDetailsReadOnlySection";
import NotesInstructionsSection from "./sections/NotesInstructionsSection";
import SampleUploadsSection from "./sections/SampleUploadsSection";

// GA-specific copies of shared sections — same logic, different section
// numbers so the Graphic Artist page numbering reads cleanly (1–12).
// The originals (under Cutter/ and ScreenMaker/) keep their own numbers
// for those portals.
import StageNotesSectionGA from "./sections/StageNotesSectionGA";
import MarkAsDoneSectionGA from "./sections/MarkAsDoneSectionGA";
import MaterialRequestsSectionGA from "./sections/MaterialRequestsSectionGA";
import ActivityLogSectionGA from "./sections/ActivityLogSectionGA";

/**
 * Phase 5-H — Graphic Artist Portal landing page.
 *
 * Flow:
 *   1. Mount → call /portal/graphic-artist/my-active
 *   2. status='single'   → fetch /portal/graphic-artist/context/{stageId}
 *   3. status='multiple' → show picker
 *   4. status='none'     → empty state
 *
 * graphic_artwork is NOT a FLIPPABLE_STAGE, so there's no service-type
 * toggle / subcontract branch in this page.
 */

const STATUS_FLOW = [
  { key: "payment_verification_sample", label: "Payment Verified", icon: "fa-credit-card" },
  { key: "graphic_artwork", label: "Graphic Artwork", icon: "fa-pen-ruler" },
  { key: "screen_making", label: "Screen Making", icon: "fa-stamp" },
  { key: "sample_creation", label: "Sample Creation", icon: "fa-shirt" },
  { key: "sample_approval", label: "Sample Approval", icon: "fa-circle-check" },
  { key: "mass_production", label: "Mass Production", icon: "fa-industry" },
];

const GraphicArtistPortalPage = () => {
  const navigate = useNavigate();

  const [resolving, setResolving] = useState(true);
  const [resolveError, setResolveError] = useState(null);
  const [activeStatus, setActiveStatus] = useState(null);
  const [assignmentList, setAssignmentList] = useState([]);
  const [currentStageId, setCurrentStageId] = useState(null);

  const [context, setContext] = useState(null);
  const [contextLoading, setContextLoading] = useState(false);
  const [contextError, setContextError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // ── Resolve active assignment ──────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setResolving(true);
      setResolveError(null);
      try {
        const result = await portalApi.myActive("graphic-artist");
        if (cancelled) return;
        setActiveStatus(result.status);
        if (result.status === "single") {
          setCurrentStageId(result.assignment.order_stage_id);
        } else if (result.status === "multiple") {
          setAssignmentList(result.assignments || []);
        }
      } catch (err) {
        if (cancelled) return;
        setResolveError(
          err?.response?.data?.message ||
          "Hindi ma-load ang assignment mo. Try refreshing.",
        );
      } finally {
        if (!cancelled) setResolving(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Fetch context ──────────────────────────────────────────────
  useEffect(() => {
    if (!currentStageId) return;
    let cancelled = false;
    (async () => {
      setContextLoading(true);
      setContextError(null);
      try {
        const result = await graphicArtistPortalApi.context(currentStageId);
        if (cancelled) return;
        setContext(result.data);
      } catch (err) {
        if (cancelled) return;
        setContextError(
          err?.response?.data?.message ||
          "Hindi ma-load ang order details. Refresh para subukan ulit.",
        );
      } finally {
        if (!cancelled) setContextLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [currentStageId, refreshKey]);

  const handleRefresh = () => setRefreshKey((k) => k + 1);

  // ── Loading / error / empty states ─────────────────────────────
  if (resolving) {
    return (
      <RolePortalLayout roleTitle="Graphic Artist Portal">
        <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
          <i className="fa-solid fa-spinner fa-spin mr-2" />
          Hinahanap ang assignment mo…
        </div>
      </RolePortalLayout>
    );
  }

  if (resolveError) {
    return (
      <RolePortalLayout roleTitle="Graphic Artist Portal">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          <i className="fa-solid fa-triangle-exclamation mr-2" />
          {resolveError}
        </div>
      </RolePortalLayout>
    );
  }

  if (activeStatus === "none") {
    return (
      <RolePortalLayout roleTitle="Graphic Artist Portal">
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
            <i className="fa-solid fa-pen-ruler text-2xl text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            Walang active na assignment
          </h3>
          <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
            Wala ka pang in-progress na graphic artwork task. Aabisuhan ka ng
            CSR kapag may bagong design na kailangan.
          </p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-xs text-primary hover:underline"
          >
            ← Bumalik sa Dashboard
          </button>
        </div>
      </RolePortalLayout>
    );
  }

  if (activeStatus === "multiple" && !currentStageId) {
    return (
      <RolePortalLayout roleTitle="Graphic Artist Portal">
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Pumili ng assignment
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Marami kang active na graphic artwork task. Piliin kung saan ka
            unang magtatrabaho.
          </p>
          <div className="flex flex-col gap-2">
            {assignmentList.map((a) => (
              <button
                key={a.order_stage_id}
                type="button"
                onClick={() => setCurrentStageId(a.order_stage_id)}
                className="text-left bg-gray-50 hover:bg-primary/5 border border-gray-200 hover:border-primary rounded-md p-3 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {a.order?.po_code || `Order #${a.order_id}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {a.order?.client_brand || a.order?.client_name || "—"}
                    </p>
                  </div>
                  <i className="fa-solid fa-chevron-right text-gray-400 text-xs" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </RolePortalLayout>
    );
  }

  const currentStageSlug = context?.stage?.stage ?? null;

  return (
    <RolePortalLayout
      roleTitle="Graphic Artist Portal"
      breadcrumbLinks={[{ name: "Graphic Artist Portal", path: "/portal/graphic-artist" }]}
      statusFlowStages={STATUS_FLOW}
      currentStageSlug={currentStageSlug}
      tipText="I-double check ang Pantone codes at print sizes bago i-save ang design files."
    >
      {activeStatus === "multiple" && (
        <button
          type="button"
          onClick={() => setCurrentStageId(null)}
          className="text-xs text-gray-600 hover:text-primary mb-3 inline-flex items-center"
        >
          <i className="fa-solid fa-arrow-left mr-1" />
          Bumalik sa picker
        </button>
      )}

      {contextLoading && !context && (
        <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
          <i className="fa-solid fa-spinner fa-spin mr-2" />
          Hinahanda ang order details…
        </div>
      )}

      {contextError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 mb-4">
          <i className="fa-solid fa-triangle-exclamation mr-2" />
          {contextError}
          <button
            type="button"
            onClick={handleRefresh}
            className="ml-3 text-xs underline"
          >
            Retry
          </button>
        </div>
      )}

      {context && (
        <div className="flex flex-col gap-4">
          {/* CSR Review Hub — shows a rejection + resubmit action only
              when this stage currently has an open rejection. */}
          <StageRejectionBanner
            orderStageId={currentStageId}
            onResubmitted={handleRefresh}
          />

          {/* 1. Order Details */}
          <OrderDetailsSection order={context.order} stage={context.stage} />

          {/* 2. Design Files (versioned) */}
          <DesignFilesSection
            files={context.design_files}
            orderId={context.order.id}
            orderStageId={context.stage.id}
            onChanged={handleRefresh}
          />

          {/* 3. Print Locations & Size */}
          <PrintLocationsSection
            placements={context.placements}
            placementOptions={context.placement_options}
            measurementOptions={context.measurement_options}
          />

          {/* 4. Pantone Colors */}
          <PantoneColorsSection pantones={context.pantones_used} />

          {/* 5. Screen Details (read-only) */}
          <ScreenDetailsReadOnlySection screens={context.screen_details} />

          {/* 6. Labels & Tags */}
          <LabelsTagsSection
            labelAssets={context.label_assets}
            orderId={context.order.id}
            orderStageId={context.stage.id}
            onChanged={handleRefresh}
          />

          {/* 7. Notes / Instructions */}
          <NotesInstructionsSection
            order={context.order}
            design={context.design}
          />

          {/* 8. Sample Uploads */}
          <SampleUploadsSection
            samples={context.sample_uploads}
            orderId={context.order.id}
            orderStageId={context.stage.id}
            onChanged={handleRefresh}
          />

          {/* 9. Stage Notes (writeable) */}
          <StageNotesSectionGA
            stageId={context.stage.id}
            initialNotes={context.stage.notes}
            onChanged={handleRefresh}
          />

          {/* 10. Mark as Done */}
          <MarkAsDoneSectionGA
            stageId={context.stage.id}
            currentStatus={context.stage.status}
            onChanged={handleRefresh}
          />

          {/* 11. Material Requests */}
          <MaterialRequestsSectionGA
            materialRequests={context.material_requests}
            orderId={context.order.id}
            orderStageId={context.stage.id}
          />

          {/* 12. Activity Log */}
          <ActivityLogSectionGA activityLog={context.activity_log} />
        </div>
      )}
    </RolePortalLayout>
  );
};

export default GraphicArtistPortalPage;