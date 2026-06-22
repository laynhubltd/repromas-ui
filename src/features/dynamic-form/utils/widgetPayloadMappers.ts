import type { FieldType, RenderSection } from "../types/dynamic-form";

type RawRecord = Record<string, unknown>;

export type OlevelGradeUi = { subjectId?: number; grade?: string };
export type OlevelSittingUi = {
  examType?: string;
  examYear?: number;
  examRegNo?: string;
  centerNumber?: string;
  schoolName?: string;
  grades?: OlevelGradeUi[];
};

export type JambScoreUi = { subjectId?: number; score?: number };

const OLEVEL_EXAM_YEAR_MIN = 1990;

function readString(
  data: RawRecord,
  snakeKey: string,
  camelKey: string,
): string | undefined {
  const value = data[snakeKey] ?? data[camelKey];
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

function readNumber(
  data: RawRecord,
  snakeKey: string,
  camelKey: string,
): number | undefined {
  const value = data[snakeKey] ?? data[camelKey];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function readSubjectId(grade: RawRecord): number | undefined {
  const value = grade.subject_id ?? grade.subjectId;
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function readGrade(grade: RawRecord): string | undefined {
  return typeof grade.grade === "string" && grade.grade.trim() !== ""
    ? grade.grade
    : undefined;
}

export function olevelSittingFromWire(raw: unknown): OlevelSittingUi {
  if (!raw || typeof raw !== "object") return {};
  const data = raw as RawRecord;
  const gradesRaw = data.grades;
  const grades = Array.isArray(gradesRaw)
    ? gradesRaw
        .filter((g): g is RawRecord => g != null && typeof g === "object")
        .map((g) => ({
          subjectId: readSubjectId(g),
          grade: readGrade(g),
        }))
    : [];

  return {
    examType: readString(data, "exam_type", "examType"),
    examYear: readNumber(data, "exam_year", "examYear"),
    examRegNo: readString(data, "exam_reg_no", "examRegNo"),
    centerNumber: readString(data, "center_number", "centerNumber"),
    schoolName: readString(data, "school_name", "schoolName"),
    grades,
  };
}

export function olevelSittingToWire(sitting: OlevelSittingUi): RawRecord {
  return {
    exam_type: sitting.examType,
    exam_year: sitting.examYear,
    exam_reg_no: sitting.examRegNo,
    center_number: sitting.centerNumber,
    school_name: sitting.schoolName,
    grades: (sitting.grades ?? [])
      .filter((g) => g.subjectId != null || g.grade != null)
      .map((g) => ({
        subject_id: g.subjectId,
        grade: g.grade,
      })),
  };
}

export function olevelWidgetFromWire(value: unknown): { sittings: OlevelSittingUi[] } {
  if (!value || typeof value !== "object") {
    return { sittings: [] };
  }
  const data = value as RawRecord;
  const sittingsRaw = data.sittings;
  if (!Array.isArray(sittingsRaw)) {
    return { sittings: [] };
  }
  return {
    sittings: sittingsRaw.map(olevelSittingFromWire),
  };
}

export function olevelWidgetToWire(value: unknown): { sittings: RawRecord[] } {
  const ui = olevelWidgetFromWire(value);
  return {
    sittings: ui.sittings.map(olevelSittingToWire),
  };
}

export function jambScoreFromWire(raw: unknown): JambScoreUi {
  if (!raw || typeof raw !== "object") return {};
  const data = raw as RawRecord;
  const subjectId = readSubjectId(data);
  const score = readNumber(data, "score", "score");
  return { subjectId, score };
}

export function jambScoreToWire(score: JambScoreUi): RawRecord {
  return {
    subject_id: score.subjectId,
    score: score.score,
  };
}

export function jambWidgetFromWire(value: unknown): { scores: JambScoreUi[] } {
  if (!value || typeof value !== "object") {
    return { scores: [] };
  }
  const data = value as RawRecord;
  const scoresRaw = data.scores;
  if (!Array.isArray(scoresRaw)) {
    return { scores: [] };
  }
  return {
    scores: scoresRaw.map(jambScoreFromWire),
  };
}

export function jambWidgetToWire(value: unknown): { scores: RawRecord[] } {
  const ui = jambWidgetFromWire(value);
  return {
    scores: ui.scores.map(jambScoreToWire),
  };
}

function normalizeFieldValueForForm(
  fieldType: FieldType,
  value: unknown,
): unknown {
  switch (fieldType) {
    case "WIDGET_OLEVEL":
      return olevelWidgetFromWire(value);
    case "WIDGET_JAMB":
      return jambWidgetFromWire(value);
    default:
      return value;
  }
}

function fieldValueToSubmitPayload(
  fieldType: FieldType,
  value: unknown,
): unknown {
  switch (fieldType) {
    case "WIDGET_OLEVEL":
      return olevelWidgetToWire(value);
    case "WIDGET_JAMB":
      return jambWidgetToWire(value);
    default:
      return value;
  }
}

export function normalizeSectionValuesForForm(
  section: RenderSection,
  values: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...values };
  for (const field of section.fields) {
    if (!(field.fieldKey in result)) continue;
    result[field.fieldKey] = normalizeFieldValueForForm(
      field.fieldType,
      result[field.fieldKey],
    );
  }
  return result;
}

export function sectionValuesToSubmitPayload(
  section: RenderSection,
  values: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...values };
  for (const field of section.fields) {
    if (!(field.fieldKey in result)) continue;
    result[field.fieldKey] = fieldValueToSubmitPayload(
      field.fieldType,
      result[field.fieldKey],
    );
  }
  return result;
}

export function buildFullSubmitPayload(
  sections: RenderSection[],
  sectionValues: Record<number, Record<string, unknown>>,
): Record<string, Record<string, unknown>> {
  const fullPayload: Record<string, Record<string, unknown>> = {};
  for (const section of sections) {
    const values = sectionValues[section.id] ?? {};
    fullPayload[String(section.id)] = sectionValuesToSubmitPayload(
      section,
      values,
    );
  }
  return fullPayload;
}

export function validateOlevelWidgetValue(
  fieldKey: string,
  value: unknown,
): string | null {
  const widget = olevelWidgetFromWire(value);
  const sittings = widget.sittings;

  if (sittings.length === 0) {
    return `${fieldKey}: at least one O-Level sitting is required.`;
  }

  const currentYear = new Date().getFullYear();

  for (let i = 0; i < sittings.length; i += 1) {
    const sitting = sittings[i];
    const label = `Sitting ${i + 1}`;

    if (!sitting.examType) {
      return `${label}: exam type is required.`;
    }
    if (
      sitting.examYear == null ||
      sitting.examYear < OLEVEL_EXAM_YEAR_MIN ||
      sitting.examYear > currentYear
    ) {
      return `${label}: exam year must be between ${OLEVEL_EXAM_YEAR_MIN} and ${currentYear}.`;
    }
    if (!sitting.examRegNo) {
      return `${label}: exam registration number is required.`;
    }

    const grades = sitting.grades ?? [];
    if (grades.length === 0) {
      return `${label}: at least one subject grade is required.`;
    }

    const subjectIds = new Set<number>();
    for (let gi = 0; gi < grades.length; gi += 1) {
      const grade = grades[gi];
      if (grade.subjectId == null) {
        return `${label}: subject is required for grade row ${gi + 1}.`;
      }
      if (!grade.grade) {
        return `${label}: grade is required for grade row ${gi + 1}.`;
      }
      if (subjectIds.has(grade.subjectId)) {
        return `${label}: duplicate subject in the same sitting.`;
      }
      subjectIds.add(grade.subjectId);
    }
  }

  return null;
}

export function validateJambWidgetValue(
  fieldKey: string,
  value: unknown,
): string | null {
  const widget = jambWidgetFromWire(value);
  const scores = widget.scores;

  if (scores.length === 0) {
    return `${fieldKey}: at least one JAMB score is required.`;
  }

  const subjectIds = new Set<number>();
  for (let i = 0; i < scores.length; i += 1) {
    const row = scores[i];
    if (row.subjectId == null) {
      return `JAMB row ${i + 1}: subject is required.`;
    }
    if (row.score == null || row.score < 0 || row.score > 400) {
      return `JAMB row ${i + 1}: score must be between 0 and 400.`;
    }
    if (subjectIds.has(row.subjectId)) {
      return `JAMB: duplicate subject is not allowed.`;
    }
    subjectIds.add(row.subjectId);
  }

  return null;
}

export function validateWidgetFieldsInSection(
  section: RenderSection,
  values: Record<string, unknown>,
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field of section.fields) {
    if (!field.isRequired && !(field.fieldKey in values)) continue;

    let message: string | null = null;
    switch (field.fieldType) {
      case "WIDGET_OLEVEL":
        message = validateOlevelWidgetValue(field.fieldKey, values[field.fieldKey]);
        break;
      case "WIDGET_JAMB":
        message = validateJambWidgetValue(field.fieldKey, values[field.fieldKey]);
        break;
      default:
        break;
    }

    if (message) {
      errors[field.fieldKey] = message;
    }
  }

  return errors;
}
