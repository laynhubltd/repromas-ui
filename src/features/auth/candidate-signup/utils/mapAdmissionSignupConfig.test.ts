import { describe, expect, it } from "vitest";
import { mapAdmissionSignupConfig } from "./mapAdmissionSignupConfig";
import { mapCandidateLookupResponse } from "./mapCandidateLookupResponse";
import { mapCandidateSignupResponse } from "./mapCandidateSignupResponse";
import { mapCandidateSignupToLoginResponse } from "./mapCandidateSignupToLoginResponse";

describe("mapAdmissionSignupConfig", () => {
  it("maps snake_case payload from documentation", () => {
    expect(
      mapAdmissionSignupConfig({
        cycle_id: 4,
        name: "2025/2026 Admission",
        status: "APPLICATION_OPEN",
        admission_identity_mode: "JAMB",
        entry_mode: "UTME",
        batch_no: 1,
        start_date: "2025-05-01T00:00:00+00:00",
        end_date: "2025-08-31T23:59:59+00:00",
      }),
    ).toEqual({
      cycleId: 4,
      name: "2025/2026 Admission",
      status: "APPLICATION_OPEN",
      admissionIdentityMode: "JAMB",
      entryMode: "UTME",
      batchNo: 1,
      startDate: "2025-05-01T00:00:00+00:00",
      endDate: "2025-08-31T23:59:59+00:00",
    });
  });

  it("maps optional session_id", () => {
    expect(
      mapAdmissionSignupConfig({
        cycle_id: 4,
        name: "DE Admission",
        status: "APPLICATION_OPEN",
        admission_identity_mode: "OPEN",
        entry_mode: "DIRECT_ENTRY",
        batch_no: 2,
        session_id: 16,
      }),
    ).toMatchObject({
      entryMode: "DIRECT_ENTRY",
      batchNo: 2,
      sessionId: 16,
    });
  });
});

describe("mapCandidateLookupResponse", () => {
  it("maps snake_case lookup response", () => {
    expect(
      mapCandidateLookupResponse({
        first_name: "John",
        last_name: "Doe",
        gender: "MALE",
        state: "Lagos",
        lga: "Ikeja",
        applied_program: "Computer Science",
        verification_token: "opaque-token",
      }),
    ).toMatchObject({
      firstName: "John",
      lastName: "Doe",
      verificationToken: "opaque-token",
    });
  });
});

describe("mapCandidateSignupResponse", () => {
  it("maps snake_case signup response", () => {
    const result = mapCandidateSignupResponse({
      candidate_id: 42,
      user: { id: 10, email: "c@school.edu" },
      profile: { id: 8, first_name: "Jane", last_name: "Doe" },
      token: "eyJ",
      refresh_token: "ref",
    });

    expect(result.candidateId).toBe(42);
    expect(result.user.email).toBe("c@school.edu");
    expect(result.profile.firstName).toBe("Jane");
    expect(result.refreshToken).toBe("ref");
  });
});

describe("mapCandidateSignupToLoginResponse", () => {
  it("defaults CANDIDATE role with candidate id when API omits roles", () => {
    const login = mapCandidateSignupToLoginResponse({
      candidateId: 1,
      user: { id: 1, email: "a@b.com" },
      profile: { id: 1, firstName: "A", lastName: "B" },
      token: "t",
      refreshToken: "r",
    });

    expect(login.roles).toEqual([
      expect.objectContaining({
        name: "Candidate",
        scope: "CANDIDATE",
        scopeReferenceId: 1,
      }),
    ]);
    expect(login.token).toBe("t");
    expect(login.profile.email).toBe("a@b.com");
  });
});
