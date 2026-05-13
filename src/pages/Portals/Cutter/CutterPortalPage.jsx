import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { portalApi } from "../../../api/portalApi";
import { cutterPortalApi } from "../../../api/cutterPortalApi";
import RolePortalLayout from "../../../layouts/RolePortal/RolePortalLayout";
import OrderDetailsSection from "./sections/OrderDetailsSection";
import SizeChartSection from "./sections/SizeChartSection";
import FabricTrackingSection from "./sections/FabricTrackingSection";
import SampleUploadSection from "./sections/SampleUploadSection";
import MaterialRequestsSection from "./sections/MaterialRequestsSection";
import ActivityLogSection from "./sections/ActivityLogSection";

/**
 * Phase 5-B — Cutter Portal landing page.
 *
 * Flow:
 *   1. Mount → call /portal/cutter/my-active
 *   2. status='single' → fetch /portal/cutter/context/{stageId} → render
 *   3. status='multiple' → show picker → user picks → fetch context → render
 *   4. status='none' → show empty state with explanation
 *
 * The 6-step status flow shown at top is the standard Phase 5 flow:
 *   Payment Verified → Graphic Artwork → Screen Making →
 *   Sample Creation → Sample Approval → Mass Production
 *
 * Reusable status flow definition (also used by Printer, Sewer, Screen
 * Maker portals).
 */

const STATUS_FLOW = [
  { key: "payment_verification_sample", label: "Payment Verified", icon: "fa-credit-card" },
  { key: "graphic_artwork", label: "Graphic Artwork", icon: "fa-pen-ruler" },
  { key: "screen_making", label: "Screen Making", icon: "fa-stamp" },
  { key: "sample_creation", label: "Sample Creation", icon: "fa-shirt" },
  { key: "sample_approval", label: "Sample Approval", icon: "fa-circle-check" },
  { key: "mass_production", label: "Mass Production", icon: "fa-industry" },
];

const CutterPortalPage = () => {
  const navigate = useNavigate();

  // Resolution state
  const [resolving, setResolving] = useState(true);
  const [resolveError, setResolveError] = useState(null);
  const [activeStatus, setActiveStatus] = useState(null); // 'single' | 'multiple' | 'none'
  const [assignmentList, setAssignmentList] = useState([]);
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
        const result = await portalApi.myActive("cutter");
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
    return () => {
      cancelled = true;
    };
  }, []);

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

  const handleRefresh = () => setRefreshKey((k) => k + 1);

  // ── Render branches ───────────────────────────────────────────

  if (resolving) {
    return (
      <RolePortalLayout roleTitle="Sample Creation – Cutter">
        <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
          <i className="fa-solid fa-spinner fa-spin mr-2" />
          Hinahanap ang assignment mo…
        </div>
      </RolePortalLayout>
    );
  }

  if (resolveError) {
    return (
      <RolePortalLayout roleTitle="Sample Creation – Cutter">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          <i className="fa-solid fa-triangle-exclamation mr-2" />
          {resolveError}
        </div>
      </RolePortalLayout>
    );
  }

  if (activeStatus === "none") {
    return (
      <RolePortalLayout roleTitle="Sample Creation – Cutter">
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
            <i className="fa-solid fa-inbox text-2xl text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            Walang active na assignment
          </h3>
          <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
            Wala ka pang in-progress na cutting task. Tatawagin ka ng manager
            mo kapag may bagong sample na kailangan i-cut.
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
      <RolePortalLayout roleTitle="Sample Creation – Cutter">
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Pumili ng assignment
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Marami kang active na cutting task. Piliin kung saan ka unang
            magtatrabaho.
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
                      {" · "}
                      {String(a.stage).replace(/_/g, " ")}
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
      {/* Back-to-picker button (only when there are multiple assignments) */}
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
          {/* Section 1: Order Details */}
          <OrderDetailsSection order={context.order} stage={context.stage} />

          {/* Two-column on lg: Size chart + Fabric tracking */}
          <div className="grid lg:grid-cols-2 gap-4">
            <SizeChartSection sizeChart={context.size_chart} order={context.order} />
            <FabricTrackingSection
              fabricTracking={context.fabric_tracking}
              orderId={context.order.id}
              orderStageId={context.stage.id}
              onChanged={handleRefresh}
            />
          </div>

          {/* Section 4: Material Requests (Phase 3 integration) */}
          <MaterialRequestsSection
            materialRequests={context.material_requests}
            orderId={context.order.id}
            orderStageId={context.stage.id}
          />

          {/* Section 5: Sample Output & Upload */}
          <SampleUploadSection
            sampleUploads={context.sample_uploads}
            orderId={context.order.id}
            orderStageId={context.stage.id}
            onChanged={handleRefresh}
          />

          {/* Section 6: Activity Log */}
          <ActivityLogSection activityLog={context.activity_log} />
        </div>
      )}
    </RolePortalLayout>
  );
};

export default CutterPortalPage;
