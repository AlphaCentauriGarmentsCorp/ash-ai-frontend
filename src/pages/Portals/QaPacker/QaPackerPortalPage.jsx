import React, { useEffect, useState } from "react";
import { portalApi } from "../../../api/portalApi";
import { qaPackerPortalApi } from "../../../api/qaPackerPortalApi";
import { useAuth } from "../../../hooks/useAuth";
import RolePortalLayout from "../../../layouts/RolePortal/RolePortalLayout";
import StageRejectionBanner from "../../../components/portals/StageRejectionBanner";
import MyActiveTasksList from "../../../components/portals/MyActiveTasksList";
import StageUploadSection from "../../../components/portals/StageUploadSection";
import TaskOverviewSection from "./sections/TaskOverviewSection";
import ReferenceImagesSection from "./sections/ReferenceImagesSection";
import QaChecklistSection from "./sections/QaChecklistSection";
import RejectRepairLogSection from "./sections/RejectRepairLogSection";
import PackingChecklistSection from "./sections/PackingChecklistSection";
import PackingBoxesSection from "./sections/PackingBoxesSection";
import FinalPhotosSection from "./sections/FinalPhotosSection";
import SubmitCompletedSection from "./sections/SubmitCompletedSection";
import ActivityLogSection from "./sections/ActivityLogSection";

/**
 * Phase 7-B Bundle 2 — QA/Packer Portal landing page.
 *
 * Flow (identical to Cutter / Sewer / Printer portals):
 *   1. Mount → call /portal/qa-packer/my-active
 *   2. status='single'   → fetch /portal/qa-packer/context/{stageId} → render
 *   3. status='multiple' → show picker → user picks → fetch context → render
 *   4. status='none'     → show empty state with explanation
 *
 * Status flow shown at top — distinct from Cutter, since QA/Packer
 * sits at the production tail (Mass Production → QA → Packing →
 * Delivery → Order Completed).
 *
 * Bundle 2 ships:
 *   - Page shell + my-active resolution
 *   - Section 1: Task Overview
 *   - Section 2: Reference Images
 *   - Section 8: Activity Log
 *
 * Bundles 3 & 4 fill in sections 3-7 (QA checklist, reject/repair,
 * packing checklist, packing boxes, final photos + submit).
 */

const STATUS_FLOW = [
  { key: "mass_sewing", label: "Mass Production", icon: "fa-industry" },
  { key: "mass_qa", label: "Quality Control", icon: "fa-clipboard-check" },
  { key: "mass_packing", label: "Packing", icon: "fa-box" },
  { key: "delivery", label: "Delivery", icon: "fa-truck" },
  { key: "order_completed", label: "Order Completed", icon: "fa-flag-checkered" },
];

const QaPackerPortalPage = () => {
  const { user } = useAuth();

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
  const [finalPhotos, setFinalPhotos] = useState({});

  // Step 1 — resolve active assignment(s)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setResolving(true);
      setResolveError(null);
      try {
        const result = await portalApi.myActiveTasks("qa-packer");
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
    if (!currentStageId) return undefined;
    let cancelled = false;

    (async () => {
      setContextLoading(true);
      setContextError(null);
      try {
        const result = await qaPackerPortalApi.context(currentStageId);
        if (cancelled) return;
        setContext(result.data);
      } catch (err) {
        if (cancelled) return;
        setContextError(
          err?.response?.data?.message ||
          "Hindi ma-load ang task details. Refresh para subukan ulit.",
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

  // The QA/Packer portal serves the QA stage plus both packing stages
  // (sample and mass). Title + packing-only sections key off this.
  const isPackingStage = ["sample_packing", "mass_packing"].includes(
    context?.task?.stage,
  );
  const portalTitle = isPackingStage ? "Packing" : "Quality Control";

  // Landing: the worker's full "My Active Tasks" queue (Bundle 1).
  // Shows every task queued at their station (incl. pending) so it
  // matches the sidebar badge; tapping one opens its detail below.
  if (!currentStageId) {
    return (
      <RolePortalLayout
        roleTitle="QA / Packer Portal"
        breadcrumbLinks={[{ name: "QA / Packer Portal", path: "/portal/qa-packer" }]}
      >
        <MyActiveTasksList
          tasks={tasks}
          loading={resolving}
          error={resolveError}
          onSelect={(id) => setCurrentStageId(id)}
          onRefresh={refreshList}
          title="My Active Tasks"
          emptyText="Wala ka pang QA o packing task. Awtomatikong lalabas dito ang trabaho mo kapag handa na ang order."
        />
      </RolePortalLayout>
    );
  }

  // ── Single / picked assignment — full portal render ───────────

  const currentStageSlug = context?.task?.stage ?? null;

  return (
    <RolePortalLayout
      roleTitle={portalTitle}
      breadcrumbLinks={[{ name: "QA / Packer Portal", path: "/portal/qa-packer" }]}
      statusFlowStages={STATUS_FLOW}
      currentStageSlug={currentStageSlug}
      tipText="Tingnan nang mabuti bawat piraso. Mas mainam ang ayusin ngayon kaysa ireklamo ng kliyente bukas."
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
          Hinahanda ang task details…
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

          {/* Section 1: Task Overview */}
          <TaskOverviewSection task={context.task} />

          {/* Section 2: Reference Images */}
          <ReferenceImagesSection referenceImages={context.reference_images} />

          {/* Section 3: QA Checklist */}
          <QaChecklistSection
            qaChecklist={context.qa_checklist}
            orderStageId={context.task.order_stage_id}
            userId={user?.id}
            sectionNumber={3}
          />

          {/* Section 4: Reject / Repair Log */}
          <RejectRepairLogSection
            rejectsRepairs={context.rejects_repairs}
            rejectReasons={context.reject_reasons}
            orderId={context.task.order_id}
            orderStageId={context.task.order_stage_id}
            orderTotalPcs={context.task.total_pcs}
            currentUserId={user?.id}
            onChanged={handleRefresh}
            sectionNumber={4}
          />

          {/* Issue / Defect Photos — QA attaches photos of any problems found,
              with an optional caption. Flows to the CSR Review Hub as artifacts
              (category 'qa_issue') via the generic stage-uploads system. */}
          <StageUploadSection
            orderStageId={context.task.order_stage_id}
            category="qa_issue"
            title="Issue / Defect Photos"
            helpText="Mag-attach ng larawan ng anumang depekto o problema sa produkto. May optional na caption. Makikita ito ng CSR sa Review Hub."
          />

          {/* Section 5: Packing Checklist — only when on packing stage */}
          {isPackingStage && (
            <PackingChecklistSection
              packingChecklist={context.packing_checklist}
              orderStageId={context.task.order_stage_id}
              userId={user?.id}
              sectionNumber={5}
            />
          )}

          {/* Section 6: Packing Boxes & QR — only when on packing stage */}
          {isPackingStage && (
            <PackingBoxesSection
              packingBoxes={context.packing_boxes}
              orderId={context.task.order_id}
              onChanged={handleRefresh}
              sectionNumber={6}
            />
          )}

          {/* Section 7: Final Photos — only when on packing stage */}
          {isPackingStage && (
            <FinalPhotosSection
              orderId={context.task.order_id}
              orderStageId={context.task.order_stage_id}
              finalPhotos={finalPhotos}
              onPhotosChanged={setFinalPhotos}
              sectionNumber={7}
            />
          )}

          {/* SUBMIT COMPLETED — shown on both QA and Packing stages */}
          <SubmitCompletedSection
            task={context.task}
            qaChecklist={context.qa_checklist}
            packingChecklist={context.packing_checklist}
            rejectsRepairs={context.rejects_repairs}
            userId={user?.id}
            finalPhotos={finalPhotos}
            onSubmitted={() => {
              // Success card handles its own navigation, but we clear
              // the parent's finalPhotos so a follow-up task starts clean.
              setFinalPhotos({});
            }}
          />

          {/* Section 8: Activity Log */}
          <ActivityLogSection
            activityLog={context.activity_log}
            sectionNumber={8}
          />
        </div>
      )}
    </RolePortalLayout>
  );
};

export default QaPackerPortalPage;
