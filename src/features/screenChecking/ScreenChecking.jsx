import React, { useState, useEffect } from "react";
import { ScreenCheckingApi } from "../../api/ScreenCheckingApi";

const ScreenChecking = ({ order, onSuccess, onError }) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

  const [screenData, setScreenData] = useState({
    notes: order?.orderDesign?.notes || "",
    sizeLabelImage: null,
    placements: [],
  });

  // Track expanded placements
  const [expandedPlacements, setExpandedPlacements] = useState({});

  // Track checked screens and their status
  const [screenChecks, setScreenChecks] = useState({});

  // Track issues/comments for screens
  const [screenIssues, setScreenIssues] = useState({});

  // Track overall verification status
  const [verificationStatus, setVerificationStatus] = useState({
    overall: "pending",
    verifiedCount: 0,
    totalCount: 0,
  });

  // Screen inventory data from screenAssignment
  const [screenInventory, setScreenInventory] = useState([]);

  // Current screen checking data (most recent)
  const [currentScreenCheck, setCurrentScreenCheck] = useState(null);

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Helper function to get image URL
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

  // Load existing screen checking data from order prop
  useEffect(() => {
    if (order?.screenChecking && order.screenChecking.length > 0) {
      // Get the most recent screen checking record (assuming they're ordered by created_at desc)
      const latestCheck = order.screenChecking[0]; // or sort if needed
      console.log("Latest screen check:", latestCheck);
      setCurrentScreenCheck(latestCheck);

      if (latestCheck && latestCheck.items) {
        // Pre-fill screen checks with existing data
        const preFilledChecks = {};
        const preFilledIssues = {};

        latestCheck.items.forEach((item) => {
          const key = `${item.placement_id}-${item.color_index - 1}-${item.screen_id}`;
          preFilledChecks[key] = {
            clean: item.clean === true || item.clean === 1,
            no_damage: item.no_damage === true || item.no_damage === 1,
            emulsion_ok: item.emulsion_ok === true || item.emulsion_ok === 1,
            verified: item.verified === true || item.verified === 1,
            updatedAt: item.verified_at || new Date().toISOString(),
          };

          if (item.issues) {
            preFilledIssues[key] = item.issues;
          }
        });

        setScreenChecks(preFilledChecks);
        setScreenIssues(preFilledIssues);
      }
    }
  }, [order]);

  // Initialize data from props
  useEffect(() => {
    if (order?.orderDesign?.placements && order?.screenAssignment) {
      console.log("Order data:", order);

      // Build screen inventory from assignments
      const inventoryMap = new Map();
      order.screenAssignment.forEach((assignment) => {
        if (assignment.screen && !inventoryMap.has(assignment.screen.id)) {
          inventoryMap.set(assignment.screen.id, {
            ...assignment.screen,
            condition: determineScreenCondition(assignment.screen),
          });
        }
      });
      setScreenInventory(Array.from(inventoryMap.values()));

      // Transform placements data
      const transformedPlacements = order.orderDesign.placements.map(
        (placement) => {
          // Get assignments for this placement
          const placementAssignments = order.screenAssignment.filter(
            (a) => a.placement_id === placement.id,
          );

          // Build screens object
          const screens = {};
          const pantones = { ...placement.pantones };

          placementAssignments.forEach((assignment) => {
            const colorKey = `color_${assignment.color_index}`;
            screens[colorKey] = assignment.screen_id;
          });

          return {
            id: placement.id,
            colorCount: Object.keys(placement.pantones || {}).length.toString(),
            mockupImage: getImageUrl(placement.mockup_image),
            pantones: pantones,
            type: placement.type,
            screens: screens,
          };
        },
      );

      setScreenData({
        notes: order.orderDesign.notes || "",
        sizeLabelImage: getImageUrl(order.orderDesign.size_label),
        placements: transformedPlacements,
      });

      // Auto-expand first placement
      if (transformedPlacements.length > 0) {
        setExpandedPlacements({
          [transformedPlacements[0].id]: true,
        });
      }
    }
  }, [order, baseUrl]);

  // Update verification counts when screenChecks change
  useEffect(() => {
    updateVerificationCounts();
  }, [screenChecks, screenData.placements]);

  // Helper function to determine screen condition based on available data
  const determineScreenCondition = (screen) => {
    if (screen.total_use > 100) {
      return "Needs Maintenance";
    } else if (screen.total_use > 50) {
      return "Fair";
    } else {
      return "Good";
    }
  };

  // Helper function to get placement label
  const getPlacementLabel = (type) => {
    const placementLabels = {
      left_chest: "Left Chest",
      center_chest: "Center Chest",
      right_chest: "Right Chest",
      center_back: "Center Back",
      full_back: "Full Back",
      left_sleeve: "Left Sleeve",
      right_sleeve: "Right Sleeve",
      upper_back: "Upper Back",
    };
    return (
      placementLabels[type] ||
      type?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) ||
      "Unknown Placement"
    );
  };

  // Get screen condition class
  const getScreenConditionClass = (condition) => {
    switch (condition?.toLowerCase()) {
      case "good":
        return "text-green-600 bg-green-50";
      case "fair":
        return "text-yellow-600 bg-yellow-50";
      case "needs maintenance":
        return "text-orange-600 bg-orange-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  // Toggle placement expansion
  const togglePlacement = (placementId) => {
    setExpandedPlacements((prev) => ({
      ...prev,
      [placementId]: !prev[placementId],
    }));
  };

  const handleScreenCheck = (
    placementId,
    colorIndex,
    screenId,
    field,
    value,
  ) => {
    const key = `${placementId}-${colorIndex}-${screenId}`;

    setScreenChecks((prev) => {
      const boolValue = value === true;

      const updated = {
        ...prev,
        [key]: {
          ...prev[key],
          [field]: boolValue,
          updatedAt: new Date().toISOString(),
        },
      };

      return updated;
    });
  };

  // Handle issue/comment change
  const handleIssueChange = (placementId, colorIndex, screenId, value) => {
    const key = `${placementId}-${colorIndex}-${screenId}`;
    setScreenIssues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Update verification counts
  const updateVerificationCounts = () => {
    let verified = 0;
    let total = 0;

    screenData.placements.forEach((placement) => {
      Object.entries(placement.screens).forEach(([colorKey, screenId]) => {
        if (screenId) {
          total++;
          const colorIndex = parseInt(colorKey.split("_")[1]) - 1;
          const key = `${placement.id}-${colorIndex}-${screenId}`;
          if (screenChecks[key]?.verified) {
            verified++;
          }
        }
      });
    });

    setVerificationStatus({
      overall:
        verified === total && total > 0
          ? "verified"
          : verified > 0
            ? "in_progress"
            : "pending",
      verifiedCount: verified,
      totalCount: total,
    });
  };

  // Get screen details by ID
  const getScreenById = (id) => {
    return (
      screenInventory.find((s) => s.id === id) ||
      order?.screenAssignment?.find((a) => a.screen_id === id)?.screen ||
      null
    );
  };

  // Calculate total screens to check
  const getTotalScreensToCheck = () => {
    let total = 0;
    screenData.placements.forEach((placement) => {
      Object.values(placement.screens).forEach((screenId) => {
        if (screenId) total++;
      });
    });
    return total;
  };

  // Get verification status badge
  const getVerificationBadge = (status) => {
    switch (status) {
      case "verified":
        return (
          <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[8px] sm:text-xs rounded-full">
            Verified
          </span>
        );
      case "in_progress":
        return (
          <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-[8px] sm:text-xs rounded-full">
            In Progress
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-[8px] sm:text-xs rounded-full">
            Pending
          </span>
        );
    }
  };

  const handleSubmit = async () => {
    if (getTotalScreensToCheck() === 0) {
      setSubmitError("No screens to verify");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const screens = [];

      for (const placement of screenData.placements) {
        for (const [colorKey, screenId] of Object.entries(placement.screens)) {
          if (!screenId) continue;

          const colorIndex = Number(colorKey.split("_")[1]);
          const key = `${placement.id}-${colorIndex - 1}-${screenId}`;

          const screenCheck = screenChecks[key] || {};
          const issue = screenIssues[key] || "";

          const clean = screenCheck.clean === true ? true : false;
          const noDamage = screenCheck.no_damage === true ? true : false;
          const emulsion = screenCheck.emulsion_ok === true ? true : false;
          const verified = screenCheck.verified === true ? true : false;

          const screenItem = {
            placement_id: placement.id,
            screen_id: screenId,
            color_index: colorIndex,
            pantone: placement.pantones?.[`color_${colorIndex}`] || null,
            checks: {
              clean: clean,
              no_damage: noDamage,
              emulsion_ok: emulsion,
              verified: verified,
            },
            issues: issue && issue.trim() !== "" ? issue : null,
            verified_at: verified
              ? screenCheck.updatedAt
                ? screenCheck.updatedAt.split("T")[0]
                : new Date().toISOString().split("T")[0]
              : null,
          };

          screens.push(screenItem);
        }
      }

      if (screens.length === 0) {
        setSubmitError("No screens to verify");
        setIsSubmitting(false);
        return;
      }

      // Determine status based on verification progress
      let status = "in_progress";
      if (
        verificationStatus.verifiedCount === verificationStatus.totalCount &&
        verificationStatus.totalCount > 0
      ) {
        status = "completed";
      } else if (verificationStatus.verifiedCount === 0) {
        status = "pending";
      }

      // Prepare payload
      const payload = {
        order_id: order.id,
        status: status,
        verification_date: new Date().toISOString().split("T")[0],
        screens: screens,
      };

      // If we have an existing screen check, update it, otherwise create new
      let response = await ScreenCheckingApi.create(payload);

      onSuccess?.(response);
    } catch (error) {
      console.error("Submission error:", error);
      console.error("Error response:", error.response?.data);

      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const errorMessages = Object.values(validationErrors).flat().join(", ");
        setSubmitError(`Validation failed: ${errorMessages}`);
      } else {
        setSubmitError(
          error.response?.data?.message || "Submission failed. Try again.",
        );
      }

      onError?.([error]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get screen address safely
  const getScreenAddress = (screen) => {
    return screen?.address || "No address";
  };

  // Get screen mesh count safely
  const getScreenMeshCount = (screen) => {
    return screen?.mesh_count || "N/A";
  };

  // Get screen size safely
  const getScreenSize = (screen) => {
    return screen?.size || "N/A";
  };

  // Get screen condition safely
  const getScreenCondition = (screen) => {
    return screen?.condition || "Good";
  };

  // Get screen total use
  const getScreenTotalUse = (screen) => {
    return screen?.total_use || 0;
  };

  // If no data, show loading or empty state
  if (!order?.orderDesign?.placements || !order?.screenAssignment) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[50vh]">
        <div className="text-center">
          <i className="fas fa-warning text-gray-500 text-3xl mb-2"></i>
          <p className="text-gray-500">
            Complete Screen Making & Screen Checking First
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-y-4 sm:gap-y-6 font-poppins">
      {/* Error Message */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2 text-red-700">
            <i className="fas fa-exclamation-circle"></i>
            <span className="text-xs sm:text-sm">{submitError}</span>
          </div>
        </div>
      )}

      {/* Success Message if there are existing checks */}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-5">
        <div className="flex-1 min-w-0">
          <h1 className="text-base sm:text-xl font-semibold text-primary truncate">
            Screen Checking
          </h1>
          <p className="text-[10px] sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
            Verify all printing screens to ensure screens are clean, undamaged,
            and properly prepared.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] sm:text-sm text-gray flex items-center shrink-0">
            <i className="fas fa-film mr-1 text-primary"></i>
            {screenData.placements.reduce(
              (total, p) => total + parseInt(p.colorCount || 0),
              0,
            )}{" "}
            total screens
          </span>
          <span className="text-[10px] sm:text-sm text-green-600 flex items-center shrink-0">
            <i className="fas fa-check-circle mr-1"></i>
            {getTotalScreensToCheck()} assigned,{" "}
            {verificationStatus.verifiedCount} verified
          </span>
        </div>
      </div>

      {currentScreenCheck && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2 text-blue-700">
            <i className="fas fa-info-circle"></i>
            <span className="text-xs sm:text-sm">
              Loaded existing screen checking data from{" "}
              {(() => {
                const dt = new Date(currentScreenCheck.created_at);
                const date = dt.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });
                const time = dt.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                });
                return `${date} ${time}`;
              })()}
            </span>
          </div>
        </div>
      )}

      {/* Summary Cards */}
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
                {screenData.placements.reduce(
                  (total, p) => total + parseInt(p.colorCount || 0),
                  0,
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <i className="fas fa-check-circle text-primary text-sm sm:text-base"></i>
            </div>
            <div>
              <p className="text-[10px] sm:text-sm text-gray-500">Assigned</p>
              <p className="text-lg sm:text-2xl font-semibold text-primary">
                {getTotalScreensToCheck()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <i className="fas fa-clipboard-check text-primary text-sm sm:text-base"></i>
            </div>
            <div>
              <p className="text-[10px] sm:text-sm text-gray-500">Status</p>
              <div className="mt-1">
                {getVerificationBadge(verificationStatus.overall)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Size Label Image Section */}
      {screenData.sizeLabelImage && (
        <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
          <h2 className="text-xs sm:text-md font-medium mb-2 sm:mb-3 text-primary">
            <i className="fas fa-tag mr-1.5 sm:mr-2 text-primary text-xs sm:text-sm"></i>
            Size Label Reference
          </h2>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-20 h-20 sm:w-32 sm:h-32 border border-gray-200 rounded-lg overflow-hidden">
              <img
                src={screenData.sizeLabelImage}
                alt="Size label"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/placeholder-image.png";
                }}
              />
            </div>
            <div>
              <p className="text-[10px] sm:text-sm text-gray-600">
                Use this as reference when checking screens
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Screens to Check */}
      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-sm sm:text-md font-medium text-primary">
          <i className="fas fa-clipboard-list mr-1.5 sm:mr-2 text-primary text-xs sm:text-sm"></i>
          Screens to Verify
        </h2>

        <div className="space-y-2 sm:space-y-3">
          {screenData.placements.map((placement) => {
            const isExpanded = expandedPlacements[placement.id] || false;
            const assignedCount = Object.values(placement.screens).filter(
              (id) => id,
            ).length;
            const totalCount = parseInt(placement.colorCount);

            return (
              <div
                key={placement.id}
                className="rounded-lg border border-gray-200 bg-white overflow-hidden"
              >
                {/* Placement Header - Clickable */}
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
                      <span className="text-[8px] sm:text-xs text-gray-500">
                        {assignedCount}/{totalCount} assigned
                      </span>
                    </div>
                  </div>
                </button>

                {/* Placement Content - Collapsible */}
                {isExpanded && (
                  <div className="p-3 sm:p-4">
                    <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                      {/* Mockup Image */}
                      <div className="md:w-32 shrink-0">
                        {placement.mockupImage ? (
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <img
                              src={placement.mockupImage}
                              alt={`${getPlacementLabel(placement.type)} mockup`}
                              className="w-20 h-20 sm:w-32 sm:h-32 object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/placeholder-image.png";
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

                      {/* Screens to Check */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                          Screen Verification Checklist
                        </h4>
                        <div className="grid grid-cols-1 gap-4">
                          {Array.from({
                            length: parseInt(placement.colorCount),
                          }).map((_, index) => {
                            const colorKey = `color_${index + 1}`;
                            const screenId = placement.screens?.[colorKey];
                            const screen = screenId
                              ? getScreenById(screenId)
                              : null;

                            // If no screen assigned, show placeholder
                            if (!screen) {
                              return (
                                <div
                                  key={index}
                                  className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200 border-dashed"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-200 flex items-center justify-center">
                                      <span className="text-[8px] sm:text-xs font-medium text-gray-500">
                                        {index + 1}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="text-xs sm:text-sm font-medium text-gray-400">
                                        No Screen Assigned
                                      </p>
                                      <p className="text-[8px] sm:text-xs text-gray-400">
                                        Color:{" "}
                                        {placement.pantones[colorKey] ||
                                          "Not set"}
                                      </p>
                                    </div>
                                    <span className="ml-auto px-2 py-1 bg-gray-200 text-gray-500 text-[8px] sm:text-xs rounded-full">
                                      Not Assigned
                                    </span>
                                  </div>
                                </div>
                              );
                            }

                            const checkKey = `${placement.id}-${index}-${screenId}`;
                            const screenCheck = screenChecks[checkKey] || {};
                            const issue = screenIssues[checkKey] || "";

                            return (
                              <div
                                key={index}
                                className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200"
                              >
                                <div className="flex flex-col gap-3">
                                  {/* Screen Info Header */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                        <span className="text-[8px] sm:text-xs font-medium text-primary">
                                          {index + 1}
                                        </span>
                                      </div>
                                      <div>
                                        <p className="text-xs sm:text-sm font-medium text-primary">
                                          {getScreenAddress(screen)}
                                        </p>
                                        <p className="text-[8px] sm:text-xs text-gray-500">
                                          Color: {placement.pantones[colorKey]}{" "}
                                          | Mesh: {getScreenMeshCount(screen)} |
                                          Size: {getScreenSize(screen)} | Uses:{" "}
                                          {getScreenTotalUse(screen)}
                                        </p>
                                      </div>
                                    </div>
                                    <span
                                      className={`px-2 py-1 rounded-full text-[8px] sm:text-xs ${getScreenConditionClass(getScreenCondition(screen))}`}
                                    >
                                      {getScreenCondition(screen)}
                                    </span>
                                  </div>

                                  {/* Verification Checklist */}
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 ml-6 sm:ml-7">
                                    <label className="flex items-center gap-2 p-2 bg-light rounded border border-gray-200">
                                      <input
                                        type="checkbox"
                                        checked={screenCheck.clean || false}
                                        onChange={(e) =>
                                          handleScreenCheck(
                                            placement.id,
                                            index,
                                            screenId,
                                            "clean",
                                            e.target.checked,
                                          )
                                        }
                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                      />
                                      <span className="text-[10px] sm:text-xs text-gray-700">
                                        Clean
                                      </span>
                                    </label>

                                    <label className="flex items-center gap-2 p-2 bg-light rounded border border-gray-200">
                                      <input
                                        type="checkbox"
                                        checked={screenCheck.no_damage || false}
                                        onChange={(e) =>
                                          handleScreenCheck(
                                            placement.id,
                                            index,
                                            screenId,
                                            "no_damage",
                                            e.target.checked,
                                          )
                                        }
                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                      />
                                      <span className="text-[10px] sm:text-xs text-gray-700">
                                        No Damage
                                      </span>
                                    </label>

                                    <label className="flex items-center gap-2 p-2 bg-light rounded border border-gray-200">
                                      <input
                                        type="checkbox"
                                        checked={
                                          screenCheck.emulsion_ok || false
                                        }
                                        onChange={(e) =>
                                          handleScreenCheck(
                                            placement.id,
                                            index,
                                            screenId,
                                            "emulsion_ok",
                                            e.target.checked,
                                          )
                                        }
                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                      />
                                      <span className="text-[10px] sm:text-xs text-gray-700">
                                        Emulsion OK
                                      </span>
                                    </label>
                                  </div>

                                  {/* Verification Status and Comments */}
                                  <div className="flex flex-col sm:flex-row items-start gap-2 ml-6 sm:ml-7">
                                    <label className="flex items-center gap-2 p-2 bg-light rounded border border-gray-200 flex-1">
                                      <input
                                        type="checkbox"
                                        checked={screenCheck.verified || false}
                                        onChange={(e) =>
                                          handleScreenCheck(
                                            placement.id,
                                            index,
                                            screenId,
                                            "verified",
                                            e.target.checked,
                                          )
                                        }
                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                      />
                                      <span className="text-[10px] sm:text-xs font-medium text-gray-700">
                                        Mark as Verified
                                      </span>
                                    </label>

                                    {screenCheck.verified && (
                                      <span className="px-2 py-1 bg-green-100 text-green-700 text-[8px] sm:text-xs rounded-full">
                                        Verified{" "}
                                        {screenCheck.updatedAt
                                          ? new Date(
                                              screenCheck.updatedAt,
                                            ).toLocaleTimeString()
                                          : ""}
                                      </span>
                                    )}
                                  </div>

                                  {/* Issues/Comments */}
                                  <div className="ml-6 sm:ml-7">
                                    <textarea
                                      placeholder="Add any issues or comments..."
                                      value={issue}
                                      onChange={(e) =>
                                        handleIssueChange(
                                          placement.id,
                                          index,
                                          screenId,
                                          e.target.value,
                                        )
                                      }
                                      rows="2"
                                      className="w-full px-3 py-2 text-[10px] sm:text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-light"
                                    />
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
          })}
        </div>
      </div>

      {/* Verification Summary Table */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="px-3 sm:px-4 py-2 sm:py-3 bg-light border-b border-gray-200">
          <h2 className="text-xs sm:text-sm font-medium text-primary">
            <i className="fas fa-table mr-1.5 sm:mr-2"></i>
            Verification Summary
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
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">
                  Condition
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Checks</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {screenData.placements.map((placement) =>
                Array.from({ length: parseInt(placement.colorCount) }).map(
                  (_, index) => {
                    const colorKey = `color_${index + 1}`;
                    const screenId = placement.screens?.[colorKey];
                    const screen = screenId ? getScreenById(screenId) : null;

                    if (!screen) {
                      return (
                        <tr
                          key={`${placement.id}-${index}`}
                          className="bg-gray-50"
                        >
                          <td className="px-2 sm:px-4 py-1.5 sm:py-2 font-medium">
                            <span className="text-[10px] sm:text-sm text-gray-400">
                              {getPlacementLabel(placement.type)}
                            </span>
                          </td>
                          <td className="px-2 sm:px-4 py-1.5 sm:py-2">
                            <span className="text-[10px] sm:text-sm text-gray-400">
                              {index + 1}
                            </span>
                          </td>
                          <td className="px-2 sm:px-4 py-1.5 sm:py-2">
                            <span className="font-mono text-[10px] sm:text-sm text-gray-400">
                              {placement.pantones[colorKey]}
                            </span>
                          </td>
                          <td className="px-2 sm:px-4 py-1.5 sm:py-2">
                            <span className="text-gray-400 text-[10px] sm:text-sm">
                              Not Assigned
                            </span>
                          </td>
                          <td className="px-2 sm:px-4 py-1.5 sm:py-2">
                            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-400 text-[8px] sm:text-xs rounded-full">
                              —
                            </span>
                          </td>
                          <td className="px-2 sm:px-4 py-1.5 sm:py-2">
                            <span className="text-gray-400 text-[10px] sm:text-sm">
                              0/3
                            </span>
                          </td>
                          <td className="px-2 sm:px-4 py-1.5 sm:py-2">
                            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-400 text-[8px] sm:text-xs rounded-full">
                              Not Ready
                            </span>
                          </td>
                        </tr>
                      );
                    }

                    const checkKey = `${placement.id}-${index}-${screenId}`;
                    const screenCheck = screenChecks[checkKey] || {};
                    const checksPassed = [
                      screenCheck.clean,
                      screenCheck.no_damage,
                      screenCheck.emulsion_ok,
                    ].filter(Boolean).length;

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
                            {placement.pantones[colorKey]}
                          </span>
                        </td>
                        <td className="px-2 sm:px-4 py-1.5 sm:py-2">
                          <span className="text-[10px] sm:text-sm font-medium text-primary">
                            {getScreenAddress(screen)}
                          </span>
                        </td>
                        <td className="px-2 sm:px-4 py-1.5 sm:py-2">
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[8px] sm:text-xs ${getScreenConditionClass(getScreenCondition(screen))}`}
                          >
                            {getScreenCondition(screen)}
                          </span>
                        </td>
                        <td className="px-2 sm:px-4 py-1.5 sm:py-2">
                          <span className="text-[10px] sm:text-sm">
                            {checksPassed}/3
                          </span>
                        </td>
                        <td className="px-2 sm:px-4 py-1.5 sm:py-2">
                          {screenCheck.verified ? (
                            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-100 text-green-700 text-[8px] sm:text-xs rounded-full">
                              Verified
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

      {/* Action Buttons */}
      {/* Action Buttons */}
      <div className="flex justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200">
        {/* <button className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-md border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors flex items-center">
    <i className="fas fa-print mr-1.5 text-gray-400"></i>
    Print Report
  </button> */}
        <button
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md transition-colors text-xs sm:text-sm flex items-center ${
            getTotalScreensToCheck() > 0 && !isSubmitting
              ? "bg-primary text-white hover:bg-secondary cursor-pointer"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          disabled={getTotalScreensToCheck() === 0 || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <>
              <i className="fas fa-spinner fa-spin mr-1 sm:mr-2"></i>
              Submitting...
            </>
          ) : (
            <>
              <i className="fas fa-save mr-1 sm:mr-2"></i>
              {currentScreenCheck ? "Update Progress" : "Save Progress"}
            </>
          )}
        </button>
      </div>
    </section>
  );
};

export default ScreenChecking;
