import type {
  BuilderContract,
  FieldType,
  FormPurpose,
  SaveStrategy,
  TargetEntity,
} from "@/features/dynamic-form/types";
import { CANDIDATE_GENDER_OPTIONS } from "@/shared/constants/admissionCandidateOptions";

export const FORM_PURPOSE_OPTIONS: {
  value: FormPurpose;
  label: string;
  disabled?: boolean;
}[] = [
  { value: "ADMISSION_APPLICATION", label: "Admission Application" },
  {
    value: "STUDENT_ONBOARDING",
    label: "Student Onboarding (coming soon)",
    disabled: true,
  },
  { value: "CUSTOM", label: "Custom" },
];

export const FIELD_TYPE_OPTIONS: { value: FieldType; label: string }[] = [
  { value: "TEXT", label: "Text" },
  { value: "TEXTAREA", label: "Text Area" },
  { value: "EMAIL", label: "Email" },
  { value: "PHONE", label: "Phone" },
  { value: "NUMBER", label: "Number" },
  { value: "DATE", label: "Date" },
  { value: "SELECT", label: "Select" },
  { value: "RADIO", label: "Radio" },
  { value: "CHECKBOX", label: "Checkbox" },
  { value: "FILE", label: "File upload" },
  { value: "WIDGET_PROGRAM_CHOICE", label: "Program Choice Widget" },
  { value: "WIDGET_OLEVEL", label: "O-Level Widget" },
  { value: "WIDGET_JAMB", label: "JAMB Score Widget" },
];

export const WIDGET_FIELD_TYPES: FieldType[] = [
  "WIDGET_OLEVEL",
  "WIDGET_JAMB",
  "WIDGET_PROGRAM_CHOICE",
];

export const SAVE_STRATEGY_OPTIONS: { value: SaveStrategy; label: string }[] = [
  { value: "MERGE", label: "Merge" },
  { value: "REPLACE_CHILDREN", label: "Replace Children" },
  { value: "CUSTOM_HANDLER", label: "Custom Handler" },
];

export const TARGET_ENTITY_OPTIONS: { value: TargetEntity; label: string }[] = [
  { value: "AdmissionCandidate", label: "Admission Candidate" },
  { value: "AdmissionApplication", label: "Admission Application" },
  { value: "AdmissionCandidateJambScore", label: "JAMB Scores" },
  { value: "AdmissionCandidateOlevelSitting", label: "O-Level Sitting" },
  { value: "AdmissionDocumentUpload", label: "Document Upload" },
];

export const MAPPING_TYPE_OPTIONS = [
  { value: "COLUMN", label: "Entity Column" },
  { value: "META_DATA", label: "Metadata JSON" },
  { value: "CUSTOM_HANDLER", label: "Custom Handler" },
] as const;

export const COLUMN_ALLOWLIST: Record<TargetEntity, string[]> = {
  AdmissionCandidate: [
    "jambRegNo",
    "firstName",
    "lastName",
    "dateOfBirth",
    "gender",
    "stateId",
    "lgaId",
    "email",
    "phone",
  ],
  AdmissionApplication: ["appliedProgramId"],
  AdmissionCandidateJambScore: [],
  AdmissionCandidateOlevelSitting: [],
  AdmissionDocumentUpload: [],
};

export const OLEVEL_SUBJECT_RESOLVER = "OlevelSubjectOptionsResolver";
export const PROGRAM_OPTIONS_RESOLVER = "ProgramOptionsResolver";
export const STATE_OPTIONS_RESOLVER = "StateOptionsResolver";
export const LGA_OPTIONS_RESOLVER = "LgaOptionsResolver";
export const DOCUMENT_TYPE_OPTIONS_RESOLVER = "DocumentTypeOptionsResolver";
export const ADMISSION_DOCUMENT_UPLOAD_HANDLER = "AdmissionDocumentUploadHydrator";
export const ADMISSION_DOCUMENT_UPLOAD_ENTITY: TargetEntity = "AdmissionDocumentUpload";

export const DYNAMIC_FORM_PUBLISH_WARNING =
  "Publishing validates mappings and compiles JSON Schema. Structure cannot be edited after publish.";

export const DYNAMIC_FORM_DRAFT_ONLY_BANNER =
  "This form is published. Create a new draft version or archive before structural changes.";

export const DYNAMIC_FORM_SLOT_CONFLICT_MESSAGE =
  "An active assignment already exists for this slot. Deactivate the existing assignment first.";

export const DYNAMIC_FORM_VERSION_MISMATCH_MESSAGE =
  "This form has been updated. Please reload and review your answers.";

export const DYNAMIC_FORM_NO_ASSIGNMENT_MESSAGE =
  "No application form is configured for your admission cycle. Please contact your institution.";

export const DYNAMIC_FORM_SUBMIT_SUCCESS =
  "Your application has been submitted successfully.";

export const STATIC_OPTIONS_BUILDER_HINT =
  "Static options are stored on the field and expanded into field.options at render-package time.";

export const DYNAMIC_FORM_OFFLINE_CONTRACT_WARNING =
  "The live builder contract could not be loaded. Defaults are shown, but publish validation may not match your tenant configuration. Reload when the API is available.";

export const EXAM_TYPE_OPTIONS = [
  { value: "WAEC", label: "WAEC" },
  { value: "NECO", label: "NECO" },
  { value: "NABTEB", label: "NABTEB" },
  { value: "IGCSE", label: "IGCSE" },
] as const;

/**
 * Fallback builder contract used when GET /api/dynamic-form-builder-contract
 * is unavailable. The runtime hook always prefers the live server contract;
 * this mirror of the documented v1 contract keeps the builder usable offline
 * and provides typed defaults derived from dynamic-form-admin-api.md.
 */
export const FALLBACK_BUILDER_CONTRACT: BuilderContract = {
  targetEntities: [
    {
      key: "AdmissionCandidate",
      label: "Admission Candidate",
      defaultSaveStrategy: "MERGE",
      handlerKey: null,
      defaultHydrateOrder: 10,
      sectionSteps: [
        "Pick the candidate scalar/metadata fields to collect.",
        "Map each field to a COLUMN or META_DATA path.",
        "Use StateOptionsResolver and LgaOptionsResolver for geography SELECTs.",
        "Add optional SELECT/RADIO options where needed.",
      ],
      allowedColumnNames: COLUMN_ALLOWLIST.AdmissionCandidate,
      systemColumnNames: ["cycleId", "userId"],
      fieldPresets: [
        {
          fieldKey: "gender",
          label: "Gender",
          fieldType: "SELECT",
          mappingConfig: { type: "COLUMN", column_name: "gender" },
          optionsConfig: {
            source: "STATIC",
            options: CANDIDATE_GENDER_OPTIONS.map((o) => ({
              value: o.value,
              label: o.label,
            })),
          },
          validationConfig: {
            type: "string",
            enum: ["MALE", "FEMALE", "OTHER"],
          },
          isRequired: false,
          isReadOnly: false,
        },
        {
          fieldKey: "state_of_origin",
          label: "State of origin",
          fieldType: "SELECT",
          mappingConfig: { type: "COLUMN", column_name: "stateId" },
          optionsConfig: { source: STATE_OPTIONS_RESOLVER, params: {} },
          validationConfig: { type: "integer", minimum: 1 },
          isRequired: false,
          isReadOnly: false,
        },
        {
          fieldKey: "lga_of_origin",
          label: "LGA of origin",
          fieldType: "SELECT",
          mappingConfig: { type: "COLUMN", column_name: "lgaId" },
          optionsConfig: {
            source: LGA_OPTIONS_RESOLVER,
            params: {
              dependsOn: { fieldKey: "stateId", sectionId: null },
            },
          },
          validationConfig: { type: "integer", minimum: 1 },
          isRequired: false,
          isReadOnly: false,
        },
      ],
      widgetFieldType: null,
    },
    {
      key: "AdmissionApplication",
      label: "Admission Application",
      defaultSaveStrategy: "MERGE",
      handlerKey: null,
      defaultHydrateOrder: 20,
      sectionSteps: [
        "Add the program choice field (apply_program).",
        "Map appliedProgramId via COLUMN.",
        "Use ProgramOptionsResolver for the program dropdown.",
      ],
      allowedColumnNames: COLUMN_ALLOWLIST.AdmissionApplication,
      systemColumnNames: [
        "candidateId",
        "applicationStatus",
        "finalDecision",
        "isMatriculated",
      ],
      fieldPresets: [
        {
          fieldKey: "apply_program",
          label: "Program to apply for",
          fieldType: "SELECT",
          mappingConfig: { type: "COLUMN", column_name: "appliedProgramId" },
          optionsConfig: { source: PROGRAM_OPTIONS_RESOLVER, params: {} },
          validationConfig: { type: "integer", minimum: 1 },
          isRequired: true,
          isReadOnly: false,
        },
      ],
      widgetFieldType: null,
    },
    {
      key: "AdmissionCandidateJambScore",
      label: "JAMB Scores",
      defaultSaveStrategy: "CUSTOM_HANDLER",
      handlerKey: "JambWidgetFormHydrator",
      defaultHydrateOrder: 25,
      sectionSteps: [
        "Add a single WIDGET_JAMB field.",
        "Section save strategy is locked to CUSTOM_HANDLER.",
        "Subjects resolve from the O-Level subject catalog.",
      ],
      subjectDataSource: OLEVEL_SUBJECT_RESOLVER,
      widgetFieldType: "WIDGET_JAMB",
      payloadContract: {
        scores: [{ subject_id: 1, score: 78 }],
      },
      fieldPresets: [
        {
          fieldKey: "jamb_scores",
          label: "JAMB Scores",
          fieldType: "WIDGET_JAMB",
          mappingConfig: {
            type: "CUSTOM_HANDLER",
            handler_key: "JambWidgetFormHydrator",
          },
          validationConfig: { type: "object" },
          isRequired: true,
          isReadOnly: false,
        },
      ],
    },
    {
      key: "AdmissionCandidateOlevelSitting",
      label: "O-Level Results",
      defaultSaveStrategy: "CUSTOM_HANDLER",
      handlerKey: "OlevelWidgetFormHydrator",
      defaultHydrateOrder: 30,
      sectionSteps: [
        "Add a single WIDGET_OLEVEL field.",
        "Section save strategy is locked to CUSTOM_HANDLER.",
        "Subjects resolve from the O-Level subject catalog.",
      ],
      subjectDataSource: OLEVEL_SUBJECT_RESOLVER,
      widgetFieldType: "WIDGET_OLEVEL",
      payloadContract: {
        sittings: [
          {
            exam_type: "WAEC",
            exam_year: 2020,
            exam_reg_no: "1234567890",
            center_number: "KN001",
            school_name: "Example Secondary School",
            grades: [{ subject_id: 1, grade: "A1" }],
          },
        ],
      },
      fieldPresets: [
        {
          fieldKey: "olevel_results",
          label: "O-Level Results",
          fieldType: "WIDGET_OLEVEL",
          mappingConfig: {
            type: "CUSTOM_HANDLER",
            handler_key: "OlevelWidgetFormHydrator",
          },
          validationConfig: { type: "object" },
          isRequired: true,
          isReadOnly: false,
        },
      ],
    },
    {
      key: "AdmissionDocumentUpload",
      label: "Document Upload",
      defaultSaveStrategy: "CUSTOM_HANDLER",
      handlerKey: ADMISSION_DOCUMENT_UPLOAD_HANDLER,
      defaultHydrateOrder: 40,
      sectionSteps: [
        "Add one FILE field per required document.",
        "Select the document type",
        "All FILE fields automatically use DocumentTypeOptionsResolver.",
      ],
      allowedColumnNames: [],
      systemColumnNames: [],
      widgetFieldType: null,
    },
  ],
  handlers: [
    {
      handlerKey: "OlevelWidgetFormHydrator",
      targetEntity: "AdmissionCandidateOlevelSitting",
      requiredSaveStrategy: "CUSTOM_HANDLER",
      widgetFieldType: "WIDGET_OLEVEL",
    },
    {
      handlerKey: "JambWidgetFormHydrator",
      targetEntity: "AdmissionCandidateJambScore",
      requiredSaveStrategy: "CUSTOM_HANDLER",
      widgetFieldType: "WIDGET_JAMB",
    },
    {
      handlerKey: ADMISSION_DOCUMENT_UPLOAD_HANDLER,
      targetEntity: "AdmissionDocumentUpload",
      requiredSaveStrategy: "CUSTOM_HANDLER",
      widgetFieldType: null,
    },
  ],
  saveStrategies: [
    {
      key: "MERGE",
      label: "Merge",
      description: "Patch scalar/metadata columns on the target entity.",
    },
    {
      key: "CUSTOM_HANDLER",
      label: "Custom Handler",
      description: "Delegate persistence to a registered widget hydrator.",
    },
    {
      key: "REPLACE_CHILDREN",
      label: "Replace Children",
      description: "Reserved — not used in v1.",
    },
  ],
  mappingTypes: [
    {
      key: "COLUMN",
      label: "Entity Column",
      configShape: { type: "COLUMN", column_name: "email" },
    },
    {
      key: "META_DATA",
      label: "Metadata JSON",
      configShape: { type: "META_DATA", json_key: "sponsor.phone" },
    },
    {
      key: "CUSTOM_HANDLER",
      label: "Custom Handler",
      configShape: { type: "CUSTOM_HANDLER", handler_key: "SomeHandler" },
    },
  ],
  fieldTypes: [
    { key: "TEXT", label: "Text" },
    { key: "TEXTAREA", label: "Text Area" },
    { key: "EMAIL", label: "Email" },
    { key: "PHONE", label: "Phone" },
    { key: "NUMBER", label: "Number" },
    { key: "DATE", label: "Date" },
    { key: "SELECT", label: "Select" },
    { key: "RADIO", label: "Radio" },
    { key: "CHECKBOX", label: "Checkbox" },
    { key: "FILE", label: "File upload" },
    { key: "WIDGET_PROGRAM_CHOICE", label: "Program Choice Widget", isWidget: true },
    { key: "WIDGET_OLEVEL", label: "O-Level Widget", isWidget: true },
    { key: "WIDGET_JAMB", label: "JAMB Score Widget", isWidget: true },
  ],
  optionsResolvers: [
    {
      key: PROGRAM_OPTIONS_RESOLVER,
      label: "Programs",
      catalogEndpoint: "/api/programs",
    },
    {
      key: OLEVEL_SUBJECT_RESOLVER,
      label: "O-Level Subjects",
      catalogEndpoint: "/api/olevel-subjects",
    },
    {
      key: STATE_OPTIONS_RESOLVER,
      label: "States",
      catalogEndpoint: "/api/states",
    },
    {
      key: LGA_OPTIONS_RESOLVER,
      label: "LGAs (by state)",
      catalogEndpoint: "/api/lgas",
    },
    {
      key: DOCUMENT_TYPE_OPTIONS_RESOLVER,
      label: "Document types",
      catalogEndpoint: "/api/admission-document-types",
      description:
        "Active admission document types for FILE fields. Each option includes meta.mimeTypes and meta.maxSizeMb.",
    },
  ],
  hydrateOrderGuide: [
    {
      targetEntity: "AdmissionCandidate",
      hydrateOrder: 10,
      reason: "Patch candidate before dependents",
    },
    {
      targetEntity: "AdmissionApplication",
      hydrateOrder: 20,
      reason: "Requires candidate context",
    },
    {
      targetEntity: "AdmissionCandidateJambScore",
      hydrateOrder: 25,
      reason: "JAMB rows attach to candidate",
    },
    {
      targetEntity: "AdmissionCandidateOlevelSitting",
      hydrateOrder: 30,
      reason: "O-Level graph after scalars",
    },
    {
      targetEntity: "AdmissionDocumentUpload",
      hydrateOrder: 40,
      reason: "Document upload links after all entity data is persisted",
    },
  ],
};
