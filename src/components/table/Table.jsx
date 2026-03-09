import React, { useMemo } from "react";
import { TableProvider } from "./context/TableContext";
import { useTableData } from "./hooks/useTableData";
import { useTablePagination } from "./hooks/useTablePagination";
import { useTableSelection } from "./hooks/useTableSelection";
import { useTableFilters } from "./hooks/useTableFilters";
import TableHeader from "./TableHeader";
import TableBody from "./TableBody";
import TablePagination from "./TablePagination";
import TableFilters from "./TableFilters";
import TableSearch from "./TableSearch";
import TableActions from "./TableActions";
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
    showCheckbox: false,
  },
  onPageSizeChange,
  onAction,
  isLoading = false,
  url,
  button,
  PageTitle,
  downloadableColumn = "image",
}) => {
  const {
    data: processedData,
    sortConfig,
    filters,
    searchTerm,
    handleSort,
    handleFilterChange,
    handleSearch,
    resetFilters,
  } = useTableData(data, columns, config);

  const {
    currentPage,
    pageSize,
    isShowingAll,
    totalPages,
    showingFrom,
    showingTo,
    handlePageChange,
    handlePageSizeChange,
    paginateData,
  } = useTablePagination(processedData.length, config.pageSize || 10, config);

  const {
    selectedItems,
    selectedCount,
    isAllSelected,
    handleSelectAll,
    handleSelectItem,
    clearSelection,
  } = useTableSelection(paginateData(processedData));

  const { getFilterOptions, filterableColumns } = useTableFilters(
    data,
    columns,
  );

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

  const paginatedData = useMemo(
    () => paginateData(processedData),
    [processedData, paginateData],
  );

  const handlePageSizeChangeWithCallback = (size) => {
    handlePageSizeChange(size);
    if (onPageSizeChange) {
      onPageSizeChange(size === "All" ? "all" : Number(size));
    }
  };

  const contextValue = useMemo(
    () => ({
      columns: tableColumns,
      config,
      sortConfig,
      filters,
      selectedItems,
      isAllSelected,
      onAction,
      handleSort,
      handleSelectAll,
      handleSelectItem,
    }),
    [
      tableColumns,
      config,
      sortConfig,
      filters,
      selectedItems,
      isAllSelected,
      onAction,
      handleSort,
      handleSelectAll,
      handleSelectItem,
    ],
  );

  return (
    <TableProvider value={contextValue}>
      <div className="bg-white rounded-lg">
        <TableActions
          url={url}
          button={button}
          showCheckbox={config.showCheckbox}
          selectedCount={selectedCount}
          onDownloadSelected={() =>
            handleDownloadSelected(
              paginatedData,
              selectedItems,
              downloadableColumn,
            )
          }
          onSearch={config.search ? handleSearch : null}
          searchPlaceholder={config.searchPlaceholder}
        />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <div>{PageTitle}</div>

          {config.filters && filterableColumns.length > 0 && (
            <TableFilters
              columns={filterableColumns}
              filters={filters}
              onFilterChange={handleFilterChange}
              getFilterOptions={getFilterOptions}
            />
          )}
        </div>

        {}
        <div className="overflow-x-auto rounded-lg border border-gray-300">
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <TableHeader
              showCheckbox={config.showCheckbox}
              hasData={paginatedData.length > 0}
            />
            <TableBody
              data={paginatedData}
              isLoading={isLoading}
              emptyMessage={config.emptyMessage || "No data found"}
            />
          </table>
        </div>

        {}
        {config.pagination && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={processedData.length}
            showingFrom={showingFrom}
            showingTo={showingTo}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChangeWithCallback}
            pageSizeOptions={config.pageSizeOptions || [10, 20, 50, 100, "All"]}
            isShowingAll={isShowingAll}
          />
        )}
      </div>
    </TableProvider>
  );
};

const handleDownloadSelected = async (
  data,
  selectedItems,
  downloadableColumn,
) => {
  const { downloadApi } = await import("../../api/downloadApi");
  const selectedData = data.filter((item) => selectedItems.has(item.id));

  for (const item of selectedData) {
    const filePath = item[downloadableColumn];
    if (!filePath) continue;

    try {
      const blob = await downloadApi.downloadFile(filePath);
      const extension = blob.type.split("/")[1] || "png";
      const fileName = `${item.sku || "file"}_${downloadableColumn}.${extension}`;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  }
};

export default Table;
