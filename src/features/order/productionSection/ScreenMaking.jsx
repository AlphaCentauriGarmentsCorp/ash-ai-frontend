import React, { useState } from "react";
import Select from "../../../components/form/Select";

const ScreenMaking = ({ order }) => {
  // Track expanded placements
  const [expandedPlacements, setExpandedPlacements] = useState({});

  // Sample data structure based on the provided data
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
          color_1: null,
          color_2: null,
          color_3: null,
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
          color_1: null,
          color_2: null,
          color_3: null,
          color_4: null,
          color_5: null,
          color_6: null,
          color_7: null,
        },
      },
    ],
  });

  // Screen inventory data from API (matching your provided structure)
  const [screenInventory] = useState([
    {
      id: 2,
      name: "Carla Harmon",
      mesh_count: "75",
      address: "21x25-120-113",
      size: "21x25",
      last_maintenance: null,
      total_use: 0,
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

  // Get all currently assigned screen IDs across all placements and colors
  const getAssignedScreenIds = () => {
    const assignedIds = new Set();
    screenData.placements.forEach((placement) => {
      Object.values(placement.screens).forEach((screenId) => {
        if (screenId) assignedIds.add(screenId);
      });
    });
    return assignedIds;
  };

  // Check if all screens are assigned
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

  // Handle screen assignment (single selection)
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
  };

  // Toggle placement expansion
  const togglePlacement = (placementId) => {
    setExpandedPlacements((prev) => ({
      ...prev,
      [placementId]: !prev[placementId],
    }));
  };

  // Transform inventory for select component - filter out already assigned screens
  // except the current one
  const getScreenOptions = (currentScreenId = null) => {
    const assignedIds = getAssignedScreenIds();

    return screenInventory
      .filter((screen) => {
        // If this screen is the currently selected one for this color, show it
        if (screen.id === currentScreenId) return true;
        // Otherwise, only show if not assigned elsewhere
        return !assignedIds.has(screen.id);
      })
      .map((screen) => ({
        value: screen.id,
        label: `${screen.address} | Mesh: ${screen.mesh_count} | Size: ${screen.size}`,
      }));
  };

  // Get screen details by ID
  const getScreenById = (id) => {
    return screenInventory.find((s) => s.id === id);
  };

  // Calculate total assigned screens
  const getTotalAssignedScreens = () => {
    let total = 0;
    screenData.placements.forEach((placement) => {
      Object.values(placement.screens).forEach((screen) => {
        if (screen) total++;
      });
    });
    return total;
  };

  // Get count of assigned screens for a placement
  const getPlacementAssignedCount = (placement) => {
    let count = 0;
    Object.values(placement.screens).forEach((screenId) => {
      if (screenId) count++;
    });
    return count;
  };

  return (
    <section className="flex flex-col gap-y-4 sm:gap-y-6 font-poppins">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-5">
        <div className="flex-1 min-w-0">
          <h1 className="text-base sm:text-xl font-semibold text-primary truncate">
            Screen Making
          </h1>
          <p className="text-[10px] sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
            Review and manage screens needed for this order based on graphic
            data.
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
            {getTotalAssignedScreens()} assigned
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <i className="fas fa-print text-primary text-sm sm:text-base"></i>
            </div>
            <div>
              <p className="text-[10px] sm:text-sm text-gray-500">
                Total Placements
              </p>
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

      {/* Size Label Image Section */}
      {screenData.sizeLabelImage && (
        <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
          <h2 className="text-xs sm:text-md font-medium mb-2 sm:mb-3 text-primary">
            <i className="fas fa-tag mr-1.5 sm:mr-2 text-primary text-xs sm:text-sm"></i>
            Size Label Image
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
                Size label image is available for screen reference.
              </p>
              <button className="mt-1 sm:mt-2 text-primary text-[10px] sm:text-sm hover:underline">
                <i className="fas fa-download mr-1"></i>
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screens Overview */}
      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-sm sm:text-md font-medium text-primary">
          <i className="fas fa-film mr-1.5 sm:mr-2 text-primary text-xs sm:text-sm"></i>
          Screens Required by Placement
        </h2>

        <div className="space-y-2 sm:space-y-3">
          {screenData.placements.map((placement) => {
            const isExpanded = expandedPlacements[placement.id] || false;
            const assignedCount = getPlacementAssignedCount(placement);
            const totalCount = parseInt(placement.colorCount);
            const isFullyAssigned = assignedCount === totalCount;

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
                      <span
                        className={`text-[8px] sm:text-xs ${isFullyAssigned ? "text-green-600" : "text-gray-500"}`}
                      >
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

                      {/* Screens Details with Assignment */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                          Pantone Colors & Screen Assignment
                        </h4>
                        <div className="grid grid-cols-1 gap-3">
                          {Array.from({
                            length: parseInt(placement.colorCount),
                          }).map((_, index) => {
                            const currentScreenId =
                              placement.screens?.[`color_${index + 1}`];

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
                                        {placement.pantones[
                                          `color_${index + 1}`
                                        ] || "Not set"}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Screen Select - Single Selection */}
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
                                      placeholder="Select a screen"
                                      searchable
                                      icon={
                                        <i className="fas fa-film text-gray"></i>
                                      }
                                    />

                                    {/* Selected Screen Display */}
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
          })}
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
                            {placement.pantones[`color_${index + 1}`] || "—"}
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

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200">
        <button
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md transition-colors text-xs sm:text-sm flex items-center ${
            areAllScreensAssigned()
              ? "bg-primary text-white hover:bg-secondary cursor-pointer"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          disabled={!areAllScreensAssigned()}
          onClick={() =>
            areAllScreensAssigned() && console.log("Mark screens ready")
          }
        >
          <i className="fas fa-check mr-1 sm:mr-2"></i>
          Mark Screens Ready
        </button>
      </div>
    </section>
  );
};

export default ScreenMaking;
