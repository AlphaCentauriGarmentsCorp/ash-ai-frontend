import React, { useEffect, useState } from "react";
import { portalApi } from "../../../api/portalApi";
import { screenMakerPortalApi } from "../../../api/screenMakerPortalApi";
import RolePortalLayout from "../../../layouts/RolePortal/RolePortalLayout";
import StageRejectionBanner from "../../../components/portals/StageRejectionBanner";
import MyActiveTasksList from "../../../components/portals/MyActiveTasksList";
import StageUploadSection from "../../../components/portals/StageUploadSection";
import ServiceTypeToggle from "../../../components/portals/ServiceTypeToggle";
import SubcontractModeView from "../../../components/portals/SubcontractModeView";
import MaterialRequestsSection from "../Cutter/sections/MaterialRequestsSection";
import ActivityLogSection from "../Cutter/sections/ActivityLogSection";
// SM Rework CP2 — the Order Details + Notes/Instructions sections are the
// GA portal's presentational components, reused directly (same pattern as
// the Cutter sections above). Both are pure props-in / markup-out.
import OrderDetailsSectionGA from "../GraphicArtist/sections/OrderDetailsSectionGA";
import NotesInstructionsSection from "../GraphicArtist/sections/NotesInstructionsSection";
import DesignDetailsSection from "./sections/DesignDetailsSection";
import DesignsToMakeSection from "./sections/DesignsToMakeSection";
import StageNotesSection from "./sections/StageNotesSection";
import StageDoneButton from "../../../components/portals/StageDoneButton";

/**
 * Phase 5-F — Screen Maker Portal landing page.
 * SM Rework CP2 — page rebuilt to mirror the GA portal layout:
 *
 *   1. Order Details        (enriched — GA section, CP1 backend fields)
 *   2. Design Details       (READ-ONLY GA output: placements + Pantones
 *                            + labels — new section)
 *   3. Screen Photos        (kept, both service modes)
 *   4. Designs to Make Screen (kept — physical screen mapping,
 *                            in-house mode)
 *   5. Notes / Instructions (order notes + Hub → screen_maker thread)
 *   6. Notes (Save Notes)   (writes stage.notes → shows sa Review Hub)
 *   7. Material Requests    (Request Material carries order+stage na)
 *   8. Activity Log
 *
 * Flow:
 *   1. Mount → call /portal/my-active?role=screen-maker
 *   2. status='single' → fetch /portal/screen-maker/context/{stageId}
 *   3. status='multiple' → show picker
 *   4. status='none' → empty state
 *
 * Screen Maker is mostly read-only. Notes + mark-as-done route through
 * the existing OrderStagesController endpoints, not portal-specific ones.
 */

const STATUS_FLOW = [
  { key: "payment_verification_sample", label: "Payment Verified", icon: "fa-credit-card" },
  { key: "graphic_artwork", label: "Graphic Artwork", icon: "fa-pen-ruler" },
  { key: "screen_making", label: "Screen Making", icon: "fa-stamp" },
  { key: "sample_cutting", label: "Sample Creation", icon: "fa-shirt" },
  { key: "sample_approval", label: "Sample Approval", icon: "fa-circle-check" },
  { key: "mass_cutting", label: "Mass Production", icon: "fa-industry" },
];

const ScreenMakerPortalPage = () => {

  const [resolving, setResolving] = useState(true);
  const [resolveError, setResolveError] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [listRefreshKey, setListRefreshKey] = useState(0);
  const [currentStageId, setCurrentStageId] = useState(null);

  const [context, setContext] = useState(null);
  const [contextLoading, setContextLoading] = useState(false);
  const [contextError, setContextError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Resolve which screen-making stage this user is on
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setResolving(true);
      setResolveError(null);
      try {
        const result = await portalApi.myActiveTasks("screen-maker");
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
    return () => { cancelled = true; };
  }, [listRefreshKey]);

  // Fetch context whenever stage changes or refresh triggered
  useEffect(() => {
    if (!currentStageId) return;
    let cancelled = false;
    (async () => {
      setContextLoading(true);
      setContextError(null);
      try {
        const result = await screenMakerPortalApi.context(currentStageId);
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

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
    setListRefreshKey((k) => k + 1);
  };
  const refreshList = () => setListRefreshKey((k) => k + 1);

  // ── Loading / error states ────────────────────────────────────

  // Landing: the worker's full "My Active Tasks" queue (Bundle 1).
  // Shows every task queued at their station (incl. pending) so it
  // matches the sidebar badge; tapping one opens its detail below.
  if (!currentStageId) {
    return (
      <RolePortalLayout
        roleTitle="Screen Making Portal"
        roleSubtitle={null}
        breadcrumbLinks={[{ name: "Screen Maker Portal", path: "/portal/screen-maker" }]}
      >
        <MyActiveTasksList
          tasks={tasks}
          loading={resolving}
          error={resolveError}
          onSelect={(id) => setCurrentStageId(id)}
          onRefresh={refreshList}
          title="My Active Tasks"
          emptyText="Wala ka pang screen-making task. Awtomatikong lalabas dito ang trabaho mo kapag handa na ang order."
        />
      </RolePortalLayout>
    );
  }

  const currentStageSlug = context?.stage?.stage ?? null;

  return (
    <RolePortalLayout
      roleTitle="Screen Making Portal"
      roleSubtitle={null}
      breadcrumbLinks={[{ name: "Screen Maker Portal", path: "/portal/screen-maker" }]}
      statusFlowStages={STATUS_FLOW}
      currentStageSlug={currentStageSlug}
      tipText="Linisin ang screen pagkatapos gamitin at itago sa tamang lugar."
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

          {/* 1. Order Details (SM Rework CP2 — enriched GA layout) */}
          <OrderDetailsSectionGA order={context.order} stage={context.stage} />

          {/* 2. Design Details — READ-ONLY view of the GA output */}
          <DesignDetailsSection
            placements={context.placements}
            pantonesUsed={context.pantones_used}
            order={context.order}
          />

          {/* 3. Screen Photos (kept — both service modes) */}
          <StageUploadSection
            orderStageId={currentStageId}
            category="screen"
            title="Screen Photos"
          />

          {/* Phase 5-D — Service Type Toggle (managers only) */}
          <ServiceTypeToggle
            stage={context.stage}
            onChanged={handleRefresh}
          />

          {/* Branch on service_type */}
          {context.stage?.service_type === "subcontract" ? (
            <SubcontractModeView subcontract={context.subcontract} />
          ) : (
            /* 4. Designs to Make Screen (kept — physical screen mapping) */
            <DesignsToMakeSection designs={context.designs} />
          )}

          {/* 5. Notes / Instructions — order notes + Hub → screen_maker
              thread (both modes; posted from the order's Review Hub) */}
          <NotesInstructionsSection
            order={context.order}
            roleNotes={context.role_notes}
          />

          {/* 6. Notes (Save Notes) — writes stage.notes; the Review Hub's
              Screen Making card shows this (both modes) */}
          <StageNotesSection
            stageId={context.stage.id}
            initialNotes={context.stage.notes}
            onChanged={handleRefresh}
          />

          {/* 7. Material Requests — Request Material already carries
              order_id + stage_id; the list shows each MR's status */}
          <MaterialRequestsSection
            materialRequests={context.material_requests}
            orderId={context.order.id}
            orderStageId={context.stage.id}
          />

          {/* 8. Activity Log */}
          <ActivityLogSection activityLog={context.activity_log} />

          {/* Bundle 3 — production "Done": advances the workflow server-side. */}
          <StageDoneButton
            role="screen-maker"
            orderStageId={currentStageId}
            onDone={() => { setCurrentStageId(null); setContext(null); refreshList(); }}
          />
        </div>
      )}
    </RolePortalLayout>
  );
};

export default ScreenMakerPortalPage;
