import React, { useState } from "react";
import RolePortalLayout from "../../../layouts/RolePortal/RolePortalLayout";
import DashboardTab from "./DashboardTab";

/**
 * Phase 6-A — CSR Hub portal landing.
 *
 * Bundle 1 ships ONLY the Dashboard tab; the other tabs render
 * placeholder messages and link the user back to Dashboard. Bundle 2
 * will replace those placeholders with real tab content for:
 *
 *   - Inquiries     (list + create + edit + Convert-to-Quotation action)
 *   - Payments      (list + upload proof + Finance verify modal)
 *   - Approvals     (list + record + respond modals)
 *   - Fabric Swatches (catalog browser — Phase 6-B reads only for Bundle 2)
 */
const TABS = [
  { key: "dashboard", label: "Dashboard",      icon: "fa-chart-line" },
  { key: "inquiries", label: "Inquiries",      icon: "fa-envelope" },
  { key: "payments",  label: "Payments",       icon: "fa-money-check-dollar" },
  { key: "approvals", label: "Approvals",      icon: "fa-hand" },
  { key: "swatches",  label: "Fabric Swatches", icon: "fa-palette" },
];

const Placeholder = ({ label, onBack }) => (
  <div className="bg-white rounded-lg border border-dashed border-gray-300 p-10 text-center">
    <i className="fa-regular fa-clock text-gray-300 text-4xl mb-3" />
    <h3 className="text-sm font-semibold text-gray-700">
      {label} — coming in Bundle 2
    </h3>
    <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
      The {label.toLowerCase()} tab will be available in the next frontend bundle.
      For now, the backend endpoints are live and you can test them via Postman.
    </p>
    <button
      type="button"
      onClick={onBack}
      className="mt-4 text-xs font-semibold text-blue-600 hover:underline"
    >
      ← Back to Dashboard
    </button>
  </div>
);

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
      {activeTab === "inquiries" && <Placeholder label="Inquiries" onBack={() => setActiveTab("dashboard")} />}
      {activeTab === "payments"  && <Placeholder label="Payments"  onBack={() => setActiveTab("dashboard")} />}
      {activeTab === "approvals" && <Placeholder label="Approvals" onBack={() => setActiveTab("dashboard")} />}
      {activeTab === "swatches"  && <Placeholder label="Fabric Swatches" onBack={() => setActiveTab("dashboard")} />}
    </RolePortalLayout>
  );
};

export default CsrPortalPage;
