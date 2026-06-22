import type { MeAdmissionApplication } from "../types/me-admission-application";
import { ME_APPLICATION_UI_COPY } from "../constants/meAdmissionApplicationOptions";

export type LifecycleStepKey =
  | "started"
  | "fee"
  | "submitted"
  | "verified"
  | "decision";

export type LifecycleStepItem = {
  key: LifecycleStepKey;
  title: string;
};

export const APPLICATION_LIFECYCLE_STEPS: LifecycleStepItem[] = [
  { key: "started", title: ME_APPLICATION_UI_COPY.lifecycleStarted },
  { key: "fee", title: ME_APPLICATION_UI_COPY.lifecycleFee },
  { key: "submitted", title: ME_APPLICATION_UI_COPY.lifecycleSubmitted },
  { key: "verified", title: ME_APPLICATION_UI_COPY.lifecycleVerified },
  { key: "decision", title: ME_APPLICATION_UI_COPY.lifecycleDecision },
];

export type LifecycleStepStatus = "finish" | "process" | "wait";

export type DerivedLifecycleState = {
  currentStepIndex: number;
  stepStatuses: LifecycleStepStatus[];
};

export function shouldShowOfferCard(application: MeAdmissionApplication): boolean {
  return (
    application.offeredProgramId != null ||
    application.finalDecision === "OFFER_CHANGE_OF_COURSE"
  );
}

export function shouldShowScreeningSection(
  application: MeAdmissionApplication,
): boolean {
  return (
    application.applicationStatus === "SUBMITTED" ||
    application.applicationStatus === "DOCUMENTS_VERIFIED" ||
    application.screening != null
  );
}

export function shouldShowScreeningPending(
  application: MeAdmissionApplication,
): boolean {
  return (
    (application.applicationStatus === "SUBMITTED" ||
      application.applicationStatus === "DOCUMENTS_VERIFIED") &&
    application.screening == null
  );
}

export function shouldShowJambSection(
  application: MeAdmissionApplication,
): boolean {
  const scores = application.candidate?.jambScores ?? [];
  return scores.length > 0;
}

export function shouldShowOlevelSection(
  application: MeAdmissionApplication,
): boolean {
  const sittings = application.candidate?.olevelSittings ?? [];
  return sittings.length > 0;
}

export function isDraftApplication(application: MeAdmissionApplication): boolean {
  return application.applicationStatus === "DRAFT";
}

export function deriveLifecycleState({
  application,
  feePaid,
}: {
  application: MeAdmissionApplication;
  feePaid: boolean;
}): DerivedLifecycleState {
  const status = application.applicationStatus;
  const decision = application.finalDecision;

  const startedComplete = true;
  const feeComplete =
    feePaid || status === "SUBMITTED" || status === "DOCUMENTS_VERIFIED";
  const submittedComplete =
    status === "SUBMITTED" || status === "DOCUMENTS_VERIFIED";
  const verifiedComplete = status === "DOCUMENTS_VERIFIED";
  const decisionComplete = decision !== "PENDING";

  const completions = [
    startedComplete,
    feeComplete,
    submittedComplete,
    verifiedComplete,
    decisionComplete,
  ];

  const firstIncomplete = completions.findIndex((c) => !c);
  const currentStepIndex =
    firstIncomplete === -1 ? completions.length - 1 : firstIncomplete;

  const stepStatuses: LifecycleStepStatus[] = completions.map((complete, index) => {
    if (complete) return "finish";
    if (index === currentStepIndex) return "process";
    return "wait";
  });

  return { currentStepIndex, stepStatuses };
}

export function formatApplicationDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function resolveRelatedName(
  ref: { name?: string } | null | undefined,
  fallbackId?: number | null,
): string {
  if (ref?.name) return ref.name;
  if (fallbackId != null) return `#${fallbackId}`;
  return "—";
}
