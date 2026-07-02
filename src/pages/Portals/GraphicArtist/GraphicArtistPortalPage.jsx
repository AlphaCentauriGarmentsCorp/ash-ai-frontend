import React, { useEffect, useState } from "react";
import { portalApi } from "../../../api/portalApi";
import { graphicArtistPortalApi } from "../../../api/graphicArtistPortalApi";
import RolePortalLayout from "../../../layouts/RolePortal/RolePortalLayout";
import StageRejectionBanner from "../../../components/portals/StageRejectionBanner";
import MyActiveTasksList from "../../../components/portals/MyActiveTasksList";
import OrderDetailsSectionGA from "./sections/OrderDetailsSectionGA";

import SourceReferenceFilesSection from "./sections/SourceReferenceFilesSection";
import PrintLocationsSection from "./sections/PrintLocationsSection";
import LabelsTagsSection from "./sections/LabelsTagsSection";
import NotesInstructionsSection from "./sections/NotesInstructionsSection";

// GA-specific copies of shared sections — same logic, different section
// numbers so the Graphic Artist page numbering reads cleanly (1–12).
// The originals (under Cutter/ and ScreenMaker/) keep their own numbers
// for those portals.
import StageNotesSectionGA from "./sections/StageNotesSectionGA";
import StageDoneButton from "../../../components/portals/StageDoneButton";
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
  { key: "sample_cutting", label: "Sample Creation", icon: "fa-shirt" },
  { key: "sample_approval", label: "Sample Approval", icon: "fa-circle-check" },
  { key: "mass_cutting", label: "Mass Production", icon: "fa-industry" },
];

const GraphicArtistPortalPage = () => {

  const [resolving, setResolving] = useState(true);
  const [resolveError, setResolveError] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [listRefreshKey, setListRefreshKey] = useState(0);
  const [currentStageId, setCurrentStageId] = useState(null);

  const [context, setContext] = useState(null);
  const [contextLoading, setContextLoading] = useState(false);
  const [contextError, setContextError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // ── Load my active tasks (Change 2) ────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setResolving(true);
      setResolveError(null);
      try {
        const result = await portalApi.myActiveTasks("graphic-artist");
        if (cancelled) return;
        setTasks(result.tasks || []);
      } catch (err) {
        if (cancelled) return;
        setResolveError(
          err?.response?.data?.message ||
          "Hindi ma-load ang tasks mo. Try refreshing.",
        );
      } finally {
        if (!cancelled) setResolving(false);
      }
    })();
    return () => { cancelled = true; };
  }, [listRefreshKey]);

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

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
    setListRefreshKey((k) => k + 1);
  };
  const refreshList = () => setListRefreshKey((k) => k + 1);

  // ── Landing: My Active Tasks list (Change 2) ───────────────────
  // Until the artist picks a task, the portal shows their active queue.
  // The list component renders its own loading / error / empty states.
  if (!currentStageId) {
    return (
      <RolePortalLayout
        roleTitle="Graphic Artist Portal"
        roleSubtitle={null}
        breadcrumbLinks={[{ name: "Graphic Artist Portal", path: "/portal/graphic-artist" }]}
      >
        <MyActiveTasksList
          tasks={tasks}
          loading={resolving}
          error={resolveError}
          onSelect={(id) => setCurrentStageId(id)}
          onRefresh={refreshList}
          title="My Active Tasks"
          emptyText="Wala ka pang graphic artwork task. Aabisuhan ka ng CSR kapag may bagong design na kailangan."
        />
      </RolePortalLayout>
    );
  }

  const currentStageSlug = context?.stage?.stage ?? null;

  return (
    <RolePortalLayout
      roleTitle="Graphic Artist Portal"
      roleSubtitle={null}
      breadcrumbLinks={[{ name: "Graphic Artist Portal", path: "/portal/graphic-artist" }]}
      statusFlowStages={STATUS_FLOW}
      currentStageSlug={currentStageSlug}
      tipText="I-double check ang Pantone at artwork kada placement bago pindutin ang Tapos na."
    >
      <button
        type="button"
        onClick={() => { setCurrentStageId(null); refreshList(); }}
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

          {/* 1. Order Details (CP6 — enriched with Product Details) */}
          <OrderDetailsSectionGA order={context.order} stage={context.stage} />

          {/* 2. Source / Reference Files (read-only — Change 14) */}
          <SourceReferenceFilesSection files={context.source_files} />

          {/* 3. Print Locations & Pantones (CP6 — catalog picker) */}
          <PrintLocationsSection
            placements={context.placements}
            suggestedPlacements={context.suggested_placements || []}
            placementOptions={context.placement_options}
            pantoneOptions={context.pantone_options || []}
            orderId={context.order.id}
            orderStageId={context.stage.id}
            onChanged={handleRefresh}
          />

          {/* 4. Labels & Tags (CP8 — aligned: read-only specs +
              shared Label Design upload) */}
          <LabelsTagsSection
            order={context.order}
            orderId={context.order.id}
            orderStageId={context.stage.id}
            onChanged={handleRefresh}
          />

          {/* 5. Notes / Instructions */}
          <NotesInstructionsSection
            order={context.order}
            design={context.design}
          />

          {/* 6. Stage Notes (writeable) */}
          <StageNotesSectionGA
            stageId={context.stage.id}
            initialNotes={context.stage.notes}
            onChanged={handleRefresh}
          />

          {/* 7. Activity Log */}
          <ActivityLogSectionGA activityLog={context.activity_log} />

          {/* Bundle 3 — production "Done": advances the workflow server-side.
              CP2 — warn-but-allow: when the backend reports completion
              warnings, the confirm dialog lists them; the artist can still
              proceed (soft gate by decision — never a hard block). */}
          <StageDoneButton
            role="graphic-artist"
            orderStageId={currentStageId}
            confirmTitle={
              (context.completion_warnings || []).length > 0
                ? "May kulang pa — ituloy pa rin?"
                : "Tapos na ba ito?"
            }
            confirmMessage={
              (context.completion_warnings || []).length > 0 ? (
                <>
                  <span className="block mb-1">
                    Bago ipasa, pakitingnan ang mga ito:
                  </span>
                  {(context.completion_warnings || []).map((w, i) => (
                    <span
                      key={w.code + i}
                      className="block text-amber-700 text-[13px]"
                    >
                      • {w.message}
                    </span>
                  ))}
                  <span className="block mt-2">
                    Pwede mo pa ring ituloy — awtomatikong magpapatuloy ang
                    order sa susunod na hakbang.
                  </span>
                </>
              ) : (
                "Markahan ang task na ito bilang tapos. Awtomatikong magpapatuloy ang order sa susunod na hakbang."
              )
            }
            onDone={() => { setCurrentStageId(null); setContext(null); refreshList(); }}
          />
        </div>
      )}
    </RolePortalLayout>
  );
};

export default GraphicArtistPortalPage;