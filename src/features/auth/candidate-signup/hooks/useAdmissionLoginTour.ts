import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  isAdmissionTourDismissed,
  markAdmissionTourDismissed,
} from "../utils/admissionTourStorage";

const DESKTOP_TABLET_MEDIA_QUERY = "(min-width: 768px)";
const AUTO_OPEN_DELAY_MS = 400;

function subscribeDesktopTablet(onChange: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) {
    return () => undefined;
  }
  const mql = window.matchMedia(DESKTOP_TABLET_MEDIA_QUERY);
  mql.addEventListener?.("change", onChange);
  return () => mql.removeEventListener?.("change", onChange);
}

function getDesktopTabletSnapshot(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return true;
  return window.matchMedia(DESKTOP_TABLET_MEDIA_QUERY).matches;
}

function getDesktopTabletServerSnapshot(): boolean {
  return true;
}

/** Controls non-blocking desktop/tablet admission guide visibility per cycle. */
export function useAdmissionLoginTour(
  enabled: boolean,
  cycleId: number | undefined,
) {
  const [ctaElement, setCtaElement] = useState<HTMLElement | null>(null);
  const [tourOpen, setTourOpen] = useState(false);
  const autoOpenTimerRef = useRef<number | null>(null);
  const interactedCycleIdRef = useRef<number | null>(null);

  const isDesktopOrTablet = useSyncExternalStore(
    subscribeDesktopTablet,
    getDesktopTabletSnapshot,
    getDesktopTabletServerSnapshot,
  );

  const clearAutoOpenTimer = useCallback(() => {
    if (autoOpenTimerRef.current !== null) {
      window.clearTimeout(autoOpenTimerRef.current);
      autoOpenTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled || cycleId == null || !isDesktopOrTablet || !ctaElement) {
      return;
    }
    if (
      interactedCycleIdRef.current === cycleId ||
      isAdmissionTourDismissed(cycleId)
    ) {
      return;
    }

    autoOpenTimerRef.current = window.setTimeout(() => {
      autoOpenTimerRef.current = null;
      if (interactedCycleIdRef.current !== cycleId) {
        setTourOpen(true);
      }
    }, AUTO_OPEN_DELAY_MS);

    return () => clearAutoOpenTimer();
  }, [enabled, cycleId, isDesktopOrTablet, ctaElement, clearAutoOpenTimer]);

  const dismissTour = useCallback(() => {
    if (cycleId != null) {
      interactedCycleIdRef.current = cycleId;
      markAdmissionTourDismissed(cycleId);
    }
    clearAutoOpenTimer();
    setTourOpen(false);
  }, [cycleId, clearAutoOpenTimer]);

  const handleFormFocus = useCallback(() => {
    if (!enabled || cycleId == null) return;
    dismissTour();
  }, [enabled, cycleId, dismissTour]);

  const handleOpenGuide = useCallback(() => {
    if (!enabled || !isDesktopOrTablet || !ctaElement) return;
    clearAutoOpenTimer();
    setTourOpen(true);
  }, [enabled, isDesktopOrTablet, ctaElement, clearAutoOpenTimer]);

  return {
    ctaElement,
    setCtaElement,
    isTourOpen: enabled && isDesktopOrTablet && tourOpen && ctaElement !== null,
    dismissTour,
    handleFormFocus,
    handleOpenGuide,
  };
}
