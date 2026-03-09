import React from "react";
import { useTableContext } from "./context/TableContext";

const TableHeader = ({ showCheckbox, hasData }) => {
  const { columns, sortConfig, handleSort, isAllSelected, handleSelectAll } =
    useTableContext();

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
    <thead className="bg-light">
      <tr>
        {showCheckbox && (
          <th className="px-6 py-2 text-left text-xs font-normal text-primary tracking-wider">
            <input
              type="checkbox"
              className="w-5 h-5 mt-1 rounded-full border border-gray-300 bg-white checked:bg-primary checked:border-primary cursor-pointer transition accent-primary"
              checked={isAllSelected && hasData}
              onChange={handleSelectAll}
              disabled={!hasData}
            />
          </th>
        )}
        {columns.map((column) => (
          <th
            key={column.key}
            className={`px-6 py-2 text-xs font-normal text-primary tracking-wider ${
              column.sortable !== false ? "cursor-pointer hover:bg-light2" : ""
            }`}
            onClick={() => column.sortable !== false && handleSort(column.key)}
            style={{ width: column.width }}
          >
            <div
              className={`flex items-center ${getJustifyClass(column.position)}`}
            >
              <span>{column.label}</span>
              {column.sortable !== false && (
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
        <th className="px-6 py-2 text-center text-xs font-normal text-primary tracking-wider bg-light">
          Actions
        </th>
      </tr>
    </thead>
  );
};

export default TableHeader;
