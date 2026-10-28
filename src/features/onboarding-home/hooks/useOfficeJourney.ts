import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { JourneyOfficeId, OfficeJourney } from "../types";
import {
  buildJourneyPath,
  easeInOut,
  JOURNEY_CENTER,
  JOURNEY_NODE_RADIUS,
  JOURNEY_RADIUS,
  pointOnCircle,
} from "../utils/journey-geometry";

/** Each step lasts STEP_MS: the dot travels for TRAVEL_MS, then rests on the highlighted office. */
const STEP_MS = 2600;
const TRAVEL_MS = 1500;

type JourneyPosition = { stepIndex: number; progress: number };

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
}

/**
 * Drives the hero journey: which step is showing, the travelling dot and the drawn trail.
 *
 * The step index and the at-rest position live in state; the per-frame dot position and trail progress are written
 * straight to the SVG through refs, so React only re-renders when a step changes. Autoplay stops when the viewer
 * pauses, scrolls the diagram away, or prefers reduced motion.
 */
export function useOfficeJourney(journey: OfficeJourney) {
  const [position, setPosition] = useState<JourneyPosition>(() => ({
    stepIndex: 0,
    progress: prefersReducedMotion() ? 1 : 0,
  }));
  const [isPaused, setIsPaused] = useState(prefersReducedMotion);
  const [isVisible, setIsVisible] = useState(true);
  const [isRecordActive, setIsRecordActive] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const trailRefs = useRef<(SVGPathElement | null)[]>([]);
  const positionRef = useRef(position);
  const recordActiveRef = useRef(false);

  const offices = useMemo(
    () =>
      journey.offices.map((office) => ({
        ...office,
        point: pointOnCircle(office.angle),
        spokeStart: pointOnCircle(office.angle, JOURNEY_RADIUS - JOURNEY_NODE_RADIUS),
      })),
    [journey.offices],
  );

  const paths = useMemo(() => {
    const angleOf = (id: JourneyOfficeId) => journey.offices.find((office) => office.id === id)?.angle ?? 0;
    return journey.steps.map((step) => buildJourneyPath(angleOf(step.from), angleOf(step.to), step.route));
  }, [journey.offices, journey.steps]);

  const draw = useCallback(
    (stepIndex: number, progress: number) => {
      const path = paths[stepIndex];
      const eased = easeInOut(progress);
      trailRefs.current[stepIndex]?.setAttribute("stroke-dashoffset", String(path.length * (1 - eased)));
      const point = path.pointAt(eased);
      dotRef.current?.setAttribute("cx", point.x.toFixed(1));
      dotRef.current?.setAttribute("cy", point.y.toFixed(1));
      const recordActive = path.route === "via" && eased > 0.3 && eased < 0.75;
      if (recordActive !== recordActiveRef.current) {
        recordActiveRef.current = recordActive;
        setIsRecordActive(recordActive);
      }
    },
    [paths],
  );

  useLayoutEffect(() => {
    positionRef.current = position;
    draw(position.stepIndex, position.progress);
  }, [position, draw]);

  useEffect(() => {
    if (isPaused || !isVisible) {
      return undefined;
    }
    const cycle = STEP_MS * paths.length;
    const offset = positionRef.current.stepIndex * STEP_MS + positionRef.current.progress * TRAVEL_MS;
    // anchor the clock to the first frame's own timestamp, which can be earlier than performance.now() here
    let startedAt: number | null = null;
    let frameId = requestAnimationFrame(function tick(now: number) {
      startedAt ??= now - offset;
      const elapsed = (((now - startedAt) % cycle) + cycle) % cycle;
      const stepIndex = Math.floor(elapsed / STEP_MS);
      const progress = Math.min(1, (elapsed - stepIndex * STEP_MS) / TRAVEL_MS);
      if (stepIndex !== positionRef.current.stepIndex) {
        setPosition({ stepIndex, progress });
      }
      positionRef.current = { stepIndex, progress };
      draw(stepIndex, progress);
      frameId = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frameId);
  }, [isPaused, isVisible, paths.length, draw]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || typeof IntersectionObserver === "undefined") {
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting));
    observer.observe(svg);
    return () => observer.disconnect();
  }, []);

  const togglePause = useCallback(() => setIsPaused((paused) => !paused), []);

  const step = journey.steps[position.stepIndex];

  return {
    svgRef,
    dotRef,
    setTrailRef: (index: number) => (element: SVGPathElement | null) => {
      trailRefs.current[index] = element;
    },
    center: JOURNEY_CENTER,
    ringRadius: JOURNEY_RADIUS,
    nodeRadius: JOURNEY_NODE_RADIUS,
    offices,
    paths,
    stepIndex: position.stepIndex,
    stepProgress: easeInOut(position.progress),
    isPaused,
    isRecordActive,
    isOfficeActive: (id: JourneyOfficeId) => step.to === id,
    isSpokeActive: (id: JourneyOfficeId) => step.to === id || step.from === id,
    togglePause,
  };
}
