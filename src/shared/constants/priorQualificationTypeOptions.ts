import type {
  AssessmentFormat,
  CreatePriorQualificationTypeRequest,
  ScaleDefinition,
} from "@/features/admission-config/tabs/qualification-type/types/prior-qualification-type";

export const PRIOR_QUALIFICATION_TYPE_LIST_ITEMS_PER_PAGE = 30;

export const PRIOR_QUALIFICATION_TYPE_SORT_DEFAULT = "code:asc";

export const ASSESSMENT_FORMAT_OPTIONS: {
  value: AssessmentFormat;
  label: string;
  description: string;
}[] = [
  {
    value: "POINTS",
    label: "Points",
    description: "Numeric total such as IJMB or JUPEB points.",
  },
  {
    value: "CLASSIFICATION",
    label: "Classification",
    description: "Ordered class names or grades (best rank first).",
  },
  {
    value: "CGPA",
    label: "CGPA",
    description: "Decimal grade point average within a min/max range.",
  },
  {
    value: "PASS_FAIL",
    label: "Pass / Fail",
    description: "Binary outcome only.",
  },
];

export const ASSESSMENT_FORMAT_TAG_COLORS: Record<AssessmentFormat, string> = {
  POINTS: "blue",
  CLASSIFICATION: "purple",
  CGPA: "geekblue",
  PASS_FAIL: "default",
};

export const CLASSIFICATION_PRESET_TEMPLATES = {
  ndClasses: {
    label: "ND / HND classes",
    key: "classes" as const,
    items: ["DISTINCTION", "UPPER_CREDIT", "LOWER_CREDIT", "PASS", "FAIL"],
  },
  aLevelGrades: {
    label: "A-Level grades",
    key: "grades" as const,
    items: ["A*", "A", "B", "C", "D", "E"],
  },
};

export const DEFAULT_SCALE_BY_FORMAT: Record<AssessmentFormat, ScaleDefinition> =
  {
    POINTS: { maxPoints: 16 },
    CLASSIFICATION: {
      classes: [...CLASSIFICATION_PRESET_TEMPLATES.ndClasses.items],
    },
    CGPA: { min: 0, max: 5 },
    PASS_FAIL: { values: ["PASS", "FAIL"] },
  };

export const CANONICAL_PRIOR_QUALIFICATION_TYPE_DEFAULTS: CreatePriorQualificationTypeRequest[] =
  [
    {
      code: "ND",
      name: "National Diploma (ND)",
      assessmentFormat: "CLASSIFICATION",
      scaleDefinition: {
        classes: [...CLASSIFICATION_PRESET_TEMPLATES.ndClasses.items],
      },
      isActive: true,
    },
    {
      code: "HND",
      name: "Higher National Diploma (HND)",
      assessmentFormat: "CLASSIFICATION",
      scaleDefinition: {
        classes: [...CLASSIFICATION_PRESET_TEMPLATES.ndClasses.items],
      },
      isActive: true,
    },
    {
      code: "NCE",
      name: "Nigeria Certificate in Education (NCE)",
      assessmentFormat: "POINTS",
      scaleDefinition: { maxPoints: 20 },
      isActive: true,
    },
    {
      code: "IJMB",
      name: "Interim Joint Matriculation Board (IJMB)",
      assessmentFormat: "POINTS",
      scaleDefinition: { maxPoints: 16 },
      isActive: true,
    },
    {
      code: "JUPEB",
      name: "Joint Universities Preliminary Examinations Board (JUPEB)",
      assessmentFormat: "POINTS",
      scaleDefinition: { maxPoints: 16 },
      isActive: true,
    },
    {
      code: "ALEVEL",
      name: "A-Level",
      assessmentFormat: "CLASSIFICATION",
      scaleDefinition: {
        grades: [...CLASSIFICATION_PRESET_TEMPLATES.aLevelGrades.items],
      },
      isActive: true,
    },
    {
      code: "DEGREE",
      name: "First Degree",
      assessmentFormat: "CGPA",
      scaleDefinition: { min: 0, max: 5 },
      isActive: true,
    },
    {
      code: "PROFESSIONAL",
      name: "Professional Certificate",
      assessmentFormat: "PASS_FAIL",
      scaleDefinition: { values: ["PASS", "FAIL"] },
      isActive: true,
    },
  ];

export function getAssessmentFormatLabel(format: AssessmentFormat): string {
  return (
    ASSESSMENT_FORMAT_OPTIONS.find((option) => option.value === format)?.label ??
    format
  );
}
