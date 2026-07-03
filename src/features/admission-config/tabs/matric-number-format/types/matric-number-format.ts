export type MatricFormatStatus = "DRAFT" | "ACTIVE" | "INACTIVE";

export type CounterPartition = "TENANT" | "SESSION" | "PROGRAM_AND_SESSION";

export type MatricNumberFormat = {
  id: number;
  code: string;
  template: string;
  tokenOptions: Record<string, unknown>;
  counterPartition: CounterPartition;
  sequencePadding: number;
  initialValue: number;
  status: MatricFormatStatus;
  createdAt: string;
  updatedAt: string;
};

export type TemplateSegment =
  | { type: "token"; value: string; id: string }
  | { type: "literal"; value: string; id: string };

export type MatricNumberFormatListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  "search[code]"?: string;
  "exact[status]"?: MatricFormatStatus;
};

export type CreateMatricNumberFormatRequest = {
  code: string;
  template: string;
  tokenOptions?: Record<string, unknown>;
  counterPartition: CounterPartition;
  sequencePadding: number;
  initialValue: number;
};

export type UpdateMatricNumberFormatRequest = CreateMatricNumberFormatRequest & {
  id: number;
};

export type MatricNumberFormatPreviewRequest = {
  template: string;
  tokenOptions?: Record<string, unknown>;
  counterPartition: CounterPartition;
  sequencePadding: number;
  initialValue: number;
  programId: number;
  academicSessionId?: number | null;
  simulatedSequence: number;
};

export type MatricNumberFormatPreviewResponse = {
  template: string;
  preview: string;
  length: number;
};

export type MatricNumberFormatDuplicateRequest = {
  id: number;
  code: string;
};

export type ProgramMissingCode = {
  id: number;
  name: string;
  code: string;
};

export type UnparseableSession = {
  id: number;
  name: string;
};

export type MatricNumberFormatPrerequisites = {
  programsMissingCode: ProgramMissingCode[];
  unparseableSessions: UnparseableSession[];
  ready: boolean;
};

export type PaginatedResponse<T> = {
  totalItems: number;
  member: T[];
  view: {
    first: string;
    last: string;
    next?: string;
    previous?: string;
  };
};

export type TemplateEditorMode = "visual" | "advanced";
