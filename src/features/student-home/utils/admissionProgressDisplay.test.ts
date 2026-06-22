import { describe, expect, it } from "vitest";
import {
  buildProgressStepDisplayItems,
  groupProgressStepsByPhase,
  mapProgressStepStatusToAnt,
  resolveAdmissionProgressPercent,
  resolveCurrentStepIndex,
  resolveStepStatusLabel,
  shouldPollProgress,
  shouldShowFeeBanner,
  shouldShowPrimaryCta,
} from "./admissionProgressDisplay";
import type { MeAdmissionProgressStep } from "../types/me-admission-progress";

const steps: MeAdmissionProgressStep[] = [
  { key: "profile", status: "completed", order: 1 },
  { key: "application_form", status: "completed", order: 2 },
  { key: "application_fee", status: "blocked", order: 4 },
  { key: "submit_application", status: "not_started", order: 5 },
];

describe("admissionProgressDisplay", () => {
  describe("mapProgressStepStatusToAnt", () => {
    it("maps API statuses to Ant Design step statuses", () => {
      expect(mapProgressStepStatusToAnt("completed")).toBe("finish");
      expect(mapProgressStepStatusToAnt("in_progress")).toBe("process");
      expect(mapProgressStepStatusToAnt("blocked")).toBe("error");
      expect(mapProgressStepStatusToAnt("not_started")).toBe("wait");
      expect(mapProgressStepStatusToAnt("skipped")).toBe("wait");
    });
  });

  describe("resolveCurrentStepIndex", () => {
    it("finds index by currentStep key", () => {
      expect(resolveCurrentStepIndex(steps, "application_fee")).toBe(2);
    });

    it("returns 0 when currentStep is unknown", () => {
      expect(resolveCurrentStepIndex(steps, "unknown")).toBe(0);
    });
  });

  describe("buildProgressStepDisplayItems", () => {
    it("builds display items with skipped suffix", () => {
      const items = buildProgressStepDisplayItems([
        { key: "application_fee", status: "skipped", order: 4 },
      ]);

      expect(items[0]?.title).toBe("Application fee (not required)");
      expect(items[0]?.status).toBe("wait");
      expect(items[0]?.statusLabel).toBe("Not required");
    });

    it("marks current step and includes description", () => {
      const items = buildProgressStepDisplayItems(
        [{ key: "profile", status: "in_progress", order: 1 }],
        "profile",
      );

      expect(items[0]?.isCurrent).toBe(true);
      expect(items[0]?.description).toBeTruthy();
    });

    it("maps blocked step to error status", () => {
      const items = buildProgressStepDisplayItems([
        { key: "application_fee", status: "blocked", order: 4 },
      ]);

      expect(items[0]?.status).toBe("error");
      expect(items[0]?.badgeColor).toBe("warning");
    });
  });

  describe("resolveAdmissionProgressPercent", () => {
    it("calculates percent from completed non-skipped steps", () => {
      expect(
        resolveAdmissionProgressPercent([
          { key: "profile", status: "completed", order: 1 },
          { key: "application_form", status: "completed", order: 2 },
          { key: "program_choice", status: "not_started", order: 3 },
          { key: "application_fee", status: "skipped", order: 4 },
        ]),
      ).toBe(67);
    });
  });

  describe("groupProgressStepsByPhase", () => {
    it("groups steps into application, review, and outcome phases", () => {
      const items = buildProgressStepDisplayItems([
        { key: "profile", status: "completed", order: 1 },
        { key: "screening", status: "not_started", order: 6 },
        { key: "admission_decision", status: "not_started", order: 8 },
      ]);

      const groups = groupProgressStepsByPhase(items);
      expect(groups).toHaveLength(3);
      expect(groups[0]?.key).toBe("application");
      expect(groups[1]?.key).toBe("review");
      expect(groups[2]?.key).toBe("outcome");
    });
  });

  describe("resolveStepStatusLabel", () => {
    it("returns human-readable labels", () => {
      expect(resolveStepStatusLabel("completed").label).toBe("Completed");
      expect(resolveStepStatusLabel("blocked").label).toBe("Action required");
    });
  });

  describe("shouldShowFeeBanner", () => {
    it("shows when portalState is fee_pending", () => {
      expect(shouldShowFeeBanner("fee_pending", "none")).toBe(true);
    });

    it("shows when nextAction is pay_application_fee", () => {
      expect(shouldShowFeeBanner("application_started", "pay_application_fee")).toBe(
        true,
      );
    });
  });

  describe("shouldShowPrimaryCta", () => {
    it("hides for none", () => {
      expect(shouldShowPrimaryCta("none")).toBe(false);
    });

    it("shows for actionable next actions", () => {
      expect(shouldShowPrimaryCta("continue_form")).toBe(true);
    });
  });

  describe("shouldPollProgress", () => {
    it("polls for wait states", () => {
      expect(shouldPollProgress("wait_for_screening")).toBe(true);
      expect(shouldPollProgress("wait_for_decision")).toBe(true);
      expect(shouldPollProgress("continue_form")).toBe(false);
    });
  });
});
