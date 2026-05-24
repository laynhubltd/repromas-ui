export type AdmissionCycleStatus = "APPLICATION_OPEN" | string;

export type AdmissionIdentityMode = "JAMB" | "OPEN";

export type AdmissionSignupConfig = {
  cycleId: number;
  name: string;
  status: AdmissionCycleStatus;
  admissionIdentityMode: AdmissionIdentityMode;
  startDate: string | null;
  endDate: string | null;
};

export type CandidateLookupRequest = {
  jambRegNo: string;
};

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
};

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
};

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

export type NigerianLga = {
  id: number;
  name: string;
  code?: string;
  stateId?: number;
};

export type LgaListParams = {
  stateId: number;
  itemsPerPage?: number;
};

export type PaginatedMember<T> = {
  member: T[];
  totalItems: number;
};
