import React, { useState, useEffect } from "react";
import Select from "../../components/form/Select";

const MassPrinting = ({ order, onSuccess }) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

  const [expandedPlacements, setExpandedPlacements] = useState({});
  const [expandedSections, setExpandedSections] = useState({
    sampleReference: true,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const [printData, setPrintData] = useState({
    notes: "",
    placements: [],
    totalPaintUsed: "",
    leftoverPaint: "",
    paintUnit: "L", // Default unit
  });

  const [paintFormulas, setPaintFormulas] = useState({});

  // Unit options for paint
  const paintUnitOptions = [
    { value: "L", label: "Liters (L)", icon: "fas fa-flask", conversion: 1 },
    {
      value: "mL",
      label: "Milliliters (mL)",
      icon: "fas fa-flask",
      conversion: 1000,
    },
    {
      value: "gal",
      label: "Gallons (gal)",
      icon: "fas fa-flask",
      conversion: 0.264172,
    },
  ];

  // Mock sample paint usage data (would come from API in production)
  const mockSamplePaintData = {
    totalPaintUsed: 2.5,
    leftoverPaint: 0.8,
    paintUnit: "L",
    placements: [
      {
        type: "center_chest",
        colors: [
          { pantone: "PMS 185 C", paintColor: "Red", formula: "2:1:0.5" },
          { pantone: "PMS 109 C", paintColor: "Yellow", formula: "1:2:0.3" },
        ],
      },
      {
        type: "upper_back",
        colors: [
          { pantone: "PMS 286 C", paintColor: "Blue", formula: "1.5:1:0.4" },
          { pantone: "PMS 347 C", paintColor: "Green", formula: "2:1:0.6" },
        ],
      },
      {
        type: "left_sleeve",
        colors: [
          { pantone: "PMS 427 C", paintColor: "Silver", formula: "1:1:0.2" },
        ],
      },
    ],
    notes: "Sample Printer notes here",
    timestamp: "2024-03-20T14:30:00",
  };

  // Calculate total sample quantity
  const totalSampleQuantity =
    order?.samples?.reduce(
      (sum, sample) => sum + (parseInt(sample.quantity) || 0),
      0,
    ) || 0;

  // Calculate total mass quantity
  const totalMassQuantity = order?.total_quantity || 0;

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  useEffect(() => {
    console.log("MassPrinting - Order prop received:", order);
    setLoading(false);
  }, [order]);

  useEffect(() => {
    if (order?.orderDesign) {
      console.log("MassPrinting - OrderDesign found:", order.orderDesign);
      const orderDesign = order.orderDesign;

      const basePlacements =
        orderDesign.placements?.map((placement) => {
          const colorCount = placement.pantones
            ? Object.keys(placement.pantones).length
            : 0;

          const colors = {};
          for (let i = 1; i <= colorCount; i++) {
            colors[`color_${i}`] = {
              pantone: placement.pantones?.[`color_${i}`] || "",
              paintColor: "",
              formula: "",
            };
          }

          return {
            id: placement.id,
            colorCount: colorCount.toString(),
            mockupImage: placement.mockup_image || null,
            colors: colors,
            type: placement.type,
          };
        }) || [];

      setPrintData({
        notes: orderDesign.notes || "",
        placements: basePlacements,
        totalPaintUsed: "",
        leftoverPaint: "",
        paintUnit: "L",
      });

      console.log("MassPrinting - Print data set:", {
        notes: orderDesign.notes,
        placements: basePlacements,
      });
    } else {
      console.log("MassPrinting - No orderDesign found in order:", order);
    }
  }, [order]);

  const getPlacementLabel = (type) => {
    const placementLabels = {
      center_chest: "Center Chest",
      upper_back: "Upper Back",
      left_chest: "Left Chest",
      right_chest: "Right Chest",
      full_back: "Full Back",
      left_sleeve: "Left Sleeve",
      right_sleeve: "Right Sleeve",
    };
    return placementLabels[type] || type;
  };

  const togglePlacement = (placementId) => {
    setExpandedPlacements((prev) => ({
      ...prev,
      [placementId]: !prev[placementId],
    }));
  };

  const handlePaintChange = (placementId, colorIndex, field, value) => {
    setPrintData((prev) => ({
      ...prev,
      placements: prev.placements.map((placement) =>
        placement.id === placementId
          ? {
              ...placement,
              colors: {
                ...placement.colors,
                [`color_${colorIndex + 1}`]: {
                  ...placement.colors[`color_${colorIndex + 1}`],
                  [field]: value,
                },
              },
            }
          : placement,
      ),
    }));

    // Clear any previous submit status when making changes
    setSubmitSuccess(null);
    setSubmitError(null);
  };

  const handleFormulaChange = (placementId, colorIndex, value) => {
    const key = `${placementId}_${colorIndex}`;
    setPaintFormulas((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPrintData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUnitChange = (e) => {
    const { value } = e.target;
    setPrintData((prev) => ({
      ...prev,
      paintUnit: value,
    }));
  };

  const getTotalColors = () => {
    return printData.placements.reduce(
      (total, p) => total + parseInt(p.colorCount || 0),
      0,
    );
  };

  const getImageUrl = (path) => {
    if (!path) return null;

    if (path.startsWith("data:") || path.startsWith("http")) {
      return path;
    }

    if (path.startsWith("/storage") && baseUrl) {
      return `${baseUrl}${path}`;
    }

    return path;
  };

  const getUnitLabel = (unitValue) => {
    const unit = paintUnitOptions.find((u) => u.value === unitValue);
    return unit ? unit.label : unitValue;
  };

  const getUnitSymbol = (unitValue) => {
    const unit = paintUnitOptions.find((u) => u.value === unitValue);
    return unit ? unit.value : unitValue;
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(null);

      // Prepare paint data for submission
      const paintData = {
        orderId: order.id,
        totalPaintUsed: printData.totalPaintUsed,
        leftoverPaint: printData.leftoverPaint,
        paintUnit: printData.paintUnit,
        placements: printData.placements.map((placement) => ({
          placementId: placement.id,
          type: placement.type,
          colors: Object.entries(placement.colors).map(([key, value]) => ({
            colorIndex: parseInt(key.split("_")[1]),
            pantone: value.pantone,
            paintColor: value.paintColor,
            formula: value.formula,
          })),
        })),
        notes: printData.notes,
      };

      console.log("Submitting paint data:", paintData);

      // API call would go here
      // const response = await PrintApi.save(paintData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (onSuccess) {
        await onSuccess();
      }

      setSubmitSuccess("Paint data has been successfully saved!");
    } catch (err) {
      console.error("Error saving paint data:", err);
      setSubmitError(
        err.response?.data?.message ||
          err.message ||
          "Failed to save paint data. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="flex flex-col items-center justify-center gap-y-4 sm:gap-y-6 min-h-[50vh]">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-500">Loading print data...</p>
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="flex flex-col gap-y-4 sm:gap-y-6">
        <div className="text-center py-8">
          <p className="text-gray-500">No order data available</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-y-4 sm:gap-y-6 font-poppins">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-5">
        <div className="flex-1 min-w-0">
          <h1 className="text-base sm:text-xl font-semibold text-primary truncate flex items-center gap-2">
            <i className="fas fa-print"></i>
            Mass Printing
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
            Record paint colors, formulas, and usage for order #
            {order?.po_code || order?.id}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs sm:text-sm text-gray flex items-center shrink-0 bg-light px-3 py-1.5 rounded-full">
            <i className="fas fa-palette mr-1.5 text-primary"></i>
            {getTotalColors()} total colors
          </span>
          <span className="text-xs sm:text-sm text-green-600 flex items-center shrink-0 bg-green-50 px-3 py-1.5 rounded-full">
            <i className="fas fa-flask mr-1.5"></i>
            {printData.totalPaintUsed || 0} {getUnitSymbol(printData.paintUnit)}{" "}
            used
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <i className="fas fa-print text-primary text-sm sm:text-base"></i>
            </div>
            <div>
              <p className="text-xs text-gray-500">Placements</p>
              <p className="text-lg sm:text-2xl font-semibold text-primary">
                {printData.placements.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <i className="fas fa-palette text-primary text-sm sm:text-base"></i>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Colors</p>
              <p className="text-lg sm:text-2xl font-semibold text-primary">
                {getTotalColors()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <i className="fas fa-tshirt text-primary text-sm sm:text-base"></i>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Quantity</p>
              <p className="text-lg sm:text-2xl font-semibold text-primary">
                {totalMassQuantity}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <i className="fas fa-print text-primary text-sm sm:text-base"></i>
            </div>
            <div>
              <p className="text-xs text-gray-500">Print Method</p>
              <p className="text-lg sm:text-2xl font-semibold text-primary">
                {order?.print_method || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sample Printing Reference Section - Collapsible */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden transition-shadow">
        <button
          onClick={() => toggleSection("sampleReference")}
          className="w-full px-5 sm:px-6 py-3.5 sm:py-4 bg-light border-b border-gray-200 hover:bg-light/80 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <i
              className={`fas fa-chevron-${expandedSections.sampleReference ? "down" : "right"} text-primary text-sm`}
            ></i>
            <h2 className="text-xs font-medium text-primary flex items-center gap-2">
              <i className="fas fa-flask"></i>
              Sample Printing Reference
            </h2>
            <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full flex items-center gap-1">
              <i className="fas fa-chart-line"></i>
              {totalSampleQuantity} Samples
            </span>
          </div>
          <div className="text-xs sm:text-sm text-gray-500 bg-white px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <i className="fas fa-palette"></i>
            {mockSamplePaintData.placements.reduce(
              (sum, p) => sum + p.colors.length,
              0,
            )}{" "}
            Colors
          </div>
        </button>

        {expandedSections.sampleReference && (
          <div className="p-5 sm:p-6">
            {/* Sample Details */}
            {order?.samples && order.samples.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <i className="fas fa-flask text-primary"></i>
                  Sample Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {order.samples.map((sample) => (
                    <div
                      key={sample.id}
                      className="bg-light/50 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          Sample
                        </span>
                        <div className="flex items-center gap-1.5 bg-primary/5 px-2 py-0.5 rounded-full">
                          <i className="fas fa-boxes text-primary text-xs"></i>
                          <span className="text-xs font-semibold text-primary">
                            Qty: {sample.quantity}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 text-xs text-gray-600">
                        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                          <i className="fas fa-ruler text-primary/60 w-3.5"></i>
                          <span className="font-medium text-gray-700">
                            Size:
                          </span>
                          <span className="font-semibold text-primary">
                            {sample.size}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sample Paint Usage Summary */}
            <div className="mb-6 p-4 bg-light rounded-lg border border-primary/10">
              <h4 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                <i className="fas fa-chart-simple"></i>
                Sample Paint Usage Summary
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <i className="fas fa-flask text-primary"></i>
                      Total Paint Used
                    </span>
                    <span className="text-lg font-bold text-primary">
                      {mockSamplePaintData.totalPaintUsed}{" "}
                      {getUnitSymbol(mockSamplePaintData.paintUnit)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2"
                      style={{
                        width: `${
                          (mockSamplePaintData.totalPaintUsed /
                            (mockSamplePaintData.totalPaintUsed +
                              mockSamplePaintData.leftoverPaint)) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <i className="fas fa-arrow-left text-primary"></i>
                      Leftover Paint
                    </span>
                    <span className="text-lg font-bold text-orange-600">
                      {mockSamplePaintData.leftoverPaint}{" "}
                      {getUnitSymbol(mockSamplePaintData.paintUnit)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 rounded-full h-2"
                      style={{
                        width: `${
                          (mockSamplePaintData.leftoverPaint /
                            (mockSamplePaintData.totalPaintUsed +
                              mockSamplePaintData.leftoverPaint)) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              {mockSamplePaintData.notes && (
                <div className="mt-3 p-2 bg-white/50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 flex items-start gap-2">
                    <i className="fas fa-pencil-alt text-primary text-xs mt-0.5"></i>
                    <span>{mockSamplePaintData.notes}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Sample Color Formulas Reference */}
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <i className="fas fa-palette"></i>
              Sample Color Formulas Reference
            </h4>
            <div className="space-y-3 mb-4">
              {mockSamplePaintData.placements.map((placement, idx) => (
                <div
                  key={idx}
                  className="bg-light rounded-lg p-3 border border-gray-200"
                >
                  <h5 className="text-xs font-semibold text-primary mb-2">
                    {getPlacementLabel(placement.type)}
                  </h5>
                  <div className="space-y-2">
                    {placement.colors.map((color, colorIdx) => (
                      <div
                        key={colorIdx}
                        className="grid grid-cols-3 gap-2 text-xs"
                      >
                        <div className="bg-white p-2 rounded border border-gray-200">
                          <span className="text-gray-500">Pantone:</span>
                          <span className="ml-1 font-medium text-primary">
                            {color.pantone}
                          </span>
                        </div>
                        <div className="bg-white p-2 rounded border border-gray-200">
                          <span className="text-gray-500">Paint:</span>
                          <span className="ml-1 font-medium">
                            {color.paintColor}
                          </span>
                        </div>
                        <div className="bg-white p-2 rounded border border-gray-200">
                          <span className="text-gray-500">Formula:</span>
                          <span className="ml-1 font-mono text-primary">
                            {color.formula}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Color Summary Table */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="px-3 sm:px-4 py-2 sm:py-3 bg-light border-b border-gray-200">
          <h2 className="text-xs  font-medium text-primary">
            <i className="fas fa-list mr-1.5 sm:mr-2"></i>
            Color Summary
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px] sm:text-sm">
            <thead className="bg-light/50 text-gray-600">
              <tr>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">
                  Placement
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Color #</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Pantone</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">
                  Paint Color
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Formula</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {printData.placements.map((placement) =>
                Array.from({ length: parseInt(placement.colorCount) }).map(
                  (_, index) => {
                    const colorData = placement.colors[`color_${index + 1}`];

                    return (
                      <tr
                        key={`${placement.id}-${index}`}
                        className="hover:bg-light/50"
                      >
                        <td className="px-2 sm:px-4 py-1.5 sm:py-2 font-medium">
                          {getPlacementLabel(placement.type)}
                        </td>
                        <td className="px-2 sm:px-4 py-1.5 sm:py-2">
                          {index + 1}
                        </td>
                        <td className="px-2 sm:px-4 py-1.5 sm:py-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono">
                              {colorData?.pantone || "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-1.5 sm:py-2">
                          {colorData?.paintColor || "—"}
                        </td>
                        <td className="px-2 sm:px-4 py-1.5 sm:py-2">
                          {colorData?.formula || "—"}
                        </td>
                      </tr>
                    );
                  },
                ),
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paint Usage Section with Unit Dropdown */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 bg-light border-b border-gray-200">
          <h3 className="text-xs font-medium text-primary flex items-center gap-2">
            <i className="fas fa-flask"></i>
            Paint Usage
          </h3>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Total Paint Used */}
            <div>
              <label
                htmlFor="totalPaintUsed"
                className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1"
              >
                <i className="fas fa-weight-hanging text-primary text-xs"></i>
                Total Paint Used
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="totalPaintUsed"
                  name="totalPaintUsed"
                  value={printData.totalPaintUsed}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  placeholder="0.00"
                  disabled={submitting}
                />
                <select
                  value={printData.paintUnit}
                  onChange={handleUnitChange}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white"
                  disabled={submitting}
                >
                  {paintUnitOptions.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Leftover Paint */}
            <div>
              <label
                htmlFor="leftoverPaint"
                className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1"
              >
                <i className="fas fa-arrow-left text-primary text-xs"></i>
                Leftover Paint
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="leftoverPaint"
                  name="leftoverPaint"
                  value={printData.leftoverPaint}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  placeholder="0.00"
                  disabled={submitting}
                />
                <div className="px-3 py-2 bg-light border border-gray-200 rounded-lg text-sm text-gray-600 min-w-[100px] text-center">
                  {getUnitLabel(printData.paintUnit)}
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
            <i className="fas fa-info-circle text-gray-400"></i>
            Enter paint used and leftover paint in your preferred unit
          </p>
        </div>
      </div>

      {/* Artist Notes */}
      {printData.notes && (
        <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
          <h2 className="text-xs sm:text-md font-medium mb-1.5 sm:mb-2 text-primary">
            <i className="fas fa-pencil-alt mr-1.5 sm:mr-2"></i>
            Artist Notes
          </h2>
          <p className="text-[10px] sm:text-sm text-gray-600 bg-light p-2 sm:p-3 rounded-lg">
            {printData.notes}
          </p>
        </div>
      )}

      {/* Printer Notes Input */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 bg-light border-b border-gray-200">
          <h3 className="text-xs font-medium text-primary flex items-center gap-2">
            <i className="fas fa-pencil-alt"></i>
            Printer Notes
          </h3>
        </div>

        <div className="p-5 sm:p-6">
          <textarea
            id="notes"
            name="notes"
            value={printData.notes}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm resize-y"
            placeholder="Enter printer notes, special instructions, or comments about the printing process..."
            disabled={submitting}
          />
        </div>
      </div>

      {/* Success/Error Messages */}
      {submitSuccess && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <i className="fas fa-check-circle text-green-500 text-sm"></i>
            <p className="text-xs sm:text-sm text-green-700">{submitSuccess}</p>
          </div>
        </div>
      )}

      {submitError && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <i className="fas fa-exclamation-circle text-red-500 text-sm"></i>
            <p className="text-xs sm:text-sm text-red-700">{submitError}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => {
            setPrintData((prev) => ({
              ...prev,
              totalPaintUsed: "",
              leftoverPaint: "",
              paintUnit: "L",
              placements: prev.placements.map((p) => ({
                ...p,
                colors: Object.keys(p.colors).reduce((acc, key) => {
                  acc[key] = { ...p.colors[key], paintColor: "", formula: "" };
                  return acc;
                }, {}),
              })),
              notes: "",
            }));
          }}
          className="px-4 py-2 rounded-md border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <i className="fas fa-undo text-gray-400"></i>
          Reset
        </button>
        <button
          className={`px-4 py-2 rounded-md transition-colors text-sm flex items-center gap-2 ${
            !submitting
              ? "bg-primary text-white hover:bg-secondary cursor-pointer"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          disabled={submitting}
          onClick={handleSubmit}
        >
          {submitting ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Saving...
            </>
          ) : (
            <>
              <i className="fas fa-save mr-2"></i>
              Save Print Data
            </>
          )}
        </button>
      </div>
    </section>
  );
};

export default MassPrinting;
