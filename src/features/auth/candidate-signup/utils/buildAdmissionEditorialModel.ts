import { appPaths } from "@/app/routing/app-path";
import { getCandidateEntryModeLabel } from "@/shared/constants/admissionCandidateOptions";
import { CANDIDATE_SIGNUP_UI_COPY } from "@/shared/constants/candidateSignupOptions";
import dayjs from "dayjs";
import type { AdmissionSignupConfig } from "../types/candidate-signup";

export type AdmissionGuideStep = {
  stepNumber: number;
  title: string;
  description: string;
};

export type AdmissionEditorialModel = {
  cycleId: number;
  headline: string;
  body: string;
  laneSummary: string;
  steps: AdmissionGuideStep[];
  signUpHref: string;
};

function formatHeadlineCycleName(
  rawName: string | undefined,
  batchNo: number,
): string {
  const base =
    rawName?.trim() || CANDIDATE_SIGNUP_UI_COPY.admissionOpenNoticeFallbackCycle;
  const pluralized = /\bAdmission$/i.test(base)
    ? base.replace(/\bAdmission$/i, "Admissions")
    : base;
  const withOpen = /\bAdmissions$/i.test(pluralized)
    ? `${pluralized} are open.`
    : `${pluralized} admissions are open.`;
  return batchNo > 1 ? `${withOpen.slice(0, -1)} (Batch ${batchNo}).` : withOpen;
}

function joinWithOxfordComma(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0]!;
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function buildProcessSteps(
  config: AdmissionSignupConfig,
  laneListText: string,
): AdmissionGuideStep[] {
  const hasJamb = config.entryModes.some((l) => l.identityMode === "JAMB");
  const openLaneNames = joinWithOxfordComma(
    config.entryModes
      .filter((l) => l.identityMode === "OPEN")
      .map((l) => getCandidateEntryModeLabel(l.entryMode)),
  );

  const stepOneDescription =
    hasJamb && openLaneNames
      ? `Choose ${laneListText}. Verify your JAMB Reg No for JAMB entry modes, or enter your details directly for ${openLaneNames}.`
      : hasJamb
        ? `Choose ${laneListText} and enter your JAMB registration number to verify your CAPS record.`
        : `Select ${laneListText} and enter your personal and prior qualification details.`;

  return [
    {
      stepNumber: 1,
      title: "Select entry mode & verify details",
      description: stepOneDescription,
    },
    {
      stepNumber: 2,
      title: "Create candidate account",
      description:
        "Confirm your details, set your email and password, and sign in automatically.",
    },
    {
      stepNumber: 3,
      title: "Complete & submit application",
      description:
        "Fill your bio-data, O-Level results, and programme choices from your portal.",
    },
  ];
}

/** Builds display copy and tailored 3-step directions from live signup config. */
export function buildAdmissionEditorialModel(
  config: AdmissionSignupConfig,
): AdmissionEditorialModel {
  const laneLabels = config.entryModes.map((lane) =>
    getCandidateEntryModeLabel(lane.entryMode),
  );
  const laneListText = joinWithOxfordComma(laneLabels);
  const parsedEndDate = config.endDate ? dayjs(config.endDate) : null;
  const formattedEndDate = parsedEndDate?.isValid()
    ? parsedEndDate.format("MMMM D, YYYY")
    : null;

  const subjectPhrase = laneListText
    ? `Prospective ${laneListText} candidates`
    : "Prospective candidates";
  const deadlineClause = formattedEndDate ? ` before ${formattedEndDate}.` : ".";

  return {
    cycleId: config.cycleId,
    headline: formatHeadlineCycleName(config.name, config.batchNo),
    body: `${subjectPhrase} can register and complete their applications online${deadlineClause}`,
    laneSummary: laneLabels.join(" · "),
    steps: buildProcessSteps(config, laneListText || "your entry mode"),
    signUpHref: appPaths.candidateSignUp,
  };
}
