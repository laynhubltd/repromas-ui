import type { StateCategory } from "@/features/settings/tabs/student-transition-status/types/student-transition-status";

export const STATE_CATEGORY_OPTIONS: { value: StateCategory; label: string }[] =
  [
    { value: "POSITIVE", label: "Positive" },
    { value: "NEGATIVE", label: "Negative" },
    { value: "NEUTRAL", label: "Neutral" },
  ];

export const IS_DEFAULT_FILTER_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "true", label: "Default" },
  { value: "false", label: "Not default" },
] as const;

export const TRANSITION_STATUS_DEFAULT_WARNING =
  "Setting this as default will replace the current default status.";

export const TRANSITION_STATUS_NO_DEFAULT_BANNER =
  "No default transition status is configured. Create a status and mark it as default — new students and matriculation require one.";

export const TRANSITION_STATUS_NO_DEFAULT_CALLOUT =
  "Mark this status as default so new students receive an enrollment transition automatically.";

export const TRANSITION_STATUS_DEFAULT_DELETE_BLOCKED =
  "The default status cannot be deleted. Set another status as default first.";
