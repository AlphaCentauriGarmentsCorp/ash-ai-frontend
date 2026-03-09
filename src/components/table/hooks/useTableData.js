import { useState, useEffect, useMemo, useCallback } from "react";

export const useTableData = (data, columns, config) => {
  const [localData, setLocalData] = useState(data);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const getTextFromValue = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
    if (Array.isArray(value)) {
      return value
        .map((v) => {
          if (v && typeof v === "object")
            return v.name || v.title || v.label || "";
          return String(v);
        })
        .join(" ");
    }
    if (typeof value === "object") {
      if (value.name) return String(value.name);
      if (value.title) return String(value.title);
      if (value.label) return String(value.label);
      try {
        return JSON.stringify(value).replace(/[{}"]/g, " ");
      } catch {
        return "";
      }
    }
    return String(value);
  };

  const searchableData = useMemo(() => {
    return localData.map((item) => {
      const searchableText = {};
      const allTextParts = [];

      columns.forEach((column) => {
        if (column.key === "index") return;

        if (
          column.searchableValue &&
          typeof column.searchableValue === "function"
        ) {
          try {
            const searchText = column.searchableValue(item);
            const text = String(searchText || "");
            searchableText[column.key] = text.toLowerCase();
            allTextParts.push(text);
          } catch (error) {
            console.warn(
              `Error in searchableValue for column ${column.key}:`,
              error,
            );
            searchableText[column.key] = "";
          }
          return;
        }

        if (column.searchable && typeof column.searchable === "function") {
          try {
            const searchText = column.searchable(item);
            const text = String(searchText || "");
            searchableText[column.key] = text.toLowerCase();
            allTextParts.push(text);
          } catch (error) {
            console.warn(
              `Error in searchable function for column ${column.key}:`,
              error,
            );
            searchableText[column.key] = "";
          }
          return;
        }

        if (column.key === "price") {
          const price = item.price ?? "-";
          const unit = item.unit ?? "-";
          const minimum = item.minimum ?? "N/A";
          const text = `${price} / ${unit} Min: ${minimum}`;
          searchableText[column.key] = text.toLowerCase();
          allTextParts.push(text);
        } else if (column.key === "brands") {
          const brands = Array.isArray(item.brands)
            ? item.brands.map((b) => b.name || b).join(" ")
            : "No brands";
          searchableText[column.key] = brands.toLowerCase();
          allTextParts.push(brands);
        } else if (column.key.includes(".")) {
          const keys = column.key.split(".");
          let value = item;
          for (const key of keys) {
            value = value?.[key];
          }
          const text = getTextFromValue(value);
          searchableText[column.key] = text.toLowerCase();
          allTextParts.push(text);
        } else {
          const text = getTextFromValue(item[column.key]);
          searchableText[column.key] = text.toLowerCase();
          allTextParts.push(text);
        }
      });

      const allText = allTextParts.join(" ").toLowerCase();

      return {
        id: item.id,
        searchableText,
        allText,
        original: item,
      };
    });
  }, [localData, columns]);

  const filteredData = useMemo(() => {
    if (!searchTerm && Object.keys(filters).length === 0) {
      return searchableData.map((item) => item.original);
    }

    let result = searchableData;

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const filtered = [];
      for (let i = 0; i < result.length; i++) {
        const item = result[i];
        if (item.allText.includes(lowerSearchTerm)) {
          filtered.push(item);
        }
      }
      result = filtered;
    }

    if (Object.keys(filters).length > 0) {
      const filtered = [];
      for (let i = 0; i < result.length; i++) {
        const { original } = result[i];
        let matchesAllFilters = true;

        for (const [key, filterValue] of Object.entries(filters)) {
          if (key === "index") continue;
          if (!filterValue || filterValue === "All") continue;

          const column = columns.find((col) => col.key === key);

          if (column?.searchableValue) {
            try {
              const searchText = column.searchableValue(original);
              if (
                !searchText
                  .toLowerCase()
                  .includes(String(filterValue).toLowerCase())
              ) {
                matchesAllFilters = false;
                break;
              }
              continue;
            } catch (error) {}
          }

          let itemValue;
          if (key.includes(".")) {
            const keys = key.split(".");
            itemValue = original;
            for (const k of keys) {
              itemValue = itemValue?.[k];
            }
          } else {
            itemValue = original[key];
          }

          const itemValueStr = String(itemValue || "").toLowerCase();
          const filterStr = String(filterValue).toLowerCase();

          if (Array.isArray(itemValue)) {
            if (
              !itemValue.some((v) =>
                String(v).toLowerCase().includes(filterStr),
              )
            ) {
              matchesAllFilters = false;
              break;
            }
          } else if (!itemValueStr.includes(filterStr)) {
            matchesAllFilters = false;
            break;
          }
        }

        if (matchesAllFilters) {
          filtered.push(original);
        }
      }
      return filtered;
    }

    return result.map((item) => item.original);
  }, [searchableData, filters, searchTerm, columns]);

  const sortedData = useMemo(() => {
    if (
      !sortConfig.key ||
      sortConfig.key === "index" ||
      filteredData.length === 0
    ) {
      return filteredData;
    }

    return [...filteredData].sort((a, b) => {
      const column = columns.find((col) => col.key === sortConfig.key);

      if (column?.searchableValue) {
        try {
          const aVal = column.searchableValue(a) || "";
          const bVal = column.searchableValue(b) || "";
          return sortConfig.direction === "asc"
            ? String(aVal).localeCompare(String(bVal))
            : String(bVal).localeCompare(String(aVal));
        } catch (error) {}
      }

      let aVal, bVal;

      if (sortConfig.key.includes(".")) {
        const keys = sortConfig.key.split(".");
        aVal = a;
        bVal = b;
        for (const key of keys) {
          aVal = aVal?.[key];
          bVal = bVal?.[key];
        }
      } else {
        aVal = a[sortConfig.key];
        bVal = b[sortConfig.key];
      }

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sortConfig.direction === "asc" ? -1 : 1;
      if (bVal == null) return sortConfig.direction === "asc" ? 1 : -1;

      if (!isNaN(Number(aVal)) && !isNaN(Number(bVal))) {
        const aNum = Number(aVal);
        const bNum = Number(bVal);
        return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;
      }

      aVal = String(aVal).toLowerCase();
      bVal = String(bVal).toLowerCase();

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig, columns]);

  const handleSort = useCallback(
    (key) => {
      if (!config.sortable || key === "index") return;
      setSortConfig((prev) => ({
        key,
        direction:
          prev.key === key && prev.direction === "asc" ? "desc" : "asc",
      }));
    },
    [config.sortable],
  );

  const handleFilterChange = useCallback((filterName, value) => {
    if (filterName === "index") return;
    setFilters((prev) => ({
      ...prev,
      [filterName]: value === "All" ? "" : value,
    }));
  }, []);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
    setSearchTerm("");
    setSortConfig({ key: null, direction: "asc" });
  }, []);

  return {
    data: sortedData,
    sortConfig,
    filters,
    searchTerm,
    handleSort,
    handleFilterChange,
    handleSearch,
    resetFilters,
  };
};
