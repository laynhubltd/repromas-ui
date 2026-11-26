import { describe, expect, it } from "vitest";
import { mapAdmissionSignupConfig } from "./mapAdmissionSignupConfig";
import { mapCandidateLookupResponse } from "./mapCandidateLookupResponse";
import { mapCandidateSignupResponse } from "./mapCandidateSignupResponse";
import { mapCandidateSignupToLoginResponse } from "./mapCandidateSignupToLoginResponse";

describe("mapAdmissionSignupConfig", () => {
  it("maps snake_case multi-lane payload", () => {
    expect(
      mapAdmissionSignupConfig({
        cycle_id: 4,
        name: "2025/2026 Admission",
        status: "APPLICATION_OPEN",
        entry_modes: [
          { entry_mode: "UTME", identity_mode: "JAMB" },
          { entry_mode: "DIRECT_ENTRY", identity_mode: "OPEN" },
        ],
        batch_no: 1,
        start_date: "2025-05-01T00:00:00+00:00",
        end_date: "2025-08-31T23:59:59+00:00",
      }),
    ).toEqual({
      cycleId: 4,
      name: "2025/2026 Admission",
      status: "APPLICATION_OPEN",
      entryModes: [
        { entryMode: "UTME", identityMode: "JAMB" },
        { entryMode: "DIRECT_ENTRY", identityMode: "OPEN" },
      ],
      batchNo: 1,
      startDate: "2025-05-01T00:00:00+00:00",
      endDate: "2025-08-31T23:59:59+00:00",
    });
  });

  it("handles empty paused entry_modes array and maps optional session_id", () => {
    expect(
      mapAdmissionSignupConfig({
        cycle_id: 4,
        name: "DE Admission",
        status: "APPLICATION_OPEN",
        entryModes: [],
        batch_no: 2,
        session_id: 16,
      }),
    ).toMatchObject({
      entryModes: [],
      batchNo: 2,
      sessionId: 16,
    });
  });
});

describe("mapCandidateLookupResponse", () => {
  it("maps snake_case lookup response including entry_mode", () => {
    expect(
      mapCandidateLookupResponse({
        first_name: "John",
        last_name: "Doe",
        gender: "MALE",
        state: "Lagos",
        lga: "Ikeja",
        applied_program: "Computer Science",
        entry_mode: "DIRECT_ENTRY",
        verification_token: "opaque-token",
      }),
    ).toMatchObject({
      firstName: "John",
      lastName: "Doe",
      entryMode: "DIRECT_ENTRY",
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
  it("defaults CANDIDATE role with candidate id and lane entryMode when API omits roles", () => {
    const login = mapCandidateSignupToLoginResponse(
      {
        candidateId: 1,
        user: { id: 1, email: "a@b.com" },
        profile: { id: 1, firstName: "A", lastName: "B" },
        token: "t",
        refreshToken: "r",
      },
      "DIRECT_ENTRY",
    );

    expect(login.roles).toEqual([
      expect.objectContaining({
        name: "Candidate",
        scope: "CANDIDATE",
        scopeReferenceId: 1,
        entity: expect.objectContaining({
          entryMode: "DIRECT_ENTRY",
        }),
      }),
    ]);
    expect(login.token).toBe("t");
    expect(login.profile.email).toBe("a@b.com");
  });
});
