import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import { orderApi } from "../../api/orderApi";
import {
  SECTION_ACCESS,
  PRODUCTION_ACCESS,
  hasSectionAccess,
  hasProductionAccess,
} from "../../utils/roleAccess";
import RoleProtected from "../../features/order/orderDetails/RoleProtected";
import ClientInformation from "../../features/order/orderDetails/ClientInformation";
import ShippingInformation from "../../features/order/orderDetails/ShippingInformation";
import ProductDetails from "../../features/order/orderDetails/ProductDetails";
import DesignFiles from "../../features/order/orderDetails/DesignFiles";
import Pricing from "../../features/order/orderDetails/Pricing";
import POItems from "../../features/order/orderDetails/POItems";
import Logs from "../../features/order/orderDetails/Logs";
import MockupCarousel from "../../features/order/OrderDetails/MockupCarousel";
import { useAuth } from "../../hooks/useAuth";

import Cutting from "../../features/order/productionSection/Cutting";
import Sewing from "../../features/order/productionSection/Sewing";
import OrderVerification from "../../features/order/productionSection/OrderVerification";

import Loader from "../../components/common/Loader";

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

  const orderSections = [
    {
      id: "all",
      label: "All Information",
      icon: "fa-info-circle",
      tab: "order",
    },
    {
      id: "client",
      label: "Client Information",
      icon: "fa-user",
      tab: "order",
    },
    {
      id: "shipping",
      label: "Shipping Information",
      icon: "fa-truck",
      tab: "order",
    },
    {
      id: "product",
      label: "Product Details",
      icon: "fa-tshirt",
      tab: "order",
    },
    {
      id: "design",
      label: "Design Files & Mockups",
      icon: "fa-image",
      tab: "order",
    },
    { id: "pricing", label: "Pricing", icon: "fa-tag", tab: "order" },
    { id: "items", label: "PO Items", icon: "fa-boxes", tab: "order" },
    {
      id: "logs",
      label: "Activity Logs",
      icon: "fa-history",
      tab: "production",
    },
  ].filter(
    (section) =>
      section.id === "all" || hasSectionAccess(userRoles, section.id),
  );

  const productionSections = [
    {
      id: "order-verification",
      label: "Order Verification",
      icon: "fa-clipboard-check",
      tab: "production",
    },
    { id: "cutting", label: "Cutting", icon: "fa-cut", tab: "production" },
    { id: "sewing", label: "Sewing", icon: "fa-stitch", tab: "production" },
  ].filter((section) => hasProductionAccess(userRoles, section.id));

  const visibleSections =
    activeTab === "order" ? orderSections : productionSections;

  const getProductionStatus = (sectionId) => {
    const mockStatus = {
      "cutting": "in-progress",
      "printing": "pending",
      "sewing": "completed",
      "embroidery": "pending",
      "quality": "in-progress",
      "packing": "pending",
      "shipping": "pending",
      "screen-making": "completed",
      "sample-making": "in-progress",
      "subcontract": "pending",
    };
    return mockStatus[sectionId] || "pending";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50";
      case "in-progress":
        return "text-yellow-600 bg-yellow-50";
      case "pending":
        return "text-gray-500 bg-gray-50";
      default:
        return "text-gray-500 bg-gray-50";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return "fa-check-circle";
      case "in-progress":
        return "fa-spinner fa-pulse";
      case "pending":
        return "fa-clock";
      default:
        return "fa-clock";
    }
  };

  useEffect(() => {
    if (po_code) {
      fetchOrderDetails();
    }
  }, [po_code]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getOrder(po_code);
      setOrder(response.data);
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

            <RoleProtected
              userRoles={userRoles}
              requiredRoles={SECTION_ACCESS.items}
            >
              <POItems order={order} />
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
          {activeSection === "items" &&
            hasSectionAccess(userRoles, "items") && <POItems order={order} />}

          {activeSection === "logs" &&
            hasProductionAccess(userRoles, "logs") && <Logs order={order} />}
        </div>
      );
    } else {
      return (
        <div className="bg-white rounded-lg lg:rounded-xl p-4 sm:p-5 lg:p-7 border border-gray-200 lg:border-gray-300 flex flex-col gap-y-4 sm:gap-y-5">
          {activeSection === "order-verification" &&
            hasProductionAccess(userRoles, "order-verification") && (
              <OrderVerification order={order} />
            )}

          {activeSection === "cutting" &&
            hasProductionAccess(userRoles, "cutting") && (
              <Cutting order={order} />
            )}

          {activeSection === "sewing" &&
            hasProductionAccess(userRoles, "sewing") && (
              <Sewing order={order} />
            )}
        </div>
      );
    }
  };

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
        {/* Tab Navigation */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-1 mb-4 sm:mb-5 border-b border-gray-200 pb-2">
          <button
            onClick={() => {
              setActiveTab("order");
              setActiveSection("all");
              setIsSidebarOpen(false);
            }}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-t-lg font-medium text-xs sm:text-sm transition-all flex items-center justify-center sm:justify-start gap-2 ${
              activeTab === "order"
                ? "bg-primary/10 text-primary sm:bg-white sm:border-b-2 border-primary"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <i className="fas fa-shopping-bag"></i>
            <span className="truncate">Order Information</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("production");
              setActiveSection(productionSections[0]?.id || "cutting");
              setIsSidebarOpen(false);
            }}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-t-lg font-medium text-xs sm:text-sm transition-all flex items-center justify-center sm:justify-start gap-2 ${
              activeTab === "production"
                ? "bg-primary/10 text-primary sm:bg-white sm:border-b-2 border-primary"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <i className="fas fa-cogs"></i>
            <span className="truncate">Production Options</span>
          </button>
        </div>

        {/* Mockup Carousel - Mobile (Above Sidebar Toggle) */}
        {activeTab === "order" && (
          <div className="lg:hidden mb-3">
            <MockupCarousel order={order} />
          </div>
        )}

        {/* Mobile Sidebar Toggle (Below Mockup) */}
        <div className="lg:hidden mb-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
          >
            <span className="font-medium text-sm flex items-center gap-2">
              <i className="fas fa-bars text-gray-500"></i>
              {activeTab === "order" ? "Order Sections" : "Production Sections"}
            </span>
            <i
              className={`fas fa-chevron-${isSidebarOpen ? "up" : "down"} text-gray-400`}
            ></i>
          </button>
        </div>

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
              {/* Mockup Carousel - Desktop (Inside Sidebar) */}
              {activeTab === "order" && (
                <div className="hidden lg:block mb-2">
                  <MockupCarousel order={order} />
                </div>
              )}

              {visibleSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleSectionSelect(section.id)}
                  className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 rounded-xl lg:rounded-2xl border p-3 sm:p-4 lg:p-5 transition-all ${
                    activeSection === section.id
                      ? "bg-blue-50 border-primary shadow-sm"
                      : "bg-white border-gray-200 lg:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span className="font-semibold text-xs sm:text-sm flex items-center gap-2">
                    <i
                      className={`fas ${section.icon} ${
                        activeSection === section.id
                          ? "text-primary/90"
                          : "text-gray-500"
                      }`}
                    ></i>
                    <span className="text-left">{section.label}</span>
                  </span>

                  <span className="flex items-center gap-x-2 w-full sm:w-auto justify-between sm:justify-end">
                    {activeTab === "production" && (
                      <span
                        className={`text-[10px] sm:text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getStatusColor(getProductionStatus(section.id))}`}
                      >
                        <i
                          className={`fas ${getStatusIcon(getProductionStatus(section.id))}`}
                        ></i>
                        <span className="hidden xs:inline capitalize">
                          {getProductionStatus(section.id).replace("-", " ")}
                        </span>
                      </span>
                    )}

                    <i
                      className={`fas fa-chevron-right text-base sm:text-lg transition-transform duration-300 ease-in-out ${
                        activeSection === section.id
                          ? "text-primary/90 rotate-90 lg:rotate-90"
                          : "text-gray-300 rotate-0"
                      }`}
                    ></i>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="content lg:col-span-3 lg:max-h-[120vh] lg:overflow-y-auto lg:pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {renderContent()}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default OrderDetailsPage;
