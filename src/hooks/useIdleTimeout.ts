import { useEffect, useRef } from "react";

export function useIdleTimeout(ms: number, onIdle: () => void, enabled = true) {
  const onIdleRef = useRef(onIdle);
  onIdleRef.current = onIdle;

  useEffect(() => {
    if (!enabled) return;
    let t: number | undefined;
    const bump = () => {
      if (t) window.clearTimeout(t);
      t = window.setTimeout(() => onIdleRef.current(), ms);
    };
    bump();
    const events: Array<keyof WindowEventMap> = ["pointerdown", "pointermove", "keydown", "touchstart"];
    events.forEach((e) => window.addEventListener(e, bump, { passive: true }));
    return () => {
      if (t) window.clearTimeout(t);
      events.forEach((e) => window.removeEventListener(e, bump));
    };
  }, [ms, enabled]);
}

