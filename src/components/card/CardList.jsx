import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import CardTemplate from "./CardTemplate";
import TableSearch from "../table/TableSearch";

/**
 * CardList Component
 * A smart component that handles card display with filtering, sorting, and pagination
 * Similar to Table.jsx but for cards
 */
const CardList = ({
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
      return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";
    }
    return "flex flex-col gap-6";
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
        className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
        title="Edit"
      >
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>
      <button
        onClick={() => handleAction("delete", item)}
        className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
        title="Delete"
      >
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </>
  );

  // Render view link for each card
  const renderViewLink = (item) => (
    <button
      onClick={() => handleAction("view", item)}
      className="text-white text-sm hover:underline"
    >
      View contents
    </button>
  );

  // Default card renderer
  const defaultRenderCard = (item) => (
    <CardTemplate
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
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <div>
          {url && button && (
            <Link
              to={url}
              className="cursor-pointer hover:bg-secondary/90 bg-secondary text-white px-4 py-2 rounded-lg text-sm"
            >
              <i className="fa fa-add mr-2"></i>
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
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        </div>
      )}

      {/* Divider Line */}
      <div className="border-t border-gray-200 mb-6"></div>

      {/* Content Container - Constrained Width */}
      <div className="max-w-7xl mx-auto px-3">
        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && paginatedData.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-600 text-lg font-medium mb-2">No locations found</p>
            <p className="text-gray-500 text-sm">
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
        <div className="max-w-7xl mx-auto px-3">
          <div className="flex justify-between items-center mt-6 px-4 py-3 bg-white border border-gray-200 rounded-lg">
          <div className="text-sm text-gray-700">
            Showing{" "}
            <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(currentPage * pageSize, totalItems)}
            </span>{" "}
            of <span className="font-medium">{totalItems}</span> results
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-3 py-1 text-sm border rounded-lg ${
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
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default CardList;
