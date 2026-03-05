import React from "react";

const TableHeader = ({
  columns,
  sortConfig,
  onSort,
  sortable,
  showCheckbox,
  onSelectAll,
  allSelected,
  hasData,
}) => {
  // Helper function to get alignment class
  const getAlignmentClass = (position) => {
    switch (position) {
      case "start":
        return "text-left";
      case "center":
        return "text-center";
      case "end":
        return "text-right";
      default:
        return "text-left";
    }
  };

  // Helper function to get flex justification based on position
  const getJustifyClass = (position) => {
    switch (position) {
      case "start":
        return "justify-start";
      case "center":
        return "justify-center";
      case "end":
        return "justify-end";
      default:
        return "justify-start";
    }
  };

  return (
    <thead className="bg-light ">
      <tr>
        {showCheckbox && (
          <th className="px-6 py-2 text-left text-xs font-normal text-primary tracking-wider">
            <input
              type="checkbox"
              className={`w-5 h-5 mt-1 rounded-full border border-gray-300 bg-white checked:bg-primary checked:border-primary cursor-pointer transition accent-primary`}
              checked={allSelected && hasData}
              onChange={onSelectAll}
              disabled={!hasData}
            />
          </th>
        )}
        {columns.map((column) => (
          <th
            key={column.key}
            className={`px-6 py-2 text-xs font-normal text-primary tracking-wider ${
              column.sortable !== false && sortable
                ? "cursor-pointer hover:bg-light2"
                : ""
            }`}
            onClick={() =>
              column.sortable !== false && sortable && onSort(column.key)
            }
            style={{ width: column.width }}
          >
            <div
              className={`flex items-center ${getJustifyClass(column.position)}`}
            >
              <span>{column.label}</span>
              {column.sortable !== false && sortable && (
                <div className="flex flex-col ml-1">
                  <i
                    className={`fas fa-caret-up text-[9px] ${
                      sortConfig.key === column.key &&
                      sortConfig.direction === "asc"
                        ? "text-primary"
                        : "text-gray-400"
                    }`}
                  />
                  <i
                    className={`fas fa-caret-down text-[9px] -mt-[4.2px] ${
                      sortConfig.key === column.key &&
                      sortConfig.direction === "desc"
                        ? "text-primary"
                        : "text-gray-400"
                    }`}
                  />
                </div>
              )}
            </div>
          </th>
        ))}
        {/* Actions column */}
        <th className="px-6 py-2 text-center text-xs font-normal text-primary tracking-wider bg-light">
          Actions
        </th>
      </tr>
    </thead>
  );
};

export default TableHeader;
