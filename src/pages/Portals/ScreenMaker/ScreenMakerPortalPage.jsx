import React, { useEffect, useState } from "react";
import { portalApi } from "../../../api/portalApi";
import { screenMakerPortalApi } from "../../../api/screenMakerPortalApi";
import RolePortalLayout from "../../../layouts/RolePortal/RolePortalLayout";
import StageRejectionBanner from "../../../components/portals/StageRejectionBanner";
import MyActiveTasksList from "../../../components/portals/MyActiveTasksList";
import StageUploadSection from "../../../components/portals/StageUploadSection";
import ServiceTypeToggle from "../../../components/portals/ServiceTypeToggle";
import SubcontractModeView from "../../../components/portals/SubcontractModeView";
import OrderDetailsSection from "../Cutter/sections/OrderDetailsSection";
import MaterialRequestsSection from "../Cutter/sections/MaterialRequestsSection";
import ActivityLogSection from "../Cutter/sections/ActivityLogSection";
import DesignsToMakeSection from "./sections/DesignsToMakeSection";
import StageNotesSection from "./sections/StageNotesSection";
import StageDoneButton from "../../../components/portals/StageDoneButton";

/**
 * Phase 5-F — Screen Maker Portal landing page.
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

          <StageUploadSection
            orderStageId={currentStageId}
            category="screen"
            title="Screen Photos"
          />

          {/* Section 1: Order Details */}
          <OrderDetailsSection order={context.order} stage={context.stage} />

          {/* Phase 5-D — Service Type Toggle (managers only) */}
          <ServiceTypeToggle
            stage={context.stage}
            onChanged={handleRefresh}
          />

          {/* Branch on service_type */}
          {context.stage?.service_type === "subcontract" ? (
            <SubcontractModeView subcontract={context.subcontract} />
          ) : (
            <>
              {/* Section 2: Designs to Make Screen */}
              <DesignsToMakeSection designs={context.designs} />

              {/* Section 4: Notes */}
              <StageNotesSection
                stageId={context.stage.id}
                initialNotes={context.stage.notes}
                onChanged={handleRefresh}
              />
            </>
          )}

          {/* Section 6: Material Requests — shown in both modes */}
          <MaterialRequestsSection
            materialRequests={context.material_requests}
            orderId={context.order.id}
            orderStageId={context.stage.id}
          />

          {/* Section 7: Activity Log — shown in both modes */}
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