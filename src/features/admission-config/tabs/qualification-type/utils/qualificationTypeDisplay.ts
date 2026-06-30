import type {
  PriorQualificationType,
  ScaleDefinition,
} from "../types/prior-qualification-type";

export type ClassificationScaleDetail = {
  key: "classes" | "grades";
  label: string;
  items: string[];
};

export function getClassificationScaleDetail(
  scaleDefinition: ScaleDefinition,
): ClassificationScaleDetail | null {
  const classes = (scaleDefinition as { classes?: string[] }).classes;
  if (classes?.length) {
    return { key: "classes", label: "Classes (best first)", items: classes };
  }

  const grades = (scaleDefinition as { grades?: string[] }).grades;
  if (grades?.length) {
    return { key: "grades", label: "Grades (best first)", items: grades };
  }

  return null;
}

export function formatCreatedAt(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatQualificationTypeTitle(type: PriorQualificationType): string {
  return type.name;
}

export function formatQualificationTypeSubtitle(type: PriorQualificationType): string {
  return type.code;
}
