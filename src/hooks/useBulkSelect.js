import { useState, useCallback } from "react";

/**
 * Hook reutilizable para selección masiva.
 * @param {Array} items - Array de items visibles (filtrados).
 * Cada item debe tener un campo `id`.
 */
export function useBulkSelect(items = []) {
  const [selected, setSelected] = useState(new Set());

  const toggle = useCallback((id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const allSelected  = items.length > 0 && items.every(i => selected.has(i.id));
  const someSelected = items.some(i => selected.has(i.id));

  const toggleAll = useCallback(() => {
    setSelected(prev => {
      const next = new Set(prev);
      if (items.every(i => next.has(i.id))) {
        items.forEach(i => next.delete(i.id));
      } else {
        items.forEach(i => next.add(i.id));
      }
      return next;
    });
  }, [items]);

  const clear = useCallback(() => setSelected(new Set()), []);

  const removeSelected = useCallback((setState) => {
    setState(prev => prev.filter(i => !selected.has(i.id)));
    setSelected(new Set());
  }, [selected]);

  return {
    selected, toggle, toggleAll, clear,
    removeSelected, allSelected, someSelected,
    count: selected.size,
  };
}
