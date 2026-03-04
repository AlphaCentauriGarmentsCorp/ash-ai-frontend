import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import EquipmentLocationCard from "./EquipmentLocationCard";
import TableSearch from "../table/TableSearch";

/**
 * EquipmentLocationCardContainer Component
 * A smart component that handles card display with filtering, sorting, and pagination
 * Similar to Table.jsx but for cards
 */
const EquipmentLocationCardContainer = ({
  data = [],
  config = {
    search: true,
    searchPlaceholder: "Search...",
    pagination: false,
    layout: "vertical", // "vertical" or "grid"
  },
  onAction,
  isLoading = false,
  url,
  button,
  title,
  renderCard, // Custom render function for each card
  getCardIcon, // Function to get icon for each item
  getCardStats, // Function to get stats for each item
}) => {
  const [localData, setLocalData] = useState(data);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Handle external data updates
  useEffect(() => {
    setLocalData(data);
  }, [data]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Client-side search
  const filteredData = useMemo(() => {
    if (!searchTerm) return localData;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return localData.filter((item) => {
      // Search through name and description
      const searchableText = `${item.name || ""} ${item.description || ""}`.toLowerCase();
      return searchableText.includes(lowerSearchTerm);
    });
  }, [localData, searchTerm]);

  // Client-side pagination
  const paginatedData = useMemo(() => {
    if (!config.pagination) return filteredData;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, pageSize, config.pagination]);

  // Get layout classes
  const getLayoutClasses = () => {
    if (config.layout === "grid") {
      return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6";
    }
    return "flex flex-col gap-3 sm:gap-4 lg:gap-6";
  };

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // Handle action (edit, delete, view)
  const handleAction = (action, item) => {
    if (onAction) {
      onAction(action, item);
    }
  };

  // Render action buttons for each card
  const renderActionButtons = (item) => (
    <>
      <button
        onClick={() => handleAction("edit", item)}
        className="bg-white hover:bg-gray-50 border-2 border-gray-300 w-6 h-6 flex items-center justify-center transition"
        title="Edit"
      >
        <i className="fas fa-pen text-primary text-xs"></i>
      </button>
      <button
        onClick={() => handleAction("delete", item)}
        className="bg-white hover:bg-gray-50 border-2 border-gray-300 w-6 h-6 flex items-center justify-center transition"
        title="Delete"
      >
        <i className="fas fa-trash text-primary text-xs"></i>
      </button>
    </>
  );

  // Render view link for each card
  const renderViewLink = (item) => (
    <button
      onClick={() => handleAction("view", item)}
      className="text-white text-xs underline font-extralight"
    >
      View contents
    </button>
  );

  // Default card renderer
  const defaultRenderCard = (item) => (
    <EquipmentLocationCard
      key={item.id}
      variant="dark-header"
      title={item.name}
      subtitle={item.description}
      isHoverable={true}
      icon={getCardIcon ? getCardIcon(item) : null}
      stats={getCardStats ? getCardStats(item) : []}
      actionButtons={renderActionButtons(item)}
      viewLink={renderViewLink(item)}
    />
  );

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="w-full">
      {/* Header with Add Button and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3 sm:gap-4">
        <div className="w-full sm:w-auto">
          {url && button && (
            <Link
              to={url}
              className="cursor-pointer hover:bg-secondary/90 bg-secondary text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-normal inline-block w-full sm:w-auto text-center"
            >
              <i className="fa fa-add mr-1 sm:mr-2"></i>
              {button}
            </Link>
          )}
        </div>

        {config.search && (
          <TableSearch
            onSearch={handleSearch}
            placeholder={config.searchPlaceholder || "Search..."}
          />
        )}
      </div>

      {/* Title Section */}
      {title && (
        <div className="mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-medium text-gray-800">{title}</h2>
        </div>
      )}

      {/* Divider Line */}
      <div className="border-t border-gray-200 mb-5 sm:mb-7"></div>

      {/* Content Container - Constrained Width */}
      <div className="max-w-7xl mx-auto px-2 sm:px-3">
        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && paginatedData.length === 0 && (
          <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg border border-gray-200">
            <svg
              className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-600 text-base sm:text-lg font-normal mb-1.5 sm:mb-2">No locations found</p>
            <p className="text-gray-500 text-xs sm:text-sm">
              {searchTerm ? "Try adjusting your search" : "Add a location to get started"}
            </p>
          </div>
        )}

        {/* Cards Display */}
        {!isLoading && paginatedData.length > 0 && (
          <div className={getLayoutClasses()}>
            {paginatedData.map((item) =>
              renderCard ? renderCard(item) : defaultRenderCard(item)
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {config.pagination && totalPages > 1 && (
        <div className="max-w-7xl mx-auto px-2 sm:px-3">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 mt-4 sm:mt-6 px-3 sm:px-4 py-3 bg-white border border-gray-200 rounded-lg">
          <div className="text-xs sm:text-sm text-gray-700 font-normal">
            Showing{" "}
            <span className="font-normal">{(currentPage - 1) * pageSize + 1}</span> to{" "}
            <span className="font-normal">
              {Math.min(currentPage * pageSize, totalItems)}
            </span>{" "}
            of <span className="font-normal">{totalItems}</span> results
          </div>

          <div className="flex gap-1.5 sm:gap-2 flex-wrap justify-center">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-2.5 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-normal"
            >
              Previous
            </button>

            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-2.5 sm:px-3 py-1 text-xs sm:text-sm border rounded-lg font-normal ${
                  currentPage === index + 1
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2.5 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-normal"
            >
              Next
            </button>
          </div>
        </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentLocationCardContainer;
