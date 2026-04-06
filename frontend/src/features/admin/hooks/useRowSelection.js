import { useState, useCallback } from "react";

/**
 * Manages checkbox selection for an admin table page.
 *
 * @param {Array} items  - Current page items (must have an `id` field).
 * @returns {{ selectedIds, allPageSelected, somePageSelected,
 *             toggleSelectAll, toggleSelectRow, clearSelection }}
 */
export function useRowSelection(items) {
  const [selectedIds, setSelectedIds] = useState(new Set());

  const allPageSelected =
    items.length > 0 && items.every((item) => selectedIds.has(item.id));
  const somePageSelected =
    items.some((item) => selectedIds.has(item.id)) && !allPageSelected;

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = items.every((item) => next.has(item.id));
      if (allSelected) {
        items.forEach((item) => next.delete(item.id));
      } else {
        items.forEach((item) => next.add(item.id));
      }
      return next;
    });
  }, [items]);

  const toggleSelectRow = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return {
    selectedIds,
    allPageSelected,
    somePageSelected,
    toggleSelectAll,
    toggleSelectRow,
    clearSelection,
  };
}
