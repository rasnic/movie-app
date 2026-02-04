
import { useEffect, useCallback, useState } from 'react';

interface NavigationOptions {
  columns: number;
  itemCount: number;
  onSelect?: (index: number) => void;
  onBack?: () => void;
  baseIndex?: number;
}

export const useKeyboardNav = ({ columns, itemCount, onSelect, onBack }: NavigationOptions) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  useEffect(() => {
    if (selectedIndex >= itemCount && itemCount > 0) {
      setSelectedIndex(itemCount - 1);
    }
  }, [itemCount]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
    }

    if (event.key === 'Tab') {
      event.preventDefault();
      return;
    }

    if (event.key === 'Escape' && onBack) {
      onBack();
      return;
    }

    if (event.key === 'Enter' && onSelect) {
      onSelect(selectedIndex);
      return;
    }

    setSelectedIndex((prev) => {
      let next = prev;

      switch (event.key) {
        case 'ArrowRight':
          next = prev + 1;
          break;
        case 'ArrowLeft':
          next = prev - 1;
          break;
        case 'ArrowDown':
          next = prev + columns;
          break;
        case 'ArrowUp':
          next = prev - columns;
          break;
      }

      if (next < 0) return 0;
      if (next >= itemCount) return itemCount - 1;
      return next;
    });
  }, [columns, itemCount, onSelect, onBack, selectedIndex]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const element = document.getElementById(`nav-item-${selectedIndex}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedIndex]);

  return { selectedIndex, setSelectedIndex };
};
