import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  HourglassOutlined,
  PauseCircleOutlined,
  QuestionCircleOutlined,
  RedoOutlined,
  StopOutlined,
  TrophyOutlined,
  UserDeleteOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import React from "react";
import type {
  LevelProgression,
  ManagedBy,
  SemanticKind,
  StateCategory,
} from "../types/student-transition-status";

export const SEMANTIC_KIND_LABELS: Record<SemanticKind, string> = {
  GOOD_STANDING: "Good Standing",
  PROBATION: "Probation",
  REPEAT: "Repeat",
  SUSPENDED: "Suspended",
  DEFERRED: "Deferred / Leave",
  SPILLOVER: "Spillover",
  ABSENT: "Absent / Lapsed",
  WITHDRAWN: "Withdrawn",
  DISMISSED: "Dismissed",
  GRADUATED: "Graduated",
  OTHER: "Unclassified",
};

export const ALL_SEMANTIC_KINDS: SemanticKind[] = [
  "GOOD_STANDING",
  "PROBATION",
  "REPEAT",
  "SUSPENDED",
  "DEFERRED",
  "SPILLOVER",
  "ABSENT",
  "WITHDRAWN",
  "DISMISSED",
  "GRADUATED",
  "OTHER",
];

export const MANAGED_BY_LABELS: Record<ManagedBy, string> = {
  BOTH: "Both",
  ADMIN: "Admin only",
  ENGINE: "Engine only",
};

export const MANAGED_BY_OPTIONS = [
  { value: "BOTH" as ManagedBy, label: "Both (Admin & Engine)" },
  { value: "ADMIN" as ManagedBy, label: "Admin only (Manual Staff Placement)" },
  { value: "ENGINE" as ManagedBy, label: "Engine only (Automated Standing)" },
];

export function getSemanticKindIcon(kind?: SemanticKind): React.ReactNode {
  switch (kind) {
    case "GOOD_STANDING":
      return <CheckCircleOutlined />;
    case "PROBATION":
      return <WarningOutlined />;
    case "REPEAT":
      return <RedoOutlined />;
    case "SUSPENDED":
      return <PauseCircleOutlined />;
    case "DEFERRED":
      return <ClockCircleOutlined />;
    case "SPILLOVER":
      return <HourglassOutlined />;
    case "ABSENT":
      return <UserDeleteOutlined />;
    case "WITHDRAWN":
      return <CloseCircleOutlined />;
    case "DISMISSED":
      return <StopOutlined />;
    case "GRADUATED":
      return <TrophyOutlined />;
    case "OTHER":
    default:
      return <QuestionCircleOutlined />;
  }
}

export interface TransitionStatusPreset {
  stateCategory?: StateCategory;
  levelProgression?: LevelProgression;
  isTerminal?: boolean;
  exemptFromEvaluation?: boolean;
  countsTowardCareerCap?: boolean;
  countsTowardsResidency?: boolean;
  canRegisterCourses?: boolean;
  managedBy?: ManagedBy;
}

export const SEMANTIC_KIND_PRESETS: Record<SemanticKind, TransitionStatusPreset> = {
  GOOD_STANDING: {
    stateCategory: "POSITIVE",
    levelProgression: "PROMOTE",
    isTerminal: false,
    exemptFromEvaluation: false,
    countsTowardsResidency: true,
    countsTowardCareerCap: true,
    canRegisterCourses: true,
    managedBy: "BOTH",
  },
  PROBATION: {
    stateCategory: "NEGATIVE",
    levelProgression: "RETAIN",
    isTerminal: false,
    exemptFromEvaluation: false,
    countsTowardsResidency: true,
    countsTowardCareerCap: true,
    canRegisterCourses: true,
    managedBy: "BOTH",
  },
  REPEAT: {
    stateCategory: "NEGATIVE",
    levelProgression: "RETAIN",
    isTerminal: false,
    exemptFromEvaluation: false,
    countsTowardsResidency: true,
    countsTowardCareerCap: true,
    canRegisterCourses: true,
    managedBy: "BOTH",
  },
  SUSPENDED: {
    stateCategory: "NEGATIVE",
    levelProgression: "RETAIN",
    isTerminal: false,
    exemptFromEvaluation: false,
    countsTowardCareerCap: false,
    canRegisterCourses: false,
    managedBy: "ADMIN",
  },
  DEFERRED: {
    stateCategory: "NEUTRAL",
    levelProgression: "RETAIN",
    isTerminal: false,
    exemptFromEvaluation: true,
    countsTowardsResidency: false,
    canRegisterCourses: false,
    managedBy: "ADMIN",
  },
  SPILLOVER: {
    stateCategory: "NEUTRAL",
    levelProgression: "RETAIN",
    isTerminal: false,
    exemptFromEvaluation: false,
    countsTowardsResidency: true,
    canRegisterCourses: true,
    managedBy: "BOTH",
  },
  ABSENT: {
    stateCategory: "NEGATIVE",
    levelProgression: "RETAIN",
    isTerminal: false,
    exemptFromEvaluation: false,
    canRegisterCourses: true,
    managedBy: "BOTH",
  },
  WITHDRAWN: {
    stateCategory: "NEGATIVE",
    isTerminal: true,
    canRegisterCourses: false,
    managedBy: "BOTH",
  },
  DISMISSED: {
    stateCategory: "NEGATIVE",
    isTerminal: true,
    canRegisterCourses: false,
    managedBy: "BOTH",
  },
  GRADUATED: {
    stateCategory: "POSITIVE",
    isTerminal: true,
    canRegisterCourses: false,
    managedBy: "BOTH",
  },
  OTHER: {},
};

export interface CoherenceCheckInput {
  semanticKind?: SemanticKind;
  stateCategory?: StateCategory;
  levelProgression?: LevelProgression;
  isTerminal?: boolean;
  exemptFromEvaluation?: boolean;
  countsTowardCareerCap?: boolean;
}

export function lintTransitionStatusCoherence(
  values: CoherenceCheckInput,
): string[] {
  const warnings: string[] = [];
  const kind = values.semanticKind;

  if (!kind || kind === "OTHER") {
    return warnings;
  }

  // 1. Terminal kind with isTerminal off
  if (
    (kind === "WITHDRAWN" || kind === "DISMISSED" || kind === "GRADUATED") &&
    values.isTerminal === false
  ) {
    warnings.push("Terminal status type on a non-terminal status.");
  }

  // 2. GRADUATED with stateCategory: NEGATIVE
  if (kind === "GRADUATED" && values.stateCategory === "NEGATIVE") {
    warnings.push("Graduation marked adverse.");
  }

  // 3. DEFERRED with exemptFromEvaluation off
  if (kind === "DEFERRED" && values.exemptFromEvaluation === false) {
    warnings.push("Deferred students will still be evaluated.");
  }

  // 4. PROBATION / REPEAT with levelProgression: PROMOTE
  if (
    (kind === "PROBATION" || kind === "REPEAT") &&
    values.levelProgression === "PROMOTE"
  ) {
    warnings.push("This status would still promote the student.");
  }

  // 5. SUSPENDED with countsTowardCareerCap on
  if (kind === "SUSPENDED" && values.countsTowardCareerCap === true) {
    warnings.push("Suspension will consume probation allowance.");
  }

  return warnings;
}
