/**
 * Shared constants for Admission Scoring Strategy feature
 * Requirements: 14.1–14.4
 */

import type {
  LaneProfile,
  ScopeValue,
  ScreeningMethod,
  ScoringComponent,
  ScoringComponentType,
  StrategyPayload,
} from "@/features/admission-config/tabs/scoring-strategy/types/scoring-strategy";

/**
 * Scope options for strategy selection
 * All four valid scopes with human-readable labels
 */
export const SCOPE_OPTIONS: { value: ScopeValue; label: string }[] = [
  { value: "GLOBAL", label: "Global" },
  { value: "FACULTY", label: "Faculty" },
  { value: "DEPARTMENT", label: "Department" },
  { value: "PROGRAM", label: "Program" },
];

export const SCORING_STRATEGY_LIST_ITEMS_PER_PAGE = 30;

export const SCORING_STRATEGY_INCLUDE = "referenceEntity";

export const SCORING_STRATEGY_SORT_DEFAULT = "scope:asc,updatedAt:desc";

export const SCOPE_TAG_COLORS: Record<ScopeValue, string> = {
  GLOBAL: "blue",
  FACULTY: "purple",
  DEPARTMENT: "orange",
  PROGRAM: "green",
};

export const LANE_PROFILE_OPTIONS: { value: LaneProfile; label: string }[] = [
  { value: "UTME_JAMB", label: "UTME (JAMB)" },
  { value: "UTME_OPEN", label: "UTME (Open)" },
  { value: "DIRECT_ENTRY", label: "Direct Entry" },
];

export const LANE_FILTER_OPTIONS = LANE_PROFILE_OPTIONS;

export const LANE_TAG_COLORS: Record<LaneProfile, string> = {
  UTME_JAMB: "blue",
  UTME_OPEN: "cyan",
  DIRECT_ENTRY: "purple",
};

export const OPEN_UTME_RENORMALIZE_HELPER =
  "Candidates without JAMB are scored from school portion only, scaled to a full aggregate (renormalize policy).";

type ScreeningMethodOption = {
  value: ScreeningMethod;
  label: string;
  description: string;
};

const SCREENING_METHOD_OPTION_BY_VALUE: Record<
  ScreeningMethod,
  ScreeningMethodOption
> = {
  JAMB_ONLY: {
    value: "JAMB_ONLY",
    label: "JAMB Only",
    description:
      "Aggregate comes entirely from JAMB score. No school portion.",
  },
  OLEVEL_GRADING: {
    value: "OLEVEL_GRADING",
    label: "O'Level Grading",
    description:
      "School portion is calculated from O'Level subject grades.",
  },
  POST_UTME_TEST: {
    value: "POST_UTME_TEST",
    label: "Post-UTME Test",
    description:
      "School portion uses the Post-UTME raw score entered by admin.",
  },
  OLEVEL_ONLY: {
    value: "OLEVEL_ONLY",
    label: "O'Level Only",
    description: "O'Level grading only, no JAMB in formula.",
  },
  POST_SCREENING_ONLY: {
    value: "POST_SCREENING_ONLY",
    label: "Post-Screening Only",
    description: "Post-screening exam score only.",
  },
  OLEVEL_POST_SCREENING: {
    value: "OLEVEL_POST_SCREENING",
    label: "O'Level + Post-Screening",
    description: "Mixed school-side scoring from O'Level and post-screening.",
  },
  PRIOR_QUAL_POST_SCREENING: {
    value: "PRIOR_QUAL_POST_SCREENING",
    label: "Prior Qual + Post-Screening",
    description:
      "Mixed school-side scoring from prior qualification and post-screening.",
  },
  PRIOR_QUAL_ONLY: {
    value: "PRIOR_QUAL_ONLY",
    label: "Prior Qualification Only",
    description: "Prior qualification only.",
  },
};

export const LANE_SCREENING_METHODS: Record<LaneProfile, ScreeningMethod[]> = {
  UTME_JAMB: ["JAMB_ONLY", "OLEVEL_GRADING", "POST_UTME_TEST"],
  UTME_OPEN: [
    "OLEVEL_GRADING",
    "OLEVEL_ONLY",
    "POST_SCREENING_ONLY",
    "OLEVEL_POST_SCREENING",
    "POST_UTME_TEST",
  ],
  DIRECT_ENTRY: [
    "OLEVEL_ONLY",
    "POST_SCREENING_ONLY",
    "OLEVEL_POST_SCREENING",
    "PRIOR_QUAL_POST_SCREENING",
    "PRIOR_QUAL_ONLY",
  ],
};

export const SCREENING_METHOD_OPTIONS_BY_LANE: Record<
  LaneProfile,
  ScreeningMethodOption[]
> = {
  UTME_JAMB: LANE_SCREENING_METHODS.UTME_JAMB.map(
    (method) => SCREENING_METHOD_OPTION_BY_VALUE[method],
  ),
  UTME_OPEN: LANE_SCREENING_METHODS.UTME_OPEN.map(
    (method) => SCREENING_METHOD_OPTION_BY_VALUE[method],
  ),
  DIRECT_ENTRY: LANE_SCREENING_METHODS.DIRECT_ENTRY.map(
    (method) => SCREENING_METHOD_OPTION_BY_VALUE[method],
  ),
};

/** @deprecated Use SCREENING_METHOD_OPTIONS_BY_LANE */
export const UTME_SCREENING_METHOD_OPTIONS =
  SCREENING_METHOD_OPTIONS_BY_LANE.UTME_JAMB;

/** @deprecated Use SCREENING_METHOD_OPTIONS_BY_LANE */
export const DE_SCREENING_METHOD_OPTIONS =
  SCREENING_METHOD_OPTIONS_BY_LANE.DIRECT_ENTRY;

/** @deprecated Use UTME_SCREENING_METHOD_OPTIONS or ALL_SCREENING_METHOD_OPTIONS */
export const SCREENING_METHOD_OPTIONS = UTME_SCREENING_METHOD_OPTIONS;

export const ALL_SCREENING_METHOD_OPTIONS = Object.values(
  SCREENING_METHOD_OPTION_BY_VALUE,
);

/** @deprecated Use SCREENING_METHOD_OPTIONS_BY_LANE */
export const SCREENING_METHOD_OPT_GROUPS = [
  { label: "UTME (JAMB)", options: SCREENING_METHOD_OPTIONS_BY_LANE.UTME_JAMB },
  { label: "UTME (Open)", options: SCREENING_METHOD_OPTIONS_BY_LANE.UTME_OPEN },
  {
    label: "Direct Entry",
    options: SCREENING_METHOD_OPTIONS_BY_LANE.DIRECT_ENTRY,
  },
];

export const SCORING_COMPONENT_TYPE_OPTIONS: {
  value: ScoringComponentType;
  label: string;
}[] = [
  { value: "olevel", label: "O'Level" },
  { value: "post_screening", label: "Post-screening" },
  { value: "prior_qualification", label: "Prior qualification" },
  { value: "jamb", label: "JAMB" },
];

export const PRIOR_QUAL_STUB_WARNING =
  "Prior qualification weight is recorded in audit but not yet calculated into aggregate.";

export const UTME_JAMB_STRATEGY_PRESET_KEYS = [
  "jamb-only",
  "olevel-5050",
  "post-utme-5050",
] as const;

export const UTME_OPEN_STRATEGY_PRESET_KEYS = [
  "open-olevel-only",
  "open-olevel-5050",
  "open-post-screening-only",
] as const;

export const DIRECT_ENTRY_STRATEGY_PRESET_KEYS = [
  "olevel-only",
  "prior-qual-only",
  "olevel-post-6040",
  "prior-qual-post-6040",
] as const;

/** @deprecated Use UTME_JAMB_STRATEGY_PRESET_KEYS */
export const UTME_STRATEGY_PRESET_KEYS = UTME_JAMB_STRATEGY_PRESET_KEYS;

/** @deprecated Use DIRECT_ENTRY_STRATEGY_PRESET_KEYS */
export const DE_STRATEGY_PRESET_KEYS = DIRECT_ENTRY_STRATEGY_PRESET_KEYS;

export type UtmeJambStrategyPresetKey =
  (typeof UTME_JAMB_STRATEGY_PRESET_KEYS)[number];
export type UtmeOpenStrategyPresetKey =
  (typeof UTME_OPEN_STRATEGY_PRESET_KEYS)[number];
export type DirectEntryStrategyPresetKey =
  (typeof DIRECT_ENTRY_STRATEGY_PRESET_KEYS)[number];

/** @deprecated Use UtmeJambStrategyPresetKey */
export type UtmeStrategyPresetKey = UtmeJambStrategyPresetKey;
/** @deprecated Use DirectEntryStrategyPresetKey */
export type DeStrategyPresetKey = DirectEntryStrategyPresetKey;

export type StrategyPresetKey =
  | UtmeJambStrategyPresetKey
  | UtmeOpenStrategyPresetKey
  | DirectEntryStrategyPresetKey;

type StrategyPreset = Pick<
  StrategyPayload,
  | "screening_method"
  | "jamb_weight_percentage"
  | "school_weight_percentage"
  | "max_jamb_score"
  | "max_school_score"
  | "requires_jamb"
  | "components"
>;

export const STRATEGY_PRESETS: Record<StrategyPresetKey, StrategyPreset> = {
  "jamb-only": {
    screening_method: "JAMB_ONLY",
    jamb_weight_percentage: 100,
    school_weight_percentage: 0,
    max_jamb_score: 400,
    max_school_score: 100,
    requires_jamb: true,
  },
  "olevel-5050": {
    screening_method: "OLEVEL_GRADING",
    jamb_weight_percentage: 50,
    school_weight_percentage: 50,
    max_jamb_score: 400,
    max_school_score: 30,
    requires_jamb: true,
  },
  "post-utme-5050": {
    screening_method: "POST_UTME_TEST",
    jamb_weight_percentage: 50,
    school_weight_percentage: 50,
    max_jamb_score: 400,
    max_school_score: 100,
    requires_jamb: true,
  },
  "open-olevel-only": {
    screening_method: "OLEVEL_ONLY",
    jamb_weight_percentage: 0,
    school_weight_percentage: 100,
    max_jamb_score: 0,
    max_school_score: 30,
    requires_jamb: false,
  },
  "open-olevel-5050": {
    screening_method: "OLEVEL_GRADING",
    jamb_weight_percentage: 50,
    school_weight_percentage: 50,
    max_jamb_score: 400,
    max_school_score: 30,
    requires_jamb: false,
  },
  "open-post-screening-only": {
    screening_method: "POST_SCREENING_ONLY",
    jamb_weight_percentage: 0,
    school_weight_percentage: 100,
    max_jamb_score: 0,
    max_school_score: 100,
    requires_jamb: false,
  },
  "prior-qual-only": {
    screening_method: "PRIOR_QUAL_ONLY",
    jamb_weight_percentage: 0,
    school_weight_percentage: 100,
    max_jamb_score: 0,
    max_school_score: 100,
    requires_jamb: false,
  },
  "olevel-only": {
    screening_method: "OLEVEL_ONLY",
    jamb_weight_percentage: 0,
    school_weight_percentage: 100,
    max_jamb_score: 0,
    max_school_score: 30,
    requires_jamb: false,
  },
  "olevel-post-6040": {
    screening_method: "OLEVEL_POST_SCREENING",
    jamb_weight_percentage: 0,
    school_weight_percentage: 100,
    max_jamb_score: 0,
    max_school_score: 100,
    requires_jamb: false,
    components: [
      { type: "olevel", weight_percentage: 40 },
      { type: "post_screening", weight_percentage: 60 },
    ],
  },
  "prior-qual-post-6040": {
    screening_method: "PRIOR_QUAL_POST_SCREENING",
    jamb_weight_percentage: 0,
    school_weight_percentage: 100,
    max_jamb_score: 0,
    max_school_score: 100,
    requires_jamb: false,
    components: [
      { type: "prior_qualification", weight_percentage: 60 },
      { type: "post_screening", weight_percentage: 40 },
    ],
  },
};

export function getScopeLabel(scope: ScopeValue): string {
  return SCOPE_OPTIONS.find((option) => option.value === scope)?.label ?? scope;
}

export function getLaneProfileLabel(laneProfile: LaneProfile): string {
  return (
    LANE_PROFILE_OPTIONS.find((option) => option.value === laneProfile)?.label ??
    laneProfile
  );
}

export function getScreeningMethodLabel(method: ScreeningMethod): string {
  return SCREENING_METHOD_OPTION_BY_VALUE[method]?.label ?? method;
}

export function getComponentTypeLabel(type: ScoringComponentType): string {
  return (
    SCORING_COMPONENT_TYPE_OPTIONS.find((option) => option.value === type)
      ?.label ?? type
  );
}

export function getDefaultComponentsForMethod(
  method: ScreeningMethod,
): ScoringComponent[] | undefined {
  if (method === "OLEVEL_POST_SCREENING") {
    return [
      { type: "olevel", weight_percentage: 40 },
      { type: "post_screening", weight_percentage: 60 },
    ];
  }
  if (method === "PRIOR_QUAL_POST_SCREENING") {
    return [
      { type: "prior_qualification", weight_percentage: 60 },
      { type: "post_screening", weight_percentage: 40 },
    ];
  }
  return undefined;
}

export type ScoringStrategyPresetLane = LaneProfile;

export type ScoringStrategyPresetCatalogItem = {
  key: StrategyPresetKey;
  lane: ScoringStrategyPresetLane;
  title: string;
  description: string;
  splitLabel: string;
};

export const SCORING_STRATEGY_PRESET_CATALOG: ScoringStrategyPresetCatalogItem[] =
  [
    {
      key: "jamb-only",
      lane: "UTME_JAMB",
      title: "JAMB Only",
      description: "Aggregate comes entirely from JAMB. No school portion.",
      splitLabel: "100% JAMB",
    },
    {
      key: "olevel-5050",
      lane: "UTME_JAMB",
      title: "50/50 O'Level",
      description: "Split JAMB and O'Level grading equally.",
      splitLabel: "50% JAMB · 50% O'Level",
    },
    {
      key: "post-utme-5050",
      lane: "UTME_JAMB",
      title: "50/50 Post-UTME",
      description: "Split JAMB and Post-UTME raw score equally.",
      splitLabel: "50% JAMB · 50% Post-UTME",
    },
    {
      key: "open-olevel-only",
      lane: "UTME_OPEN",
      title: "O'Level only",
      description: "No JAMB in formula — O'Level grade points only.",
      splitLabel: "100% O'Level",
    },
    {
      key: "open-olevel-5050",
      lane: "UTME_OPEN",
      title: "50/50 O'Level (optional JAMB)",
      description:
        "JAMB used when present; otherwise school score renormalized to 100%.",
      splitLabel: "50% JAMB · 50% O'Level",
    },
    {
      key: "open-post-screening-only",
      lane: "UTME_OPEN",
      title: "50/50 Post-screening",
      description: "Post-screening exam score only on the school side.",
      splitLabel: "100% Post-screening",
    },
    {
      key: "prior-qual-only",
      lane: "DIRECT_ENTRY",
      title: "Prior Qual Only",
      description: "Direct Entry lane with prior qualification only.",
      splitLabel: "100% Prior qual",
    },
    {
      key: "olevel-only",
      lane: "DIRECT_ENTRY",
      title: "O'Level Only",
      description: "Direct Entry — O'Level grade points only, max scale 30.",
      splitLabel: "100% O'Level",
    },
    {
      key: "olevel-post-6040",
      lane: "DIRECT_ENTRY",
      title: "O'Level + Screening",
      description: "Mixed school-side scoring for Direct Entry programs.",
      splitLabel: "40% O'Level · 60% Screening",
    },
    {
      key: "prior-qual-post-6040",
      lane: "DIRECT_ENTRY",
      title: "Prior Qual + Screening",
      description: "Prior qualification blended with post-screening score.",
      splitLabel: "60% Prior qual · 40% Screening",
    },
  ];
