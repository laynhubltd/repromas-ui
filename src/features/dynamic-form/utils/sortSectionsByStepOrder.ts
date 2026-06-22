import type { RenderSection } from "../types";

export function sortSectionsByStepOrder(sections: RenderSection[]): RenderSection[] {
  return [...sections].sort((a, b) => a.stepOrder - b.stepOrder);
}
