import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import { orderApi } from "../../api/orderApi";
import {
  SECTION_ACCESS,
  hasSectionAccess,
  hasWorkPageAccess,
} from "../../utils/roleAccess";
import { getStatusMeta } from "../../constants/formOptions/orderStages";
import { hasRequiredPermissions } from "../../utils/authz";
import RoleProtected from "../../features/order/orderDetails/RoleProtected";
import ClientInformation from "../../features/order/orderDetails/ClientInformation";
import ShippingInformation from "../../features/order/orderDetails/ShippingInformation";
import ProductDetails from "../../features/order/orderDetails/ProductDetails";
import DesignFiles from "../../features/order/orderDetails/DesignFiles";
import Pricing from "../../features/order/orderDetails/Pricing";
import ActivityLog from "../../features/order/orderDetails/ActivityLog";
import MockupCarousel from "../../features/order/orderDetails/MockupCarousel";
import { useAuth } from "../../hooks/useAuth";
import Loader from "../../components/common/Loader";

import OrderStage from "../../features/orderStages/OrderStage";
import ReviewHub from "../../features/order/reviewHub/ReviewHub";


/**
 * OrderDetailsPage
 *
 * Two tabs:
 *  - Order Information: client, shipping, product, design, pricing, items, logs
 *  - Production: a single "Workflow" section (the 16-stage timeline) plus
 *    role-specific work pages the user has access to (graphic editing,
 *    screen making, sample/mass cutting/printing/sewing, packing, …).
 *
 * The 16-stage workflow is auto-created on the backend when the order is
 * stored, so the user never has to "select stages" any more.
 */
const OrderDetailsPage = () => {
  const { po_code } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("all");
  const [activeTab, setActiveTab] = useState("order");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const userRoles = user?.domain_role || [];

  // ---- Tab 1: Order Information sections ----
  const orderSections = [
    { id: "all", label: "All Information", icon: "fa-info-circle", tab: "order" },
    { id: "client", label: "Client Information", icon: "fa-user", tab: "order" },
    { id: "shipping", label: "Shipping Information", icon: "fa-truck", tab: "order" },
    { id: "product", label: "Product Details", icon: "fa-tshirt", tab: "order" },
    { id: "design", label: "Design Files & Mockups", icon: "fa-image", tab: "order" },
    { id: "pricing", label: "Pricing Summary", icon: "fa-tag", tab: "order" },
  ].filter(
    (section) =>
      section.id === "all" || hasSectionAccess(userRoles, section.id),
  );

  // ---- Tab 2: Production sections ----
  // Always start with the unified Workflow timeline, then append the
  // role-specific work pages the user has access to.
  const productionSections = React.useMemo(() => {
    const sections = [];

    if (hasWorkPageAccess(userRoles, "workflow")) {
      sections.push({
        id: "workflow",
        label: "Workflow Timeline",
        icon: "fa-list-check",
      });
    }

    // CSR Review Hub — read + approve/reject each stage's output. Visible to
    // reviewers (CSR / Super Admin / Admin) via access.production-review.
    if (hasRequiredPermissions(user, ["access.production-review"], "any")) {
      sections.push({
        id: "review_hub",
        label: "Review Hub",
        icon: "fa-clipboard-check",
      });
    }


    return sections;
  }, [userRoles, user]);

  const visibleSections =
    activeTab === "order" ? orderSections : productionSections;

  // ---- Status helpers (read from order.orderStages, never mocked) ----
  const getProductionStatus = (sectionId) => {
    if (!order?.orderStages) return "pending";

    if (sectionId === "workflow") {
      // Workflow is "completed" once every stage is completed.
      const allDone =
        order.orderStages.length > 0 &&
        order.orderStages.every((s) => s.status === "completed");
      if (allDone) return "completed";
      const anyDelayed = order.orderStages.some((s) => s.status === "delayed");
      if (anyDelayed) return "delayed";
      const anyInProgress = order.orderStages.some(
        (s) => s.status === "in_progress" || s.status === "for_approval",
      );
      return anyInProgress ? "in_progress" : "pending";
    }

    // The Review Hub mirrors the overall workflow progress for its badge.
    if (sectionId === "review_hub") {
      const allDone =
        order.orderStages.length > 0 &&
        order.orderStages.every((s) => s.status === "completed");
      if (allDone) return "completed";
      const anyInProgress = order.orderStages.some(
        (s) => s.status === "in_progress" || s.status === "for_approval",
      );
      return anyInProgress ? "in_progress" : "pending";
    }


    return "pending";
  };

  const getStatusBadge = (status) => {
    const meta = getStatusMeta(status);
    return `${meta.bg} ${meta.text} border ${meta.border}`;
  };

  const getStatusIcon = (status) => {
    const meta = getStatusMeta(status);
    return meta.icon;
  };

  const getStatusLabel = (status) => {
    return getStatusMeta(status).label;
  };

  // ---- Data fetch ----
  useEffect(() => {
    if (po_code) {
      fetchOrderDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [po_code]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getOrder(po_code);
      setOrder(response.data);

      if (response.data) {
        if (activeTab === "production") {
          const sectionExists = productionSections.some(
            (section) => section.id === activeSection,
          );
          setActiveSection(sectionExists ? activeSection : "workflow");
        } else {
          setActiveSection(activeSection);
        }
      }
    } catch (err) {
      setError(err.message || "Failed to fetch order details");
    } finally {
      setLoading(false);
    }
  };

  const handleSectionSelect = (sectionId) => {
    setActiveSection(sectionId);
    setIsSidebarOpen(false);
  };

  const handleTabChange = (tab) => {
    // Production is locked while the order is Incomplete (Change 11 gate) —
    // there should be no active production until the order is completed.
    if (tab === "production" && order?.is_incomplete) {
      return;
    }
    setActiveTab(tab);
    if (tab === "production" && productionSections.length > 0) {
      setActiveSection(productionSections[0].id);
    } else if (tab === "activity_log") {
      // Activity Log is a full-width view with no sidebar sections.
      setActiveSection("activity_log");
    } else {
      setActiveSection("all");
    }
    setIsSidebarOpen(false);
  };

  // ---- Render content body ----
  const renderContent = () => {
    if (!order) return null;

    if (activeTab === "order") {
      if (activeSection === "all") {
        return (
          <div className="bg-white rounded-lg lg:rounded-xl p-4 sm:p-5 lg:p-7 border border-gray-200 lg:border-gray-300 flex flex-col gap-y-4 sm:gap-y-5">
            <RoleProtected
              userRoles={userRoles}
              requiredRoles={SECTION_ACCESS.client}
            >
              <ClientInformation order={order} />
            </RoleProtected>

            <RoleProtected
              userRoles={userRoles}
              requiredRoles={SECTION_ACCESS.shipping}
            >
              <ShippingInformation order={order} />
            </RoleProtected>

            <RoleProtected
              userRoles={userRoles}
              requiredRoles={SECTION_ACCESS.product}
            >
              <ProductDetails order={order} />
            </RoleProtected>

            <RoleProtected
              userRoles={userRoles}
              requiredRoles={SECTION_ACCESS.design}
            >
              <DesignFiles order={order} />
            </RoleProtected>

            <RoleProtected
              userRoles={userRoles}
              requiredRoles={SECTION_ACCESS.pricing}
            >
              <Pricing order={order} />
            </RoleProtected>

          </div>
        );
      }

      return (
        <div className="bg-white rounded-lg lg:rounded-xl p-4 sm:p-5 lg:p-7 border border-gray-200 lg:border-gray-300 flex flex-col gap-y-4 sm:gap-y-5">
          {activeSection === "client" &&
            hasSectionAccess(userRoles, "client") && (
              <ClientInformation order={order} />
            )}
          {activeSection === "shipping" &&
            hasSectionAccess(userRoles, "shipping") && (
              <ShippingInformation order={order} />
            )}
          {activeSection === "product" &&
            hasSectionAccess(userRoles, "product") && (
              <ProductDetails order={order} />
            )}
          {activeSection === "design" &&
            hasSectionAccess(userRoles, "design") && (
              <DesignFiles order={order} />
            )}
          {activeSection === "pricing" &&
            hasSectionAccess(userRoles, "pricing") && <Pricing order={order} />}
        </div>
      );
    }

    // ---- Production tab ----
    return (
      <div className="bg-white rounded-lg lg:rounded-xl p-4 sm:p-5 lg:p-7 border border-gray-200 lg:border-gray-300 flex flex-col gap-y-4 sm:gap-y-5">
        {activeSection === "workflow" &&
          hasWorkPageAccess(userRoles, "workflow") && (
            <OrderStage order={order} onStagesUpdated={fetchOrderDetails} />
          )}

        {activeSection === "review_hub" &&
          hasRequiredPermissions(user, ["access.production-review"], "any") && (
            <ReviewHub order={order} onChanged={fetchOrderDetails} />
          )}

      </div>
    );
  };

  // ---- Activity Log tab (Phase 4) — full-width, no sidebar ----
  const renderActivityLogTab = () => {
    if (!order) return null;
    return (
      <div className="bg-white rounded-lg lg:rounded-xl p-4 sm:p-5 lg:p-7 border border-gray-200 lg:border-gray-300">
        <ActivityLog order={order} />
      </div>
    );
  };

  // ---- Loading / error / not-found ----
  if (loading) {
    return (
      <Loader
        pageTitle="Order Details"
        path="/orders"
        links={[
          { label: "Home", href: "/" },
          { label: "Orders", href: "/orders" },
        ]}
      />
    );
  }

  if (error) {
    return (
      <AdminLayout
        pageTitle="Order Details"
        path="/orders"
        links={[
          { label: "Home", href: "/" },
          { label: "Orders", href: "/orders" },
        ]}
      >
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm sm:text-base">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout
        pageTitle="Order Details"
        path="/orders"
        links={[
          { label: "Home", href: "/" },
          { label: "Orders", href: "/orders" },
        ]}
      >
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg text-sm sm:text-base">
          <span className="block sm:inline">Order not found</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      pageTitle={`Order Details - ${order.po_code}`}
      path="/orders"
      links={[
        { label: "Home", href: "/" },
        { label: "Orders", href: "/orders" },
        { label: order.po_code, href: "#" },
      ]}
    >
      <div className="bg-light p-3 sm:p-4 lg:p-7 rounded-lg border border-gray-200 lg:border-gray-300">
        {/* Incomplete-order notice (Change 11) */}
        {order.is_incomplete && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <i className="fas fa-triangle-exclamation text-amber-600 mt-0.5"></i>
            <div className="text-sm text-amber-800">
              <span className="font-semibold">This order is marked Incomplete.</span>
              {Array.isArray(order.incomplete_fields) &&
                order.incomplete_fields.length > 0 && (
                  <> Missing: {order.incomplete_fields.join(", ")}.</>
                )}
            </div>
          </div>
        )}


        {/* Tab Navigation */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-1 mb-4 sm:mb-5 border-b border-gray-200 pb-2">
          <button
            onClick={() => handleTabChange("order")}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-t-lg font-medium text-xs sm:text-sm transition-all flex items-center justify-center sm:justify-start gap-2 ${activeTab === "order"
                ? "bg-primary/10 text-primary sm:bg-white sm:border-b-2 border-primary"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
          >
            <i className="fas fa-shopping-bag"></i>
            <span className="truncate">Order Information</span>
          </button>

          <button
            onClick={() => handleTabChange("production")}
            disabled={order.is_incomplete}
            title={
              order.is_incomplete
                ? "Complete the order to enable production"
                : undefined
            }
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-t-lg font-medium text-xs sm:text-sm transition-all flex items-center justify-center sm:justify-start gap-2 ${
              order.is_incomplete
                ? "text-gray-300 cursor-not-allowed"
                : activeTab === "production"
                  ? "bg-primary/10 text-primary sm:bg-white sm:border-b-2 border-primary"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <i className={`fas ${order.is_incomplete ? "fa-lock" : "fa-cogs"}`}></i>
            <span className="truncate">
              Production
              {!order.is_incomplete && order.orderStages?.length > 0 && (
                <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                  {
                    order.orderStages.filter((s) => s.status === "completed")
                      .length
                  }
                  /{order.orderStages.length}
                </span>
              )}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("activity_log")}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-t-lg font-medium text-xs sm:text-sm transition-all flex items-center justify-center sm:justify-start gap-2 ${activeTab === "activity_log"
                ? "bg-primary/10 text-primary sm:bg-white sm:border-b-2 border-primary"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
          >
            <i className="fas fa-clock-rotate-left"></i>
            <span className="truncate">Activity Log</span>
          </button>
        </div>

        {/* Mockup Carousel - Mobile (Above Sidebar Toggle) */}
        {activeTab === "order" && (
          <div className="lg:hidden mb-3">
            <MockupCarousel order={order} />
          </div>
        )}

        {/* Mobile Sidebar Toggle */}
        {activeTab !== "activity_log" && (
          <div className="lg:hidden mb-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
            >
              <span className="font-medium text-sm flex items-center gap-2">
                <i className="fas fa-bars text-gray-500"></i>
                {activeTab === "order"
                  ? "Order Sections"
                  : "Production Sections"}
                {activeTab === "production" &&
                  productionSections.length === 0 && (
                    <span className="text-xs text-gray-400">(No access)</span>
                  )}
              </span>
              <i
                className={`fas fa-chevron-${isSidebarOpen ? "up" : "down"} text-gray-400`}
              ></i>
            </button>
          </div>
        )}

        {activeTab === "activity_log" ? (
          // Activity Log tab — full-width, no sidebar.
          <div>{renderActivityLogTab()}</div>
        ) : (
          <div className="grid lg:grid-cols-4 grid-cols-1 gap-4 lg:gap-x-5 relative">
            {/* Sidebar */}
            <div
              className={`
              lg:sticky lg:top-7 lg:self-start
              ${isSidebarOpen ? "block" : "hidden lg:block"}
              transition-all duration-300
            `}
            >
              <div className="togglers flex flex-col gap-y-2 sm:gap-y-3">
                {activeTab === "order" && (
                  <div className="hidden lg:block mb-2">
                    <MockupCarousel order={order} />
                  </div>
                )}

                {visibleSections.length > 0 ? (
                  visibleSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => handleSectionSelect(section.id)}
                      className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 rounded-xl lg:rounded-2xl border p-3 sm:p-4 lg:p-5 transition-all ${activeSection === section.id
                          ? "bg-blue-50 border-primary shadow-sm"
                          : "bg-white border-gray-200 lg:border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                      <span className="font-semibold text-xs sm:text-sm flex items-center gap-2">
                        <i
                          className={`fas ${section.icon} ${activeSection === section.id
                              ? "text-primary/90"
                              : "text-gray-500"
                            }`}
                        ></i>
                        <span className="text-left">{section.label}</span>
                      </span>

                      <span className="flex items-center gap-x-2 w-full sm:w-auto justify-between sm:justify-end">
                        {activeTab === "production" && (
                          <span
                            className={`text-[10px] sm:text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getStatusBadge(getProductionStatus(section.id))}`}
                          >
                            <i
                              className={`fas ${getStatusIcon(getProductionStatus(section.id))}`}
                            ></i>
                            <span className="hidden xs:inline capitalize">
                              {getStatusLabel(getProductionStatus(section.id))}
                            </span>
                          </span>
                        )}

                        <i
                          className={`fas fa-chevron-right text-base sm:text-lg transition-transform duration-300 ease-in-out ${activeSection === section.id
                              ? "text-primary/90 rotate-90 lg:rotate-90"
                              : "text-gray-300 rotate-0"
                            }`}
                        ></i>
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                    <i className="fas fa-info-circle text-gray-400 text-3xl mb-2"></i>
                    <p className="text-gray-500 text-sm">
                      No production sections available for your role
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="content lg:col-span-3 lg:pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {renderContent()}
            </div>
          </div>
        )}
      </div>

    </AdminLayout>
  );
};

export default OrderDetailsPage;