export type CandidateGender = "MALE" | "FEMALE" | "OTHER";

export type CandidateEntryMode = "JAMB";

export type ApplicationStatus =
  | "PENDING"
  | "DOCUMENTS_VERIFIED"
  | "OFFER_ADMISSION"
  | "REJECTED"
  | string;

export type FinalDecision =
  | "PENDING"
  | "OFFER_ADMISSION"
  | "REJECTED"
  | string;

/** Candidate embed on application when using application.candidate include. */
export type AdmissionApplicationCandidateEmbed = {
  id: number;
  jambRegNo?: string;
  firstName?: string;
  lastName?: string;
  jambScores?: AdmissionCandidateJambScore[];
};

export type AdmissionApplication = {
  id: number;
  candidateId: number;
  appliedProgramId: number;
  offeredProgramId: number | null;
  applicationStatus: ApplicationStatus;
  finalDecision: FinalDecision;
  isMatriculated: boolean;
  updatedAt: string;
  appliedProgram?: { id: number; name: string; code?: string };
  offeredProgram?: { id: number; name: string; code?: string };
  candidate?: AdmissionApplicationCandidateEmbed | null;
};

export type AdmissionScreening = {
  id: number;
  candidateId: number;
  jambScore: number | null;
  schoolRawScore: number | null;
  aggregateScore: number | null;
  scoreDetails: Record<string, unknown>;
};

export type StateRef = {
  id: number;
  name: string;
  code?: string;
  countryCode?: string;
};

export type LgaRef = {
  id: number;
  name: string;
  code?: string;
  stateId?: number;
};

export type AdmissionCycleRef = {
  id: number;
  name: string;
  status?: string;
};

export type OlevelSubjectRef = {
  id: number;
  name: string;
  code?: string | null;
};

export type AdmissionCandidateJambScore = {
  id: number;
  candidateId: number;
  subjectId: number;
  score: number;
  subject?: OlevelSubjectRef | null;
  olevelSubject?: OlevelSubjectRef | null;
};

export type AdmissionCandidate = {
  id: number;
  cycleId: number;
  jambRegNo: string | null;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  gender: CandidateGender | null;
  stateId: number;
  lgaId: number | null;
  email: string | null;
  phone: string | null;
  entryMode: CandidateEntryMode;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  application?: AdmissionApplication | null;
  screening?: AdmissionScreening | null;
  state?: StateRef | null;
  lga?: LgaRef | null;
  cycle?: AdmissionCycleRef | null;
};

export type PaginatedResponse<T> = {
  member: T[];
  totalItems: number;
  view?: { first?: string; last?: string; next?: string; previous?: string };
};

export type AdmissionCandidateListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  include?: string;
  "search[firstName]"?: string;
  "search[lastName]"?: string;
  "exact[jambRegNo]"?: string;
  "exact[id]"?: number;
  "exact[cycleId]"?: number;
  "exact[stateId]"?: number;
  "exact[gender]"?: CandidateGender;
  "exact[entryMode]"?: CandidateEntryMode;
};

export type JambScoreInput = {
  subjectId: number;
  score: number;
};

export type CreateAdmissionCandidateRequest = {
  cycleId: number;
  firstName: string;
  lastName: string;
  stateId: number;
  appliedProgramId: number;
  jambRegNo?: string | null;
  lgaId?: number | null;
  email?: string | null;
  phone?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  metadata?: Record<string, unknown> | null;
  jambScores?: JambScoreInput[];
};

export type CreateAdmissionCandidateResponse = {
  candidate: AdmissionCandidate;
  application: AdmissionApplication | null;
  jambScores: AdmissionCandidateJambScore[];
  warnings: CapsUploadIssue[];
};

export type CandidateIntakeMode = "manual" | "jamb";

export type PatchAdmissionCandidateMetadataRequest = {
  metadata: Record<string, unknown> | null;
};

export type CapsUploadIssue = {
  row?: number;
  key?: string;
  stage?: string;
  message: string;
};

export type CapsBulkUploadSummary = {
  processedCount: number;
  skippedCount: number;
  errors: CapsUploadIssue[];
  warnings: CapsUploadIssue[];
};

export type CapsBulkUploadSummaryState =
  | "success"
  | "partial"
  | "failed"
  | "parse-error";

export type MatriculateResponse = {
  message: string;
};
