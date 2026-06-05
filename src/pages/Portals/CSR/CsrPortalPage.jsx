import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import RolePortalLayout from "../../../layouts/RolePortal/RolePortalLayout";
import DashboardTab from "./DashboardTab";
import InquiriesTab from "./tabs/InquiriesTab";
import PaymentsTab from "./tabs/PaymentsTab";
import ApprovalsTab from "./tabs/ApprovalsTab";
import SwatchesTab from "./tabs/SwatchesTab";

/**
 * Phase 6-A / 6-B — CSR Hub portal landing.
 *
 * Bundle 3 update: replaces the final Fabric Swatches placeholder with
 * the real SwatchesTab. All 5 tabs are now live:
 *
 *   - Dashboard       (Bundle 1)
 *   - Inquiries       (Bundle 2)
 *   - Payments        (Bundle 2)
 *   - Approvals       (Bundle 2)
 *   - Fabric Swatches (Bundle 3 / Phase 6-B)
 */
const TABS = [
  { key: "dashboard", label: "Dashboard", icon: "fa-chart-line" },
  { key: "inquiries", label: "Inquiries", icon: "fa-envelope" },
  { key: "payments", label: "Payments", icon: "fa-money-check-dollar" },
  { key: "approvals", label: "Approvals", icon: "fa-hand" },
  { key: "swatches", label: "Fabric Swatches", icon: "fa-palette" },
];

// Change 16 — each KPI overview card drills into its filtered list. Service
// cards switch to a CSR Hub tab with a preset status filter; order-state cards
// route to the main Orders page with a ?state= filter that mirrors the
// CsrDashboardService KPI definitions, so the list matches the card's count.
const CARD_TARGETS = {
  pending_inquiries: { tab: "inquiries", filter: "new" },
  pending_quotations: { tab: "inquiries", filter: "quoted" },
  client_approvals_needed: { tab: "approvals", filter: "waiting" },
  pending_payments: { tab: "payments", filter: "for_verification" },
  in_production_orders: { route: "/orders?state=in_production" },
  delayed_orders: { route: "/orders?state=delayed" },
  ready_for_delivery: { route: "/orders?state=ready_for_delivery" },
  completed_orders: { route: "/orders?state=completed" },
};

const CsrPortalPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  // Per-tab preset filter, set when a card is clicked and consumed by the tab
  // on mount. Cleared on a manual tab click so tabs default to "All".
  const [initialFilters, setInitialFilters] = useState({
    inquiries: null,
    payments: null,
    approvals: null,
  });

  const handleCardNavigate = (cardKey) => {
    const target = CARD_TARGETS[cardKey];
    if (!target) return;
    if (target.route) {
      navigate(target.route);
      return;
    }
    setInitialFilters((prev) => ({ ...prev, [target.tab]: target.filter }));
    setActiveTab(target.tab);
  };

  const selectTab = (key) => {
    // A manual tab click clears any card-preset filter for that tab.
    setInitialFilters((prev) => ({ ...prev, [key]: null }));
    setActiveTab(key);
  };

  return (
    <RolePortalLayout
      roleTitle="CSR Hub"
      roleSubtitle="Lahat ng nangyayari sa inyong client orders, sa isang lugar."
      breadcrumbLinks={[{ name: "CSR Hub", path: "/portal/csr" }]}
      tipText="I-update ang inquiry status pag may bagong update mula sa client — para hindi ma-stuck sa 'new'."
    >
      <div className="mb-4 flex gap-1 border-b border-gray-200 overflow-x-auto">
        {TABS.map((t) => {
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => selectTab(t.key)}
              className={
                "px-4 py-2 text-xs font-semibold inline-flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap " +
                (isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-800")
              }
            >
              <i className={`fa-solid ${t.icon}`} />
              {t.label}
            </button>
          );
        })}
      </div>

      {activeTab === "dashboard" && <DashboardTab onCardNavigate={handleCardNavigate} />}
      {activeTab === "inquiries" && <InquiriesTab initialFilter={initialFilters.inquiries} />}
      {activeTab === "payments" && <PaymentsTab initialFilter={initialFilters.payments} />}
      {activeTab === "approvals" && <ApprovalsTab initialFilter={initialFilters.approvals} />}
      {activeTab === "swatches" && <SwatchesTab />}
    </RolePortalLayout>
  );
};

export default CsrPortalPage;