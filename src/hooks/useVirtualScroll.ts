import { useState, useCallback, useRef, useMemo } from 'react';

interface VirtualScrollOptions {
  itemCount: number;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

interface VirtualScrollResult {
  visibleItems: { index: number; offsetTop: number }[];
  totalHeight: number;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  scrollTop: number;
}

export function useVirtualScroll({
  itemCount,
  itemHeight,
  containerHeight,
  overscan = 5,
}: VirtualScrollOptions): VirtualScrollResult {
  const [scrollTop, setScrollTop] = useState(0);
  const rafRef = useRef<number>(0);

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setScrollTop(target.scrollTop);
    });
  }, []);

  const totalHeight = itemCount * itemHeight;

  const visibleItems = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const endIndex = Math.min(itemCount - 1, startIndex + visibleCount + overscan * 2);

    const items: { index: number; offsetTop: number }[] = [];
    for (let i = startIndex; i <= endIndex; i++) {
      items.push({ index: i, offsetTop: i * itemHeight });
    }
    return items;
  }, [scrollTop, itemCount, itemHeight, containerHeight, overscan]);

  return { visibleItems, totalHeight, onScroll, scrollTop };
}
