export const UI_KIT_STYLING_RULE =
  "Prefer Ant Design tokens and component props first; use pure CSS only when AntD cannot express required behavior.";

export const UI_KIT_EXPORT_CONVENTIONS = {
  root: "@/components/ui-kit",
  foundation: "@/components/ui-kit/foundation",
  policy:
    "Import shared helpers and typed prop contracts from the UI-kit root exports only.",
} as const;

export const UI_KIT_PROP_CONVENTIONS = {
  size: "Use `sm | md | lg` and map to AntD `small | middle | large`.",
  density: "Use `compact | comfortable | spacious` for spacing rhythm.",
  variant: "Use `default | filled | outlined | ghost` for visual treatment.",
  state:
    "Use `default | loading | disabled | readonly | error | success | warning` for UI state.",
  responsive:
    "Use breakpoint-to-mode mapping (`xs|sm|md|lg|xl` => `inline|stack|collapse`).",
} as const;
