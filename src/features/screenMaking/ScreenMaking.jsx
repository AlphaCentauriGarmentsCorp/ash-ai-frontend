import React, { useState, useEffect } from "react";
import Select from "../../components/form/Select";
import { ScreenTypeApi } from "../../api/ScreenTypeApi";
import { ScreenMakingApi } from "../../api/ScreenMakingApi";

const ScreenMaking = ({ order }) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

  const [expandedPlacements, setExpandedPlacements] = useState({});
  const [loading, setLoading] = useState(true);
  const [screensLoading, setScreensLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [hasExistingAssignments, setHasExistingAssignments] = useState(false);

  const [screenData, setScreenData] = useState({
    notes: "",
    placement_type: "",
    sizeLabelImage: null,
    placements: [],
  });

  const [screenInventory, setScreenInventory] = useState([]);
  const [screenError, setScreenError] = useState(null);

  useEffect(() => {
    fetchScreens();
  }, []);

  const fetchScreens = async () => {
    try {
      setScreensLoading(true);
      const response = await ScreenTypeApi.index();
      console.log("Screens fetched:", response);

      if (response?.data) {
        setScreenInventory(response.data);
      } else if (Array.isArray(response)) {
        setScreenInventory(response);
      } else {
        setScreenInventory([]);
      }

      setScreenError(null);
    } catch (err) {
      console.error("Error fetching screens:", err);
      setScreenError(err.message || "Failed to fetch screens");
    } finally {
      setScreensLoading(false);
    }
  };

  // Process existing assignments from order prop
  const processExistingAssignments = (placements) => {
    if (!order?.screenAssignment || order.screenAssignment.length === 0) {
      setHasExistingAssignments(false);
      return placements;
    }

    setHasExistingAssignments(true);

    // Map assignments to placements
    const assignments = order.screenAssignment;

    return placements.map((placement) => {
      const placementAssignments = assignments.filter(
        (a) => a.placement_id === placement.id,
      );

      const screens = { ...placement.screens };

      placementAssignments.forEach((assignment) => {
        screens[`color_${assignment.color_index}`] = assignment.screen_id;
      });

      return {
        ...placement,
        screens: screens,
      };
    });
  };

  useEffect(() => {
    console.log("ScreenMaking - Order prop received:", order);
    setLoading(false);
  }, [order]);

  useEffect(() => {
    if (order?.orderDesign) {
      console.log("ScreenMaking - OrderDesign found:", order.orderDesign);
      const orderDesign = order.orderDesign;

      const basePlacements =
        orderDesign.placements?.map((placement) => {
          const colorCount = placement.pantones
            ? Object.keys(placement.pantones).length
            : 0;

          const screens = {};
          for (let i = 1; i <= colorCount; i++) {
            screens[`color_${i}`] = null;
          }

          return {
            id: placement.id,
            colorCount: colorCount.toString(),
            mockupImage: placement.mockup_image || null,
            pantones: placement.pantones || {},
            type: placement.type,
            screens: screens,
          };
        }) || [];

      // Process existing assignments if any
      const placementsWithAssignments =
        processExistingAssignments(basePlacements);

      setScreenData({
        notes: orderDesign.notes || "",
        placement_type: "",
        sizeLabelImage: orderDesign.size_label || null,
        placements: placementsWithAssignments,
      });

      console.log("ScreenMaking - Screen data set:", {
        notes: orderDesign.notes,
        sizeLabelImage: orderDesign.size_label,
        placements: placementsWithAssignments,
        hasExistingAssignments: order.screenAssignment?.length > 0,
      });
    } else {
      console.log("ScreenMaking - No orderDesign found in order:", order);
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

  const getAssignedScreenIds = () => {
    const assignedIds = new Set();
    screenData.placements.forEach((placement) => {
      Object.values(placement.screens).forEach((screenId) => {
        if (screenId) assignedIds.add(screenId);
      });
    });
    return assignedIds;
  };

  const areAllScreensAssigned = () => {
    let totalNeeded = 0;
    let totalAssigned = 0;

    screenData.placements.forEach((placement) => {
      totalNeeded += parseInt(placement.colorCount);
      Object.values(placement.screens).forEach((screenId) => {
        if (screenId) totalAssigned++;
      });
    });

    return totalNeeded === totalAssigned;
  };

  const handleScreenAssignment = (placementId, colorIndex, event) => {
    const selectedScreen = event.target.value;

    setScreenData((prev) => ({
      ...prev,
      placements: prev.placements.map((placement) =>
        placement.id === placementId
          ? {
              ...placement,
              screens: {
                ...placement.screens,
                [`color_${colorIndex + 1}`]: selectedScreen || null,
              },
            }
          : placement,
      ),
    }));

    // Clear any previous submit status when making changes
    setSubmitSuccess(null);
    setSubmitError(null);
  };

  const togglePlacement = (placementId) => {
    setExpandedPlacements((prev) => ({
      ...prev,
      [placementId]: !prev[placementId],
    }));
  };

  const getScreenOptions = (currentScreenId = null) => {
    const assignedIds = getAssignedScreenIds();

    return screenInventory
      .filter((screen) => {
        if (screen.id === currentScreenId) return true;

        return !assignedIds.has(screen.id);
      })
      .map((screen) => ({
        value: screen.id,
        label: `${screen.address} | Mesh: ${screen.mesh_count} | Size: ${screen.size}`,
      }));
  };

  const getScreenById = (id) => {
    return screenInventory.find((s) => s.id === id);
  };

  const getTotalAssignedScreens = () => {
    let total = 0;
    screenData.placements.forEach((placement) => {
      Object.values(placement.screens).forEach((screen) => {
        if (screen) total++;
      });
    });
    return total;
  };

  const getPlacementAssignedCount = (placement) => {
    let count = 0;
    Object.values(placement.screens).forEach((screenId) => {
      if (screenId) count++;
    });
    return count;
  };

  const getTotalScreensNeeded = () => {
    return screenData.placements.reduce(
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

  const handleSubmit = async () => {
    if (!areAllScreensAssigned() || screenInventory.length === 0) {
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(null);

      const assignments = [];

      screenData.placements.forEach((placement) => {
        Object.entries(placement.screens).forEach(([colorKey, screenId]) => {
          if (screenId) {
            assignments.push({
              order_id: order.id,
              placement_id: placement.id,
              screen_id: screenId,
              color_index: parseInt(colorKey.split("_")[1]),
            });
          }
        });
      });

      console.log("Submitting screen assignments:", assignments);

      let response = await ScreenMakingApi.create({
        assignments: assignments,
      });
      console.log("Screen assignments saved:", response);
      setSubmitSuccess(
        "Screens have been successfully assigned and marked as ready!",
      );

      // Note: You might want to refresh the order data here
      // This depends on how your parent component handles data refresh
      if (typeof window.refreshOrderData === "function") {
        window.refreshOrderData();
      }
    } catch (err) {
      console.error("Error saving screen assignments:", err);

      setSubmitError(
        err.response?.data?.message ||
          err.message ||
          "Failed to save screen assignments. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || screensLoading) {
    return (
      <section className="flex flex-col gap-y-4 sm:gap-y-6 font-poppins">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-500">Loading screen making data...</p>
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="flex flex-col gap-y-4 sm:gap-y-6 font-poppins">
        <div className="text-center py-8">
          <p className="text-gray-500">No order data available</p>
        </div>
      </section>
    );
  }

  if (screenError) {
    return (
      <section className="flex flex-col gap-y-4 sm:gap-y-6 font-poppins">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <i className="fas fa-exclamation-circle text-red-500 text-2xl mb-2"></i>
          <p className="text-red-600 text-sm">
            Error loading screens: {screenError}
          </p>
          <button
            onClick={fetchScreens}
            className="mt-2 text-sm text-primary hover:underline"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-y-4 sm:gap-y-6 font-poppins">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-5">
        <div className="flex-1 min-w-0">
          <h1 className="text-base sm:text-xl font-semibold text-primary truncate">
            Screen Making - {order.po_code}
          </h1>
          <p className="text-[10px] sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
            Review and manage screens needed for order based on graphic data.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] sm:text-sm text-gray flex items-center shrink-0">
            <i className="fas fa-film mr-1 text-primary"></i>
            {getTotalScreensNeeded()} total screens
          </span>
          <span className="text-[10px] sm:text-sm text-green-600 flex items-center shrink-0">
            <i className="fas fa-check-circle mr-1"></i>
            {getTotalAssignedScreens()} assigned
          </span>
          {hasExistingAssignments && (
            <span className="text-[10px] sm:text-sm text-blue-600 flex items-center shrink-0">
              <i className="fas fa-edit mr-1"></i>
              Edit Mode
            </span>
          )}
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
              <p className="text-[10px] sm:text-sm text-gray-500">Placements</p>
              <p className="text-lg sm:text-2xl font-semibold text-primary">
                {screenData.placements.length}
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
              <p className="text-[10px] sm:text-sm text-gray-500">
                Total Colors
              </p>
              <p className="text-lg sm:text-2xl font-semibold text-primary">
                {getTotalScreensNeeded()}
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
              <p className="text-[10px] sm:text-sm text-gray-500">
                Total Quantity
              </p>
              <p className="text-lg sm:text-2xl font-semibold text-primary">
                {order.total_quantity}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <i className="fas fa-tag text-primary text-sm sm:text-base"></i>
            </div>
            <div>
              <p className="text-[10px] sm:text-sm text-gray-500">Size Label</p>
              <p className="text-lg sm:text-2xl font-semibold text-primary">
                {screenData.sizeLabelImage ? "Yes" : "No"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Size Label Image */}
      {screenData.sizeLabelImage && (
        <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
          <h2 className="text-xs sm:text-md font-medium mb-2 sm:mb-3 text-primary">
            <i className="fas fa-tag mr-1.5 sm:mr-2 text-primary text-xs sm:text-sm"></i>
            Size Label Image
          </h2>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-20 h-20 sm:w-32 sm:h-32 border border-gray-200 rounded-lg overflow-hidden">
              <img
                src={getImageUrl(screenData.sizeLabelImage)}
                alt="Size label"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/150?text=No+Image";
                }}
              />
            </div>
            <div>
              <p className="text-[10px] sm:text-sm text-gray-600">
                Size label image is available for screen reference.
              </p>
              <a
                href={getImageUrl(screenData.sizeLabelImage)}
                download
                className="inline-block mt-1 sm:mt-2 text-primary text-[10px] sm:text-sm hover:underline"
              >
                <i className="fas fa-download mr-1"></i>
                Download
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Screens Required by Placement */}
      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-sm sm:text-md font-medium text-primary">
          <i className="fas fa-film mr-1.5 sm:mr-2 text-primary text-xs sm:text-sm"></i>
          Screens Required by Placement
        </h2>

        <div className="space-y-2 sm:space-y-3">
          {screenData.placements.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500 text-sm">
                No placements found for this order
              </p>
              {order.orderDesign && (
                <p className="text-xs text-gray-400 mt-2">
                  OrderDesign found but has no placements
                </p>
              )}
            </div>
          ) : (
            screenData.placements.map((placement) => {
              const isExpanded = expandedPlacements[placement.id] || false;
              const assignedCount = getPlacementAssignedCount(placement);
              const totalCount = parseInt(placement.colorCount);
              const isFullyAssigned = assignedCount === totalCount;

              return (
                <div
                  key={placement.id}
                  className="rounded-lg border border-gray-200 bg-white"
                >
                  {/* Placement Header */}
                  <button
                    onClick={() => togglePlacement(placement.id)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-light border-b border-gray-200 hover:bg-light/80 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <i
                          className={`fas fa-chevron-${isExpanded ? "down" : "right"} text-primary text-xs sm:text-sm transition-transform`}
                        ></i>
                        <h3 className="text-xs sm:font-medium text-primary">
                          {getPlacementLabel(placement.type)}
                        </h3>
                        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-primary/10 text-primary text-[8px] sm:text-xs rounded-full">
                          {placement.colorCount}{" "}
                          {parseInt(placement.colorCount) === 1
                            ? "Screen"
                            : "Screens"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[8px] sm:text-xs ${isFullyAssigned ? "text-green-600" : "text-gray-500"}`}
                        >
                          {assignedCount}/{totalCount} assigned
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="p-3 sm:p-4">
                      <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                        {/* Mockup Image */}
                        <div className="md:w-32 shrink-0">
                          {placement.mockupImage ? (
                            <div className="border border-gray-200 rounded-lg">
                              <img
                                src={getImageUrl(placement.mockupImage)}
                                alt={`${getPlacementLabel(placement.type)} mockup`}
                                className="w-20 h-20 sm:w-32 sm:h-32 object-cover"
                                onError={(e) => {
                                  e.target.src =
                                    "https://via.placeholder.com/150?text=No+Image";
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-20 sm:w-32 sm:h-32 bg-light border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center">
                              <i className="fas fa-image text-gray text-base sm:text-2xl mb-0.5 sm:mb-1"></i>
                              <span className="text-[8px] sm:text-xs text-gray">
                                No mockup
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Colors and Screen Assignment */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                            Pantone Colors & Screen Assignment
                          </h4>

                          {/* No screens warning */}
                          {screenInventory.length === 0 && (
                            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <p className="text-xs text-yellow-700">
                                <i className="fas fa-exclamation-triangle mr-1"></i>
                                No screens available in inventory. Please add
                                screens first.
                              </p>
                            </div>
                          )}

                          <div className="grid grid-cols-1 gap-3">
                            {Array.from({
                              length: parseInt(placement.colorCount),
                            }).map((_, index) => {
                              const currentScreenId =
                                placement.screens?.[`color_${index + 1}`];
                              const pantoneColor =
                                placement.pantones?.[`color_${index + 1}`];

                              // Find screen details from order.screenAssignment if available
                              const assignmentFromOrder =
                                order.screenAssignment?.find(
                                  (a) =>
                                    a.placement_id === placement.id &&
                                    a.color_index === index + 1,
                                );

                              return (
                                <div
                                  key={index}
                                  className="bg-light rounded-lg p-2 sm:p-3 border border-gray-200"
                                >
                                  <div className="flex flex-col gap-2">
                                    {/* Color Info */}
                                    <div className="flex items-center gap-2">
                                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                        <span className="text-[8px] sm:text-xs font-medium text-primary">
                                          {index + 1}
                                        </span>
                                      </div>
                                      <div>
                                        <p className="text-[8px] sm:text-xs text-gray-500">
                                          Color {index + 1}
                                        </p>
                                        <p className="text-xs sm:text-sm font-medium text-primary">
                                          <i className="fas fa-droplet mr-1 text-xs text-gray-500"></i>
                                          {pantoneColor || "Not set"}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Screen Selection */}
                                    <div className="ml-6 sm:ml-7 relative">
                                      <Select
                                        label={`Assign Screen for Color ${index + 1}`}
                                        name={`screen_${placement.id}_${index}`}
                                        options={getScreenOptions(
                                          currentScreenId,
                                        )}
                                        value={currentScreenId || ""}
                                        onChange={(e) =>
                                          handleScreenAssignment(
                                            placement.id,
                                            index,
                                            e,
                                          )
                                        }
                                        placeholder={
                                          screenInventory.length === 0
                                            ? "No screens available"
                                            : "Select a screen"
                                        }
                                        searchable
                                        disabled={screenInventory.length === 0}
                                        icon={
                                          <i className="fas fa-film text-gray"></i>
                                        }
                                      />

                                      {/* Selected Screen Details */}
                                      {currentScreenId && (
                                        <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                                          <p className="text-[10px] sm:text-xs font-medium text-gray-700 mb-1">
                                            Selected Screen:
                                          </p>
                                          {(() => {
                                            const screen =
                                              getScreenById(currentScreenId);
                                            return screen ? (
                                              <div className="flex items-center justify-between">
                                                <div>
                                                  <p className="text-xs sm:text-sm font-medium text-primary">
                                                    {screen.address}
                                                  </p>
                                                  <p className="text-[8px] sm:text-xs text-gray-500">
                                                    Mesh: {screen.mesh_count} |
                                                    Size: {screen.size}
                                                  </p>
                                                  {screen.total_use > 0 && (
                                                    <p className="text-[8px] sm:text-xs text-gray-400">
                                                      Used: {screen.total_use}{" "}
                                                      times
                                                    </p>
                                                  )}
                                                </div>
                                                <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[8px] sm:text-xs rounded-full">
                                                  Assigned
                                                </span>
                                              </div>
                                            ) : null;
                                          })()}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Screen Summary Table */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="px-3 sm:px-4 py-2 sm:py-3 bg-light border-b border-gray-200">
          <h2 className="text-xs sm:text-sm font-medium text-primary">
            <i className="fas fa-list mr-1.5 sm:mr-2"></i>
            Screen Summary
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px] sm:text-sm">
            <thead className="bg-light/50 text-gray-600">
              <tr>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">
                  Placement
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Color</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Pantone</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">
                  Screen Address
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Mesh</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Size</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {screenData.placements.map((placement) =>
                Array.from({ length: parseInt(placement.colorCount) }).map(
                  (_, index) => {
                    const screenId = placement.screens?.[`color_${index + 1}`];
                    const screen = screenId ? getScreenById(screenId) : null;
                    const pantoneColor =
                      placement.pantones?.[`color_${index + 1}`];

                    return (
                      <tr
                        key={`${placement.id}-${index}`}
                        className="hover:bg-light/50"
                      >
                        <td className="px-2 sm:px-4 py-1.5 sm:py-2 font-medium">
                          <span className="text-[10px] sm:text-sm">
                            {getPlacementLabel(placement.type)}
                          </span>
                        </td>
                        <td className="px-2 sm:px-4 py-1.5 sm:py-2">
                          <span className="text-[10px] sm:text-sm">
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-2 sm:px-4 py-1.5 sm:py-2">
                          <span className="font-mono text-[10px] sm:text-sm">
                            {pantoneColor || "—"}
                          </span>
                        </td>
                        <td className="px-2 sm:px-4 py-1.5 sm:py-2">
                          {screen ? (
                            <span className="text-[10px] sm:text-sm font-medium text-primary">
                              {screen.address}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-[10px] sm:text-sm">
                              —
                            </span>
                          )}
                        </td>
                        <td className="px-2 sm:px-4 py-1.5 sm:py-2">
                          {screen ? (
                            <span className="text-[10px] sm:text-sm">
                              {screen.mesh_count}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-[10px] sm:text-sm">
                              —
                            </span>
                          )}
                        </td>
                        <td className="px-2 sm:px-4 py-1.5 sm:py-2">
                          {screen ? (
                            <span className="text-[10px] sm:text-sm">
                              {screen.size}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-[10px] sm:text-sm">
                              —
                            </span>
                          )}
                        </td>
                        <td className="px-2 sm:px-4 py-1.5 sm:py-2">
                          {screen ? (
                            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-100 text-green-700 text-[8px] sm:text-xs rounded-full">
                              Assigned
                            </span>
                          ) : (
                            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-yellow-100 text-yellow-700 text-[8px] sm:text-xs rounded-full">
                              Pending
                            </span>
                          )}
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

      {/* Artist Notes */}
      {screenData.notes && (
        <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
          <h2 className="text-xs sm:text-md font-medium mb-1.5 sm:mb-2 text-primary">
            <i className="fas fa-pencil-alt mr-1.5 sm:mr-2 text-primary text-xs sm:text-sm"></i>
            Artist Notes
          </h2>
          <p className="text-[10px] sm:text-sm text-gray-600 bg-light p-2 sm:p-3 rounded-lg">
            {screenData.notes}
          </p>
        </div>
      )}

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
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md transition-colors text-xs sm:text-sm flex items-center ${
            areAllScreensAssigned() && screenInventory.length > 0 && !submitting
              ? "bg-primary text-white hover:bg-secondary cursor-pointer"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          disabled={
            !areAllScreensAssigned() ||
            screenInventory.length === 0 ||
            submitting
          }
          onClick={handleSubmit}
        >
          {submitting ? (
            <>
              <i className="fas fa-spinner fa-spin mr-1 sm:mr-2"></i>
              Submitting...
            </>
          ) : (
            <>
              <i className="fas fa-check mr-1 sm:mr-2"></i>
              {hasExistingAssignments ? "Update Screens" : "Mark Screens Ready"}
            </>
          )}
        </button>
      </div>
    </section>
  );
};

export default ScreenMaking;
