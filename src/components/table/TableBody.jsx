import React from "react";

const TableBody = ({
  data,
  columns,
  actions = [],
  onAction,
  isLoading,
  emptyMessage,
}) => {
  if (isLoading) {
    return (
      <tbody>
        <tr>
          <td colSpan={columns.length + 1} className="px-6 py-8 text-center">
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
            colSpan={columns.length + 1}
            className="px-6 py-8 text-center text-gray-500  "
          >
            {emptyMessage}
          </td>
        </tr>
      </tbody>
    );
  }

  const renderCell = (item, column) => {
    if (column.render) {
      return column.render(item);
    }

    if (column.key.includes(".")) {
      const keys = column.key.split(".");
      let value = item;
      for (const key of keys) {
        value = value?.[key];
      }
      return value || "";
    }

    return item[column.key] || "";
  };

  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {data.map((item, index) => (
        <tr key={item.id || index} className="hover:bg-gray-50">
          {columns.map((column) => (
            <td
              key={`${item.id}-${column.key}`}
              className={`px-6 py-2 text-xs text-primary wrap-break-word capitalize ${
                column.className || "text-xs text-primary"
              }`}
            >
              {renderCell(item, column)}
            </td>
          ))}

          {/* Actions */}
          <td className="px-6 py-2 whitespace-nowrap">
            <div className="flex space-x-2 justify-center">
              {actions.includes("view") && (
                <button
                  onClick={() => onAction("view", item)}
                  className="cursor-pointer w-7 h-7 border border-gray-300 flex items-center justify-center rounded-lg text-xs hover:bg-gray-100 transition"
                  title="View"
                >
                  <i className="fas fa-eye"></i>
                </button>
              )}
              {actions.includes("edit") && (
                <button
                  onClick={() => onAction("edit", item)}
                  className="cursor-pointer w-7 h-7 border border-gray-300 flex items-center justify-center rounded-lg text-xs hover:bg-gray-100 transition"
                  title="Edit"
                >
                  <i className="fas fa-pen"></i>
                </button>
              )}
              {actions.includes("delete") && (
                <button
                  onClick={() => onAction("delete", item)}
                  className="cursor-pointer w-7 h-7 border text-red-600 border-red-600 flex items-center justify-center rounded-lg text-xs hover:bg-gray-100 transition"
                  title="Delete"
                >
                  <i className="fas fa-trash"></i>
                </button>
              )}
              {actions.includes("custom") &&
                item.customActions?.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => onAction(action.type, item)}
                    className={action.className}
                    title={action.title}
                  >
                    <i className={action.icon}></i>
                  </button>
                ))}
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  );
};

export default TableBody;
