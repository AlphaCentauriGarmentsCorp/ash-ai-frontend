import React, { useEffect, useState } from "react";
import { portalApi } from "../../../api/portalApi";
import { sewerPortalApi } from "../../../api/sewerPortalApi";
import RolePortalLayout from "../../../layouts/RolePortal/RolePortalLayout";
import StageRejectionBanner from "../../../components/portals/StageRejectionBanner";
import MyActiveTasksList from "../../../components/portals/MyActiveTasksList";
import StageDoneButton from "../../../components/portals/StageDoneButton";
import StageUploadSection from "../../../components/portals/StageUploadSection";
import ServiceTypeToggle from "../../../components/portals/ServiceTypeToggle";
import SubcontractModeView from "../../../components/portals/SubcontractModeView";
import OrderDetailsSection from "../Cutter/sections/OrderDetailsSection";
import MaterialRequestsSection from "../Cutter/sections/MaterialRequestsSection";
import ActivityLogSection from "../Cutter/sections/ActivityLogSection";
import SampleDetailsSection from "./sections/SampleDetailsSection";
import MeasurementsSection from "./sections/MeasurementsSection";
import MaterialsUsageSection from "./sections/MaterialsUsageSection";
import SewerSampleUploadSection from "./sections/SewerSampleUploadSection";

const STATUS_FLOW = [
  { key: "payment_verification_sample", label: "Payment Verified", icon: "fa-credit-card" },
  { key: "graphic_artwork", label: "Graphic Artwork", icon: "fa-pen-ruler" },
  { key: "screen_making", label: "Screen Making", icon: "fa-stamp" },
  { key: "sample_cutting", label: "Sample Creation", icon: "fa-shirt" },
  { key: "sample_approval", label: "Sample Approval", icon: "fa-circle-check" },
  { key: "mass_cutting", label: "Mass Production", icon: "fa-industry" },
];

const SewerPortalPage = () => {

  const [resolving, setResolving] = useState(true);
  const [resolveError, setResolveError] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [listRefreshKey, setListRefreshKey] = useState(0);
  const [currentStageId, setCurrentStageId] = useState(null);

  const [context, setContext] = useState(null);
  const [contextLoading, setContextLoading] = useState(false);
  const [contextError, setContextError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setResolving(true);
      setResolveError(null);
      try {
        const result = await portalApi.myActiveTasks("sewer");
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

  useEffect(() => {
    if (!currentStageId) return;
    let cancelled = false;
    (async () => {
      setContextLoading(true);
      setContextError(null);
      try {
        const result = await sewerPortalApi.context(currentStageId);
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

  // Landing: the worker's full "My Active Tasks" queue (Bundle 1).
  // Shows every task queued at their station (incl. pending) so it
  // matches the sidebar badge; tapping one opens its detail below.
  if (!currentStageId) {
    return (
      <RolePortalLayout
        roleTitle="Sewer Portal"
        breadcrumbLinks={[{ name: "Sewer Portal", path: "/portal/sewer" }]}
      >
        <MyActiveTasksList
          tasks={tasks}
          loading={resolving}
          error={resolveError}
          onSelect={(id) => setCurrentStageId(id)}
          onRefresh={refreshList}
          title="My Active Tasks"
          emptyText="Wala ka pang sewing task. Awtomatikong lalabas dito ang trabaho mo kapag handa na ang order."
        />
      </RolePortalLayout>
    );
  }

  const currentStageSlug = context?.stage?.stage ?? null;

  return (
    <RolePortalLayout
      roleTitle={
        context?.stage?.phase === "mass"
          ? "Mass Production – Sewer"
          : "Sample Creation – Sewer"
      }
      breadcrumbLinks={[{ name: "Sewer Portal", path: "/portal/sewer" }]}
      statusFlowStages={STATUS_FLOW}
      currentStageSlug={currentStageSlug}
      tipText="Maayos na tahi, tamang sukat, at malinis na sample na susi sa mabilis na approval. Salamat!"
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
            category="sewing"
            title="Sewing Proof"
          />

          <OrderDetailsSection order={context.order} stage={context.stage} />

          <ServiceTypeToggle
            stage={context.stage}
            onChanged={handleRefresh}
          />

          {context.stage?.service_type === "subcontract" ? (
            <SubcontractModeView subcontract={context.subcontract} />
          ) : (
            <>
              <SampleDetailsSection sampleDetails={context.sample_details} />

              <MeasurementsSection measurements={context.measurements} />

              <MaterialsUsageSection
                materialsUsage={context.materials_usage}
                orderId={context.order.id}
                orderStageId={context.stage.id}
                onChanged={handleRefresh}
              />

              <SewerSampleUploadSection
                sampleUploads={context.sample_uploads}
                orderId={context.order.id}
                orderStageId={context.stage.id}
                onChanged={handleRefresh}
              />
            </>
          )}

          <MaterialRequestsSection
            materialRequests={context.material_requests}
            orderId={context.order.id}
            orderStageId={context.stage.id}
          />

          <ActivityLogSection activityLog={context.activity_log} />

          {/* Bundle 3 — production "Done": advances the workflow server-side. */}
          <StageDoneButton
            role="sewer"
            orderStageId={currentStageId}
            onDone={() => { setCurrentStageId(null); setContext(null); refreshList(); }}
          />
        </div>
      )}
    </RolePortalLayout>
  );
};

export default SewerPortalPage;