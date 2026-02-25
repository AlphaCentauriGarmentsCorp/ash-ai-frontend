import React, { useState, useEffect } from "react";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import Input from "../../components/form/Input";
import Textarea from "../../components/form/Textarea";
import { clientApi } from "../../api/clientApi";
import { useParams, Link } from "react-router-dom";

export default function ClientDetails() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    fetchClientDetails();
  }, [id]);

  const fetchClientDetails = async () => {
    try {
      setLoading(true);
      const response = await clientApi.show(id);
      setClient(response.data);
    } catch (err) {
      setError("Failed to load client details");
    } finally {
      setLoading(false);
    }
  };

  const parseAddress = (addressString) => {
    if (!addressString)
      return {
        street: "",
        barangay: "",
        city: "",
        province: "",
        postal: "",
      };
    const parts = addressString.split(",").map((part) => part.trim());

    return {
      street: parts[0] || "",
      barangay: parts[1] || "",
      city: parts[2] || "",
      province: parts[3] || "",
      postal: parts[4] || "",
    };
  };

  if (loading) {
    return (
      <AdminLayout
        icon="fa-user"
        pageTitle="Client Details"
        path="/"
        links={[
          { label: "Home", href: "/" },
          { label: "Clients", href: "/clients" },
          { label: "Details", href: "#" },
        ]}
      >
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-gray-600 text-sm font-medium">
              Loading client details...
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !client) {
    return (
      <AdminLayout
        icon="fa-user"
        pageTitle="Client Details"
        path="/"
        links={[
          { label: "Home", href: "/" },
          { label: "Clients", href: "/clients" },
          { label: "Details", href: "#" },
        ]}
      >
        <div className="bg-light p-7 rounded-lg border border-gray-300">
          <div className="text-center py-8">
            <i className="fa-solid fa-exclamation-circle text-4xl text-red-500 mb-4"></i>
            <p className="text-gray-700 mb-4">{error || "Client not found"}</p>
            <Link
              to="/clients"
              className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors inline-flex items-center"
            >
              <i className="fa-solid fa-arrow-left mr-2"></i>
              Back to Clients
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const nameParts = client.name ? client.name.split(" ") : ["", ""];
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";
  const address = parseAddress(client.address);

  return (
    <AdminLayout
      icon="fa-user"
      pageTitle="Client Details"
      path="/"
      links={[
        { label: "Home", href: "/" },
        { label: "Clients", href: "/clients" },
        { label: client.name || "Client", href: "#" },
      ]}
    >
      <div className="space-y-6">
        <div className="bg-light p-4 lg:p-6 rounded-lg border border-gray-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-user text-secondary text-xl"></i>
            </div>
            <div className="ml-4">
              <h1 className="text-xl lg:text-2xl font-semibold text-primary">
                {client.name}
              </h1>
              <p className="text-gray-500 text-sm">Client ID: {client.id}</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Link
              to={`/clients/edit/${client.id}`}
              className="flex-1 sm:flex-none px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors flex items-center justify-center"
            >
              <i className="fa-solid fa-pen mr-2"></i>
              Edit
            </Link>
            <Link
              to="/clients"
              className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              <i className="fa-solid fa-arrow-left mr-2"></i>
              Back
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-300">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab("details")}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "details"
                  ? "border-secondary text-secondary"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <i className="fa-solid fa-info-circle mr-2"></i>
              Details
            </button>
            <button
              onClick={() => setActiveTab("brands")}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "brands"
                  ? "border-secondary text-secondary"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <i className="fa-solid fa-building mr-2"></i>
              Brands ({client.brands?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "orders"
                  ? "border-secondary text-secondary"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <i className="fa-solid fa-shirt mr-2"></i>
              Orders ({client.orders?.length || 0})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-light p-3 lg:p-7 rounded-lg border border-gray-300">
          {activeTab === "details" && (
            <>
              <h2 className="font-semibold text-xl border-b text-primary border-gray-300 pb-1 mb-6">
                Client Information
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-7 p-4">
                <Input
                  label="First Name"
                  name="first_name"
                  value={firstName}
                  type="text"
                  readOnly
                />

                <Input
                  label="Last Name"
                  name="last_name"
                  value={lastName}
                  type="text"
                  readOnly
                />

                <Input
                  label="Email"
                  name="email"
                  value={client.email}
                  type="email"
                  readOnly
                />

                <Input
                  label="Contact Number"
                  name="contact_number"
                  value={client.contact_number}
                  type="text"
                  readOnly
                />
              </div>

              <h2 className="font-semibold text-xl border-b text-primary border-gray-300 pb-1 mb-6">
                Address
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-7 px-2 sm:px-3 md:px-4">
                <div className="col-span-1 sm:col-span-1 lg:col-span-2">
                  <Input
                    label="Preferred Courier"
                    name="courier"
                    value={client.courier || "—"}
                    type="text"
                    readOnly
                  />
                </div>

                <div className="col-span-1 sm:col-span-1 lg:col-span-2">
                  <Input
                    label="Shipping Method"
                    name="method"
                    value={client.method || "—"}
                    type="text"
                    readOnly
                  />
                </div>

                <div className="col-span-1 sm:col-span-2 lg:col-span-4">
                  <Input
                    label="Street Address"
                    name="street_address"
                    value={address.street || "—"}
                    type="text"
                    readOnly
                  />
                </div>

                <div className="col-span-1 sm:col-span-1 lg:col-span-1">
                  <Input
                    label="Barangay"
                    name="barangay"
                    value={address.barangay || "—"}
                    type="text"
                    readOnly
                  />
                </div>

                <div className="col-span-1 sm:col-span-1 lg:col-span-1">
                  <Input
                    label="City"
                    name="city"
                    value={address.city || "—"}
                    type="text"
                    readOnly
                  />
                </div>

                <div className="col-span-1 sm:col-span-1 lg:col-span-1">
                  <Input
                    label="Province"
                    name="province"
                    value={address.province || "—"}
                    type="text"
                    readOnly
                  />
                </div>

                <div className="col-span-1 sm:col-span-1 lg:col-span-1">
                  <Input
                    label="Postal Code"
                    name="postal_code"
                    value={address.postal || "—"}
                    type="text"
                    readOnly
                  />
                </div>
              </div>

              {client.notes && (
                <>
                  <h2 className="font-semibold text-xl border-b text-primary border-gray-300 pb-1 mb-6 mt-6">
                    Notes
                  </h2>
                  <div className="px-4">
                    <Textarea
                      label="Notes"
                      name="notes"
                      value={client.notes}
                      rows={6}
                      readOnly
                    />
                  </div>
                </>
              )}
            </>
          )}

          {activeTab === "brands" && (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-gray-300 mb-4 sm:mb-6">
                <h2 className="font-semibold text-lg sm:text-xl text-primary">
                  Clothing/Company Brands
                </h2>
                {client.brands && client.brands.length > 0 && (
                  <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                    {client.brands.length}{" "}
                    {client.brands.length === 1 ? "Brand" : "Brands"}
                  </span>
                )}
              </div>

              {client.brands && client.brands.length > 0 ? (
                <>
                  <div className="block sm:hidden mb-3 px-2">
                    <p className="text-xs text-gray-500">
                      Showing {client.brands.length} brand
                      {client.brands.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <div
                    className="grid grid-cols-1 
                      sm:grid-cols-2 
                      md:grid-cols-2 
                      lg:grid-cols-3 
                      xl:grid-cols-4 
                      gap-4 sm:gap-5 md:gap-6 
                      p-2 sm:p-3 md:p-4"
                  >
                    {client.brands.map((brand, index) => (
                      <div
                        key={brand.id || index}
                        className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                      >
                        <div className="h-2 bg-linear-to-r from-primary to-primary/60"></div>

                        <div className="p-4 sm:p-5">
                          <div className="relative mb-4 sm:mb-5 flex justify-center">
                            <div
                              className="w-64 h-64 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-60 lg:h-60 xl:w-56 xl:h-56 
                                rounded-xl bg-linear-to-br from-gray-50 to-gray-100 
                                border-2 border-gray-200 flex items-center justify-center 
                                group-hover:border-secondary/30 transition-colors duration-300 
                                overflow-hidden mx-auto"
                            >
                              {brand?.logo && brand.logo.trim() !== "" ? (
                                <img
                                  src={brand.logo}
                                  alt={brand?.name || "Brand Logo"}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = "none";
                                    const fallbackDiv =
                                      document.createElement("div");
                                    fallbackDiv.className =
                                      "w-full h-full flex items-center justify-center bg-gray-100";
                                    fallbackDiv.innerHTML = `<i class="fa-solid fa-shirt text-4xl sm:text-5xl text-gray-300"></i>`;
                                    e.target.parentNode.appendChild(
                                      fallbackDiv,
                                    );
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                  <i className="fa-solid fa-shirt text-4xl sm:text-5xl text-gray-300"></i>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="text-center">
                            <h3
                              className="font-semibold text-primary 
                               text-base sm:text-lg 
                               mb-2 group-hover:text-secondary transition-colors duration-300
                               line-clamp-2 px-1"
                            >
                              {brand.name}
                            </h3>

                            <div
                              className="flex flex-col xs:flex-row items-center justify-center 
                                gap-1 xs:gap-2 text-xs text-gray-400"
                            >
                              {brand.created_at && (
                                <>
                                  <span className="hidden xs:inline">•</span>
                                  <span className="flex items-center gap-1">
                                    <i className="fa-regular fa-calendar"></i>
                                    <span className="text-xs">
                                      {new Date(
                                        brand.created_at,
                                      ).toLocaleDateString()}
                                    </span>
                                  </span>
                                </>
                              )}
                            </div>

                            {(!brand.logo || brand.logo.trim() === "") && (
                              <div className="mt-3 inline-block sm:hidden">
                                <span
                                  className="inline-flex items-center gap-1 px-2 py-0.5 
                                     bg-gray-100 rounded-full text-xs text-gray-500"
                                >
                                  <i className="fa-regular fa-image"></i>
                                  <span>No logo</span>
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 sm:py-10 md:py-12 px-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <i className="fa-solid fa-building text-3xl sm:text-4xl text-gray-400"></i>
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 text-center">
                    No Brands Added
                  </h3>
                  <p className="text-sm text-gray-500 text-center max-w-sm mb-6">
                    This client hasn't added any brands yet. Brands will appear
                    here once they're added.
                  </p>
                  <Link
                    to={`/clients/edit/${client.id}`}
                    className="w-full sm:w-auto px-6 py-2 bg-secondary text-white 
                     rounded-lg hover:bg-secondary/90 transition-colors 
                     inline-flex items-center justify-center gap-2 text-sm"
                  >
                    <i className="fa-solid fa-plus"></i>
                    <span>Add Brand</span>
                  </Link>
                </div>
              )}
            </>
          )}

          {activeTab === "orders" && (
            <>
              <h2 className="font-semibold text-xl border-b text-primary border-gray-300 pb-1 mb-6">
                Order History
              </h2>

              <div className="">
                {client.orders && client.orders.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-gray-300  ">
                    <table className="min-w-full divide-y divide-gray-200 ">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {client.orders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              #{order.po_code || order.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(order.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                 bg-green-100 text-green-800"
                              >
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ₱
                              {Number(order.total_price).toLocaleString(
                                "en-PH",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                },
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <Link
                                to={`/order/${order.id}`}
                                className="text-secondary hover:text-secondary/80"
                              >
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="fa-solid fa-shirt text-4xl text-gray-400 mb-3"></i>
                    <p className="text-gray-500">
                      No orders found for this client
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
