import type { MatricNumberFormatPrerequisites } from "../types/matric-number-format";

const TOKEN_REGEX = /\{[^}]+\}/g;

const SESSION_TOKEN_REGEX = /\{session(Upper|Lower)(YY|YYYY)\}/;

const HIERARCHY_TOKENS = ["{facultyCode}", "{departmentCode}", "{programCode}"];

const KNOWN_TOKEN_PATTERN =
  /^\{(tenantSlug|tenantCode|facultyCode|departmentCode|programCode|sessionUpperYY|sessionLowerYY|sessionUpperYYYY|sessionLowerYYYY|seq(?::\d+)?)\}$/;

let segmentCounter = 0;

function nextSegmentId(): string {
  segmentCounter += 1;
  return `seg-${segmentCounter}-${Date.now()}`;
}

export function resetSegmentIdCounter(): void {
  segmentCounter = 0;
}

export function isKnownMatricToken(token: string): boolean {
  return KNOWN_TOKEN_PATTERN.test(token);
}

export function templateNeedsSession(template: string): boolean {
  return SESSION_TOKEN_REGEX.test(template);
}

export function templateNeedsProgramHierarchy(template: string): boolean {
  return HIERARCHY_TOKENS.some((t) => template.includes(t));
}

export function isPrerequisitesReadyForTemplate(
  prerequisites: MatricNumberFormatPrerequisites | undefined,
  template: string,
): boolean {
  const normalized = normalizeMatricPrerequisites(prerequisites);
  if (!normalized) return false;

  if (normalized.ready) return true;

  const needsHierarchy = templateNeedsProgramHierarchy(template);
  const needsSession = templateNeedsSession(template);

  const programsWithIssues = normalized.programsMissingCode.filter(
    (p) => isMigrationPlaceholderCode(p.code) || !p.code?.trim(),
  );

  if (needsHierarchy && programsWithIssues.length > 0) return false;
  if (needsSession && normalized.unparseableSessions.length > 0) return false;

  // Template does not use tokens blocked by current prerequisite issues.
  if (!needsHierarchy && !needsSession) return true;

  return (
    (!needsHierarchy || programsWithIssues.length === 0) &&
    (!needsSession || normalized.unparseableSessions.length === 0)
  );
}

export type ActivationBlocker = {
  key: string;
  label: string;
  met: boolean;
};

export function getActivationBlockers(input: {
  isDraft: boolean;
  prerequisitesReady: boolean;
  unknownTokens: string[];
  isLengthInvalid: boolean;
  previewError: string | null;
  hasPreviewResult: boolean;
  previewProgramSelected: boolean;
}): ActivationBlocker[] {
  return [
    {
      key: "draft",
      label: "Format is saved as a draft",
      met: input.isDraft,
    },
    {
      key: "prerequisites",
      label: "Prerequisites satisfied for this template",
      met: input.prerequisitesReady,
    },
    {
      key: "tokens",
      label: "Template uses only known tokens",
      met: input.unknownTokens.length === 0,
    },
    {
      key: "length",
      label: "Preview length is 50 characters or fewer",
      met: !input.isLengthInvalid,
    },
    {
      key: "preview-program",
      label: "Sample program selected in Live preview",
      met: input.previewProgramSelected,
    },
    {
      key: "preview-success",
      label: "Live preview generated successfully",
      met: input.hasPreviewResult && !input.previewError,
    },
  ];
}

export function canActivateMatricFormat(input: {
  isDraft: boolean;
  prerequisitesReady: boolean;
  unknownTokens: string[];
  isLengthInvalid: boolean;
  previewError: string | null;
  hasPreviewResult: boolean;
  previewProgramSelected: boolean;
}): boolean {
  return getActivationBlockers(input).every((blocker) => blocker.met);
}

export function parseTemplateSegments(template: string): import("../types/matric-number-format").TemplateSegment[] {
  if (!template) return [];

  const segments: import("../types/matric-number-format").TemplateSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const regex = new RegExp(TOKEN_REGEX.source, "g");
  while ((match = regex.exec(template)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: "literal",
        value: template.slice(lastIndex, match.index),
        id: nextSegmentId(),
      });
    }
    segments.push({
      type: "token",
      value: match[0],
      id: nextSegmentId(),
    });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < template.length) {
    segments.push({
      type: "literal",
      value: template.slice(lastIndex),
      id: nextSegmentId(),
    });
  }

  return segments;
}

export function serializeTemplateSegments(
  segments: import("../types/matric-number-format").TemplateSegment[],
): string {
  return segments.map((s) => s.value).join("");
}

export function findUnknownTokens(template: string): string[] {
  const matches = template.match(TOKEN_REGEX) ?? [];
  return matches.filter((token) => !isKnownMatricToken(token));
}

export function truncateTemplateSnippet(template: string, maxLength = 40): string {
  if (template.length <= maxLength) return template;
  return `${template.slice(0, maxLength - 1)}…`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function normalizeMatricPrerequisites(
  prerequisites: MatricNumberFormatPrerequisites | undefined,
): MatricNumberFormatPrerequisites | undefined {
  if (!prerequisites) return undefined;
  const programsMissing = prerequisites.programsMissingCode ?? [];
  const sessionsUnparseable = prerequisites.unparseableSessions ?? [];
  const inferredReady =
    programsMissing.length === 0 && sessionsUnparseable.length === 0;

  return {
    ready: prerequisites.ready ?? inferredReady,
    programsMissingCode: programsMissing,
    unparseableSessions: sessionsUnparseable,
  };
}

export function isMigrationPlaceholderCode(code: string): boolean {
  return /^PROG_\d+$/.test(code);
}

export function suggestCounterPartition(template: string): import("../types/matric-number-format").CounterPartition {
  if (templateNeedsProgramHierarchy(template)) {
    return "PROGRAM_AND_SESSION";
  }
  if (templateNeedsSession(template)) {
    return "SESSION";
  }
  return "TENANT";
}
