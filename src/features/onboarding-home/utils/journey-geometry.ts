import type { JourneyRoute } from "../types";

/** Geometry of the hero journey diagram, in the SVG's 560 × 570 viewBox. */
export const JOURNEY_VIEWBOX = { width: 560, height: 570 };
export const JOURNEY_CENTER = 280;
export const JOURNEY_RADIUS = 210;
export const JOURNEY_NODE_RADIUS = 27;

export type JourneyPoint = { x: number; y: number };

export type JourneyPath = {
  route: JourneyRoute;
  d: string;
  length: number;
  /** Point at a fraction (0–1) of the path's length. */
  pointAt: (fraction: number) => JourneyPoint;
};

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;
const round = (value: number): number => Math.round(value * 10) / 10;

export function pointOnCircle(angle: number, radius: number = JOURNEY_RADIUS): JourneyPoint {
  return {
    x: JOURNEY_CENTER + radius * Math.cos(toRadians(angle)),
    y: JOURNEY_CENTER + radius * Math.sin(toRadians(angle)),
  };
}

/** Ease-in-out so the dot leaves and arrives gently. */
export function easeInOut(fraction: number): number {
  const x = Math.min(1, Math.max(0, fraction));
  return x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2;
}

/**
 * The route between two offices: clockwise along the ring for "arc", or in to the student record and out to the
 * next office for "via". Both start and end at the edge of the office circles, not their centres.
 */
export function buildJourneyPath(fromAngle: number, toAngle: number, route: JourneyRoute): JourneyPath {
  if (route === "arc") {
    const inset = (JOURNEY_NODE_RADIUS / JOURNEY_RADIUS) * (180 / Math.PI) + 1.5;
    const start = fromAngle + inset;
    const sweep = ((toAngle - fromAngle + 360) % 360) - 2 * inset;
    const from = pointOnCircle(start);
    const to = pointOnCircle(start + sweep);
    return {
      route,
      d: `M${round(from.x)} ${round(from.y)} A${JOURNEY_RADIUS} ${JOURNEY_RADIUS} 0 ${sweep > 180 ? 1 : 0} 1 ${round(to.x)} ${round(to.y)}`,
      length: JOURNEY_RADIUS * toRadians(sweep),
      pointAt: (fraction) => pointOnCircle(start + sweep * Math.min(1, Math.max(0, fraction))),
    };
  }

  const points = [
    pointOnCircle(fromAngle, JOURNEY_RADIUS - JOURNEY_NODE_RADIUS),
    { x: JOURNEY_CENTER, y: JOURNEY_CENTER },
    pointOnCircle(toAngle, JOURNEY_RADIUS - JOURNEY_NODE_RADIUS),
  ];
  const first = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
  const second = Math.hypot(points[2].x - points[1].x, points[2].y - points[1].y);
  const length = first + second;
  return {
    route,
    d: points.map((point, index) => `${index === 0 ? "M" : "L"}${round(point.x)} ${round(point.y)}`).join(" "),
    length,
    pointAt: (fraction) => {
      const distance = length * Math.min(1, Math.max(0, fraction));
      const [a, b, t] = distance <= first ? [points[0], points[1], distance / first] : [points[1], points[2], (distance - first) / second];
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    },
  };
}
