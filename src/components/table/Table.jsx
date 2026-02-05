import React, { useState, useEffect, useMemo } from "react";
import TableHeader from "./TableHeader";
import TableBody from "./TableBody";
import TablePagination from "./TablePagination";
import TableFilters from "./TableFilters";
import TableSearch from "./TableSearch";
import { Link } from "react-router-dom";

const Table = ({
  data = [],
  columns = [],
  config = {
    sortable: true,
    pagination: true,
    search: true,
    filters: true,
    actions: ["view", "edit", "delete"],
    showIndex: true,
  },
  onPageSizeChange,
  onAction,
  isLoading = false,
  url,
  button,
  PageTitle,
}) => {
  const [localData, setLocalData] = useState(data);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(config.pageSize || 10);
  const [isShowingAll, setIsShowingAll] = useState(false);

  // Handle external data updates
  useEffect(() => {
    setLocalData(data);
  }, [data]);

  // Reset to first page when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchTerm]);

  // Get unique filter values from data
  const getFilterOptions = (columnKey) => {
    // Skip index column for filters
    if (columnKey === "index") return ["All"];

    // Handle nested keys for filter options
    const values = data.map((item) => {
      if (columnKey.includes(".")) {
        const keys = columnKey.split(".");
        let value = item;
        for (const key of keys) {
          value = value?.[key];
        }
        return value;
      }
      return item[columnKey];
    });

    // Filter out null/undefined and get unique values
    const uniqueValues = [
      ...new Set(
        values.filter(
          (value) => value !== null && value !== undefined && value !== "",
        ),
      ),
    ];

    return ["All", ...uniqueValues.sort()];
  };

  // Client-side filtering
  const filteredData = useMemo(() => {
    let result = [...localData];

    // Apply search
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter((item) => {
        // Search through all column values except index
        return columns.some((column) => {
          // Skip index column from search
          if (column.key === "index") return false;

          let value;
          if (column.key.includes(".")) {
            const keys = columnKey.split(".");
            value = item;
            for (const key of keys) {
              value = value?.[key];
            }
          } else {
            value = item[column.key];
          }

          if (value === null || value === undefined) return false;

          // Check if value is an array
          if (Array.isArray(value)) {
            return value.some((arrItem) =>
              String(arrItem).toLowerCase().includes(lowerSearchTerm),
            );
          }

          return String(value).toLowerCase().includes(lowerSearchTerm);
        });
      });
    }

    // Apply filters
    if (Object.keys(filters).length > 0) {
      result = result.filter((item) => {
        return Object.entries(filters).every(([key, filterValue]) => {
          // Skip index column for filters
          if (key === "index") return true;

          if (!filterValue || filterValue === "All") return true;

          let itemValue;
          if (key.includes(".")) {
            const keys = key.split(".");
            itemValue = item;
            for (const k of keys) {
              itemValue = itemValue?.[k];
            }
          } else {
            itemValue = item[key];
          }

          // Handle array values in filters
          if (Array.isArray(itemValue)) {
            return itemValue.includes(filterValue);
          }

          return String(itemValue) === String(filterValue);
        });
      });
    }

    return result;
  }, [localData, filters, searchTerm, columns]);

  // Client-side sorting
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    // Skip sorting for index column
    if (sortConfig.key === "index") return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      let aValue;
      let bValue;

      // Handle nested keys
      if (sortConfig.key.includes(".")) {
        const keys = sortConfig.key.split(".");
        aValue = a;
        bValue = b;
        for (const key of keys) {
          aValue = aValue?.[key];
          bValue = bValue?.[key];
        }
      } else {
        aValue = a[sortConfig.key];
        bValue = b[sortConfig.key];
      }

      // Handle null/undefined values
      if (aValue == null) aValue = "";
      if (bValue == null) bValue = "";

      // Convert to string for comparison
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [filteredData, sortConfig]);

  // Calculate effective page size for pagination
  const effectivePageSize = useMemo(() => {
    if (isShowingAll) {
      return sortedData.length; // When showing all, page size is total items
    }
    return pageSize;
  }, [isShowingAll, pageSize, sortedData.length]);

  // Client-side pagination
  const paginatedData = useMemo(() => {
    if (!config.pagination || isShowingAll) {
      // When showing all or pagination disabled, return all data with continuous index
      return sortedData.map((item, index) => ({
        ...item,
        index: index + 1,
      }));
    }

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    // Add index numbers that continue across pages
    const dataWithIndex = sortedData
      .slice(startIndex, endIndex)
      .map((item, index) => ({
        ...item,
        index: startIndex + index + 1, // Continuous index across pages
      }));

    return dataWithIndex;
  }, [sortedData, currentPage, pageSize, config.pagination, isShowingAll]);

  // Prepare columns with index column if enabled
  const tableColumns = useMemo(() => {
    if (config.showIndex) {
      return [
        {
          key: "index",
          label: "#",
          width: "60px",
          sortable: false,
          render: (item) => (
            <span className="text-xs text-gray-500 font-medium">
              {item.index}
            </span>
          ),
        },
        ...columns,
      ];
    }
    return columns;
  }, [columns, config.showIndex]);

  // Local sorting handler
  const handleSort = (key) => {
    if (!config.sortable) return;
    // Don't sort index column
    if (key === "index") return;

    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";

    setSortConfig({ key, direction });
  };

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    // Don't filter by index column
    if (filterName === "index") return;

    setFilters((prev) => ({
      ...prev,
      [filterName]: value === "All" ? "" : value,
    }));
  };

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle page size change
  const handlePageSizeChange = (size) => {
    if (size === "All" || size === "all") {
      // When "All" is selected, show all records without pagination
      setIsShowingAll(true);
      setPageSize(sortedData.length);
      setCurrentPage(1);

      if (onPageSizeChange) {
        onPageSizeChange("all"); // Send "all" to parent for API call
      }
    } else {
      const newPageSize = Number(size);
      setIsShowingAll(false);
      setPageSize(newPageSize);
      setCurrentPage(1);

      if (onPageSizeChange) {
        onPageSizeChange(newPageSize);
      }
    }
  };

  // Handle action button click
  const handleAction = (action, rowData) => {
    if (onAction) {
      onAction(action, rowData);
    }
  };

  const totalItems = sortedData.length;
  const totalPages = isShowingAll ? 1 : Math.ceil(totalItems / pageSize);
  const showingFrom = isShowingAll ? 1 : (currentPage - 1) * pageSize + 1;
  const showingTo = isShowingAll
    ? totalItems
    : Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="bg-white rounded-lg">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <div>
          {url && (
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <h1 className="text-lg font-semibold text-gray-800">{PageTitle}</h1>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-auto">
          <div className="flex flex-wrap gap-3">
            {/* Filters */}
            {config.filters && tableColumns.some((col) => col.filterable) && (
              <TableFilters
                columns={tableColumns.filter(
                  (col) => col.filterable && col.key !== "index",
                )}
                filters={filters}
                onFilterChange={handleFilterChange}
                getFilterOptions={getFilterOptions}
              />
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <TableHeader
            columns={tableColumns}
            sortConfig={sortConfig}
            onSort={handleSort}
            sortable={config.sortable}
          />

          <TableBody
            data={paginatedData}
            columns={tableColumns}
            actions={config.actions}
            onAction={handleAction}
            isLoading={isLoading}
            emptyMessage={config.emptyMessage || "No data found"}
          />
        </table>
      </div>

      {/* Pagination */}
      {config.pagination && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={isShowingAll ? "All" : pageSize}
          totalItems={totalItems}
          showingFrom={showingFrom}
          showingTo={showingTo}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={config.pageSizeOptions || [10, 20, 50, 100, "All"]}
          isShowingAll={isShowingAll}
        />
      )}
    </div>
  );
};

export default Table;
