import { useState, useCallback, useRef, useEffect } from "react";

interface UsePullToRefreshOptions {
  onRefresh?: () => void | Promise<void>;
  threshold?: number;
  maxPull?: number;
}

function getScrollTop() {
  return (
    window.pageYOffset ||
    document.documentElement.scrollTop ||
    (document.body as unknown as { scrollTop: number })?.scrollTop ||
    0
  );
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  maxPull = 120,
}: UsePullToRefreshOptions = {}) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const startY = useRef(0);
  const isPulling = useRef(false);

  const begin = useCallback(
    (clientY: number, target: EventTarget | null) => {
      if (isRefreshing) return;
      if (target instanceof HTMLElement) {
        const tag = target.tagName.toLowerCase();
        if (tag === "input" || tag === "textarea" || tag === "select" || target.isContentEditable) return;
      }
      const scrollTop = getScrollTop();
      if (scrollTop <= 0) {
        startY.current = clientY;
        isPulling.current = true;
      }
    },
    [isRefreshing],
  );

  const move = useCallback(
    (clientY: number, e: Event) => {
      if (!isPulling.current || isRefreshing) return;
      const diff = clientY - startY.current;
      const scrollTop = getScrollTop();
      if (diff > 0 && scrollTop <= 0) {
        const resistance = 0.5;
        const distance = Math.min(diff * resistance, maxPull);
        setPullDistance(distance);
        if (distance > 5) e.preventDefault?.();
      } else {
        setPullDistance(0);
      }
    },
    [isRefreshing, maxPull],
  );

  const end = useCallback(async () => {
    if (!isPulling.current) return;
    isPulling.current = false;
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(threshold);
      try {
        if (onRefresh) await onRefresh();
        else window.location.reload();
      } finally {
        window.setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 500);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  useEffect(() => {
    const prevBody = document.body.style.overscrollBehavior;
    const prevHtml = document.documentElement.style.overscrollBehavior;
    document.body.style.overscrollBehavior = "none";
    document.documentElement.style.overscrollBehavior = "none";

    const onPointerDown = (e: PointerEvent) => begin(e.clientY, e.target);
    const onPointerMove = (e: PointerEvent) => move(e.clientY, e);
    const onPointerUp = () => end();
    const onTouchStart = (e: TouchEvent) => begin(e.touches[0].clientY, e.target);
    const onTouchMove = (e: TouchEvent) => move(e.touches[0].clientY, e);
    const onTouchEnd = () => end();

    window.addEventListener("pointerdown", onPointerDown, { passive: true, capture: true });
    window.addEventListener("pointermove", onPointerMove, { passive: false, capture: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true, capture: true });
    window.addEventListener("pointercancel", onPointerUp, { passive: true, capture: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true, capture: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true, capture: true });

    return () => {
      document.body.style.overscrollBehavior = prevBody;
      document.documentElement.style.overscrollBehavior = prevHtml;
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("pointermove", onPointerMove, true);
      window.removeEventListener("pointerup", onPointerUp, true);
      window.removeEventListener("pointercancel", onPointerUp, true);
      window.removeEventListener("touchstart", onTouchStart, true);
      window.removeEventListener("touchmove", onTouchMove, true);
      window.removeEventListener("touchend", onTouchEnd, true);
      window.removeEventListener("touchcancel", onTouchEnd, true);
    };
  }, [begin, move, end]);

  const progress = Math.min(pullDistance / threshold, 1);

  return { pullDistance, isRefreshing, progress };
}
