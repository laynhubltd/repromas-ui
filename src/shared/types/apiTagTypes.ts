export const ApiTagTypes = {
  Auth: "Auth",
  User: "User",
  Session: "Session",
  Semester: "Semester",
  SemesterType: "SemesterType",
  Level: "Level",
  AcademicStructure: "AcademicStructure",
  Theme: "Theme",
  CurriculumVersion: "CurriculumVersion",
  Faculty: "Faculty",
  Department: "Department",
} as const;

export type ApiTagLiteral = (typeof ApiTagTypes)[keyof typeof ApiTagTypes];
