import { describe, expect, it } from "vitest";
import { mapMeAdmissionCandidate } from "@/features/candidate-profile/utils/mapMeAdmissionCandidate";

describe("mapMeAdmissionCandidate", () => {
  it("maps snake_case me candidate with embeds", () => {
    const result = mapMeAdmissionCandidate({
      id: 42,
      cycle_id: 4,
      jamb_reg_no: "123456789AB",
      first_name: "Jane",
      last_name: "Doe",
      date_of_birth: "2005-01-15",
      gender: "FEMALE",
      state_id: 25,
      lga_id: 100,
      email: "jane@school.edu",
      phone: "+2348000000000",
      metadata: null,
      state: { id: 25, name: "Lagos" },
      lga: { id: 100, name: "Ikeja" },
      cycle: {
        id: 4,
        session_id: 16,
        name: "2025/2026 UTME",
        status: "APPLICATION_OPEN",
        admission_identity_mode: "JAMB",
        entry_mode: "UTME",
        batch_no: 1,
        start_date: null,
        end_date: null,
      },
      application: {
        id: 7,
        candidate_id: 42,
        applied_program_id: 3,
        offered_program_id: null,
        application_status: "PENDING",
        final_decision: "PENDING",
        is_matriculated: false,
        updated_at: "2025-01-01T00:00:00+00:00",
        applied_program: { id: 3, name: "Computer Science" },
      },
    });

    expect(result).toMatchObject({
      id: 42,
      cycleId: 4,
      jambRegNo: "123456789AB",
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@school.edu",
      state: { id: 25, name: "Lagos" },
      cycle: {
        entryMode: "UTME",
        batchNo: 1,
        admissionIdentityMode: "JAMB",
      },
      application: {
        appliedProgram: { name: "Computer Science" },
      },
    });
  });
});
