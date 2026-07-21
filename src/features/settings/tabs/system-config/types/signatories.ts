// ── Apply-to document types ───────────────────────────────────────────────────

export const ApplyTo = {
  AdmissionLetter: "ADMISSION_LETTER",
  ResultDe: "RESULT_DE",
  ResultHod: "RESULT_HOD",
  ResultChairman: "RESULT_CHAIRMAN",
  Transcript: "TRANSCRIPT",
  ClearanceForm: "CLEARANCE_FORM",
  OfferLetter: "OFFER_LETTER",
  Certificate: "CERTIFICATE",
} as const;

export type ApplyToValue = (typeof ApplyTo)[keyof typeof ApplyTo];

export const APPLY_TO_OPTIONS: { value: ApplyToValue; label: string }[] = [
  { value: ApplyTo.AdmissionLetter, label: "Admission Letter" },
  { value: ApplyTo.ResultDe, label: "Result (DE)" },
  { value: ApplyTo.ResultHod, label: "Result (HOD)" },
  { value: ApplyTo.ResultChairman, label: "Result (Chairman)" },
  { value: ApplyTo.Transcript, label: "Transcript" },
  { value: ApplyTo.ClearanceForm, label: "Clearance Form" },
  { value: ApplyTo.OfferLetter, label: "Offer Letter" },
  { value: ApplyTo.Certificate, label: "Certificate" },
];

// ── Snapshot shapes (read-only, from API) ────────────────────────────────────

export type UserSnapshot = {
  id: number;
  email: string;
};

export type RoleSnapshot = {
  id: number;
  name: string;
  scope: string;
};

// ── Read-side signatory entry (from API response) ─────────────────────────────

export type SignatoryEntry = {
  userId: number;
  roleId: number;
  userSnapshot: UserSnapshot | null;
  roleSnapshot: RoleSnapshot | null;
  /** Full display name e.g. "Prof. Sabo Ibrahim B/Kudu" */
  name: string | null;
  /** Position code e.g. "VICE-CHANCELLOR" */
  position: string | null;
  /** Credentials string e.g. "B.Eng. (BUK), M.Eng. (UNIBEN), PhD (BUK)" */
  qualification: string | null;
  title: string | null;
  signature: string;
  signatureUrl: string | null;
  applyTo: ApplyToValue[];
  order: number;
  isActive: boolean;
};

// ── Top-level API response (GET / POST 201 / PUT 200) ────────────────────────

export type SignatoriesConfig = {
  id: number;
  configValue: {
    signatories: SignatoryEntry[];
  };
  description: string | null;
  updatedAt: string;
};

// ── In-memory working entry (local list, pre-save) ────────────────────────────

export type LocalSignatoryEntry = {
  /** Client-side UUID for stable list keying — not sent to the API. */
  _localId: string;
  userId: number;
  roleId: number;
  /** Display label resolved from the users datasource. */
  userLabel: string;
  /** Display label resolved from the roles datasource. */
  roleLabel: string;
  name: string;
  position: string;
  qualification: string;
  title: string;
  storagePath: string;
  publicUrl: string;
  applyTo: ApplyToValue[];
  order: number;
  isActive: boolean;
};

// ── Signature upload (POST /api/signatories/signature-upload) ─────────────────

export type SignatureUploadResponse = {
  storagePath: string;
  publicUrl: string;
};

/** Multipart form fields: file, userId, roleId */
export type SignatureUploadRequest = FormData;

export const SIGNATURE_ACCEPT_MIME_TYPES = ["image/jpeg", "image/png"] as const;
export const SIGNATURE_ACCEPT_ATTRIBUTE = SIGNATURE_ACCEPT_MIME_TYPES.join(",");
export const SIGNATURE_MAX_SIZE_MB = 5;

// ── Render endpoint (GET /api/signatories/{documentType}/render) ──────────────

/**
 * A resolved signatory item returned by the render endpoint.
 * Used by document generators (admission letters, transcripts, etc.)
 * to know which signatories to render and in what order.
 */
export type SignatoryRenderItem = {
  /** Composite ID: "{documentType}_{userId}_{roleId}" */
  id: string;
  userId: number;
  roleId: number;
  roleName: string;
  position: string | null;
  name: string | null;
  qualification: string | null;
  title: string | null;
  signatureUrl: string | null;
  order: number;
};

export type SignatoryPayloadItem = {
  userId: number;
  roleId: number;
  signature: string;
  name?: string | null;
  position?: string | null;
  qualification?: string | null;
  title?: string | null;
  applyTo: ApplyToValue[];
  order: number;
  isActive: boolean;
};

// ── Upsert request body (POST / PUT /api/signatories) ────────────────────────

export type UpsertSignatoriesRequest = {
  signatories: SignatoryPayloadItem[];
  description?: string | null;
};
