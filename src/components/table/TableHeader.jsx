import React from "react";

const TableHeader = ({ columns, sortConfig, onSort, sortable }) => {
  return (
    <thead className="bg-light">
      <tr>
        {columns.map((column) => (
          <th
            key={column.key}
            className={`px-6 py-2 text-left text-xs font-normal text-primary tracking-wider ${
              column.sortable !== false && sortable
                ? "cursor-pointer hover:bg-light2"
                : ""
            }`}
            onClick={() =>
              column.sortable !== false && sortable && onSort(column.key)
            }
            style={{ width: column.width }}
          >
            <div className="flex items-center">
              {column.label}
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
