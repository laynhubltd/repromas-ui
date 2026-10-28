import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OfficeJourney } from "@/features/onboarding-home/components/sections/OfficeJourney";
import { HOME_JOURNEY } from "@/features/onboarding-home/utils/home-content";
import {
  buildJourneyPath,
  easeInOut,
  JOURNEY_CENTER,
  JOURNEY_NODE_RADIUS,
  JOURNEY_RADIUS,
  pointOnCircle,
} from "@/features/onboarding-home/utils/journey-geometry";

const distanceFromCentre = ({ x, y }: { x: number; y: number }) => Math.hypot(x - JOURNEY_CENTER, y - JOURNEY_CENTER);

describe("journey geometry", () => {
  it("runs an arc clockwise along the ring, stopping at the edge of each office", () => {
    const path = buildJourneyPath(90, 141.43, "arc");
    const start = path.pointAt(0);
    const end = path.pointAt(1);

    expect(distanceFromCentre(start)).toBeCloseTo(JOURNEY_RADIUS);
    expect(distanceFromCentre(end)).toBeCloseTo(JOURNEY_RADIUS);
    expect(Math.hypot(start.x - pointOnCircle(90).x, start.y - pointOnCircle(90).y)).toBeGreaterThan(JOURNEY_NODE_RADIUS);
    expect(path.length).toBeLessThan(JOURNEY_RADIUS * ((51.43 * Math.PI) / 180));
    expect(path.d).toMatch(/^M[\d.]+ [\d.]+ A210 210 0 0 1 /);
  });

  it("wraps an arc across 0 degrees", () => {
    const path = buildJourneyPath(347.14, 38.57, "arc");
    expect(path.length).toBeGreaterThan(0);
    expect(path.length).toBeLessThan(JOURNEY_RADIUS * ((51.43 * Math.PI) / 180));
  });

  it("routes a via step through the student record in the centre", () => {
    const path = buildJourneyPath(38.57, 90, "via");
    const atCentre = path.pointAt(0.5);

    expect(atCentre.x).toBeCloseTo(JOURNEY_CENTER, 0);
    expect(atCentre.y).toBeCloseTo(JOURNEY_CENTER, 0);
    expect(path.length).toBeCloseTo(2 * (JOURNEY_RADIUS - JOURNEY_NODE_RADIUS));
  });

  it("eases between 0 and 1 and clamps outside that range", () => {
    expect(easeInOut(-1)).toBe(0);
    expect(easeInOut(0.5)).toBe(0.5);
    expect(easeInOut(2)).toBe(1);
  });
});

describe("hero office journey", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const activeOffice = () => {
    const active = screen.getAllByTestId("journey-office").filter((office) => office.dataset.active === "true");
    expect(active).toHaveLength(1);
    return active[0];
  };

  it("puts every office on the ring and starts with the student portal opening", () => {
    render(<OfficeJourney journey={HOME_JOURNEY} />);

    expect(screen.getAllByTestId("journey-office")).toHaveLength(7);
    expect(screen.getByTestId("journey-student")).toBeInTheDocument();
    expect(screen.queryByText("STUDENT RECORD")).not.toBeInTheDocument();
    expect(screen.getAllByTestId("journey-trail")).toHaveLength(HOME_JOURNEY.steps.length);
    expect(within(activeOffice()).getByText("Student Portal")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pause animation" })).toHaveAttribute("aria-pressed", "false");
  });

  it("pauses and resumes from its icon button", async () => {
    const user = userEvent.setup();
    render(<OfficeJourney journey={HOME_JOURNEY} />);

    await user.click(screen.getByRole("button", { name: "Pause animation" }));
    expect(screen.getByRole("button", { name: "Play animation" })).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: "Play animation" }));
    expect(screen.getByRole("button", { name: "Pause animation" })).toBeInTheDocument();
  });

  it("waits for the viewer when reduced motion is preferred", () => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          matches: query.includes("prefers-reduced-motion"),
          media: query,
          onchange: null,
          addListener: () => undefined,
          removeListener: () => undefined,
          addEventListener: () => undefined,
          removeEventListener: () => undefined,
          dispatchEvent: () => false,
        }) as MediaQueryList,
    );
    render(<OfficeJourney journey={HOME_JOURNEY} />);

    expect(screen.getByRole("button", { name: "Play animation" })).toHaveAttribute("aria-pressed", "true");
    expect(within(activeOffice()).getByText("Student Portal")).toBeInTheDocument();
  });

  it("has no visible step box, only a list of every step for screen readers", () => {
    render(<OfficeJourney journey={HOME_JOURNEY} />);

    expect(screen.queryByRole("group", { name: "Choose a step" })).not.toBeInTheDocument();
    const list = screen.getByRole("list");
    expect(within(list).getAllByRole("listitem")).toHaveLength(HOME_JOURNEY.steps.length);
  });
});
