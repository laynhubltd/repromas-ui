export type MeApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "DOCUMENTS_VERIFIED";

export type MeFinalDecision =
  | "PENDING"
  | "ADMIT_MERIT"
  | "ADMIT_CATCHMENT"
  | "ADMIT_ELDS"
  | "OFFER_CHANGE_OF_COURSE"
  | "REJECTED";

export type MeAdmissionCandidateGender = "MALE" | "FEMALE" | "OTHER";

export type MeAdmissionCandidateEntryMode = "JAMB" | string;

export type MeAdmissionRef = {
  id: number;
  name: string;
  code?: string;
  countryCode?: string;
  stateId?: number;
};

export type MeAdmissionCycleEmbed = {
  id: number;
  sessionId: number;
  name: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt?: string;
};

export type MeAdmissionSubjectRef = {
  id: number;
  name: string;
  code?: string;
  createdAt?: string;
};

export type MeAdmissionJambScore = {
  id: number;
  candidateId: number;
  subjectId: number;
  score: number;
  createdAt: string;
  subject?: MeAdmissionSubjectRef | null;
};

export type MeAdmissionOlevelGrade = {
  id: number;
  subjectId: number;
  grade: string;
  subject?: MeAdmissionSubjectRef | null;
};

export type MeAdmissionOlevelSitting = {
  id: number;
  candidateId: number;
  examType: string;
  examYear: number;
  examRegNo: string | null;
  centerNumber: string | null;
  schoolName: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  grades: MeAdmissionOlevelGrade[];
};

export type MeAdmissionApplicationCandidate = {
  id: number;
  cycleId: number;
  jambRegNo: string | null;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  gender: MeAdmissionCandidateGender | null;
  stateId: number;
  lgaId: number | null;
  email: string | null;
  phone: string | null;
  entryMode: MeAdmissionCandidateEntryMode | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  state?: MeAdmissionRef | null;
  lga?: MeAdmissionRef | null;
  cycle?: MeAdmissionCycleEmbed | null;
  jambScores: MeAdmissionJambScore[];
  olevelSittings: MeAdmissionOlevelSitting[];
};

export type MeAdmissionProgramSummary = {
  id: number;
  departmentId?: number;
  name: string;
  degreeTitle?: string;
  durationInYears?: number;
  maxResidencyYears?: number;
  createdAt?: string;
  updatedAt?: string;
  department?: MeAdmissionRef | null;
};

export type MeAdmissionScreening = {
  id: number;
  candidateId: number;
  jambScore: string | null;
  schoolRawScore: string | null;
  aggregateScore: string | null;
  scoreDetails: Record<string, unknown>;
  createdAt: string;
};

export type MeAdmissionApplication = {
  id: number;
  candidateId: number;
  appliedProgramId: number;
  offeredProgramId: number | null;
  applicationStatus: MeApplicationStatus | string;
  finalDecision: MeFinalDecision | string;
  isMatriculated: boolean;
  updatedAt: string;
  candidate?: MeAdmissionApplicationCandidate | null;
  appliedProgram?: MeAdmissionProgramSummary | null;
  offeredProgram?: MeAdmissionProgramSummary | null;
  screening?: MeAdmissionScreening | null;
};
