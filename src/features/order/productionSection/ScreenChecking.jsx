import React, { useState } from "react";

const ScreenChecking = ({ order }) => {
  // Track expanded placements
  const [expandedPlacements, setExpandedPlacements] = useState({});

  // Sample data structure based on the provided data (after assignment)
  const [screenData, setScreenData] = useState({
    notes: "Artist Noteasdasd",
    placement_type: "",
    sizeLabelImage: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAA",
    placements: [
      {
        colorCount: "3",
        id: 1773187362473,
        mockupImage: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQABAA",
        pantones: {
          color_1: "aa",
          color_2: "cc",
          color_3: "dddd",
        },
        type: "center_chest",
        screens: {
          color_1: 2,
          color_2: 3,
          color_3: 4,
        },
      },
      {
        colorCount: "7",
        id: 1773187370516,
        mockupImage: null,
        pantones: {
          color_1: "asdas",
          color_2: "23423",
          color_3: "dasd",
          color_4: "xcvc",
          color_5: "zxcz",
          color_6: "qweq",
          color_7: "rtyr",
        },
        type: "upper_back",
        screens: {
          color_1: 5,
          color_2: 6,
          color_3: null,
          color_4: null,
          color_5: null,
          color_6: null,
          color_7: null,
        },
      },
    ],
  });

  // Track checked screens and their status
  const [screenChecks, setScreenChecks] = useState({});

  // Track issues/comments for screens
  const [screenIssues, setScreenIssues] = useState({});

  // Track overall verification status
  const [verificationStatus, setVerificationStatus] = useState({
    overall: "pending", // pending, in_progress, verified
    verifiedCount: 0,
    totalCount: 0,
  });

  // Screen inventory data from API
  const [screenInventory] = useState([
    {
      id: 2,
      name: "Carla Harmon",
      mesh_count: "75",
      address: "21x25-120-113",
      size: "21x25",
      last_maintenance: null,
      total_use: 0,
      condition: "Good",
      created_at: "2026-03-11T00:45:19.000000Z",
      updated_at: "2026-03-11T00:45:19.000000Z",
    },
    {
      id: 3,
      name: "John Smith",
      mesh_count: "110",
      address: "21x25-120-114",
      size: "21x25",
      last_maintenance: "2026-02-15",
      total_use: 45,
      condition: "Good",
      created_at: "2026-01-10T00:45:19.000000Z",
      updated_at: "2026-03-10T00:45:19.000000Z",
    },
    {
      id: 4,
      name: "Jane Doe",
      mesh_count: "156",
      address: "21x25-120-115",
      size: "21x25",
      last_maintenance: "2026-03-01",
      total_use: 23,
      condition: "Needs Cleaning",
      created_at: "2026-02-05T00:45:19.000000Z",
      updated_at: "2026-03-11T00:45:19.000000Z",
    },
    {
      id: 5,
      name: "Bob Johnson",
      mesh_count: "230",
      address: "21x25-120-116",
      size: "21x25",
      last_maintenance: "2026-02-28",
      total_use: 67,
      condition: "Good",
      created_at: "2025-12-15T00:45:19.000000Z",
      updated_at: "2026-03-09T00:45:19.000000Z",
    },
    {
      id: 6,
      name: "Bob Johnson",
      mesh_count: "230",
      address: "21x25-120-116",
      size: "21x25",
      last_maintenance: "2026-02-28",
      total_use: 67,
      condition: "Good",
      created_at: "2025-12-15T00:45:19.000000Z",
      updated_at: "2026-03-09T00:45:19.000000Z",
    },
  ]);

  // Helper function to get placement label
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

  // Get screen condition class
  const getScreenConditionClass = (condition) => {
    switch (condition?.toLowerCase()) {
      case "good":
        return "text-green-600 bg-green-50";
      case "needs cleaning":
        return "text-yellow-600 bg-yellow-50";
      case "damaged":
        return "text-red-600 bg-red-50";
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

  // Handle screen check
  const handleScreenCheck = (
    placementId,
    colorIndex,
    screenId,
    field,
    value,
  ) => {
    const key = `${placementId}-${colorIndex}-${screenId}`;

    setScreenChecks((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
        updatedAt: new Date().toISOString(),
      },
    }));

    // Update verification counts
    setTimeout(() => updateVerificationCounts(), 0);
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
    return screenInventory.find((s) => s.id === id);
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

  return (
    <section className="flex flex-col gap-y-4 sm:gap-y-6 font-poppins">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-5">
        <div className="flex-1 min-w-0">
          <h1 className="text-base sm:text-xl font-semibold text-primary truncate">
            Screen Checking
          </h1>
          <p className="text-[10px] sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
            Verify and inspect screens before production
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
                                          {screen.address}
                                        </p>
                                        <p className="text-[8px] sm:text-xs text-gray-500">
                                          Color: {placement.pantones[colorKey]}{" "}
                                          | Mesh: {screen.mesh_count} | Size:{" "}
                                          {screen.size}
                                        </p>
                                      </div>
                                    </div>
                                    <span
                                      className={`px-2 py-1 rounded-full text-[8px] sm:text-xs ${getScreenConditionClass(screen.condition)}`}
                                    >
                                      {screen.condition || "Unknown"}
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
                                        checked={screenCheck.noDamage || false}
                                        onChange={(e) =>
                                          handleScreenCheck(
                                            placement.id,
                                            index,
                                            screenId,
                                            "noDamage",
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
                                        checked={screenCheck.emulsion || false}
                                        onChange={(e) =>
                                          handleScreenCheck(
                                            placement.id,
                                            index,
                                            screenId,
                                            "emulsion",
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
                      screenCheck.noDamage,
                      screenCheck.emulsion,
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
                            {screen.address}
                          </span>
                        </td>
                        <td className="px-2 sm:px-4 py-1.5 sm:py-2">
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[8px] sm:text-xs ${getScreenConditionClass(screen.condition)}`}
                          >
                            {screen.condition || "Unknown"}
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
      <div className="flex justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200">
        <button className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-md border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors flex items-center">
          <i className="fas fa-print mr-1.5 text-gray-400"></i>
          Print Report
        </button>
        <button
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md transition-colors text-xs sm:text-sm flex items-center ${
            verificationStatus.verifiedCount === getTotalScreensToCheck() &&
            getTotalScreensToCheck() > 0
              ? "bg-primary text-white hover:bg-secondary cursor-pointer"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          disabled={
            verificationStatus.verifiedCount !== getTotalScreensToCheck() ||
            getTotalScreensToCheck() === 0
          }
          onClick={() => {
            if (
              verificationStatus.verifiedCount === getTotalScreensToCheck() &&
              getTotalScreensToCheck() > 0
            ) {
              console.log("All screens verified", {
                checks: screenChecks,
                issues: screenIssues,
                timestamp: new Date().toISOString(),
              });
            }
          }}
        >
          <i className="fas fa-check-circle mr-1 sm:mr-2"></i>
          Complete Verification
        </button>
      </div>
    </section>
  );
};

export default ScreenChecking;
