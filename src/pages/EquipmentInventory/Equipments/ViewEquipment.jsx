import React, { useState, useEffect } from "react";
import AdminLayout from "../../../layouts/Admin/AdminLayout";
import Input from "../../../components/form/Input";
import Textarea from "../../../components/form/Textarea";
import { equipmentInventoryApi } from "../../../api/equipmentInventoryApi";
import { useParams, Link } from "react-router-dom";
import Table from "../../../components/table/Table";
import Loader from "../../../components/common/Loader";

export default function ViewEquipment() {
  const { id } = useParams();
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("details");
  const BaseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchEquipmentDetails();
  }, [id]);

  const fetchEquipmentDetails = async () => {
    try {
      setLoading(true);
      const response = await equipmentInventoryApi.show(id);
      setEquipment(response.data);
      setError("");
    } catch (err) {
      setError("Failed to load equipment details");
      console.error("Error fetching equipment:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (!value) return "—";
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      available: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: "fa-circle-check",
        label: "Available",
      },
      in_use: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        icon: "fa-clock",
        label: "In Use",
      },
      missing: {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: "fa-circle-exclamation",
        label: "Missing",
      },
      maintenance: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: "fa-tools",
        label: "Maintenance",
      },
      reserved: {
        bg: "bg-purple-100",
        text: "text-purple-800",
        icon: "fa-calendar-check",
        label: "Reserved",
      },
    };

    const config = statusConfig[status] || statusConfig.available;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        <i className={`fa-solid ${config.icon} mr-1`}></i>
        {config.label}
      </span>
    );
  };

  const columns = [
    {
      key: "user",
      label: "Name",
      sortable: true,
    },
    {
      key: "borrow_date",
      label: "Borrowed date",
      sortable: true,
      render: (item) => {
        const date = new Date(item.borrow_date);

        const formattedDate = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        const formattedTime = date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });

        return (
          <div className="flex flex-col">
            <span className="whitespace-nowrap">{formattedDate}</span>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {formattedTime}
            </span>
          </div>
        );
      },
    },
    {
      key: "quantity",
      label: "Qty",
      sortable: false,
      position: "center",
      render: (item) => (
        <span className="px-2 py-1 bg-gray-100 rounded-lg text-sm">
          {item.quantity}
        </span>
      ),
    },
    {
      key: "return_date",
      label: "Return date",
      sortable: true,
      render: (item) => {
        if (!item.return_date) {
          return (
            <span className="text-gray-400 italic text-sm">Not returned</span>
          );
        }

        const date = new Date(item.return_date);

        const formattedDate = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        const formattedTime = date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });

        return (
          <div className="flex flex-col">
            <span className="whitespace-nowrap">{formattedDate}</span>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {formattedTime}
            </span>
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      position: "center",
      render: (item) => {
        let bgColor = "bg-gray-200";

        switch (item.status?.toLowerCase()) {
          case "completed":
            bgColor = "bg-green-100 text-green-800";
            break;
          case "in use":
            bgColor = "bg-yellow-100 text-yellow-800";
            break;
          case "missing":
            bgColor = "bg-red-100 text-red-800";
            break;
          default:
            bgColor = "bg-gray-100 text-gray-700";
        }

        return (
          <span
            className={`${bgColor} px-2.5 py-1 rounded-full text-xs font-medium capitalize whitespace-nowrap`}
          >
            {item.status}
          </span>
        );
      },
    },
  ];

  const handleAction = (action, rowData) => {
    switch (action) {
      case "edit":
        navigate(`/admin/settings/size-label/edit/${rowData.id}`);
        break;
      case "delete":
        handleDeleteClick(rowData);
        break;
    }
  };

  const tableConfig = {
    sortable: true,
    pagination: true,
    search: true,
    filters: false,
    actions: ["edit"],
    pageSize: 10,
    emptyMessage: "No activity logs found",
    searchPlaceholder: "Search logs...",
    showIndex: true,
    // Responsive table settings
    scrollable: true,
    minWidth: "650px",
  };

  const activityLogs = [
    {
      id: 1,
      user: "John Doe",
      borrow_date: "2026-03-05 15:08:56",
      quantity: "2",
      return_date: "2026-03-05 15:08:56",
      status: "Completed",
    },
    {
      id: 2,
      user: "Jane Smith",
      borrow_date: "2026-03-06 00:13:47",
      quantity: "2",
      return_date: "2026-03-05 15:08:56",
      status: "Completed",
    },
    {
      id: 3,
      user: "Mike Johnson",
      borrow_date: "2026-03-05 15:08:56",
      quantity: "2",
      return_date: "2026-03-05 15:08:56",
      status: "Completed",
    },
    {
      id: 4,
      user: "Sarah Wilson",
      borrow_date: "2026-03-05 15:08:56",
      quantity: "2",
      return_date: null,
      status: "In use",
    },
    {
      id: 5,
      user: "Admin",
      borrow_date: "2026-03-05 15:08:56",
      quantity: "2",
      return_date: null,
      status: "Missing",
    },
  ];

  if (loading) {
    return (
      <Loader
        icon="fa-cube"
        pageTitle="Equipment Details"
        path="/"
        links={[
          { label: "Home", href: "/" },
          { label: "Equipment Inventory", href: "/equipment-inventory" },
          { label: "Details", href: "#" },
        ]}
      />
    );
  }

  if (error || !equipment) {
    return (
      <AdminLayout
        icon="fa-cube"
        pageTitle="Equipment Details"
        path="/"
        links={[
          { label: "Home", href: "/" },
          { label: "Equipment Inventory", href: "/equipment-inventory" },
          { label: "Details", href: "#" },
        ]}
      >
        <div className="bg-light p-4 sm:p-7 rounded-lg border border-gray-300">
          <div className="text-center py-8 sm:py-12">
            <i className="fa-solid fa-exclamation-circle text-4xl sm:text-5xl text-red-500 mb-4"></i>
            <p className="text-gray-700 mb-4 text-sm sm:text-base">
              {error || "Equipment not found"}
            </p>
            <Link
              to="/equipment-inventory"
              className="px-4 sm:px-6 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors inline-flex items-center text-sm sm:text-base"
            >
              <i className="fa-solid fa-arrow-left mr-2"></i>
              Back to Inventory
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      pageTitle="Equipment Details"
      path="/"
      links={[
        { label: "Home", href: "/" },
        { label: "Equipment Inventory", href: "/equipment-inventory" },
        { label: equipment.name || "Equipment", href: "#" },
      ]}
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Header with actions */}
        <div className="bg-light p-4 sm:p-6 rounded-lg border border-gray-300">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              {/* Equipment Image */}
              {equipment.image ? (
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                  <img
                    src={`${BaseUrl}${equipment.image}`}
                    alt={equipment.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-secondary/10 rounded-lg flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-cube text-secondary text-xl sm:text-2xl"></i>
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-primary truncate">
                    {equipment.name}
                  </h1>
                  <span className="shrink-0">
                    {getStatusBadge(equipment.status || "available")}
                  </span>
                </div>
                <p className="text-gray-500 text-xs sm:text-sm truncate">
                  <span className="hidden xs:inline">Equipment ID:</span>{" "}
                  {equipment.sku} •
                  <span className="hidden xs:inline"> Added on</span>{" "}
                  {new Date(equipment.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <Link
                to={`/equipment-inventory/equipment/${equipment.id}/edit`}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors flex items-center justify-center text-sm sm:text-base"
              >
                <i className="fa-solid fa-pen mr-1 sm:mr-2"></i>
                <span className="sm:inline">Edit</span>
              </Link>
              <Link
                to="/equipment-inventory"
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center text-sm sm:text-base"
              >
                <i className="fa-solid fa-arrow-left mr-1 sm:mr-2"></i>
                <span className="sm:inline">Back</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Statistics Cards - Responsive grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          <div className="bg-light p-3 sm:p-4 rounded-lg border border-gray-300">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Total</span>
              <i className="fa-solid fa-cubes text-gray-400 text-sm sm:text-base"></i>
            </div>
            <p className="text-lg sm:text-xl font-semibold text-primary mt-1">
              {equipment.quantity}
            </p>
          </div>
          <div className="bg-light p-3 sm:p-4 rounded-lg border border-gray-300">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Available</span>
              <i className="fa-solid fa-circle-check text-green-500 text-sm sm:text-base"></i>
            </div>
            <p className="text-lg sm:text-xl font-semibold text-green-600 mt-1">
              {equipment.quantity - equipment.in_use - equipment.missing}
            </p>
          </div>
          <div className="bg-light p-3 sm:p-4 rounded-lg border border-gray-300">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">In Use</span>
              <i className="fa-solid fa-clock text-blue-500 text-sm sm:text-base"></i>
            </div>
            <p className="text-lg sm:text-xl font-semibold text-blue-600 mt-1">
              {equipment.in_use}
            </p>
          </div>
          <div className="bg-light p-3 sm:p-4 rounded-lg border border-gray-300">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Missing</span>
              <i className="fa-solid fa-circle-exclamation text-red-500 text-sm sm:text-base"></i>
            </div>
            <p className="text-lg sm:text-xl font-semibold text-red-600 mt-1">
              {equipment.missing}
            </p>
          </div>
        </div>

        {/* Tabs - Responsive navigation */}
        <div className="border-b border-gray-300 overflow-x-auto">
          <nav className="flex gap-2 sm:gap-4 min-w-max sm:min-w-0 px-1">
            <button
              onClick={() => setActiveTab("details")}
              className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "details"
                  ? "border-secondary text-secondary"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <i className="fa-solid fa-info-circle mr-1 sm:mr-2"></i>
              <span>Details</span>
            </button>
            <button
              onClick={() => setActiveTab("media")}
              className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "media"
                  ? "border-secondary text-secondary"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <i className="fa-solid fa-image mr-1 sm:mr-2"></i>
              <span>Media</span>
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "logs"
                  ? "border-secondary text-secondary"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <i className="fa-solid fa-clock-rotate-left mr-1 sm:mr-2"></i>
              <span>Activity</span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "details" && (
          <div className="bg-light p-4 sm:p-6 lg:p-7 rounded-lg border border-gray-300">
            <h2 className="font-semibold text-lg sm:text-xl border-b text-primary border-gray-300 pb-1 mb-4">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-7 p-2 sm:p-4">
              <Input
                label="Item Name"
                name="name"
                value={equipment.name || "—"}
                type="text"
                readOnly
                className="text-sm sm:text-base"
              />

              <Input
                label="Location"
                name="location"
                value={equipment.location?.name ?? "—"}
                type="text"
                readOnly
                icon={
                  <i
                    className={`fas ${equipment.location?.icon ?? "fa-box"}`}
                  ></i>
                }
                className="text-sm sm:text-base"
              />

              <Input
                label="Quantity"
                name="quantity"
                value={equipment.quantity || "0"}
                type="text"
                readOnly
                className="text-sm sm:text-base"
              />

              <div className="flex items-center">
                <div className="flex-1">
                  <Input
                    label="Color"
                    name="color"
                    value={equipment.color || "—"}
                    type="text"
                    readOnly
                    className="text-sm sm:text-base"
                  />
                </div>
                {equipment.color && (
                  <div className="ml-3 mt-6">
                    <span
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-gray-300 block"
                      style={{
                        backgroundColor: equipment.color.toLowerCase(),
                      }}
                      title={equipment.color}
                    ></span>
                  </div>
                )}
              </div>

              <Input
                label="Model / Year"
                name="model"
                value={equipment.model || "—"}
                type="text"
                readOnly
                className="text-sm sm:text-base"
              />

              <Input
                label="Material"
                name="material"
                value={equipment.material || "—"}
                type="text"
                readOnly
                className="text-sm sm:text-base"
              />
            </div>

            <h2 className="font-semibold text-lg sm:text-xl border-b text-primary border-gray-300 pb-1 mb-4 mt-4 sm:mt-6">
              Financial Information
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-7 p-2 sm:p-4">
              <Input
                label="Price"
                name="price"
                value={formatCurrency(equipment.price)}
                type="text"
                readOnly
                className="text-sm sm:text-base"
              />

              <Input
                label="Penalty"
                name="penalty"
                value={formatCurrency(equipment.penalty)}
                type="text"
                readOnly
                className="text-sm sm:text-base"
              />
            </div>

            {equipment.design && (
              <>
                <h2 className="font-semibold text-lg sm:text-xl border-b text-primary border-gray-300 pb-1 mb-4 mt-4 sm:mt-6">
                  Design
                </h2>
                <div className="px-2 sm:px-4">
                  <Textarea
                    label="Design Description"
                    name="design"
                    value={equipment.design}
                    rows={4}
                    readOnly
                    className="text-sm sm:text-base"
                  />
                </div>
              </>
            )}

            <h2 className="font-semibold text-lg sm:text-xl border-b text-primary border-gray-300 pb-1 mb-4 mt-4 sm:mt-6">
              Description
            </h2>
            <div className="px-2 sm:px-4">
              <Textarea
                label="Equipment Description"
                name="description"
                value={equipment.description || "No description provided."}
                rows={4}
                readOnly
                className="text-sm sm:text-base"
              />
            </div>
          </div>
        )}

        {activeTab === "media" && (
          <div className="bg-light p-4 sm:p-6 lg:p-7 rounded-lg border border-gray-300">
            <div className="animate-fadeIn">
              <h2 className="font-semibold text-lg sm:text-xl border-b text-primary border-gray-300 pb-1 mb-4 sm:mb-6">
                Media & Documents
              </h2>
              <div className="space-y-6 sm:space-y-8">
                {/* Media Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                  {/* Equipment Image Card */}
                  <div className="group bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="bg-gradient-to-r from-primary/5 to-transparent px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center">
                          <i className="fa-solid fa-image text-primary text-sm sm:text-lg"></i>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                            Equipment Image
                          </h3>
                          <p className="text-xs text-gray-500 hidden sm:block">
                            Main equipment photo
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 sm:p-6">
                      <div className="border-2 border-dashed border-gray-100 rounded-lg sm:rounded-xl overflow-hidden bg-gray-50/50 max-w-sm mx-auto">
                        {equipment.image ? (
                          <div className="relative aspect-square group/image">
                            <img
                              src={`${BaseUrl}${equipment.image}`}
                              alt={equipment.name}
                              className="w-full h-full object-cover group-hover/image:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex items-end justify-start p-2 sm:p-4">
                              <a
                                href={`${BaseUrl}${equipment.image}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                download={`equipment-${equipment.name}.jpg`}
                                className="text-white text-xs sm:text-sm flex items-center space-x-1 sm:space-x-2 bg-black/30 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-black/50 transition-colors"
                              >
                                <i className="fa-solid fa-download text-xs"></i>
                                <span className="hidden sm:inline">
                                  Download
                                </span>
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-square flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl sm:rounded-2xl shadow-inner flex items-center justify-center mb-2 sm:mb-3">
                              <i className="fa-solid fa-image text-2xl sm:text-3xl text-gray-300"></i>
                            </div>
                            <p className="text-gray-400 text-xs sm:text-sm font-medium text-center">
                              No image available
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* QR Code Card */}
                  <div className="group bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="bg-gradient-to-r from-primary/5 to-transparent px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center">
                          <i className="fa-solid fa-qrcode text-primary text-sm sm:text-lg"></i>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                            QR Code
                          </h3>
                          <p className="text-xs text-gray-500 hidden sm:block">
                            Scan for quick access
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 sm:p-6">
                      <div className="border-2 border-dashed border-gray-100 rounded-lg sm:rounded-xl overflow-hidden bg-gray-50/50 max-w-sm mx-auto">
                        {equipment.qr_code ? (
                          <div className="aspect-square p-3 sm:p-6 flex flex-col items-center justify-center">
                            <div className="bg-white p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-sm mb-2 sm:mb-3">
                              <img
                                src={`${BaseUrl}${equipment.qr_code}`}
                                alt="QR Code"
                                className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 object-contain"
                              />
                            </div>
                            <div className="text-center space-y-1 sm:space-y-2">
                              <span className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 bg-green-50 text-green-600 text-xs rounded-full">
                                <i className="fa-solid fa-circle-check mr-1 text-xs"></i>
                                Active
                              </span>
                              <a
                                href={`${BaseUrl}${equipment.qr_code}`}
                                download={`qr-${equipment.name}.png`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-primary hover:text-primary-dark bg-primary/5 hover:bg-primary/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-300"
                              >
                                <i className="fa-solid fa-download"></i>
                                <span className="hidden sm:inline">
                                  Download QR Code
                                </span>
                                <span className="sm:hidden">Download</span>
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-square flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl sm:rounded-2xl shadow-inner flex items-center justify-center mb-2 sm:mb-3">
                              <i className="fa-solid fa-qrcode text-2xl sm:text-3xl text-gray-300"></i>
                            </div>
                            <p className="text-gray-400 text-xs sm:text-sm font-medium text-center">
                              No QR code available
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents Section */}
                <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-primary/5 to-transparent px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center">
                          <i className="fa-solid fa-file-lines text-primary text-sm sm:text-lg"></i>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                            Receipts & Documents
                          </h3>
                          <p className="text-xs text-gray-500">
                            {equipment.receipt?.length || 0} document(s)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6">
                    {equipment.receipt && equipment.receipt.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {equipment.receipt.map((doc, index) => {
                          const fileName = doc.split("/").pop();
                          const fileUrl = `${BaseUrl}${doc}`;
                          const fileExtension = fileName
                            ?.split(".")
                            .pop()
                            ?.toLowerCase();

                          const getFileIcon = () => {
                            switch (fileExtension) {
                              case "pdf":
                                return {
                                  icon: "fa-file-pdf",
                                  color: "text-red-500",
                                  bg: "bg-red-50",
                                };
                              case "doc":
                              case "docx":
                                return {
                                  icon: "fa-file-word",
                                  color: "text-blue-500",
                                  bg: "bg-blue-50",
                                };
                              case "xls":
                              case "xlsx":
                                return {
                                  icon: "fa-file-excel",
                                  color: "text-green-500",
                                  bg: "bg-green-50",
                                };
                              case "jpg":
                              case "jpeg":
                              case "png":
                              case "gif":
                                return {
                                  icon: "fa-file-image",
                                  color: "text-purple-500",
                                  bg: "bg-purple-50",
                                };
                              default:
                                return {
                                  icon: "fa-file-lines",
                                  color: "text-gray-500",
                                  bg: "bg-gray-50",
                                };
                            }
                          };

                          const fileIcon = getFileIcon();

                          return (
                            <div
                              key={index}
                              className="group/document bg-white rounded-lg sm:rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-lg transition-all duration-300 overflow-hidden"
                            >
                              <div className="p-3 sm:p-4">
                                <div className="flex items-start space-x-2 sm:space-x-3">
                                  <div
                                    className={`w-10 h-10 sm:w-12 sm:h-12 ${fileIcon.bg} rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 group-hover/document:scale-110 transition-transform duration-300`}
                                  >
                                    <i
                                      className={`fa-solid ${fileIcon.icon} ${fileIcon.color} text-base sm:text-xl`}
                                    ></i>
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 text-xs sm:text-sm truncate group-hover/document:text-primary transition-colors">
                                      {fileName || `Document ${index + 1}`}
                                    </p>

                                    <div className="flex items-center mt-1 sm:mt-2 space-x-1 sm:space-x-2">
                                      <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md">
                                        {fileExtension?.toUpperCase() || "FILE"}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-1 opacity-0 group-hover/document:opacity-100 transition-opacity duration-300">
                                    <a
                                      href={fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                      title="View"
                                    >
                                      <i className="fa-solid fa-eye text-sm sm:text-base"></i>
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
                        <div className="relative">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-3 sm:mb-4">
                            <i className="fa-solid fa-file-circle-xmark text-3xl sm:text-4xl text-gray-300"></i>
                          </div>
                        </div>
                        <h4 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2 text-center">
                          No documents yet
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-500 text-center max-w-sm">
                          Upload receipts, manuals, or other documents
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "logs" && (
          <Table
            data={activityLogs}
            columns={columns}
            config={tableConfig}
            onAction={handleAction}
            isLoading={loading}
          />
        )}
      </div>
    </AdminLayout>
  );
}
