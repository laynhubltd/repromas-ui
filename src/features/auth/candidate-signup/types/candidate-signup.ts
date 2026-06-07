import type { AdmissionEntryMode } from "@/features/admission-config/tabs/admission-cycle/types/admission-cycle";

export type { AdmissionEntryMode };

export type AdmissionCycleStatus = "APPLICATION_OPEN" | string;

export type AdmissionIdentityMode = "JAMB" | "OPEN";

export type AdmissionLaneSelectors = {
  entryMode?: AdmissionEntryMode;
  sessionId?: number;
};

export type AdmissionSignupConfigParams = AdmissionLaneSelectors;

export type AdmissionSignupConfig = {
  cycleId: number;
  name: string;
  status: AdmissionCycleStatus;
  admissionIdentityMode: AdmissionIdentityMode;
  entryMode: AdmissionEntryMode;
  batchNo: number;
  sessionId?: number;
  startDate: string | null;
  endDate: string | null;
};

export type CandidateLookupRequest = {
  jambRegNo: string;
} & AdmissionLaneSelectors;

export type CandidateLookupResponse = {
  firstName: string;
  lastName: string;
  gender: string;
  state: string;
  lga: string;
  appliedProgram: string;
  verificationToken: string;
};

export type CandidateSignupJambRequest = {
  email: string;
  password: string;
  jambRegNo: string;
  verificationToken: string;
  phone?: string;
} & AdmissionLaneSelectors;

export type CandidateSignupOpenRequest = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  stateId: number;
  gender: string;
  lgaId: number;
  phone?: string;
  dateOfBirth: string;
} & AdmissionLaneSelectors;

export type CandidateSignupRequest =
  | CandidateSignupJambRequest
  | CandidateSignupOpenRequest;

export type CandidateSignupUser = {
  id: number;
  email: string;
};

export type CandidateSignupProfile = {
  id: number;
  firstName: string;
  lastName: string;
};

export type CandidateSignupResponse = {
  candidateId: number;
  user: CandidateSignupUser;
  profile: CandidateSignupProfile;
  token: string;
  refreshToken: string;
  roles?: { name: string; scope: string; scopeReferenceId: string | null }[];
  permissions?: string[];
};
