import React, { useState } from "react";

const SampleCutting = ({ order }) => {
  const [formData, setFormData] = useState({
    notes: "",
    fabricUsed: "",
    fabricLeft: "",
    cutQuantities: {},
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    cuttingItems: true,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Helper function to aggregate quantities by size
  const getSizeQuantities = () => {
    if (!order?.items) return {};

    return order.items.reduce((acc, item) => {
      const size = item.size;
      const quantity = parseInt(item.quantity) || 0;
      acc[size] = (acc[size] || 0) + quantity;
      return acc;
    }, {});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuantityChange = (itemId, value) => {
    setFormData((prev) => ({
      ...prev,
      cutQuantities: {
        ...prev.cutQuantities,
        [itemId]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Here you would typically send the data to your backend
    console.log("Cutting Data:", {
      orderId: order?.id,
      notes: formData.notes,
      fabricUsed: formData.fabricUsed,
      cutQuantities: formData.cutQuantities,
      timestamp: new Date().toISOString(),
    });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);

    // You can add success notification here
    alert("Cutting data saved successfully!");
  };

  const sizeQuantities = getSizeQuantities();
  const totalOrderQuantity = order?.total_quantity || 0;

  // Calculate total items (number of unique SKUs)
  const totalItems = order?.items?.length || 0;

  return (
    <section className="flex flex-col gap-y-4 sm:gap-y-6 font-poppins">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-5">
        <div className="flex-1 min-w-0">
          <h1 className="text-base sm:text-xl font-semibold text-primary truncate flex items-center gap-2">
            <i className="fas fa-cut"></i>
            Sample Cutting
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
            Record cutting quantities and fabric usage for order #{order?.id}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs sm:text-sm text-green-600 flex items-center shrink-0 bg-green-50 px-3 py-1.5 rounded-full">
            <i className="fas fa-weight-hanging mr-1.5"></i>
            {formData.fabricUsed || 0} kg used
          </span>
        </div>
      </div>

      {/* Order Summary Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 transition-shadow">
        <h2 className="text-sm sm:text-base font-medium text-primary mb-3 flex items-center gap-2">
          <i className="fas fa-clipboard-list"></i>
          Order Summary
        </h2>

        {/* Main Order Info - Updated with Pattern Type and revised stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-light/50 p-3 rounded">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <i className="fas fa-hashtag text-gray-400"></i>
              PO Code
            </p>
            <p className="text-sm font-medium">{order?.po_code || "N/A"}</p>
          </div>
          <div className="bg-light/50 p-3 rounded">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <i className="fas fa-cubes text-gray-400"></i>
              Total Qty
            </p>
            <p className="text-sm font-medium">{totalOrderQuantity} pcs</p>
          </div>
          <div className="bg-light/50 p-3 rounded">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <i className="fas fa-tshirt text-gray-400"></i>
              Design
            </p>
            <p className="text-sm font-medium">{order?.design_name || "N/A"}</p>
          </div>
          <div className="bg-light/50 p-3 rounded">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <i className="fas fa-palette text-gray-400"></i>
              Fabric Color
            </p>
            <p className="text-sm font-medium">
              {order?.fabric_color || "N/A"}
            </p>
          </div>
        </div>

        {/* Second row with Pattern Type and additional info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-light/50 p-3 rounded">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <i className="fas fa-cut text-gray-400"></i>
              Pattern Type
            </p>
            <p className="text-sm font-medium flex items-center gap-1">
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                {order?.pattern_type || "Standard"}
              </span>
            </p>
          </div>
          <div className="bg-light/50 p-3 rounded">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <i className="fas fa-tags text-gray-400"></i>
              Total Items
            </p>
            <p className="text-sm font-medium">{totalItems} Sizes</p>
          </div>
          <div className="bg-light/50 p-3 rounded">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <i className="fas fa-calendar text-gray-400"></i>
              Deadline
            </p>
            <p className="text-sm font-medium">
              {order?.deadline
                ? new Date(order.deadline).toLocaleDateString()
                : "Not set"}
            </p>
          </div>
          <div className="bg-light/50 p-3 rounded">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <i className="fas fa-flag text-gray-400"></i>
              Priority
            </p>
            <p className="text-sm font-medium capitalize">
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  order?.priority === "high"
                    ? "bg-red-100 text-red-700"
                    : order?.priority === "medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                }`}
              >
                {order?.priority || "normal"}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Cutting Items Section */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden transition-shadow">
        <button
          onClick={() => toggleSection("cuttingItems")}
          className="w-full px-5 sm:px-6 py-3.5 sm:py-4 bg-light border-b border-gray-200 hover:bg-light/80 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <i
              className={`fas fa-chevron-${expandedSections.cuttingItems ? "down" : "right"} text-primary text-sm`}
            ></i>
            <h3 className="text-sm sm:text-base font-medium text-primary flex items-center gap-2">
              <i className="fas fa-scissors"></i>
              Cutting Items
            </h3>
            <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full flex items-center gap-1">
              <i className="fas fa-check-circle"></i>
              {
                Object.values(formData.cutQuantities).filter(
                  (q) => q && parseInt(q) > 0,
                ).length
              }{" "}
              Sizes
            </span>
          </div>
          <div className="text-xs sm:text-sm text-gray-500 bg-white px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <i className="fas fa-cubes"></i>
            {totalOrderQuantity} Items to cut
          </div>
        </button>

        {expandedSections.cuttingItems && (
          <div className="p-5 sm:p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-light/80 rounded-lg">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Color
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Order Qty
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Cut Qty
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order?.items?.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-light/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm">{item.size}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{
                              backgroundColor: item.color.toLowerCase(),
                            }}
                          />
                          {item.color}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">
                        {item.sku}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <input
                          type="number"
                          min="0"
                          max={item.quantity}
                          value={formData.cutQuantities[item.id] || ""}
                          onChange={(e) =>
                            handleQuantityChange(item.id, e.target.value)
                          }
                          className="w-24 px-2 py-1.5 border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                          placeholder="0"
                          disabled={isSubmitting}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-light/50">
                  <tr>
                    <td colSpan="3" className="px-4 py-3 text-sm font-medium">
                      Total
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      {totalOrderQuantity}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-primary">
                      {Object.values(formData.cutQuantities).reduce(
                        (sum, val) => sum + (parseInt(val) || 0),
                        0,
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Fabric & Notes Section */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 bg-light border-b border-gray-200">
          <h3 className="text-sm sm:text-base font-medium text-primary flex items-center gap-2">
            <i className="fas fa-clipboard"></i>
            Cutting Details
          </h3>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Total Fabric Used */}
            <div>
              <label
                htmlFor="fabricUsed"
                className="block text-sm font-medium text-gray-700 mb-2 items-center gap-2"
              >
                <i className="fas fa-weight-hanging text-primary text-xs"></i>
                Total Fabric Used
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="fabricUsed"
                  name="fabricUsed"
                  value={formData.fabricUsed}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  placeholder="0.00"
                  disabled={isSubmitting}
                />
                <span className="text-gray-600 font-medium bg-light px-3 py-2 rounded-lg border border-gray-200 min-w-15 text-center">
                  kg
                </span>
              </div>
            </div>

            {/* Leftover Fabric */}
            <div>
              <label
                htmlFor="leftoverFabric"
                className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1"
              >
                <i className="fas fa-weight-hanging text-primary text-xs"></i>
                Leftover Fabric
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="leftoverFabric"
                  name="leftoverFabric"
                  value={formData.leftoverFabric}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  placeholder="0.00"
                  disabled={isSubmitting}
                />
                <span className="text-gray-600 font-medium bg-light px-3 py-2 rounded-lg border border-gray-200 min-w-15 text-center">
                  kg
                </span>
              </div>
            </div>
          </div>

          {/* Info note */}
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
            <i className="fas fa-info-circle text-gray-400"></i>
            Enter fabric used and leftover fabric in kilograms
          </p>

          {/* Cutter Notes */}
          <div className="mt-6">
            <label
              htmlFor="notes"
              className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
            >
              <i className="fas fa-pencil-alt text-primary text-xs"></i>
              Cutter Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm resize-y"
              placeholder="Enter cutter notes"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => {
            setFormData({ notes: "", fabricUsed: "", cutQuantities: {} });
          }}
          className="px-4 py-2 rounded-md border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <i className="fas fa-undo text-gray-400"></i>
          Reset
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-4 py-2 rounded-md bg-primary text-white hover:bg-secondary transition-colors text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i
            className={`fas fa-${isSubmitting ? "spinner fa-spin" : "save"}`}
          ></i>
          {isSubmitting ? "Saving..." : "Save Cutting Data"}
        </button>
      </div>
    </section>
  );
};

export default SampleCutting;
