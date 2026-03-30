export const ApiTagTypes = {
  Auth: "Auth",
  User: "User",
  Session: "Session",
  Semester: "Semester",
  SemesterType: "SemesterType",
  Level: "Level",
  AcademicStructure: "AcademicStructure",
  Theme: "Theme",
} as const;

export type ApiTagLiteral = (typeof ApiTagTypes)[keyof typeof ApiTagTypes];
