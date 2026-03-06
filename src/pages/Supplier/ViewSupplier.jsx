import React, { useState, useEffect } from "react";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import Input from "../../components/form/Input";
import Textarea from "../../components/form/Textarea";
import { supplierApi } from "../../api/supplierApi";
import { useParams, Link } from "react-router-dom";
import Table from "../../components/table/Table";
import Loader from "../../components/common/Loader";

export default function ViewSupplier() {
  const { id } = useParams();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const BaseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchSupplierDetails();
  }, [id]);

  const fetchSupplierDetails = async () => {
    try {
      setLoading(true);
      const response = await supplierApi.show(id);
      setSupplier(response.data);
      setError("");
    } catch (err) {
      setError("Failed to load supplier details");
      console.error("Error fetching supplier:", err);
    } finally {
      setLoading(false);
    }
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

  const tableConfig = {
    sortable: true,
    pagination: true,
    search: true,
    filters: false,
    actions: [],
    pageSize: 10,
    emptyMessage: "No activity logs found",
    searchPlaceholder: "Search logs...",
    showIndex: true,
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
        icon="fa-building"
        pageTitle="Supplier Details"
        path="/"
        links={[
          { label: "Home", href: "/" },
          { label: "Suppliers", href: "/suppliers" },
          { label: "Details", href: "#" },
        ]}
      />
    );
  }

  if (error || !supplier) {
    return (
      <AdminLayout
        icon="fa-building"
        pageTitle="Supplier Details"
        path="/"
        links={[
          { label: "Home", href: "/" },
          { label: "Suppliers", href: "/suppliers" },
          { label: "Details", href: "#" },
        ]}
      >
        <div className="bg-light p-4 sm:p-7 rounded-lg border border-gray-300">
          <div className="text-center py-8 sm:py-12">
            <i className="fa-solid fa-exclamation-circle text-4xl sm:text-5xl text-red-500 mb-4"></i>
            <p className="text-gray-700 mb-4 text-sm sm:text-base">
              {error || "Supplier not found"}
            </p>
            <Link
              to="/suppliers"
              className="px-4 sm:px-6 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors inline-flex items-center text-sm sm:text-base"
            >
              <i className="fa-solid fa-arrow-left mr-2"></i>
              Back to Suppliers
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      pageTitle="Supplier Details"
      path="/"
      links={[
        { label: "Home", href: "/" },
        { label: "Suppliers", href: "/suppliers" },
        { label: supplier.name || "Supplier", href: "#" },
      ]}
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Header with actions and basic info */}
        {/* Header with actions and basic info */}
        <div className="bg-light p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border border-gray-300">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4 sm:gap-6 lg:gap-8">
            {/* Left Section - Supplier Info */}
            <div className="flex items-start gap-3 sm:gap-4 md:gap-5 w-full lg:w-auto">
              {/* Supplier Avatar with Gradient */}
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-linear-to-br from-secondary/20 to-secondary/5 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-sm ring-2 sm:ring-4 ring-secondary/5">
                  <i className="fa-solid fa-building text-secondary text-xl sm:text-2xl md:text-3xl"></i>
                </div>
              </div>

              {/* Supplier Details */}
              <div className="min-w-0 flex-1 space-y-2 sm:space-y-3">
                {/* Name and Status */}
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight wrap-break-word">
                    {supplier.name}
                  </h1>
                  <span className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 shadow-sm flex items-center gap-1 sm:gap-1.5">
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-emerald-500 rounded-full"></span>
                    <span className="hidden lg:inline">Active</span>
                  </span>
                </div>

                {/* Contact Grid - Responsive layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 sm:gap-x-4 md:gap-x-6 gap-y-2 sm:gap-y-2">
                  {/* Contact Person */}
                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 min-w-0">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 border border-gray-300 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                      <i className="fa-regular fa-user text-gray-500 text-xs sm:text-sm"></i>
                    </div>
                    <span className="truncate font-medium">
                      {supplier.contact_person}
                    </span>
                  </div>

                  {/* Added Date - Hide on smallest screens if needed */}
                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 min-w-0">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 border border-gray-300 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                      <i className="fa-regular fa-calendar text-gray-500 text-xs sm:text-sm"></i>
                    </div>
                    <span className="font-medium truncate">
                      <span className="hidden xs:inline">Added </span>
                      {new Date(supplier.created_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </span>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 min-w-0">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 border border-gray-300 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                      <i className="fa-regular fa-envelope text-gray-500 text-xs sm:text-sm"></i>
                    </div>
                    <span className="truncate font-medium">
                      {supplier.email ?? "N/A"}
                    </span>
                  </div>

                  {/* Contact Number */}
                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 min-w-0">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 border border-gray-300 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                      <i className="fa-solid fa-phone text-gray-500 text-xs sm:text-sm"></i>
                    </div>
                    <span className="font-medium truncate">
                      {supplier.contact_number}
                    </span>
                  </div>
                </div>

                {/* Address with responsive styling */}

                <div className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 pt-1 sm:pt-2 mt-1 sm:mt-2">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 border border-gray-300 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                    <i className="fa-regular fa-building text-gray-500 text-xs sm:text-sm"></i>
                  </div>
                  <span className="line-clamp-2 font-medium leading-relaxed wrap-break-word">
                    {[
                      supplier.street_address,
                      supplier.barangay,
                      supplier.city,
                      supplier.province,
                      supplier.postal_code,
                    ].filter(Boolean).length > 0 ? (
                      [
                        supplier.street_address,
                        supplier.barangay,
                        supplier.city,
                        supplier.province,
                        supplier.postal_code,
                      ]
                        .filter(Boolean)
                        .join(", ")
                    ) : (
                      <span className="text-gray-400 italic text-xs sm:text-sm">
                        No Address
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Section - Action Buttons */}
            <div className="flex flex-col xs:flex-row sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto lg:ml-auto lg:self-center">
              <Link
                to={`/supplier/${supplier.id}/edit`}
                className="flex-1 lg:flex-none px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 bg-secondary text-white rounded-lg sm:rounded-xl hover:bg-secondary/90 transition-all duration-200 hover:shadow-md sm:hover:shadow-lg hover:shadow-secondary/25 active:scale-[0.98] flex items-center justify-center gap-1.5 sm:gap-2.5 text-xs sm:text-sm font-semibold group"
              >
                <i className="fa-solid fa-pen group-hover:scale-110 transition-transform duration-200 text-xs sm:text-sm"></i>
                <span className="hidden xs:inline">Edit Supplier</span>
                <span className="xs:hidden">Edit</span>
              </Link>
              <Link
                to="/supplier"
                className="flex-1 lg:flex-none px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 bg-white border border-gray-200 sm:border-2 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-1.5 sm:gap-2.5 text-xs sm:text-sm font-semibold group"
              >
                <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform duration-200 text-xs sm:text-sm"></i>
                <span className="hidden xs:inline">Back to List</span>
                <span className="xs:hidden">Back</span>
              </Link>
            </div>
          </div>
        </div>
        <Table
          data={activityLogs}
          columns={columns}
          config={tableConfig}
          isLoading={loading}
          url="/new"
          button="Add Material"
        />
      </div>
    </AdminLayout>
  );
}
