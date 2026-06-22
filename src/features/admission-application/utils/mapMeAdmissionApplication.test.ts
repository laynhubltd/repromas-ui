import { describe, expect, it } from "vitest";
import { mapMeAdmissionApplication } from "./mapMeAdmissionApplication";

const fullDossierFixture = {
  id: 54,
  candidateId: 130,
  appliedProgramId: 4,
  offeredProgramId: null,
  applicationStatus: "SUBMITTED",
  finalDecision: "PENDING",
  isMatriculated: false,
  updatedAt: "2026-06-12T16:29:39+00:00",
  candidate: {
    id: 130,
    cycle_id: 7,
    jamb_reg_no: "202655999999AA",
    first_name: "Aisha",
    last_name: "Ibrahim",
    date_of_birth: "2007-03-19",
    gender: "FEMALE",
    state_id: 19,
    lga_id: 244,
    email: "aisha@example.com",
    phone: "08030000000",
    entry_mode: "JAMB",
    metadata: null,
    created_at: "2026-05-20T12:40:25+00:00",
    state: { id: 19, name: "Lagos", code: "LA", countryCode: "NG" },
    lga: { id: 244, name: "Ikeja", stateId: 19 },
    cycle: {
      id: 7,
      sessionId: 16,
      name: "2025/2026 Admission",
      status: "APPLICATION_OPEN",
      startDate: "2025-05-01T00:00:00+00:00",
      endDate: "2025-08-31T23:59:59+00:00",
      createdAt: "2026-01-10T08:00:00+00:00",
    },
    jambScores: [
      {
        id: 1,
        candidate_id: 130,
        subject_id: 3,
        score: 78,
        created_at: "2026-06-10T10:00:00+00:00",
        subject: { id: 3, name: "Mathematics", code: "MTH", created_at: "..." },
      },
    ],
    olevelSittings: [
      {
        id: 12,
        candidate_id: 130,
        exam_type: "WAEC",
        exam_year: 2023,
        exam_reg_no: "42511234AB",
        center_number: null,
        school_name: "Example High School",
        metadata: null,
        created_at: "2026-06-10T11:00:00+00:00",
        grades: [
          {
            subject_id: 5,
            grade: "A1",
            id: 44,
            subject: {
              id: 5,
              name: "English Language",
              code: "ENG",
              created_at: "...",
            },
          },
        ],
      },
    ],
  },
  appliedProgram: {
    id: 4,
    departmentId: 2,
    name: "Computer Science",
    degreeTitle: "B.Sc",
    durationInYears: 4,
    maxResidencyYears: 8,
    createdAt: "2026-01-01T00:00:00+00:00",
    updatedAt: "2026-01-01T00:00:00+00:00",
  },
  offeredProgram: null,
  screening: {
    id: 63,
    candidate_id: 130,
    jamb_score: "278",
    school_raw_score: "22",
    aggregate_score: "71.50",
    score_details: { postUtme: 12 },
    created_at: "2026-06-12T16:29:39+00:00",
  },
};

describe("mapMeAdmissionApplication", () => {
  it("maps full dossier with mixed snake_case and camelCase keys", () => {
    const result = mapMeAdmissionApplication(fullDossierFixture);

    expect(result.id).toBe(54);
    expect(result.applicationStatus).toBe("SUBMITTED");
    expect(result.finalDecision).toBe("PENDING");
    expect(result.candidate?.firstName).toBe("Aisha");
    expect(result.candidate?.jambRegNo).toBe("202655999999AA");
    expect(result.candidate?.state?.name).toBe("Lagos");
    expect(result.candidate?.lga?.name).toBe("Ikeja");
    expect(result.candidate?.cycle?.name).toBe("2025/2026 Admission");
    expect(result.candidate?.jambScores).toHaveLength(1);
    expect(result.candidate?.jambScores[0].subject?.name).toBe("Mathematics");
    expect(result.candidate?.olevelSittings).toHaveLength(1);
    expect(result.candidate?.olevelSittings[0].examType).toBe("WAEC");
    expect(result.candidate?.olevelSittings[0].grades[0].grade).toBe("A1");
    expect(result.appliedProgram?.name).toBe("Computer Science");
    expect(result.offeredProgram).toBeUndefined();
    expect(result.screening?.aggregateScore).toBe("71.50");
    expect(result.screening?.scoreDetails).toEqual({ postUtme: 12 });
  });

  it("maps base-only response without embeds", () => {
    const result = mapMeAdmissionApplication({
      id: 54,
      candidateId: 130,
      appliedProgramId: 4,
      offeredProgramId: null,
      applicationStatus: "DRAFT",
      finalDecision: "PENDING",
      isMatriculated: false,
      updatedAt: "2026-06-12T16:29:39+00:00",
    });

    expect(result.applicationStatus).toBe("DRAFT");
    expect(result.candidate).toBeUndefined();
    expect(result.appliedProgram).toBeUndefined();
    expect(result.screening).toBeUndefined();
  });

  it("handles snake_case top-level application fields", () => {
    const result = mapMeAdmissionApplication({
      id: 1,
      candidate_id: 2,
      applied_program_id: 3,
      offered_program_id: 5,
      application_status: "DOCUMENTS_VERIFIED",
      final_decision: "ADMIT_MERIT",
      is_matriculated: true,
      updated_at: "2026-01-01T00:00:00+00:00",
    });

    expect(result.candidateId).toBe(2);
    expect(result.appliedProgramId).toBe(3);
    expect(result.offeredProgramId).toBe(5);
    expect(result.applicationStatus).toBe("DOCUMENTS_VERIFIED");
    expect(result.finalDecision).toBe("ADMIT_MERIT");
    expect(result.isMatriculated).toBe(true);
  });

  it("returns empty arrays when jamb and olevel embeds are missing", () => {
    const result = mapMeAdmissionApplication({
      ...fullDossierFixture,
      candidate: {
        id: 130,
        cycle_id: 7,
        first_name: "A",
        last_name: "B",
        state_id: 1,
        created_at: "2026-01-01T00:00:00+00:00",
      },
    });

    expect(result.candidate?.jambScores).toEqual([]);
    expect(result.candidate?.olevelSittings).toEqual([]);
  });
});
