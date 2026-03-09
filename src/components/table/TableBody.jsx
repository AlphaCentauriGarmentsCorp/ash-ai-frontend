import React from "react";
import { useTableContext } from "./context/TableContext";

const TableBody = ({ data, isLoading, emptyMessage }) => {
  const { columns, selectedItems, onSelectItem, onAction, config } =
    useTableContext();

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

  // Helper function to format column key to readable text
  const formatColumnKey = (key) => {
    return key
      .split(/[._]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const renderCell = (item, column) => {
    // If column has custom render function
    if (column.render) {
      return column.render(item);
    }

    let value;

    // Handle nested keys
    if (column.key.includes(".")) {
      const keys = column.key.split(".");
      value = item;
      for (const key of keys) {
        value = value?.[key];
        if (value === undefined || value === null) break;
      }
    } else {
      value = item[column.key];
    }

    // Check if value exists and is not empty
    const hasValue =
      value !== undefined &&
      value !== null &&
      value !== "" &&
      !(Array.isArray(value) && value.length === 0);

    if (!hasValue) {
      // Return "No [Column Name]" in gray text
      return (
        <span className="text-gray-400 italic">
          No {formatColumnKey(column.key)}
        </span>
      );
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return value.join(", ");
    }

    // Return the value
    return value;
  };

  if (isLoading) {
    return (
      <tbody>
        <tr>
          <td
            colSpan={columns.length + (config.showCheckbox ? 1 : 0) + 1}
            className="px-6 py-8 text-center"
          >
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </td>
        </tr>
      </tbody>
    );
  }

  if (data.length === 0) {
    return (
      <tbody>
        <tr>
          <td
            colSpan={columns.length + (config.showCheckbox ? 1 : 0) + 1}
            className="px-6 py-8 text-center text-gray-500"
          >
            {emptyMessage}
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {data.map((item, index) => (
        <tr key={item.id || index} className="hover:bg-gray-50">
          {config.showCheckbox && (
            <td className="px-6 py-2 w-2">
              <div className="flex justify-center">
                <input
                  type="checkbox"
                  className="w-5 h-5 mt-2 rounded-full border border-gray-300 bg-white checked:bg-primary checked:border-primary cursor-pointer transition accent-primary"
                  checked={selectedItems.has(item.id)}
                  onChange={() => onSelectItem(item.id)}
                />
              </div>
            </td>
          )}

          {columns.map((column) => (
            <td
              key={`${item.id}-${column.key}`}
              className={`px-6 py-2 text-xs text-primary wrap-break-word ${getAlignmentClass(
                column.position,
              )} ${column.className || "text-xs text-primary"}`}
            >
              {renderCell(item, column)}
            </td>
          ))}

          {/* Actions column */}
          <td className="px-6 py-2">
            <div className="flex space-x-2 justify-center">
              {config.actions.includes("view") && (
                <button
                  onClick={() => onAction("view", item)}
                  className="cursor-pointer w-7 h-7 border border-gray-300 flex items-center justify-center rounded-lg text-xs hover:bg-gray-100 transition"
                  title="View"
                >
                  <i className="fas fa-eye"></i>
                </button>
              )}
              {config.actions.includes("edit") && (
                <button
                  onClick={() => onAction("edit", item)}
                  className="cursor-pointer w-7 h-7 border border-gray-300 flex items-center justify-center rounded-lg text-xs hover:bg-gray-100 transition"
                  title="Edit"
                >
                  <i className="fas fa-pen"></i>
                </button>
              )}
              {config.actions.includes("delete") && (
                <button
                  onClick={() => onAction("delete", item)}
                  className="cursor-pointer w-7 h-7 border text-red-600 border-red-600 flex items-center justify-center rounded-lg text-xs hover:bg-gray-100 transition"
                  title="Delete"
                >
                  <i className="fas fa-trash"></i>
                </button>
              )}
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  );
};

export default TableBody;
