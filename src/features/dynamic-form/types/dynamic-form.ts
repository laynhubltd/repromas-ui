export type FormPurpose =
  | "ADMISSION_APPLICATION"
  | "STUDENT_ONBOARDING"
  | "CUSTOM";

export type FormAssignmentScope = "GLOBAL" | "ADMISSION_CYCLE" | "PROGRAM";

export type FormTemplateStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type SubmissionStatus = "DRAFT" | "SUBMITTED" | "REJECTED";

export type FieldType =
  | "TEXT"
  | "TEXTAREA"
  | "EMAIL"
  | "PHONE"
  | "NUMBER"
  | "DATE"
  | "SELECT"
  | "RADIO"
  | "CHECKBOX"
  | "FILE"
  | "WIDGET_OLEVEL"
  | "WIDGET_JAMB"
  | "WIDGET_PROGRAM_CHOICE";

export type SaveStrategy = "MERGE" | "REPLACE_CHILDREN" | "CUSTOM_HANDLER";

export type MappingType = "COLUMN" | "META_DATA" | "CUSTOM_HANDLER";

export type TargetEntity =
  | "AdmissionCandidate"
  | "AdmissionApplication"
  | "AdmissionCandidateOlevelSitting"
  | "AdmissionCandidateJambScore"
  | "AdmissionDocumentUpload";

export type MappingConfig =
  | { type: "COLUMN"; column_name: string }
  | { type: "META_DATA"; json_key: string }
  | { type: "CUSTOM_HANDLER"; handler_key: string };

export type VisibilityCondition = {
  field: string;
  operator: "equals" | "not_equals" | "in";
  value: unknown;
};

export type VisibilityConfig = {
  "x-condition"?: VisibilityCondition;
};

export type OptionsConfig =
  | {
      source: "STATIC";
      options: Array<{ value: number | string; label: string }>;
    }
  | {
      source: string;
      params?: Record<string, unknown>;
    };

export type FormTemplate = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  purpose: FormPurpose;
  status: FormTemplateStatus;
  version: number;
  schemaHash: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FormSection = {
  id: number;
  formId: number;
  title: string;
  description: string | null;
  stepOrder: number;
  targetEntity: TargetEntity;
  saveStrategy: SaveStrategy;
  handlerKey: string | null;
  hydrateOrder: number;
  isRequired: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FormField = {
  id: number;
  sectionId: number;
  fieldKey: string;
  label: string;
  helpText: string | null;
  fieldType: FieldType;
  displayOrder: number;
  mappingConfig: MappingConfig;
  validationConfig: Record<string, unknown>;
  visibilityConfig: VisibilityConfig | null;
  optionsConfig: OptionsConfig | null;
  isRequired: boolean;
  isReadOnly: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FormAssignment = {
  id: number;
  formId: number;
  purpose: FormPurpose;
  assignmentScope: FormAssignmentScope;
  assignmentReferenceId: number | null;
  priority: number;
  isActive: boolean;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RenderFieldOptionMeta = {
  code?: string;
  mimeTypes?: string[];
  maxSizeMb?: number;
};

export type RenderFieldFilePrefill = {
  uploadId: number;
  originalFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  url: string;
  rejectionReason?: string | null;
};

export type RenderField = {
  fieldKey: string;
  label: string;
  helpText: string | null;
  fieldType: FieldType;
  isRequired: boolean;
  isReadOnly: boolean;
  displayOrder: number;
  options: Array<{
    value: number | string;
    label: string;
    meta?: RenderFieldOptionMeta;
  }> | null;
  ui: Record<string, unknown> | null;
  visibilityConfig?: VisibilityConfig | null;
  prefill?: RenderFieldFilePrefill | null;
};

export type RenderSection = {
  id: number;
  title: string;
  description?: string | null;
  stepOrder: number;
  fields: RenderField[];
};

export type RenderPackage = {
  assignment: {
    id: number;
    purpose: FormPurpose;
    assignmentScope: FormAssignmentScope;
    assignmentReferenceId: number | null;
  };
  form: {
    id: number;
    code: string;
    name: string;
    purpose: FormPurpose;
    version: number;
    schemaHash: string | null;
  };
  sections: RenderSection[];
  jsonSchema: Record<string, unknown>;
  prefill: Record<string, Record<string, unknown>>;
};

export type SubmissionPayload = Record<string, Record<string, unknown>>;

export type Submission = {
  id: number;
  formId: number;
  assignmentId: number;
  formVersion: number;
  purpose: FormPurpose;
  assignmentScope: FormAssignmentScope;
  assignmentReferenceId: number | null;
  status: SubmissionStatus;
  payload: SubmissionPayload;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string | null;
  hydratedResources?: Record<string, number | string | null>;
};

export type PaginatedResponse<T> = {
  totalItems: number;
  member: T[];
  view?: { first: string; last: string; next?: string | null };
};

export type CreateFormTemplateRequest = {
  code: string;
  name: string;
  purpose: FormPurpose;
  description?: string | null;
};

export type UpdateFormTemplateRequest = {
  name: string;
  description?: string | null;
};

export type CreateFormSectionRequest = {
  title: string;
  description?: string | null;
  stepOrder: number;
  targetEntity: TargetEntity;
  saveStrategy: SaveStrategy;
  handlerKey?: string | null;
  hydrateOrder: number;
  isRequired: boolean;
};

export type UpdateFormSectionRequest = CreateFormSectionRequest;

export type CreateFormFieldRequest = {
  fieldKey: string;
  label: string;
  helpText?: string | null;
  fieldType: FieldType;
  displayOrder: number;
  mappingConfig: MappingConfig;
  validationConfig: Record<string, unknown>;
  visibilityConfig?: VisibilityConfig | null;
  optionsConfig?: OptionsConfig | null;
  isRequired: boolean;
  isReadOnly: boolean;
};

export type UpdateFormFieldRequest = Omit<CreateFormFieldRequest, "fieldKey">;

export type BulkAssignRequest = {
  assignmentScope: FormAssignmentScope;
  assignmentReferenceIds?: number[];
  priority?: number;
};

export type CreateSubmissionRequest = {
  purpose: FormPurpose;
  assignmentScope: FormAssignmentScope;
  assignmentReferenceId?: number | null;
  idempotencyKey?: string;
};

export type PatchSubmissionRequest = {
  payload: SubmissionPayload;
};

export type RenderPackageParams = {
  purpose: FormPurpose;
  assignmentScope: FormAssignmentScope;
  assignmentReferenceId?: number | null;
  submissionId?: number;
};

export type FormListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  "exact[purpose]"?: FormPurpose;
  "exact[status]"?: FormTemplateStatus;
};

export type AssignmentListParams = {
  page?: number;
  itemsPerPage?: number;
  "exact[purpose]"?: FormPurpose;
  "exact[assignmentScope]"?: FormAssignmentScope;
  "boolean[isActive]"?: boolean;
};

// ─── Builder contract (GET /api/dynamic-form-builder-contract) ────────────────

export type ContractFieldPreset = {
  fieldKey: string;
  label: string;
  fieldType: FieldType;
  mappingConfig: MappingConfig;
  validationConfig?: Record<string, unknown>;
  optionsConfig?: OptionsConfig | null;
  helpText?: string | null;
  isRequired?: boolean;
  isReadOnly?: boolean;
};

export type ContractTargetEntity = {
  key: TargetEntity;
  label?: string;
  defaultSaveStrategy: SaveStrategy;
  handlerKey: string | null;
  defaultHydrateOrder: number;
  sectionSteps: string[];
  fieldPresets?: ContractFieldPreset[];
  payloadContract?: Record<string, unknown> | null;
  allowedColumnNames?: string[];
  systemColumnNames?: string[];
  subjectDataSource?: string | null;
  widgetFieldType?: FieldType | null;
};

export type ContractHandler = {
  handlerKey: string;
  targetEntity: TargetEntity;
  requiredSaveStrategy: SaveStrategy;
  widgetFieldType?: FieldType | null;
};

export type ContractSaveStrategy = {
  key: SaveStrategy;
  label: string;
  description?: string;
};

export type ContractMappingType = {
  key: MappingType;
  label: string;
  description?: string;
  configShape?: Record<string, unknown>;
};

export type ContractFieldTypeOption = {
  key: FieldType;
  label: string;
  disabled?: boolean;
  isWidget?: boolean;
};

export type ContractOptionsResolver = {
  key: string;
  label: string;
  catalogEndpoint: string;
  description?: string;
};

export type ContractHydrateOrderGuide = {
  targetEntity: TargetEntity;
  hydrateOrder: number;
  reason?: string;
};

export type BuilderContract = {
  targetEntities: ContractTargetEntity[];
  handlers: ContractHandler[];
  saveStrategies: ContractSaveStrategy[];
  mappingTypes: ContractMappingType[];
  fieldTypes: ContractFieldTypeOption[];
  optionsResolvers: ContractOptionsResolver[];
  hydrateOrderGuide: ContractHydrateOrderGuide[];
};
