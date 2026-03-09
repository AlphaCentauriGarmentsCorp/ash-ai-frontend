import { useState, useMemo, useCallback } from "react";

export const useTablePagination = (
  totalItems,
  initialPageSize = 10,
  config = {},
) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [isShowingAll, setIsShowingAll] = useState(false);

  const effectivePageSize = useMemo(() => {
    return isShowingAll ? totalItems : pageSize;
  }, [isShowingAll, pageSize, totalItems]);

  const totalPages = useMemo(() => {
    return isShowingAll ? 1 : Math.ceil(totalItems / pageSize);
  }, [totalItems, pageSize, isShowingAll]);

  const paginationInfo = useMemo(() => {
    const showingFrom = isShowingAll ? 1 : (currentPage - 1) * pageSize + 1;
    const showingTo = isShowingAll
      ? totalItems
      : Math.min(currentPage * pageSize, totalItems);

    return { showingFrom, showingTo };
  }, [currentPage, pageSize, totalItems, isShowingAll]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback(
    (size) => {
      if (size === "All" || size === "all") {
        setIsShowingAll(true);
        setPageSize(totalItems);
        setCurrentPage(1);
      } else {
        const newPageSize = Number(size);
        setIsShowingAll(false);
        setPageSize(newPageSize);
        setCurrentPage(1);
      }
    },
    [totalItems],
  );

  const paginateData = useCallback(
    (data) => {
      if (!config.pagination || isShowingAll) {
        return data.map((item, index) => ({ ...item, index: index + 1 }));
      }

      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;

      return data.slice(startIndex, endIndex).map((item, index) => ({
        ...item,
        index: startIndex + index + 1,
      }));
    },
    [currentPage, pageSize, config.pagination, isShowingAll],
  );

  return {
    currentPage,
    pageSize: isShowingAll ? "All" : pageSize,
    isShowingAll,
    totalPages,
    ...paginationInfo,
    handlePageChange,
    handlePageSizeChange,
    paginateData,
  };
};
