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
import OrderStage from "../../features/orderStages/OrderStage";
import GraphicEditing from "../../features/graphicEditing/GraphicEditing";
import ScreenMaking from "../../features/screenMaking/ScreenMaking";
import ScreenChecking from "../../features/screenChecking/ScreenChecking";
import SampleMaterials from "../../features/order/productionSection/SampleMaterials";
import SampleCutting from "../../features/sampleCutting/SampleCutting";
import SamplePrinting from "../../features/samplePrinting/SamplePrinting";
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

  const baseProductionSections = [
    {
      id: "order_stages",
      label: "Order Stages",
      icon: "fa-list-check",
      tab: "production",
    },
    {
      id: "graphic_editing",
      label: "Graphic Editing",
      icon: "fa-pencil-ruler",
      tab: "production",
    },
    {
      id: "screen_making",
      label: "Screen Making",
      icon: "fa-th-large",
      tab: "production",
    },
    {
      id: "screen_checking",
      label: "Screen Checking",
      icon: "fa-eye",
      tab: "production",
    },

    // Sample Production
    {
      id: "sample_material_preparation",
      label: "Sample Material Preparation",
      icon: "fa-boxes",
      tab: "production",
    },
    {
      id: "sample_material_receiving",
      label: "Sample Material Receiving",
      icon: "fa-truck-loading",
      tab: "production",
    },
    {
      id: "sample_cutting",
      label: "Sample Cutting",
      icon: "fa-cut",
      tab: "production",
    },
    {
      id: "sample_printing",
      label: "Sample Printing",
      icon: "fa-print",
      tab: "production",
    },
    {
      id: "sample_sewing",
      label: "Sample Sewing",
      icon: "fa-hand-paper",
      tab: "production",
    },
    {
      id: "sample_quality_assurance",
      label: "Sample QA",
      icon: "fa-check-circle",
      tab: "production",
    },
    {
      id: "sample_approval",
      label: "Sample Approval",
      icon: "fa-thumbs-up",
      tab: "production",
    },

    // Mass Production
    {
      id: "production_material_preparation",
      label: "Mass Material Preparation",
      icon: "fa-boxes",
      tab: "production",
    },
    {
      id: "production_material_receiving",
      label: "Mass Material Receiving",
      icon: "fa-truck-loading",
      tab: "production",
    },
    {
      id: "production_material_cutting",
      label: "Mass Cutting",
      icon: "fa-cut",
      tab: "production",
    },
    {
      id: "production_printing",
      label: "Mass Printing",
      icon: "fa-print",
      tab: "production",
    },
    {
      id: "production_sewing",
      label: "Mass Sewing",
      icon: "fa-hand-paper",
      tab: "production",
    },
    {
      id: "production_revision",
      label: "Mass Revision",
      icon: "fa-edit",
      tab: "production",
    },
    {
      id: "production_quality_assurance",
      label: "Mass QA",
      icon: "fa-check-circle",
      tab: "production",
    },

    // Delivery
    {
      id: "delivery",
      label: "Delivery",
      icon: "fa-truck",
      tab: "production",
    },
  ];

  // Filter production sections based on order stages and user roles
  const productionSections = React.useMemo(() => {
    if (!order || !order.orderStages || order.orderStages.length === 0) {
      // If no order stages data, only show order_stages
      return baseProductionSections.filter(
        (section) =>
          section.id === "order_stages" &&
          hasProductionAccess(userRoles, section.id),
      );
    }

    // Extract stage values from the array of stage objects
    const availableStages = order.orderStages.map((stageObj) => stageObj.stage);

    return baseProductionSections.filter((section) => {
      // Always include order_stages regardless of available stages
      if (section.id === "order_stages") {
        return hasProductionAccess(userRoles, section.id);
      }

      // For other sections, only show if they exist in orderStages and user has access
      return (
        availableStages.includes(section.id) &&
        hasProductionAccess(userRoles, section.id)
      );
    });
  }, [order, userRoles]);

  const visibleSections =
    activeTab === "order" ? orderSections : productionSections;

  const getProductionStatus = (sectionId) => {
    // Special case for order_stages - if there are any stages configured, mark as completed
    if (sectionId === "order_stages") {
      // If there are order stages in the data, mark as completed
      if (order?.orderStages && order.orderStages.length > 0) {
        return "completed";
      }
      return "in-progress";
    }

    // For other sections, use real status data from the API if available
    if (order?.orderStages) {
      const stageObj = order.orderStages.find((s) => s.stage === sectionId);
      if (stageObj) {
        return stageObj.status;
      }
    }

    // Fallback to mock status
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

      if (response.data) {
        if (activeTab === "production") {
          const sectionExists = productionSections.some(
            (section) => section.id === activeSection,
          );
          setActiveSection(sectionExists ? activeSection : "order_stages");
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
    setActiveTab(tab);
    if (tab === "production" && productionSections.length > 0) {
      // Set to first available production section (should be order_stages if nothing else)
      setActiveSection(productionSections[0].id);
    } else {
      setActiveSection("all");
    }
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
          {activeSection === "order_stages" &&
            hasProductionAccess(userRoles, "order_stages") && (
              <OrderStage order={order} onStagesUpdated={fetchOrderDetails} />
            )}

          {activeSection === "graphic_editing" &&
            hasProductionAccess(userRoles, "graphic_editing") && (
              <GraphicEditing order={order} onSuccess={fetchOrderDetails} />
            )}
          {activeSection === "screen_making" &&
            hasProductionAccess(userRoles, "screen_maker") && (
              <ScreenMaking order={order} onSuccess={fetchOrderDetails} />
            )}
          {activeSection === "screen_checking" &&
            hasProductionAccess(userRoles, "screen_checking") && (
              <ScreenChecking order={order} onSuccess={fetchOrderDetails} />
            )}
          {activeSection === "sample_material_preparation" &&
            hasProductionAccess(userRoles, "sample_material_preparation") && (
              <SampleMaterials order={order} />
            )}

          {activeSection === "sample_cutting" &&
            hasProductionAccess(userRoles, "sample_cutting") && (
              <SampleCutting order={order} />
            )}

          {activeSection === "sample_printing" &&
            hasProductionAccess(userRoles, "sample_printing") && (
              <SamplePrinting order={order} />
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
            onClick={() => handleTabChange("order")}
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
            onClick={() => handleTabChange("production")}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-t-lg font-medium text-xs sm:text-sm transition-all flex items-center justify-center sm:justify-start gap-2 ${
              activeTab === "production"
                ? "bg-primary/10 text-primary sm:bg-white sm:border-b-2 border-primary"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <i className="fas fa-cogs"></i>
            <span className="truncate">
              Production Options
              {order.orderStages?.length > 0 && (
                <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                  {order.orderStages.length}
                </span>
              )}
            </span>
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
              {activeTab === "production" &&
                productionSections.length === 0 && (
                  <span className="text-xs text-gray-400">(No stages)</span>
                )}
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

              {visibleSections.length > 0 ? (
                visibleSections.map((section) => (
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
                ))
              ) : (
                <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                  <i className="fas fa-info-circle text-gray-400 text-3xl mb-2"></i>
                  <p className="text-gray-500 text-sm">
                    No production stages available for this order
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
      </div>
    </AdminLayout>
  );
};

export default OrderDetailsPage;
