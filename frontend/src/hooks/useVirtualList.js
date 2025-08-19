import { useState, useEffect, useMemo } from 'react';

export const useVirtualList = (items, itemHeight = 80, containerHeight = 600) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [items, itemHeight, containerHeight, scrollTop]);

  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };

  return { visibleItems, handleScroll };
};