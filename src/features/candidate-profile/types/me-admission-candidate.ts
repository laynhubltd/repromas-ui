import type { AdmissionEntryMode } from "@/features/admission-config/tabs/admission-cycle/types/admission-cycle";
import type {
  AdmissionApplication,
  CandidateGender,
  LgaRef,
  StateRef,
} from "@/features/admission-candidate/types/admission-candidate";

export type MeAdmissionCycleEmbed = {
  id: number;
  sessionId: number;
  name: string;
  status: string;
  admissionIdentityMode?: "JAMB" | "OPEN";
  entryMode?: AdmissionEntryMode;
  batchNo?: number;
  startDate: string | null;
  endDate: string | null;
};

export type MeAdmissionCandidate = {
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
  metadata: Record<string, unknown> | null;
  application?: AdmissionApplication | null;
  state?: StateRef | null;
  lga?: LgaRef | null;
  cycle?: MeAdmissionCycleEmbed | null;
};

export type PatchMeAdmissionCandidateRequest = {
  email?: string;
  phone?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type PatchMeProfileRequest = {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
};
