import React, { useEffect, useState } from "react";
import { portalApi } from "../../../api/portalApi";
import { cutterPortalApi } from "../../../api/cutterPortalApi";
import RolePortalLayout from "../../../layouts/RolePortal/RolePortalLayout";
import StageRejectionBanner from "../../../components/portals/StageRejectionBanner";
import MyActiveTasksList from "../../../components/portals/MyActiveTasksList";
import StageDoneButton from "../../../components/portals/StageDoneButton";
import StageUploadSection from "../../../components/portals/StageUploadSection";
import ServiceTypeToggle from "../../../components/portals/ServiceTypeToggle";
import SubcontractModeView from "../../../components/portals/SubcontractModeView";
// Cutter Rework CP2 — the Order Details, Design Details and Notes/
// Instructions sections are the GA / Screen Maker portals' presentational
// components, reused directly (same pattern the SM page uses). All are
// pure props-in / markup-out and consume the enriched CP1 context shape.
import OrderDetailsSectionGA from "../GraphicArtist/sections/OrderDetailsSectionGA";
import DesignDetailsSection from "../ScreenMaker/sections/DesignDetailsSection";
import NotesInstructionsSection from "../GraphicArtist/sections/NotesInstructionsSection";
import StageNotesSection from "./sections/StageNotesSection";
import SizeChartSection from "./sections/SizeChartSection";
import FabricTrackingSection from "./sections/FabricTrackingSection";
import MaterialRequestsSection from "./sections/MaterialRequestsSection";
import MaterialDetailsSection from "../../../components/portals/MaterialDetailsSection";
import ActivityLogSection from "./sections/ActivityLogSection";

/**
 * Phase 5-B — Cutter Portal landing page.
 *
 * Cutter Rework CP2 — page rebuilt to mirror the Graphic Artist / Screen
 * Maker portal layout, so all three production portals read the same way:
 *
 *   1. Order Details        (enriched — GA section, CP1 backend fields)
 *   1b. Material Details    (what Material Prep confirmed — moved directly
 *                            below Order Details per owner request)
 *   2. Design Details       (READ-ONLY GA output: placements + Pantones
 *                            + labels — reused SM section)
 *   3. Cutting Proof        (upload — kept; moved below Order/Design per
 *                            the SM pattern, both service modes)
 *   4. Service Type Toggle  (managers only)
 *   5a. in_house  → Size Chart + Fabric Tracking
 *   5b. subcontract → SubcontractModeView
 *   6. Notes / Instructions (order notes + Hub → cutter thread)
 *   7. Notes (Save Notes)   (writes stage.notes → shows sa Review Hub)
 *   8. Material Requests     (Request Material carries order+stage na)
 *   9. Activity Log
 *
 * Owner decision (2026-07-28) — "Sample Output & Upload" was removed: it
 * duplicated the Cutting Proof upload above it, so only one proof-of-work
 * upload block remains per stage.
 *
 * Flow:
 *   1. Mount → call /portal/my-active?role=cutter
 *   2. status='single' → fetch /portal/cutter/context/{stageId} → render
 *   3. status='multiple' → show picker → user picks → fetch context → render
 *   4. status='none' → show empty state with explanation
 *
 * The cutter owns TWO stages per order (sample_cutting + mass_cutting);
 * context.stage.phase ('sample' | 'mass') drives the portal title.
 */

const STATUS_FLOW = [
  { key: "payment_verification_sample", label: "Payment Verified", icon: "fa-credit-card" },
  { key: "graphic_artwork", label: "Graphic Artwork", icon: "fa-pen-ruler" },
  { key: "screen_making", label: "Screen Making", icon: "fa-stamp" },
  { key: "sample_cutting", label: "Sample Creation", icon: "fa-shirt" },
  { key: "sample_approval", label: "Sample Approval", icon: "fa-circle-check" },
  { key: "mass_cutting", label: "Mass Production", icon: "fa-industry" },
];

const CutterPortalPage = () => {

  // Resolution state
  const [resolving, setResolving] = useState(true);
  const [resolveError, setResolveError] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [listRefreshKey, setListRefreshKey] = useState(0);
  const [currentStageId, setCurrentStageId] = useState(null);

  // Context state
  const [context, setContext] = useState(null);
  const [contextLoading, setContextLoading] = useState(false);
  const [contextError, setContextError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Step 1 — resolve active assignment(s)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setResolving(true);
      setResolveError(null);
      try {
        const result = await portalApi.myActiveTasks("cutter");
        if (cancelled) return;
        setTasks(result.tasks || []);
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
    return () => {
      cancelled = true;
    };
  }, [listRefreshKey]);

  // Step 2 — once we have a stage, fetch its full context
  useEffect(() => {
    if (!currentStageId) return;
    let cancelled = false;

    (async () => {
      setContextLoading(true);
      setContextError(null);
      try {
        const result = await cutterPortalApi.context(currentStageId);
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

    return () => {
      cancelled = true;
    };
  }, [currentStageId, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
    setListRefreshKey((k) => k + 1);
  };
  const refreshList = () => setListRefreshKey((k) => k + 1);

  // Landing: the worker's full "My Active Tasks" queue (Bundle 1).
  // Shows every task queued at their station (incl. pending) so it
  // matches the sidebar badge; tapping one opens its detail below.
  if (!currentStageId) {
    return (
      <RolePortalLayout
        roleTitle="Cutter Portal"
        breadcrumbLinks={[{ name: "Cutter Portal", path: "/portal/cutter" }]}
      >
        <MyActiveTasksList
          tasks={tasks}
          loading={resolving}
          error={resolveError}
          onSelect={(id) => setCurrentStageId(id)}
          onRefresh={refreshList}
          title="My Active Tasks"
          emptyText="Wala ka pang cutting task. Awtomatikong lalabas dito ang trabaho mo kapag handa na ang order."
        />
      </RolePortalLayout>
    );
  }

  // ── Single / picked assignment — full portal render ───────────

  const currentStageSlug = context?.stage?.stage ?? null;

  return (
    <RolePortalLayout
      roleTitle={
        context?.stage?.phase === "mass"
          ? "Mass Production – Cutter"
          : "Sample Creation – Cutter"
      }
      breadcrumbLinks={[{ name: "Cutter Portal", path: "/portal/cutter" }]}
      statusFlowStages={STATUS_FLOW}
      currentStageSlug={currentStageSlug}
      tipText="Sukatin nang tama, i-cut nang maayos. Maliit na error sa sample, malaking problema sa production."
    >
      {/* Back to the My Active Tasks queue */}
      <button
        type="button"
        onClick={() => {
          setCurrentStageId(null);
          setContext(null);
          refreshList();
        }}
        className="text-xs text-gray-600 hover:text-primary mb-3 inline-flex items-center"
      >
        <i className="fa-solid fa-arrow-left mr-1" />
        My Active Tasks
      </button>

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

          {/* 1. Order Details (Cutter Rework CP2 — enriched GA layout) */}
          <OrderDetailsSectionGA order={context.order} stage={context.stage} />

          {/* Material Details — what Material Prep confirmed for this
              order, moved directly below Order Details per owner request. */}
          <MaterialDetailsSection materialDetails={context.material_details} />

          {/* 2. Design Details — READ-ONLY view of the GA output */}
          <DesignDetailsSection
            placements={context.placements}
            pantonesUsed={context.pantones_used}
            order={context.order}
          />

          {/* 3. Cutting Proof (kept — both service modes; placed below
              Order/Design per the SM pattern) */}
          <StageUploadSection
            orderStageId={currentStageId}
            category="cutting"
            title="Cutting Proof"
          />

          {/* Phase 5-D — Service Type Toggle (managers only) */}
          <ServiceTypeToggle
            stage={context.stage}
            onChanged={handleRefresh}
          />

          {/*
            Phase 5-D — Branch on service_type:
            - in_house: render the normal tracking sections
            - subcontract: render the SubcontractModeView instead
          */}
          {context.stage?.service_type === "subcontract" ? (
            <SubcontractModeView subcontract={context.subcontract} />
          ) : (
            /* Two-column on lg: Size chart + Fabric tracking */
            <div className="grid lg:grid-cols-2 gap-4">
              <SizeChartSection sizeChart={context.size_chart} order={context.order} />
              <FabricTrackingSection
                fabricTracking={context.fabric_tracking}
                orderId={context.order.id}
                orderStageId={context.stage.id}
                onChanged={handleRefresh}
              />
            </div>
          )}

          {/* 6. Notes / Instructions — order notes + Hub → cutter thread
              (both modes; posted from the order's Review Hub) */}
          <NotesInstructionsSection
            order={context.order}
            roleNotes={context.role_notes}
          />

          {/* 7. Notes (Save Notes) — writes stage.notes; the Review Hub's
              Cutting card shows this (both modes) */}
          <StageNotesSection
            stageId={context.stage.id}
            initialNotes={context.stage.notes}
            onChanged={handleRefresh}
          />

          {/* 8. Material Requests — shown in both modes */}
          <MaterialRequestsSection
            materialRequests={context.material_requests}
            orderId={context.order.id}
            orderStageId={context.stage.id}
          />

          {/* 9. Activity Log — shown in both modes */}
          <ActivityLogSection activityLog={context.activity_log} />

          {/* Bundle 3 — production "Done": advances the workflow server-side. */}
          <StageDoneButton
            role="cutter"
            orderStageId={currentStageId}
            onDone={() => { setCurrentStageId(null); setContext(null); refreshList(); }}
          />
        </div>
      )}
    </RolePortalLayout>
  );
};

export default CutterPortalPage;
