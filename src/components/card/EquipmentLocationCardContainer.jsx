import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import EquipmentLocationCard from "./EquipmentLocationCard";
import TableSearch from "../table/TableSearch";

const EquipmentLocationCardContainer = ({
  data = [],
  onAction,
  isLoading = false,
  url,
  button,
}) => {
  const [localData, setLocalData] = useState(data);
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return localData;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return localData.filter((item) => {
      const searchableText =
        `${item.name || ""} ${item.description || ""}`.toLowerCase();
      return searchableText.includes(lowerSearchTerm);
    });
  }, [localData, searchTerm]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleAction = (action, item) => {
    if (onAction) {
      onAction(action, item);
    }
  };

  return (
    <div className="w-full">
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

        <TableSearch
          onSearch={handleSearch}
          placeholder="Search locations..."
        />
      </div>

      {/* Divider Line */}
      <div className="border-t border-gray-200 mb-5 sm:mb-7"></div>

      {/* Content Container - Constrained Width */}
      <div className="max-w-7xl mx-auto px-2 sm:px-3">
        {/* Empty State */}
        {!isLoading && filteredData.length === 0 && (
          <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg border border-gray-200">
            <i className="fa-solid fa-warehouse mx-auto text-4xl sm:text-5xl text-gray-400 mb-3 sm:mb-4 block"></i>

            <p className="text-gray-600 text-base sm:text-lg font-normal mb-1.5 sm:mb-2">
              No locations found
            </p>
            <p className="text-gray-500 text-xs sm:text-sm">
              {searchTerm
                ? "Try adjusting your search"
                : "Add a location to get started"}
            </p>
          </div>
        )}

        {!isLoading && filteredData.length > 0 && (
          <div className="flex flex-col gap-3 sm:gap-4 lg:gap-6">
            {filteredData.map((item) => (
              <EquipmentLocationCard
                key={item.id}
                variant="dark-header"
                data={item}
                isHoverable={true}
                handleAction={handleAction}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentLocationCardContainer;
