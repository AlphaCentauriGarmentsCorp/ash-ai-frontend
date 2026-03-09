import { useMemo, useCallback } from "react";

export const useTableFilters = (data, columns) => {
  const getFilterOptions = useCallback(
    (columnKey) => {
      if (columnKey === "index") return ["All"];

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

      const uniqueValues = [
        ...new Set(
          values.filter(
            (value) => value !== null && value !== undefined && value !== "",
          ),
        ),
      ];

      return ["All", ...uniqueValues.sort()];
    },
    [data],
  );

  const filterableColumns = useMemo(
    () => columns.filter((col) => col.filterable && col.key !== "index"),
    [columns],
  );

  return { getFilterOptions, filterableColumns };
};
