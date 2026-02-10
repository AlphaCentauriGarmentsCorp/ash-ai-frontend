import React from "react";

const TablePagination = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  showingFrom,
  showingTo,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100, "All"],
  isShowingAll = false,
}) => {
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;

    if (totalPages <= maxVisibleButtons) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => onPageChange(i)}
            className={`w-8 h-8 flex items-center justify-center rounded text-sm ${
              currentPage === i
                ? "bg-primary text-white"
                : "bg-light text-primary hover:bg-gray-100"
            }`}
          >
            {i}
          </button>,
        );
      }
    } else {
      // Always show first page
      buttons.push(
        <button
          key={1}
          onClick={() => onPageChange(1)}
          className={`w-8 h-8 flex items-center justify-center rounded text-sm ${
            currentPage === 1
              ? "bg-primary text-white"
              : "bg-light text-primary hover:bg-gray-100"
          }`}
        >
          1
        </button>,
      );

      // Show ellipsis if current page is far from start
      if (currentPage > 3) {
        buttons.push(
          <span key="ellipsis-start" className="px-2">
            ...
          </span>,
        );
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          buttons.push(
            <button
              key={i}
              onClick={() => onPageChange(i)}
              className={`w-8 h-8 flex items-center justify-center rounded text-sm ${
                currentPage === i
                  ? "bg-primary text-white"
                  : "bg-light text-primary hover:bg-gray-100"
              }`}
            >
              {i}
            </button>,
          );
        }
      }

      // Show ellipsis if current page is far from end
      if (currentPage < totalPages - 2) {
        buttons.push(
          <span key="ellipsis-end" className="px-2">
            ...
          </span>,
        );
      }

      // Always show last page
      buttons.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          className={`w-8 h-8 flex items-center justify-center rounded text-sm ${
            currentPage === totalPages
              ? "bg-primary text-white"
              : "bg-light text-primary hover:bg-gray-100"
          }`}
        >
          {totalPages}
        </button>,
      );
    }

    return buttons;
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-center mt-1 pt-4 ">
      {/* Showing Info */}
      <div className="text-xs text-gray-700 mb-4 md:mb-0">
        {isShowingAll ? (
          <>Showing all {totalItems} entries</>
        ) : (
          <>
            Showing {showingFrom} to {showingTo} of {totalItems} entries
          </>
        )}
      </div>

      {/* Pagination - Center - Only show if not showing all */}
      {!isShowingAll && totalPages > 1 && (
        <div className="mb-4 md:mb-0">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`w-8 h-8 flex items-center justify-center rounded text-sm ${
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-primary hover:bg-gray-100"
              }`}
            >
              <i className="fas fa-chevron-left text-xs"></i>
            </button>

            {renderPaginationButtons()}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`w-8 h-8 flex items-center justify-center rounded text-sm ${
                currentPage === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-primary hover:bg-gray-100"
              }`}
            >
              <i className="fas fa-chevron-right text-xs"></i>
            </button>
          </div>
        </div>
      )}

      {/* Show Entries - Right */}
      <div className="mb-4 md:mb-0">
        <span className="text-xs text-gray-700 mr-2">Show:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 text-sm"
        >
          {pageSizeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span className="text-sm text-gray-700 ml-2">entries</span>
      </div>
    </div>
  );
};

export default TablePagination;
