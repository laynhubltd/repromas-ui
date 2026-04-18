/**
 * Hierarchy types for the academic structure feature.
 * These represent the nested faculty → department → program tree.
 */

export type FacultyNode = {
  id: number;
  name: string;
  code: string;
};

export type DepartmentNode = {
  id: number;
  name: string;
  code: string;
  facultyId: number;
};

export type ProgramNode = {
  id: number;
  name: string;
  degreeTitle: string;
  durationInYears: number;
  utmeMinimumTotalUnit: number;
  deMinimumTotalUnit: number;
  departmentId: number;
};

export type DepartmentWithChildren = {
  department: DepartmentNode;
  programs: ProgramNode[];
};

export type FacultyWithChildren = {
  faculty: FacultyNode;
  departments: DepartmentWithChildren[];
};
