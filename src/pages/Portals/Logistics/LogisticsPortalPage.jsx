import React, { useState } from "react";
import RolePortalLayout from "../../../layouts/RolePortal/RolePortalLayout";
import SubcontractShipmentsTab from "./tabs/SubcontractShipmentsTab";
import CustomerDeliveryTab from "./tabs/CustomerDeliveryTab";

/**
 * Phase 5-I — Logistics Portal landing.
 *
 * Two tabs:
 *   - Subcontract Shipments (the Logistic_Staff.png workflow)
 *   - Customer Delivery (placeholder for the final delivery stage)
 */
const TABS = [
  { key: "subcontract", label: "Subcontract Shipments", icon: "fa-truck-fast" },
  { key: "delivery",    label: "Customer Delivery",     icon: "fa-box-circle-check" },
];

const LogisticsPortalPage = () => {
  const [activeTab, setActiveTab] = useState("subcontract");

  return (
    <RolePortalLayout
      roleTitle="Logistics Portal"
      breadcrumbLinks={[{ name: "Logistics Portal", path: "/portal/logistics" }]}
      tipText="I-double check ang address ng contact person bago i-dispatch."
    >
      <div className="mb-4 flex gap-1 border-b border-gray-200">
        {TABS.map((t) => {
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={
                "px-4 py-2 text-xs font-semibold inline-flex items-center gap-1.5 border-b-2 transition-colors " +
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

      {activeTab === "subcontract" && <SubcontractShipmentsTab />}
      {activeTab === "delivery"    && <CustomerDeliveryTab />}
    </RolePortalLayout>
  );
};

export default LogisticsPortalPage;
