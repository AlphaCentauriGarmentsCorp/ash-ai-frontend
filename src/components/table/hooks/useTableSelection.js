import { useState, useCallback, useMemo } from "react";

export const useTableSelection = (items = []) => {
  const [selectedItems, setSelectedItems] = useState(new Set());

  const handleSelectAll = useCallback(() => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map((item) => item.id)));
    }
  }, [items, selectedItems]);

  const handleSelectItem = useCallback((id) => {
    setSelectedItems((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return newSelected;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const selectedCount = useMemo(() => selectedItems.size, [selectedItems]);

  const isAllSelected = useMemo(
    () => items.length > 0 && selectedItems.size === items.length,
    [items.length, selectedItems.size],
  );

  const selectedItemsList = useMemo(
    () => items.filter((item) => selectedItems.has(item.id)),
    [items, selectedItems],
  );

  return {
    selectedItems,
    selectedCount,
    isAllSelected,
    selectedItemsList,
    handleSelectAll,
    handleSelectItem,
    clearSelection,
  };
};
