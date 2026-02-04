import React from "react";

const TableFilters = ({
  columns,
  filters,
  onFilterChange,
  getFilterOptions,
}) => {
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      {columns.map((column) => (
        <div key={column.key} className="gap-2">
          <label className="text-xs text-gray-600">{column.label}:</label>
          <div className="relative">
            <select
              value={filters[column.key] || "All"}
              onChange={(e) => onFilterChange(column.key, e.target.value)}
              className="h-10 border border-gray-300 rounded-lg px-3 pr-8 text-sm
                focus:ring-1 focus:ring-primary/20 focus:border-primary
                appearance-none bg-white cursor-pointer min-w-32"
            >
              {getFilterOptions(column.key).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <i className="fas fa-chevron-down text-gray-400 text-xs"></i>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TableFilters;
