import type { MeAdmissionApplication } from "../types/me-admission-application";
import type { AcknowledgementSlipModel } from "../types/acknowledgement-slip";
import { buildAcknowledgementReference } from "./buildAcknowledgementReference";
import { buildAcknowledgementVerifyUrl } from "./buildAcknowledgementVerifyUrl";
import { canViewApplicationDocuments } from "./canViewApplicationDocuments";

export type BuildAcknowledgementSlipModelInput = {
  application: MeAdmissionApplication;
  profilePictureUrl: string | null | undefined;
  logoUrl: string | null | undefined;
  schoolName: string | null | undefined;
};

function resolveSubmittedAt(application: MeAdmissionApplication): string | null {
  if (application.submittedAt) return application.submittedAt;
  if (canViewApplicationDocuments(application.applicationStatus)) {
    return application.updatedAt || null;
  }
  return null;
}

export function buildAcknowledgementSlipModel({
  application,
  profilePictureUrl,
  logoUrl,
  schoolName,
}: BuildAcknowledgementSlipModelInput): AcknowledgementSlipModel | null {
  if (!canViewApplicationDocuments(application.applicationStatus)) {
    return null;
  }

  const candidate = application.candidate;
  if (!candidate) return null;

  const cycleId = candidate.cycleId ?? candidate.cycle?.id ?? 0;
  const applicantName = `${candidate.firstName} ${candidate.lastName}`.trim();

  return {
    acknowledgementNumber: buildAcknowledgementReference({
      cycleId,
      applicationId: application.id,
      acknowledgementNumber: application.acknowledgementNumber,
    }),
    verifyUrl: buildAcknowledgementVerifyUrl(application.id),
    applicantName,
    profilePictureUrl: profilePictureUrl?.trim() || null,
    jambRegNo: candidate.jambRegNo,
    programmeName: application.appliedProgram?.name ?? null,
    cycleName: candidate.cycle?.name ?? null,
    entryMode: candidate.entryMode,
    candidateId: candidate.id,
    applicationId: application.id,
    submittedAt: resolveSubmittedAt(application),
    logoUrl: logoUrl?.trim() || null,
    schoolName: schoolName?.trim() || null,
  };
}
