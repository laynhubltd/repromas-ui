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
  Program: "Program",
  ProgramGraduationRequirement: "ProgramGraduationRequirement",
  Student: "Student",
  Staff: "Staff",
  Role: "Role",
  Permission: "Permission",
  UserRole: "UserRole",
  Course: "Course",
  CourseConfiguration: "CourseConfiguration",
} as const;

export type ApiTagLiteral = (typeof ApiTagTypes)[keyof typeof ApiTagTypes];
