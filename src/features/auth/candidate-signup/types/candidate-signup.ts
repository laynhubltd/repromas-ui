import type {
  AdmissionCycleStatus as SharedAdmissionCycleStatus,
  AdmissionEntryMode,
  AdmissionIdentityMode,
} from "@/shared/types/admission-lane";

export type { AdmissionEntryMode, AdmissionIdentityMode };

export type AdmissionCycleStatus = SharedAdmissionCycleStatus | string;

export type SignupConfigLane = {
  entryMode: AdmissionEntryMode;
  identityMode: AdmissionIdentityMode;
};

export type AdmissionLaneSelectors = {
  entryMode?: AdmissionEntryMode;
  sessionId?: number;
};

export type AdmissionSignupConfigParams = AdmissionLaneSelectors;

export type AdmissionSignupConfig = {
  cycleId: number;
  name: string;
  status: AdmissionCycleStatus;
  entryModes: SignupConfigLane[];
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
  entryMode: AdmissionEntryMode;
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
