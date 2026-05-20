import React, { useState } from "react";
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
  { key: "dashboard", label: "Dashboard",       icon: "fa-chart-line" },
  { key: "inquiries", label: "Inquiries",       icon: "fa-envelope" },
  { key: "payments",  label: "Payments",        icon: "fa-money-check-dollar" },
  { key: "approvals", label: "Approvals",       icon: "fa-hand" },
  { key: "swatches",  label: "Fabric Swatches", icon: "fa-palette" },
];

const CsrPortalPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

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
              onClick={() => setActiveTab(t.key)}
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

      {activeTab === "dashboard" && <DashboardTab />}
      {activeTab === "inquiries" && <InquiriesTab />}
      {activeTab === "payments"  && <PaymentsTab />}
      {activeTab === "approvals" && <ApprovalsTab />}
      {activeTab === "swatches"  && <SwatchesTab />}
    </RolePortalLayout>
  );
};

export default CsrPortalPage;
