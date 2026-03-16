/** Matches repromas-api Faculty entity (id, name, code). */
export interface Faculty {
  id: number;
  name: string;
  code: string;
}

/** Matches repromas-api Department entity (id, name, code, faculty). */
export interface Department {
  id: number;
  name: string;
  code: string;
  facultyId?: number;
  faculty?: Pick<Faculty, "id" | "name" | "code">;
}

/** Matches repromas-api Program entity (id, name, degreeTitle, durationInYears, utmeMinimumTotalUnit, deMinimumTotalUnit, department). */
export interface Program {
  id: number;
  name: string;
  degreeTitle: string;
  durationInYears: number;
  utmeMinimumTotalUnit: number;
  deMinimumTotalUnit: number;
  departmentId?: number;
  department?: Pick<Department, "id" | "name" | "code">;
}

/** Faculty with nested departments; each department has programs. For UI hierarchy. */
export interface FacultyWithChildren {
  faculty: Faculty;
  departments: DepartmentWithPrograms[];
}

export interface DepartmentWithPrograms {
  department: Department;
  programs: Program[];
}
