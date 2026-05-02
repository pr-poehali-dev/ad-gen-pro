import { useEffect, useRef } from "react";

interface SwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  edgeOnly?: boolean;
  edgeWidth?: number;
  minDistance?: number;
  maxOffAxis?: number;
  enabled?: boolean;
}

export function useSwipeGesture(options: SwipeOptions = {}) {
  const {
    onSwipeLeft,
    onSwipeRight,
    edgeOnly = false,
    edgeWidth = 30,
    minDistance = 60,
    maxOffAxis = 80,
    enabled = true,
  } = options;

  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const tracking = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      if (edgeOnly && t.clientX > edgeWidth) {
        tracking.current = false;
        return;
      }
      startX.current = t.clientX;
      startY.current = t.clientY;
      tracking.current = true;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!tracking.current || startX.current === null || startY.current === null) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - startX.current;
      const dy = t.clientY - startY.current;

      if (Math.abs(dy) <= maxOffAxis) {
        if (dx >= minDistance && onSwipeRight) onSwipeRight();
        else if (dx <= -minDistance && onSwipeLeft) onSwipeLeft();
      }

      tracking.current = false;
      startX.current = null;
      startY.current = null;
    };

    const onTouchCancel = () => {
      tracking.current = false;
      startX.current = null;
      startY.current = null;
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchCancel, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchCancel);
    };
  }, [onSwipeLeft, onSwipeRight, edgeOnly, edgeWidth, minDistance, maxOffAxis, enabled]);
}

export default useSwipeGesture;
