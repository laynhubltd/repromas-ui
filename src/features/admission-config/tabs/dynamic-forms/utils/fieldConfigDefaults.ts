import type { FieldType, OptionsConfig, TargetEntity } from "@/features/dynamic-form/types";
import { CANDIDATE_GENDER_OPTIONS } from "@/shared/constants/admissionCandidateOptions";
import {
  LGA_OPTIONS_RESOLVER,
  PROGRAM_OPTIONS_RESOLVER,
  STATE_OPTIONS_RESOLVER,
} from "@/shared/constants/dynamicFormOptions";

type ColumnFieldProfile = {
  fieldKey: string;
  label: string;
  fieldType: FieldType;
  validationConfig: Record<string, unknown>;
  optionsConfig?: OptionsConfig | null;
};

const COLUMN_FIELD_PROFILES: Record<string, ColumnFieldProfile> = {
  jambRegNo: {
    fieldKey: "jambRegNo",
    label: "JAMB Registration Number",
    fieldType: "TEXT",
    validationConfig: { type: "string", maxLength: 20 },
  },
  firstName: {
    fieldKey: "firstName",
    label: "First Name",
    fieldType: "TEXT",
    validationConfig: { type: "string", maxLength: 100 },
  },
  lastName: {
    fieldKey: "lastName",
    label: "Last Name",
    fieldType: "TEXT",
    validationConfig: { type: "string", maxLength: 100 },
  },
  dateOfBirth: {
    fieldKey: "dateOfBirth",
    label: "Date of Birth",
    fieldType: "DATE",
    validationConfig: { type: "string", format: "date" },
  },
  gender: {
    fieldKey: "gender",
    label: "Gender",
    fieldType: "SELECT",
    validationConfig: {
      type: "string",
      enum: ["MALE", "FEMALE", "OTHER"],
    },
    optionsConfig: {
      source: "STATIC",
      options: CANDIDATE_GENDER_OPTIONS.map((o) => ({
        value: o.value,
        label: o.label,
      })),
    },
  },
  stateId: {
    fieldKey: "stateId",
    label: "State",
    fieldType: "SELECT",
    validationConfig: { type: "integer", minimum: 1 },
    optionsConfig: { source: STATE_OPTIONS_RESOLVER, params: {} },
  },
  lgaId: {
    fieldKey: "lgaId",
    label: "LGA",
    fieldType: "SELECT",
    validationConfig: { type: "integer", minimum: 1 },
    optionsConfig: {
      source: LGA_OPTIONS_RESOLVER,
      params: {
        dependsOn: { fieldKey: "stateId", sectionId: null },
      },
    },
  },
  email: {
    fieldKey: "email",
    label: "Email",
    fieldType: "EMAIL",
    validationConfig: { type: "string", format: "email", maxLength: 255 },
  },
  phone: {
    fieldKey: "phone",
    label: "Phone",
    fieldType: "PHONE",
    validationConfig: { type: "string", maxLength: 20 },
  },
  appliedProgramId: {
    fieldKey: "apply_program",
    label: "Program to apply for",
    fieldType: "SELECT",
    validationConfig: { type: "integer", minimum: 1 },
    optionsConfig: { source: PROGRAM_OPTIONS_RESOLVER, params: {} },
  },
};

export function getColumnFieldProfile(columnName: string) {
  return COLUMN_FIELD_PROFILES[columnName] ?? null;
}

export function defaultValidationForFieldType(
  fieldType: FieldType,
): Record<string, unknown> {
  switch (fieldType) {
    case "EMAIL":
      return { type: "string", format: "email", maxLength: 255 };
    case "PHONE":
      return { type: "string", maxLength: 20 };
    case "NUMBER":
      return { type: "number" };
    case "DATE":
      return { type: "string", format: "date" };
    case "CHECKBOX":
      return { type: "boolean" };
    case "SELECT":
    case "RADIO":
      return { type: "integer", minimum: 1 };
    case "WIDGET_OLEVEL":
    case "WIDGET_JAMB":
    case "WIDGET_PROGRAM_CHOICE":
      return { type: "object" };
    case "FILE":
      return { type: "integer", minimum: 1 };
    default:
      return { type: "string", maxLength: 255 };
  }
}

export function isSelectableFieldType(fieldType: FieldType): boolean {
  return fieldType === "SELECT" || fieldType === "RADIO";
}

export function isWidgetFieldType(fieldType: FieldType): boolean {
  return (
    fieldType === "WIDGET_OLEVEL" ||
    fieldType === "WIDGET_JAMB" ||
    fieldType === "WIDGET_PROGRAM_CHOICE"
  );
}

export function isFileFieldType(fieldType: FieldType): boolean {
  return fieldType === "FILE";
}

export function isFileSection(targetEntity: TargetEntity | undefined): boolean {
  return targetEntity === "AdmissionDocumentUpload";
}
