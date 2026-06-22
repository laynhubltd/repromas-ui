import { describe, expect, it } from "vitest";
import { mapMeAdmissionProgress } from "./mapMeAdmissionProgress";

const feePendingFixture = {
  portalState: "fee_pending",
  cycleId: 7,
  cycleStatus: "APPLICATION_OPEN",
  candidateId: 130,
  applicationId: 54,
  formSubmissionId: 5,
  currentStep: "application_fee",
  nextAction: "pay_application_fee",
  steps: [
    { key: "profile", status: "completed", order: 1 },
    { key: "application_form", status: "completed", order: 2 },
    { key: "program_choice", status: "completed", order: 3 },
    { key: "application_fee", status: "blocked", order: 4 },
    { key: "submit_application", status: "blocked", order: 5 },
    { key: "screening", status: "not_started", order: 6 },
    { key: "document_verification", status: "not_started", order: 7 },
    { key: "admission_decision", status: "not_started", order: 8 },
    { key: "matriculation", status: "not_started", order: 9 },
  ],
  blockers: [{ code: "APPLICATION_FEE_UNPAID", step: "application_fee" }],
  fee: {
    required: true,
    feeChargeId: 901,
    status: "PENDING",
    allowedToSubmit: false,
  },
};

describe("mapMeAdmissionProgress", () => {
  it("maps doc JSON fixture (camelCase)", () => {
    const result = mapMeAdmissionProgress(feePendingFixture);

    expect(result.portalState).toBe("fee_pending");
    expect(result.cycleId).toBe(7);
    expect(result.candidateId).toBe(130);
    expect(result.applicationId).toBe(54);
    expect(result.formSubmissionId).toBe(5);
    expect(result.currentStep).toBe("application_fee");
    expect(result.nextAction).toBe("pay_application_fee");
    expect(result.steps).toHaveLength(9);
    expect(result.steps[0]?.key).toBe("profile");
    expect(result.blockers).toEqual([
      { code: "APPLICATION_FEE_UNPAID", step: "application_fee" },
    ]);
    expect(result.fee).toEqual({
      required: true,
      feeChargeId: 901,
      status: "PENDING",
      allowedToSubmit: false,
    });
  });

  it("maps snake_case API response", () => {
    const result = mapMeAdmissionProgress({
      portal_state: "form_only",
      cycle_id: 3,
      cycle_status: "APPLICATION_OPEN",
      candidate_id: 10,
      application_id: null,
      form_submission_id: null,
      current_step: "profile",
      next_action: "continue_form",
      steps: [{ key: "profile", status: "in_progress", order: 1 }],
      blockers: [],
      fee: null,
    });

    expect(result.portalState).toBe("form_only");
    expect(result.applicationId).toBeNull();
    expect(result.formSubmissionId).toBeNull();
    expect(result.fee).toBeNull();
  });

  it("sorts steps by order", () => {
    const result = mapMeAdmissionProgress({
      ...feePendingFixture,
      steps: [
        { key: "submit_application", status: "blocked", order: 5 },
        { key: "profile", status: "completed", order: 1 },
      ],
    });

    expect(result.steps.map((s) => s.key)).toEqual([
      "profile",
      "submit_application",
    ]);
  });

  it("handles empty or invalid payload", () => {
    const result = mapMeAdmissionProgress(null);

    expect(result.portalState).toBe("");
    expect(result.steps).toEqual([]);
    expect(result.blockers).toEqual([]);
    expect(result.fee).toBeNull();
  });
});
