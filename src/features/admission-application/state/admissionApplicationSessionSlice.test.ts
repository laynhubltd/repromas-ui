import { describe, expect, it } from "vitest";
import {
  clearAllSubmissionIds,
  clearSubmissionId,
  initialAdmissionApplicationSessionState,
  readLegacySessionStorageSubmissionId,
  selectSubmissionIdForCycle,
  setSubmissionId,
} from "./admissionApplicationSessionSlice";
import admissionApplicationSessionReducer from "./admissionApplicationSessionSlice";

describe("admissionApplicationSessionSlice", () => {
  it("sets submission id by cycle", () => {
    const state = admissionApplicationSessionReducer(
      initialAdmissionApplicationSessionState,
      setSubmissionId({ cycleId: 7, submissionId: 42 }),
    );
    expect(state.submissionIdsByCycleId).toEqual({ 7: 42 });
  });

  it("clears submission id for one cycle", () => {
    const withId = admissionApplicationSessionReducer(
      initialAdmissionApplicationSessionState,
      setSubmissionId({ cycleId: 7, submissionId: 42 }),
    );
    const cleared = admissionApplicationSessionReducer(
      withId,
      clearSubmissionId(7),
    );
    expect(cleared.submissionIdsByCycleId).toEqual({});
  });

  it("clears all submission ids", () => {
    const withIds = admissionApplicationSessionReducer(
      admissionApplicationSessionReducer(
        initialAdmissionApplicationSessionState,
        setSubmissionId({ cycleId: 1, submissionId: 10 }),
      ),
      setSubmissionId({ cycleId: 2, submissionId: 20 }),
    );
    const cleared = admissionApplicationSessionReducer(
      withIds,
      clearAllSubmissionIds(),
    );
    expect(cleared).toEqual(initialAdmissionApplicationSessionState);
  });

  it("selects submission id for cycle", () => {
    const rootState = {
      admissionApplicationSession: {
        submissionIdsByCycleId: { 7: 42 },
      },
    };
    expect(selectSubmissionIdForCycle(rootState, 7)).toBe(42);
    expect(selectSubmissionIdForCycle(rootState, null)).toBeNull();
    expect(selectSubmissionIdForCycle(rootState, 99)).toBeNull();
  });

  it("imports legacy sessionStorage id and removes the key", () => {
    sessionStorage.setItem("dynamic-form-submission-5", "123");
    expect(readLegacySessionStorageSubmissionId(5)).toBe(123);
    expect(sessionStorage.getItem("dynamic-form-submission-5")).toBeNull();
  });
});
