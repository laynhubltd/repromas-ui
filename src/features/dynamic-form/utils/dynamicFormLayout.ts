import type { RenderField, RenderSection } from "../types";

export type FieldUiWidth = "half" | "full" | string | undefined;

export type DynamicFormLayoutFlags = {
  isMobile: boolean;
  isXs: boolean;
  fieldWidth: "100%" | "48%";
  stackRadioVertical: boolean;
  stackWidgetRows: boolean;
  stackSittingCards: boolean;
  stepsVariant: "horizontal" | "compact";
  navButtonsBlock: boolean;
  stickyNav: boolean;
};

export function resolveFieldWidth(
  uiWidth: FieldUiWidth,
  isMobile: boolean,
): "100%" | "48%" {
  if (isMobile) return "100%";
  return uiWidth === "half" ? "48%" : "100%";
}

export function resolveGradeRowDirection(
  isXs: boolean,
): "vertical" | "horizontal" {
  return isXs ? "vertical" : "horizontal";
}

export function buildCompactStepLabel(
  sections: Pick<RenderSection, "title">[],
  currentStep: number,
): string {
  if (sections.length === 0) return "Step 1 of 1";
  const safeIndex = Math.min(Math.max(currentStep, 0), sections.length - 1);
  const title = sections[safeIndex]?.title ?? "Section";
  return `Step ${safeIndex + 1} of ${sections.length} — ${title}`;
}

export function resolveStepProgressPercent(
  sections: Pick<RenderSection, "title">[],
  currentStep: number,
): number {
  if (sections.length === 0) return 0;
  const safeIndex = Math.min(Math.max(currentStep, 0), sections.length - 1);
  return Math.round(((safeIndex + 1) / sections.length) * 100);
}

export function buildDynamicFormLayoutFlags(
  isMobile: boolean,
  isXs: boolean,
): DynamicFormLayoutFlags {
  return {
    isMobile,
    isXs,
    fieldWidth: isMobile ? "100%" : "48%",
    stackRadioVertical: isMobile,
    stackWidgetRows: isMobile,
    stackSittingCards: isMobile,
    stepsVariant: isMobile ? "compact" : "horizontal",
    navButtonsBlock: isMobile,
    stickyNav: isMobile,
  };
}

export type FieldLayoutGroup =
  | { kind: "single"; field: RenderField }
  | { kind: "pair"; fields: [RenderField, RenderField] };

export function groupFieldsForLayout(
  fields: RenderField[],
  isMobile: boolean,
): FieldLayoutGroup[] {
  if (isMobile) {
    return fields.map((field) => ({ kind: "single", field }));
  }

  const groups: FieldLayoutGroup[] = [];
  let index = 0;

  while (index < fields.length) {
    const current = fields[index];
    const next = fields[index + 1];
    const currentIsHalf = current.ui?.width === "half";
    const nextIsHalf = next?.ui?.width === "half";

    if (currentIsHalf && nextIsHalf && next) {
      groups.push({ kind: "pair", fields: [current, next] });
      index += 2;
      continue;
    }

    groups.push({ kind: "single", field: current });
    index += 1;
  }

  return groups;
}
