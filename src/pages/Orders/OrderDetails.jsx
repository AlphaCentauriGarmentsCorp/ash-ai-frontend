import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import { orderApi } from "../../api/orderApi";

const OrderDetailsPage = () => {
  const { po_code } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("all");
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

  const sections = [
    { id: "all", label: "All Information", icon: "fa-info-circle" },
    { id: "client", label: "Client Information", icon: "fa-user" },
    { id: "product", label: "Product Details", icon: "fa-tshirt" },
    { id: "design", label: "Design Files & Mockups", icon: "fa-image" },
    { id: "pricing", label: "Pricing", icon: "fa-tag" },
    { id: "items", label: "PO Items", icon: "fa-boxes" },
  ];

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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₱0.00";
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const parseJsonField = (field) => {
    if (!field) return [];
    try {
      return typeof field === "string" ? JSON.parse(field) : field;
    } catch (e) {
      return [];
    }
  };

  const renderClientInformation = () => (
    <section className="flex-col flex gap-y-3">
      <h1 className="font-semibold text-lg">Client Information</h1>
      <div className="border border-gray-300 p-3 rounded-xl">
        <div className="flex justify-between border-b border-b-gray-100 p-2">
          <p className="text-gray-500 text-sm">PO Code</p>
          <p className="text-sm font-medium">{order?.po_code || "N/A"}</p>
        </div>
        <div className="flex justify-between border-b border-b-gray-100 p-2">
          <p className="text-gray-500 text-sm">Client Name</p>
          <p className="text-sm font-medium">
            {order?.client?.name || order?.client_brand || "N/A"}
          </p>
        </div>
        <div className="flex justify-between border-b border-b-gray-100 p-2">
          <p className="text-gray-500 text-sm">Client Brand</p>
          <p className="text-sm font-medium">{order?.client_brand || "N/A"}</p>
        </div>
        <div className="flex justify-between border-b border-b-gray-100 p-2">
          <p className="text-gray-500 text-sm">Brand</p>
          <p className="text-sm font-medium capitalize">
            {order?.brand || "N/A"}
          </p>
        </div>
        <div className="flex justify-between border-b border-b-gray-100 p-2">
          <p className="text-gray-500 text-sm">Priority</p>
          <p className="text-sm font-medium capitalize">
            {order?.priority || "N/A"}
          </p>
        </div>
        <div className="flex justify-between p-2">
          <p className="text-gray-500 text-sm">Deadline</p>
          <p className="text-sm font-medium">{formatDate(order?.deadline)}</p>
        </div>
      </div>
    </section>
  );

  const renderShippingInformation = () => (
    <section className="flex-col flex gap-y-3 mt-6">
      <h1 className="font-semibold text-lg">Shipping Information</h1>
      <div className="border border-gray-300 p-3 rounded-xl">
        <div className="flex justify-between border-b border-b-gray-100 p-2">
          <p className="text-gray-500 text-sm">Courier</p>
          <p className="text-sm font-medium capitalize">
            {order?.courier || "N/A"}
          </p>
        </div>
        <div className="flex justify-between border-b border-b-gray-100 p-2">
          <p className="text-gray-500 text-sm">Method</p>
          <p className="text-sm font-medium capitalize">
            {order?.method || "N/A"}
          </p>
        </div>
        <div className="flex justify-between border-b border-b-gray-100 p-2">
          <p className="text-gray-500 text-sm">Receiver Name</p>
          <p className="text-sm font-medium">{order?.receiver_name || "N/A"}</p>
        </div>
        <div className="flex justify-between border-b border-b-gray-100 p-2">
          <p className="text-gray-500 text-sm">Receiver Contact</p>
          <p className="text-sm font-medium">
            {order?.receiver_contact || "N/A"}
          </p>
        </div>
        <div className="flex justify-between p-2">
          <p className="text-gray-500 text-sm">Address</p>
          <p className="text-sm font-medium text-right max-w-xs">
            {order?.address || "N/A"}
          </p>
        </div>
      </div>
    </section>
  );

  const renderProductDetails = () => (
    <section className="flex-col flex gap-y-3 mt-6">
      <h1 className="font-semibold text-lg">Product Details</h1>
      <div className="border border-gray-300 p-3 rounded-xl">
        <div className="flex justify-between border-b border-b-gray-100 p-2">
          <p className="text-gray-500 text-sm">Design Name</p>
          <p className="text-sm font-medium">{order?.design_name || "N/A"}</p>
        </div>
        <div className="flex justify-between border-b border-b-gray-100 p-2">
          <p className="text-gray-500 text-sm">Apparel Type</p>
          <p className="text-sm font-medium">{order?.apparel_type || "N/A"}</p>
        </div>
        <div className="flex justify-between border-b border-b-gray-100 p-2">
          <p className="text-gray-500 text-sm">Pattern Type</p>
          <p className="text-sm font-medium">{order?.pattern_type || "N/A"}</p>
        </div>
        <div className="flex justify-between border-b border-b-gray-100 p-2">
          <p className="text-gray-500 text-sm">Service Type</p>
          <p className="text-sm font-medium">{order?.service_type || "N/A"}</p>
        </div>
        <div className="flex justify-between border-b border-b-gray-100 p-2">
          <p className="text-gray-500 text-sm">Print Method</p>
          <p className="text-sm font-medium">{order?.print_method || "N/A"}</p>
        </div>
        <div className="flex justify-between border-b border-b-gray-100 p-2">
          <p className="text-gray-500 text-sm">Print Service</p>
          <p className="text-sm font-medium">{order?.print_service || "N/A"}</p>
        </div>
        <div className="flex justify-between border-b border-b-gray-100 p-2">
          <p className="text-gray-500 text-sm">Size Label</p>
          <p className="text-sm font-medium">{order?.size_label || "N/A"}</p>
        </div>
        <div className="flex justify-between p-2">
          <p className="text-gray-500 text-sm">Print Label Placement</p>
          <p className="text-sm font-medium">
            {order?.print_label_placement || "N/A"}
          </p>
        </div>
      </div>

      <h1 className="font-semibold text-lg mt-4">Fabric Details</h1>
      <div className="border border-gray-300 p-3 rounded-xl">
        <div className="flex justify-between border-b border-b-gray-100 p-2">
          <p className="text-gray-500 text-sm">Fabric Type</p>
          <p className="text-sm font-medium">{order?.fabric_type || "N/A"}</p>
        </div>
        <div className="flex justify-between border-b border-b-gray-100 p-2">
          <p className="text-gray-500 text-sm">Fabric Supplier</p>
          <p className="text-sm font-medium">
            {order?.fabric_supplier || "N/A"}
          </p>
        </div>
        <div className="flex justify-between border-b border-b-gray-100 p-2">
          <p className="text-gray-500 text-sm">Fabric Color</p>
          <p className="text-sm font-medium">{order?.fabric_color || "N/A"}</p>
        </div>
        <div className="flex justify-between border-b border-b-gray-100 p-2">
          <p className="text-gray-500 text-sm">Thread Color</p>
          <p className="text-sm font-medium">{order?.thread_color || "N/A"}</p>
        </div>
        <div className="flex justify-between p-2">
          <p className="text-gray-500 text-sm">Ribbing Color</p>
          <p className="text-sm font-medium">{order?.ribbing_color || "N/A"}</p>
        </div>
      </div>

      {order?.freebie_items && (
        <>
          <h1 className="font-semibold text-lg mt-4">Freebies</h1>
          <div className="border border-gray-300 p-3 rounded-xl">
            <div className="flex justify-between border-b border-b-gray-100 p-2">
              <p className="text-gray-500 text-sm">Freebie Items</p>
              <p className="text-sm font-medium">{order.freebie_items}</p>
            </div>
            <div className="flex justify-between border-b border-b-gray-100 p-2">
              <p className="text-gray-500 text-sm">Freebie Color</p>
              <p className="text-sm font-medium">
                {order.freebie_color || "N/A"}
              </p>
            </div>
            <div className="flex justify-between p-2">
              <p className="text-gray-500 text-sm">Freebie Others</p>
              <p className="text-sm font-medium">
                {order.freebie_others || "N/A"}
              </p>
            </div>
          </div>
        </>
      )}

      {order?.placement_measurements && (
        <div className="mt-4">
          <h1 className="font-semibold text-lg">Placement Measurements</h1>
          <p className="text-sm mt-2 p-3 bg-gray-50 rounded-lg">
            {order.placement_measurements}
          </p>
        </div>
      )}

      {order?.notes && (
        <div className="mt-4">
          <h1 className="font-semibold text-lg">Notes</h1>
          <p className="text-sm mt-2 p-3 bg-gray-50 rounded-lg whitespace-pre-line border-gray-300 border ">
            {order.notes}
          </p>
        </div>
      )}

      {order?.options && (
        <div className="mt-4">
          <h1 className="font-semibold text-lg">Additional Options</h1>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {parseJsonField(order.options).map((option, index) => {
              if (typeof option === "object" && option !== null) {
                return (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    {option.name && (
                      <p className="text-sm font-medium">{option.name}</p>
                    )}
                    {option.color && (
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: option.color }}
                        ></span>
                        <span className="text-xs text-gray-600">
                          {option.color}
                        </span>
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <span
                  key={index}
                  className="px-3 py-2 bg-gray-100 text-sm rounded-lg"
                >
                  {option}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );

  const renderDesignFiles = () => {
    const designFiles = parseJsonField(order?.design_files);
    const designMockup = parseJsonField(order?.design_mockup);
    const sizeLabelFiles = parseJsonField(order?.size_label_files);
    const freebiesFiles = parseJsonField(order?.freebies_files);

    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

    return (
      <section className="flex flex-col gap-y-3 mt-6">
        <h1 className="font-semibold text-lg">Design Files & Mockups</h1>

        {/* Design Files */}
        {designFiles.length > 0 && (
          <div className="border border-gray-300 p-4 rounded-xl">
            <h2 className="font-medium mb-3 flex items-center gap-2">
              <i className="fas fa-file-image text-gray-400"></i>
              Design Files
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {designFiles.map((file, index) => (
                <a
                  key={index}
                  href={`${baseUrl}${file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <i className="fas fa-file-image text-gray-400"></i>
                  <span className="text-sm truncate">
                    {file.split("/").pop()}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Design Mockups */}
        {designMockup.length > 0 && (
          <div className="border border-gray-300 p-4 rounded-xl">
            <h2 className="font-medium mb-3 flex items-center gap-2">
              <i className="fas fa-image text-gray-400"></i>
              Design Mockups
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {designMockup.map((file, index) => (
                <a
                  key={index}
                  href={`${baseUrl}${file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <i className="fas fa-image text-gray-400"></i>
                  <span className="text-sm truncate">
                    {file.split("/").pop()}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Size Label Files */}
        {sizeLabelFiles.length > 0 && (
          <div className="border border-gray-300 p-4 rounded-xl">
            <h2 className="font-medium mb-3 flex items-center gap-2">
              <i className="fas fa-tag text-gray-400"></i>
              Size Label Files
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {sizeLabelFiles.map((file, index) => (
                <a
                  key={index}
                  href={`${baseUrl}${file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <i className="fas fa-tag text-gray-400"></i>
                  <span className="text-sm truncate">
                    {file.split("/").pop()}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Freebies Files */}
        {freebiesFiles.length > 0 && (
          <div className="border border-gray-300 p-4 rounded-xl">
            <h2 className="font-medium mb-3 flex items-center gap-2">
              <i className="fas fa-gift text-gray-400"></i>
              Freebies Files
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {freebiesFiles.map((file, index) => (
                <a
                  key={index}
                  href={`${baseUrl}${file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <i className="fas fa-gift text-gray-400"></i>
                  <span className="text-sm truncate">
                    {file.split("/").pop()}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* QR & Barcode */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {order?.qr_path && (
            <a
              href={`${baseUrl}${order.qr_path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-gray-300 p-4 rounded-xl text-center hover:bg-gray-50 transition-colors"
            >
              <h2 className="font-medium mb-2 flex items-center justify-center gap-2">
                <i className="fas fa-qrcode text-gray-400"></i>
                QR Code
              </h2>
              <img
                src={`${baseUrl}${order.qr_path}`}
                alt="QR Code"
                className="mx-auto w-32 h-32 object-contain"
              />
            </a>
          )}

          {order?.barcode_path && (
            <a
              href={`${baseUrl}${order.barcode_path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-gray-300 p-4 rounded-xl text-center hover:bg-gray-50 transition-colors"
            >
              <h2 className="font-medium mb-2 flex items-center justify-center gap-2">
                <i className="fas fa-barcode text-gray-400"></i>
                Barcode
              </h2>
              <img
                src={`${baseUrl}${order.barcode_path}`}
                alt="Barcode"
                className="mx-auto w-full h-20 object-contain"
              />
            </a>
          )}
        </div>
      </section>
    );
  };

  const renderPricing = () => (
    <section className="flex-col flex gap-y-3 mt-6">
      <h1 className="font-semibold text-lg">Pricing Information</h1>
      <div className="border border-gray-300 p-3 rounded-xl">
        <div className="flex justify-between border-b border-b-gray-100 p-2">
          <p className="text-gray-500 text-sm">Payment Method</p>
          <p className="text-sm font-medium capitalize">
            {order?.payment_method || "N/A"}
          </p>
        </div>
        <div className="flex justify-between border-b border-b-gray-100 p-2">
          <p className="text-gray-500 text-sm">Payment Plan</p>
          <p className="text-sm font-medium capitalize">
            {order?.payment_plan || "N/A"}
          </p>
        </div>
        <div className="flex justify-between border-b border-b-gray-100 p-2">
          <p className="text-gray-500 text-sm">Total Quantity</p>
          <p className="text-sm font-medium">{order?.total_quantity || 0}</p>
        </div>
        <div className="flex justify-between border-b border-b-gray-100 p-2">
          <p className="text-gray-500 text-sm">Average Unit Price</p>
          <p className="text-sm font-medium">
            {formatCurrency(order?.average_unit_price)}
          </p>
        </div>
        <div className="flex justify-between border-b border-b-gray-100 p-2">
          <p className="text-gray-500 text-sm">Total Price</p>
          <p className="text-sm font-medium text-green-600">
            {formatCurrency(order?.total_price)}
          </p>
        </div>
        <div className="flex justify-between p-2">
          <p className="text-gray-500 text-sm">
            Deposit ({order?.deposit || 0}%)
          </p>
          <p className="text-sm font-medium text-blue-600">
            {formatCurrency((order?.total_price * (order?.deposit || 0)) / 100)}
          </p>
        </div>
      </div>
    </section>
  );

  const renderPOItems = () => (
    <section className="flex-col flex gap-y-3 mt-6">
      <h1 className="font-semibold text-lg">PO Items</h1>
      {order?.items && order.items.length > 0 ? (
        <div className="overflow-x-auto border border-gray-300 rounded-xl">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Color
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Codes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.sku}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.color}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex gap-3">
                      {item.qr_path && (
                        <a
                          href={`${baseUrl}${item.qr_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                          title="View QR Code"
                        >
                          <i className="fas fa-qrcode text-lg"></i>
                        </a>
                      )}
                      {item.barcode_path && (
                        <a
                          href={`${baseUrl}${item.barcode_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-500 hover:text-green-700 transition-colors"
                          title="View Barcode"
                        >
                          <i className="fas fa-barcode text-lg"></i>
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4 border border-gray-300 rounded-xl">
          No items found for this order
        </p>
      )}
    </section>
  );

  const renderContent = () => {
    if (!order) return null;

    if (activeSection === "all") {
      return (
        <div className="bg-white rounded-xl p-7 border border-gray-300">
          {renderClientInformation()}
          {renderShippingInformation()}
          {renderProductDetails()}
          {renderDesignFiles()}
          {renderPricing()}
          {renderPOItems()}
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl p-7 border border-gray-300">
        {activeSection === "client" && (
          <>
            {renderClientInformation()}
            {renderShippingInformation()}
          </>
        )}
        {activeSection === "product" && renderProductDetails()}
        {activeSection === "design" && renderDesignFiles()}
        {activeSection === "pricing" && renderPricing()}
        {activeSection === "items" && renderPOItems()}
      </div>
    );
  };

  if (loading) {
    return (
      <AdminLayout
        pageTitle="Order Details"
        path="/orders"
        links={[
          { label: "Home", href: "/" },
          { label: "Orders", href: "/orders" },
        ]}
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </AdminLayout>
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
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
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
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
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
      <div className="bg-light p-3 lg:p-7 rounded-lg border border-gray-300">
        <div className="grid lg:grid-cols-4 grid-cols-1 gap-x-5">
          {/* Togglers Sidebar */}
          <div className="togglers flex flex-col gap-y-3">
            <div className="w-full aspect-square border border-gray-300 rounded-xl overflow-hidden flex flex-col items-center justify-center bg-white text-gray-400 gap-2">
              <i className="fas fa-image text-3xl"></i>
              <span className="text-sm text-center">Mockup will show here</span>
            </div>
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex justify-between items-center rounded-2xl border p-5 transition-all ${
                  activeSection === section.id
                    ? "bg-blue-50 border-primary shadow-sm"
                    : "bg-white border-gray-300 hover:bg-gray-50"
                }`}
              >
                <span className="font-semibold text-sm flex items-center gap-2">
                  <i
                    className={`fas ${section.icon} ${
                      activeSection === section.id
                        ? "text-primary/90"
                        : "text-gray-500"
                    }`}
                  ></i>
                  {section.label}
                </span>
                <i
                  className={`fas fa-chevron-right text-lg transition-transform duration-300 ease-in-out ${
                    activeSection === section.id
                      ? "text-primary/90 rotate-90"
                      : "text-gray-300 rotate-0"
                  }`}
                ></i>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="content col-span-3">{renderContent()}</div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default OrderDetailsPage;
