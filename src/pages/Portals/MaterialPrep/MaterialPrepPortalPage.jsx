import React, { useEffect, useState } from "react";
import { materialPrepPortalApi } from "../../../api/materialPrepPortalApi";
import RolePortalLayout from "../../../layouts/RolePortal/RolePortalLayout";
import PRSummarySection from "./sections/PRSummarySection";
import MaterialsToBuySection from "./sections/MaterialsToBuySection";
import SupplierDetailsSection from "./sections/SupplierDetailsSection";
import PRActionsSection from "./sections/PRActionsSection";
import OrdersNeedingPrepSection from "./sections/OrdersNeedingPrepSection";

/**
 * Phase 5-G — Material Prep Portal landing page.
 *
 * Resolution flow (similar to Cutter/Sewer but for PRs, not stages):
 *   1. Mount → call /portal/material-prep/my-active
 *   2. status='single' → fetch /portal/material-prep/context/{prId}
 *   3. status='multiple' → show PR picker
 *   4. status='none' → empty state
 *
 * No service_type branching (PRs don't get subcontracted — they ARE
 * the inventory-purchase mechanism).
 */
const MaterialPrepPortalPage = () => {
  const [resolving, setResolving] = useState(true);
  const [resolveError, setResolveError] = useState(null);
  const [activeStatus, setActiveStatus] = useState(null);
  const [assignmentList, setAssignmentList] = useState([]);
  const [currentPRId, setCurrentPRId] = useState(null);

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
        const result = await materialPrepPortalApi.myActive();
        if (cancelled) return;
        setActiveStatus(result.status);
        if (result.status === "single") {
          setCurrentPRId(result.assignment.id);
        } else if (result.status === "multiple") {
          setAssignmentList(result.assignments || []);
        }
      } catch (err) {
        if (cancelled) return;
        setResolveError(
          err?.response?.data?.message ||
          "Hindi ma-load ang PRs. Try refreshing."
        );
      } finally {
        if (!cancelled) setResolving(false);
      }
    })();
    return () => { cancelled = true; };
  }, [refreshKey]);

  useEffect(() => {
    if (!currentPRId) return;
    let cancelled = false;
    (async () => {
      setContextLoading(true);
      setContextError(null);
      try {
        const result = await materialPrepPortalApi.context(currentPRId);
        if (cancelled) return;
        setContext(result.data);
      } catch (err) {
        if (cancelled) return;
        setContextError(
          err?.response?.data?.message ||
          "Hindi ma-load ang PR details. Refresh para subukan ulit."
        );
      } finally {
        if (!cancelled) setContextLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [currentPRId, refreshKey]);

  const handleRefresh = () => setRefreshKey((k) => k + 1);

  // ── Loading / error / empty states ──────────────────────────

  if (resolving) {
    return (
      <RolePortalLayout roleTitle="Material Preparation Portal">
        <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
          <i className="fa-solid fa-spinner fa-spin mr-2" />
          Naghahanap ng active PRs…
        </div>
      </RolePortalLayout>
    );
  }

  if (resolveError) {
    return (
      <RolePortalLayout roleTitle="Material Preparation Portal">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          <i className="fa-solid fa-triangle-exclamation mr-2" />
          {resolveError}
        </div>
      </RolePortalLayout>
    );
  }

  if (activeStatus === "none") {
    return (
      <RolePortalLayout roleTitle="Material Preparation Portal">
        <OrdersNeedingPrepSection />
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-500">
            No active Purchase Requests yet. Prepare an order above — shortfalls
            will create a Purchase Request automatically.
          </p>
        </div>
      </RolePortalLayout>
    );
  }

  if (activeStatus === "multiple" && !currentPRId) {
    return (
      <RolePortalLayout roleTitle="Material Preparation Portal">
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Pumili ng Purchase Request
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Marami kang active PRs. Piliin kung alin ang i-aaction muna.
          </p>
          <div className="flex flex-col gap-2">
            {assignmentList.map((a) => {
              const statusStyle = {
                pending: "bg-amber-100 text-amber-700",
                approved: "bg-blue-100 text-blue-700",
                ordered: "bg-indigo-100 text-indigo-700",
              }[a.status] || "bg-gray-100 text-gray-700";

              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setCurrentPRId(a.id)}
                  className="text-left bg-gray-50 hover:bg-primary/5 border border-gray-200 hover:border-primary rounded-md p-3 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {a.pr_code}
                      </p>
                      <p className="text-xs text-gray-500">
                        {a.order?.po_code || `Order #${a.order?.id}`} —{" "}
                        {a.order?.client_brand || a.order?.client_name || "—"}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Supplier: {a.supplier?.name || "Not assigned"} · ₱
                        {(a.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded ${statusStyle}`}>
                        {a.status}
                      </span>
                      <i className="fa-solid fa-chevron-right text-gray-400 text-xs" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </RolePortalLayout>
    );
  }

  return (
    <RolePortalLayout
      roleTitle="Material Preparation Portal"
      breadcrumbLinks={[{ name: "Material Prep Portal", path: "/portal/material-prep" }]}
      tipText="Always check all items before purchasing, confirm price and stock availability with supplier, and update the system after purchasing."
    >
      <OrdersNeedingPrepSection />
      {activeStatus === "multiple" && (
        <button
          type="button"
          onClick={() => setCurrentPRId(null)}
          className="text-xs text-gray-600 hover:text-primary mb-3 inline-flex items-center"
        >
          <i className="fa-solid fa-arrow-left mr-1" />
          Bumalik sa PR picker
        </button>
      )}

      {contextLoading && !context && (
        <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
          <i className="fa-solid fa-spinner fa-spin mr-2" />
          Hinahanda ang PR details…
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
          {/* Section 1 — PR Summary */}
          <PRSummarySection
            pr={context.pr}
            order={context.order}
            totals={context.totals}
          />

          {/* Section 2 — Materials to Buy */}
          <MaterialsToBuySection items={context.items} />

          {/* Section 3 — Supplier Details + Selector */}
          <SupplierDetailsSection
            supplier={context.supplier}
            alternativeSuppliers={context.alternative_suppliers}
            canChangeSupplier={context.permissions?.can_change_supplier}
            prId={context.pr.id}
            onChanged={handleRefresh}
          />

          {/* Sections 4 + 5 — Actions + Totals (combined component) */}
          <PRActionsSection
            pr={context.pr}
            supplier={context.supplier}
            totals={context.totals}
            permissions={context.permissions}
            onChanged={handleRefresh}
          />
        </div>
      )}
    </RolePortalLayout>
  );
};

export default MaterialPrepPortalPage;