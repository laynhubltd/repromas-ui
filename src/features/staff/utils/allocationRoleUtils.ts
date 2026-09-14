import type { AllocationRole } from "../types/courseAllocation";

export type AllocationRoleMeta = {
  label: string;
  tagColor: string;
  description: string;
};

export const ALLOCATION_ROLE_CONFIG: Record<AllocationRole, AllocationRoleMeta> = {
  PRIMARY_LECTURER: {
    label: "Primary Lecturer",
    tagColor: "geekblue",
    description: "Lead instructor of record",
  },
  CO_LECTURER: {
    label: "Co-Lecturer",
    tagColor: "cyan",
    description: "Joint teaching lecturer",
  },
  ASSISTANT: {
    label: "Teaching Assistant",
    tagColor: "purple",
    description: "Practical/tutorial assistant",
  },
  MARKER: {
    label: "Marker",
    tagColor: "orange",
    description: "Assessment & grading marker",
  },
};

export const ALLOCATION_ROLE_OPTIONS: { value: AllocationRole; label: string }[] = [
  { value: "PRIMARY_LECTURER", label: ALLOCATION_ROLE_CONFIG.PRIMARY_LECTURER.label },
  { value: "CO_LECTURER", label: ALLOCATION_ROLE_CONFIG.CO_LECTURER.label },
  { value: "ASSISTANT", label: ALLOCATION_ROLE_CONFIG.ASSISTANT.label },
  { value: "MARKER", label: ALLOCATION_ROLE_CONFIG.MARKER.label },
];

export function getAllocationRoleLabel(role: AllocationRole): string {
  return ALLOCATION_ROLE_CONFIG[role]?.label ?? role;
}

export function getAllocationRoleTagColor(role: AllocationRole): string {
  return ALLOCATION_ROLE_CONFIG[role]?.tagColor ?? "default";
}

export function parseAllocationConflictError(
  error: unknown,
): { courseConfigurationId?: number; message: string } | null {
  if (!error || typeof error !== "object") return null;

  const err = error as {
    status?: number;
    data?: {
      detail?: string;
      message?: string;
      courseConfigurationId?: number;
      violations?: Array<{ propertyPath?: string; message?: string }>;
    };
  };

  const status = err.status;
  const detail = err.data?.detail || err.data?.message || "";
  const directConfigId = err.data?.courseConfigurationId;

  if (status === 422 || detail.toLowerCase().includes("primary lecturer") || detail.toLowerCase().includes("duplicate")) {
    let extractedConfigId = directConfigId;
    if (!extractedConfigId && detail) {
      const match = detail.match(/Course Configuration (\d+)/i) || detail.match(/course_configuration_id[^\d]*(\d+)/i);
      if (match && match[1]) {
        extractedConfigId = parseInt(match[1], 10);
      }
    }

    return {
      courseConfigurationId: extractedConfigId,
      message: detail || "This course already has an active primary lecturer for the selected session.",
    };
  }

  return null;
}
