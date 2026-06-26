import type { DocumentUpload } from "@/features/dynamic-form/api/documentUploadApi";
import type { MeAdmissionApplication } from "../types/me-admission-application";
import type { PrintableApplicationDocumentModel } from "../types/acknowledgement-slip";
import { buildAcknowledgementReference } from "./buildAcknowledgementReference";
import { canViewApplicationDocuments } from "./canViewApplicationDocuments";
import { resolveJambSubjectName } from "./meApplicationJambDisplay";
import { resolveRelatedName } from "./applicationDossierDisplay";
import { resolveApplicationStatusDisplay } from "../constants/meAdmissionApplicationOptions";

export type BuildPrintableApplicationModelInput = {
  application: MeAdmissionApplication;
  profilePictureUrl: string | null | undefined;
  logoUrl: string | null | undefined;
  schoolName: string | null | undefined;
  documentUploads?: DocumentUpload[];
};

function resolveSubmittedAt(application: MeAdmissionApplication): string | null {
  if (application.submittedAt) return application.submittedAt;
  if (canViewApplicationDocuments(application.applicationStatus)) {
    return application.updatedAt || null;
  }
  return null;
}

export function buildPrintableApplicationModel({
  application,
  profilePictureUrl,
  logoUrl,
  schoolName,
  documentUploads = [],
}: BuildPrintableApplicationModelInput): PrintableApplicationDocumentModel | null {
  if (!canViewApplicationDocuments(application.applicationStatus)) {
    return null;
  }

  const candidate = application.candidate;
  if (!candidate) return null;

  const cycleId = candidate.cycleId ?? candidate.cycle?.id ?? 0;
  const applicantName = `${candidate.firstName} ${candidate.lastName}`.trim();
  const statusDisplay = resolveApplicationStatusDisplay(
    application.applicationStatus,
  );

  return {
    acknowledgementNumber: buildAcknowledgementReference({
      cycleId,
      applicationId: application.id,
      acknowledgementNumber: application.acknowledgementNumber,
    }),
    applicantName,
    profilePictureUrl: profilePictureUrl?.trim() || null,
    jambRegNo: candidate.jambRegNo,
    dateOfBirth: candidate.dateOfBirth,
    gender: candidate.gender,
    stateName: resolveRelatedName(candidate.state, candidate.stateId),
    lgaName: resolveRelatedName(candidate.lga, candidate.lgaId),
    email: candidate.email,
    phone: candidate.phone,
    programmeName: application.appliedProgram?.name ?? null,
    cycleName: candidate.cycle?.name ?? null,
    entryMode: candidate.entryMode,
    applicationStatus: statusDisplay.label,
    submittedAt: resolveSubmittedAt(application),
    candidateId: candidate.id,
    applicationId: application.id,
    logoUrl: logoUrl?.trim() || null,
    schoolName: schoolName?.trim() || null,
    jambScores: (candidate.jambScores ?? []).map((score) => ({
      subject: resolveJambSubjectName(score),
      score: score.score,
    })),
    olevelSittings: (candidate.olevelSittings ?? []).map((sitting) => ({
      examType: sitting.examType,
      examYear: sitting.examYear,
      examRegNo: sitting.examRegNo,
      grades: (sitting.grades ?? []).map((grade) => ({
        subject: grade.subject?.name ?? `Subject #${grade.subjectId}`,
        grade: grade.grade,
      })),
    })),
    documents: documentUploads.map((upload) => ({
      filename: upload.originalFilename,
      documentType: upload.documentTypeCode.replace(/_/g, " "),
      status: upload.status,
    })),
  };
}
