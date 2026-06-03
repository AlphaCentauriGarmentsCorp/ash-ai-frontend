import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { portalApi } from "../../../api/portalApi";
import { screenMakerPortalApi } from "../../../api/screenMakerPortalApi";
import RolePortalLayout from "../../../layouts/RolePortal/RolePortalLayout";
import StageRejectionBanner from "../../../components/portals/StageRejectionBanner";
import StageUploadSection from "../../../components/portals/StageUploadSection";
import ServiceTypeToggle from "../../../components/portals/ServiceTypeToggle";
import SubcontractModeView from "../../../components/portals/SubcontractModeView";
import OrderDetailsSection from "../Cutter/sections/OrderDetailsSection";
import MaterialRequestsSection from "../Cutter/sections/MaterialRequestsSection";
import ActivityLogSection from "../Cutter/sections/ActivityLogSection";
import DesignsToMakeSection from "./sections/DesignsToMakeSection";
import StageNotesSection from "./sections/StageNotesSection";
import MarkAsDoneSection from "./sections/MarkAsDoneSection";

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

  // Resolve which screen-making stage this user is on
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setResolving(true);
      setResolveError(null);
      try {
        const result = await portalApi.myActive("screen-maker");
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

  const handleRefresh = () => setRefreshKey((k) => k + 1);

  // ── Loading / error states ────────────────────────────────────

  if (resolving) {
    return (
      <RolePortalLayout roleTitle="Screen Making Portal">
        <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
          <i className="fa-solid fa-spinner fa-spin mr-2" />
          Hinahanap ang assignment mo…
        </div>
      </RolePortalLayout>
    );
  }

  if (resolveError) {
    return (
      <RolePortalLayout roleTitle="Screen Making Portal">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          <i className="fa-solid fa-triangle-exclamation mr-2" />
          {resolveError}
        </div>
      </RolePortalLayout>
    );
  }

  if (activeStatus === "none") {
    return (
      <RolePortalLayout roleTitle="Screen Making Portal">
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
            <i className="fa-solid fa-inbox text-2xl text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            Walang active na assignment
          </h3>
          <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
            Wala ka pang in-progress na screen-making task. Tatawagin ka ng
            manager mo kapag may bagong design na kailangan ng screen.
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
      <RolePortalLayout roleTitle="Screen Making Portal">
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Pumili ng assignment
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Marami kang active na screen-making task. Piliin kung saan ka
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
      roleTitle="Screen Making Portal"
      breadcrumbLinks={[{ name: "Screen Maker Portal", path: "/portal/screen-maker" }]}
      statusFlowStages={STATUS_FLOW}
      currentStageSlug={currentStageSlug}
      tipText="Linisin ang screen pagkatapos gamitin at itago sa tamang lugar."
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

              {/* Section 5: Quick Actions — Mark as Done */}
              <MarkAsDoneSection
                stageId={context.stage.id}
                currentStatus={context.stage.status}
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
        </div>
      )}
    </RolePortalLayout>
  );
};

export default ScreenMakerPortalPage;