import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export const LEGACY_SUBMISSION_STORAGE_PREFIX = "dynamic-form-submission-";

export type AdmissionApplicationSessionState = {
  submissionIdsByCycleId: Record<number, number>;
};

export const initialAdmissionApplicationSessionState: AdmissionApplicationSessionState =
  {
    submissionIdsByCycleId: {},
  };

const admissionApplicationSessionSlice = createSlice({
  name: "admissionApplicationSession",
  initialState: initialAdmissionApplicationSessionState,
  reducers: {
    setSubmissionId(
      state,
      action: PayloadAction<{ cycleId: number; submissionId: number }>,
    ) {
      state.submissionIdsByCycleId[action.payload.cycleId] =
        action.payload.submissionId;
    },
    clearSubmissionId(state, action: PayloadAction<number>) {
      delete state.submissionIdsByCycleId[action.payload];
    },
    clearAllSubmissionIds() {
      return initialAdmissionApplicationSessionState;
    },
  },
});

export const {
  setSubmissionId,
  clearSubmissionId,
  clearAllSubmissionIds,
} = admissionApplicationSessionSlice.actions;

export default admissionApplicationSessionSlice.reducer;

export function selectSubmissionIdForCycle(
  state: { admissionApplicationSession: AdmissionApplicationSessionState },
  cycleId: number | null,
): number | null {
  if (cycleId == null) return null;
  return state.admissionApplicationSession.submissionIdsByCycleId[cycleId] ?? null;
}

/** One-time import from legacy sessionStorage key, then remove it. */
export function readLegacySessionStorageSubmissionId(
  cycleId: number,
): number | null {
  const raw = sessionStorage.getItem(
    `${LEGACY_SUBMISSION_STORAGE_PREFIX}${cycleId}`,
  );
  if (!raw) return null;
  sessionStorage.removeItem(`${LEGACY_SUBMISSION_STORAGE_PREFIX}${cycleId}`);
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
}
