import { describe, expect, it } from "vitest";
import type { MeAdmissionApplication } from "../types/me-admission-application";
import {
  deriveLifecycleState,
  shouldShowJambCard,
  shouldShowOfferCard,
  shouldShowScreeningPending,
} from "./applicationDossierDisplay";

function baseApplication(
  overrides: Partial<MeAdmissionApplication> = {},
): MeAdmissionApplication {
  return {
    id: 1,
    candidateId: 1,
    appliedProgramId: 1,
    offeredProgramId: null,
    entryMode: "UTME",
    applicationStatus: "DRAFT",
    finalDecision: "PENDING",
    isMatriculated: false,
    updatedAt: "2026-01-01T00:00:00+00:00",
    ...overrides,
  };
}

describe("applicationDossierDisplay", () => {
  it("shows offer card when offeredProgramId is set", () => {
    expect(
      shouldShowOfferCard(baseApplication({ offeredProgramId: 5 })),
    ).toBe(true);
  });

  it("shows offer card when finalDecision is OFFER_CHANGE_OF_COURSE", () => {
    expect(
      shouldShowOfferCard(
        baseApplication({ finalDecision: "OFFER_CHANGE_OF_COURSE" }),
      ),
    ).toBe(true);
  });

  it("hides offer card for pending pre-decision", () => {
    expect(shouldShowOfferCard(baseApplication())).toBe(false);
  });

  it("shows score pending for submitted without screening", () => {
    expect(
      shouldShowScreeningPending(
        baseApplication({ applicationStatus: "SUBMITTED", screening: null }),
      ),
    ).toBe(true);
  });

  it("derives lifecycle with fee step in process for draft unpaid", () => {
    const state = deriveLifecycleState({
      application: baseApplication({ applicationStatus: "DRAFT" }),
      feePaid: false,
    });
    expect(state.currentStepIndex).toBe(1);
    expect(state.stepStatuses[0]).toBe("finish");
    expect(state.stepStatuses[1]).toBe("process");
  });

  it("derives lifecycle with decision complete when admitted", () => {
    const state = deriveLifecycleState({
      application: baseApplication({
        applicationStatus: "DOCUMENTS_VERIFIED",
        finalDecision: "ADMIT_MERIT",
      }),
      feePaid: true,
    });
    expect(state.stepStatuses.every((s) => s === "finish")).toBe(true);
    expect(state.currentStepIndex).toBe(4);
  });

  it("hides empty JAMB card for OPEN, DIRECT_ENTRY, and TRANSFER lanes", () => {
    const emptyOpen = baseApplication({
      entryMode: "UTME",
      candidate: {
        id: 1,
        cycleId: 2,
        jambRegNo: null,
        firstName: "A",
        lastName: "B",
        dateOfBirth: null,
        gender: null,
        stateId: 1,
        lgaId: null,
        email: null,
        phone: null,
        entryMode: "UTME",
        metadata: null,
        createdAt: "2026-01-01T00:00:00Z",
        cycle: {
          id: 2,
          sessionId: 1,
          name: "Cycle",
          status: "APPLICATION_OPEN",
          entryModes: [{ entryMode: "UTME", identityMode: "OPEN", enabled: true }],
          startDate: null,
          endDate: null,
        },
        jambScores: [],
        olevelSittings: [],
      },
    });
    expect(shouldShowJambCard(emptyOpen)).toBe(false);
    expect(shouldShowJambCard(baseApplication({ entryMode: "DIRECT_ENTRY" }))).toBe(false);
    expect(shouldShowJambCard(baseApplication({ entryMode: "TRANSFER" }))).toBe(false);
    expect(shouldShowJambCard(baseApplication({ entryMode: "UTME" }))).toBe(true);
  });
});
