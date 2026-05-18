import React, { useCallback, useEffect, useState } from "react";
import { logisticsPortalApi } from "../../../../api/logisticsPortalApi";
import ShipmentOverviewCards from "../sections/ShipmentOverviewCards";
import ShipmentListSection from "../sections/ShipmentListSection";
import ShipmentDetailHeader from "../sections/ShipmentDetailHeader";
import CourierShipmentForm from "../sections/CourierShipmentForm";
import InHouseShipmentForm from "../sections/InHouseShipmentForm";
import ShipmentStatusButtons from "../sections/ShipmentStatusButtons";
import ReturnVerificationSection from "../sections/ReturnVerificationSection";

/**
 * Phase 5-I — Subcontract Shipments tab.
 *
 * Two views in one tab:
 *   view='list'   → overview cards + table of all active shipments
 *   view='detail' → single shipment detail page (or create-new flow
 *                   if landed via a bare assignment)
 */
const SubcontractShipmentsTab = () => {
  const [view, setView] = useState("list");
  // When view='detail', exactly one of these is set:
  const [activeShipmentId, setActiveShipmentId] = useState(null);
  const [activeAssignmentId, setActiveAssignmentId] = useState(null);

  // List-view state
  const [listData, setListData] = useState(null);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState(null);

  // Detail-view state
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  const [refreshKey, setRefreshKey] = useState(0);
  const bump = useCallback(() => setRefreshKey((k) => k + 1), []);

  // ── Load list ──────────────────────────────────────────────────
  useEffect(() => {
    if (view !== "list") return;
    let cancelled = false;
    (async () => {
      setListLoading(true);
      setListError(null);
      try {
        const result = await logisticsPortalApi.activeShipments();
        if (cancelled) return;
        setListData(result.data);
      } catch (err) {
        if (cancelled) return;
        setListError(err?.response?.data?.message || "Hindi ma-load ang shipments.");
      } finally {
        if (!cancelled) setListLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [view, refreshKey]);

  // ── Load detail ────────────────────────────────────────────────
  useEffect(() => {
    if (view !== "detail") return;
    let cancelled = false;
    (async () => {
      setDetailLoading(true);
      setDetailError(null);
      try {
        const result = activeShipmentId
          ? await logisticsPortalApi.shipmentContext(activeShipmentId)
          : await logisticsPortalApi.assignmentContext(activeAssignmentId);
        if (cancelled) return;
        setDetailData(result.data);
      } catch (err) {
        if (cancelled) return;
        setDetailError(err?.response?.data?.message || "Hindi ma-load ang detail.");
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [view, activeShipmentId, activeAssignmentId, refreshKey]);

  const openShipment = (shipmentId) => {
    setActiveAssignmentId(null);
    setActiveShipmentId(shipmentId);
    setDetailData(null);
    setView("detail");
  };

  const openAssignment = (assignmentId) => {
    setActiveShipmentId(null);
    setActiveAssignmentId(assignmentId);
    setDetailData(null);
    setView("detail");
  };

  const backToList = () => {
    setView("list");
    setActiveShipmentId(null);
    setActiveAssignmentId(null);
    setDetailData(null);
    bump();
  };

  // ── List view ──────────────────────────────────────────────────
  if (view === "list") {
    if (listLoading && !listData) {
      return (
        <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
          <i className="fa-solid fa-spinner fa-spin mr-2" />
          Hinahanda ang shipments…
        </div>
      );
    }

    if (listError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          <i className="fa-solid fa-triangle-exclamation mr-2" />
          {listError}
          <button type="button" onClick={bump} className="ml-3 text-xs underline">
            Retry
          </button>
        </div>
      );
    }

    if (!listData) return null;

    return (
      <div className="flex flex-col gap-4">
        <ShipmentOverviewCards counts={listData.counts} />
        <ShipmentListSection
          shipments={listData.shipments}
          pendingAssignments={listData.pending_assignments}
          onOpenShipment={openShipment}
          onOpenAssignment={openAssignment}
        />
      </div>
    );
  }

  // ── Detail view ────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={backToList}
        className="text-xs text-gray-600 hover:text-primary inline-flex items-center self-start"
      >
        <i className="fa-solid fa-arrow-left mr-1" />
        Bumalik sa list
      </button>

      {detailLoading && !detailData && (
        <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
          <i className="fa-solid fa-spinner fa-spin mr-2" />
          Hinahanda ang detalye…
        </div>
      )}

      {detailError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          <i className="fa-solid fa-triangle-exclamation mr-2" />
          {detailError}
        </div>
      )}

      {detailData && (
        <DetailView
          detail={detailData}
          isShipmentView={!!activeShipmentId}
          onChanged={bump}
          onOpenShipment={openShipment}
        />
      )}
    </div>
  );
};

/**
 * DetailView renders either:
 *   - a single shipment's full form (shipment + status buttons + return verify),
 *     OR
 *   - an assignment landing (no shipment yet) with a "Create new shipment" form.
 */
const DetailView = ({ detail, isShipmentView, onChanged, onOpenShipment }) => {
  // When we're viewing an assignment with no shipment yet, present the
  // assignment context + a "new shipment" form. Once created, the user
  // gets routed to the new shipment's detail.
  if (!isShipmentView) {
    return (
      <>
        <ShipmentDetailHeader
          order={detail.order}
          subcontractor={detail.subcontractor}
          stage={detail.stage}
          shipment={null}
          assignment={detail.assignment}
        />

        {detail.shipments?.length > 0 && (
          <section className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <i className="fa-solid fa-list-ul text-gray-500" />
              Existing Shipments
            </h3>
            <div className="flex flex-col gap-2">
              {detail.shipments.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onOpenShipment(s.id)}
                  className="text-left bg-gray-50 hover:bg-primary/5 border border-gray-200 hover:border-primary rounded p-3 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold capitalize">
                      {s.direction.replace("_", " ")} · {s.status.replace("_", " ")}
                    </span>
                    <i className="fa-solid fa-chevron-right text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        <NewShipmentEntry
          assignmentId={detail.assignment?.id}
          courierOptions={detail.courier_options}
          shippingMethodOptions={detail.shipping_method_options}
          onCreated={onOpenShipment}
        />

        <ReturnVerificationSection
          assignment={detail.assignment}
          onChanged={onChanged}
        />
      </>
    );
  }

  // Shipment-view: full form for one shipment.
  const shipment = detail.shipment;
  const isCourier = shipment.delivery_mode === "courier";

  return (
    <>
      <ShipmentDetailHeader
        order={detail.order}
        subcontractor={detail.subcontractor}
        stage={detail.stage}
        shipment={shipment}
        assignment={detail.assignment}
      />

      {isCourier ? (
        <CourierShipmentForm
          shipment={shipment}
          courierOptions={detail.courier_options}
          shippingMethodOptions={detail.shipping_method_options}
          onChanged={onChanged}
        />
      ) : (
        <InHouseShipmentForm
          shipment={shipment}
          onChanged={onChanged}
        />
      )}

      <ShipmentStatusButtons
        shipment={shipment}
        onChanged={onChanged}
      />

      <ReturnVerificationSection
        assignment={detail.assignment}
        onChanged={onChanged}
      />
    </>
  );
};

/**
 * Minimal "Create first shipment" entry — picks delivery_mode +
 * (optional) waybill, then the user gets redirected to the new
 * shipment's detail to fill in the rest.
 */
const NewShipmentEntry = ({ assignmentId, courierOptions, shippingMethodOptions, onCreated }) => {
  const [mode, setMode] = useState("courier");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleCreate = async () => {
    if (!assignmentId) return;
    setSaving(true);
    setError(null);
    try {
      const result = await logisticsPortalApi.createShipment({
        stage_subcontract_assignment_id: assignmentId,
        delivery_mode: mode,
      });
      const newId = result?.data?.shipment?.id;
      if (newId) onCreated(newId);
    } catch (err) {
      setError(err?.response?.data?.message || "Hindi nakapag-create ng shipment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <i className="fa-solid fa-plus text-gray-500" />
        Create New Shipment
      </h3>
      <p className="text-xs text-gray-500 mb-3">
        Pumili ng delivery mode para makapag-set up ng shipment.
      </p>
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          type="button"
          onClick={() => setMode("courier")}
          className={
            "px-3 py-2 text-xs rounded border " +
            (mode === "courier"
              ? "bg-primary text-white border-primary"
              : "bg-white text-gray-700 border-gray-300 hover:border-primary")
          }
        >
          <i className="fa-solid fa-truck mr-1" />
          Courier / Lalamove / Platform
        </button>
        <button
          type="button"
          onClick={() => setMode("in_house_driver")}
          className={
            "px-3 py-2 text-xs rounded border " +
            (mode === "in_house_driver"
              ? "bg-primary text-white border-primary"
              : "bg-white text-gray-700 border-gray-300 hover:border-primary")
          }
        >
          <i className="fa-solid fa-user-tie mr-1" />
          Company Driver (In-House)
        </button>
      </div>

      {error && (
        <p className="text-[11px] text-red-600 mb-2">{error}</p>
      )}

      <button
        type="button"
        onClick={handleCreate}
        disabled={saving}
        className="bg-primary text-white text-xs px-4 py-2 rounded font-medium hover:opacity-90 disabled:opacity-50"
      >
        {saving ? "Creating…" : "Create Shipment"}
      </button>
    </section>
  );
};

export default SubcontractShipmentsTab;
