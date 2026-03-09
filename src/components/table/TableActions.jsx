import React from "react";
import { Link } from "react-router-dom";
import TableSearch from "./TableSearch";

const TableActions = ({
  url,
  button,
  showCheckbox,
  selectedCount,
  onDownloadSelected,
  onSearch,
  searchPlaceholder,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
      <div className="flex gap-2">
        {url && (
          <Link
            to={url}
            className="cursor-pointer hover:bg-secondary/90 bg-secondary text-white px-4 py-2 rounded-lg text-sm"
          >
            <i className="fa fa-add mr-2"></i>
            {button}
          </Link>
        )}

        {showCheckbox && selectedCount > 0 && (
          <button
            onClick={onDownloadSelected}
            className="cursor-pointer transition-all ease-in-out hover:text-white hover:bg-primary/90 bg-white text-primary font-medium border border-primary px-4 py-2 rounded-lg text-sm flex items-center"
          >
            <i className="fa fa-download mr-2"></i>
            Download ({selectedCount})
          </button>
        )}
      </div>

      {onSearch && (
        <TableSearch
          onSearch={onSearch}
          placeholder={searchPlaceholder || "Search..."}
        />
      )}
    </div>
  );
};

export default TableActions;
