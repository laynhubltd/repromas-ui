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
        start_date: "2025-05-01T00:00:00+00:00",
        end_date: "2025-08-31T23:59:59+00:00",
      }),
    ).toEqual({
      cycleId: 4,
      name: "2025/2026 Admission",
      status: "APPLICATION_OPEN",
      admissionIdentityMode: "JAMB",
      startDate: "2025-05-01T00:00:00+00:00",
      endDate: "2025-08-31T23:59:59+00:00",
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
  it("defaults CANDIDATE role when API omits roles", () => {
    const login = mapCandidateSignupToLoginResponse({
      candidateId: 1,
      user: { id: 1, email: "a@b.com" },
      profile: { id: 1, firstName: "A", lastName: "B" },
      token: "t",
      refreshToken: "r",
    });

    expect(login.roles).toEqual([
      {
        name: "Candidate",
        scope: "CANDIDATE",
        scopeReferenceId: null,
        entity: null,
      },
    ]);
    expect(login.token).toBe("t");
    expect(login.profile.email).toBe("a@b.com");
  });
});
