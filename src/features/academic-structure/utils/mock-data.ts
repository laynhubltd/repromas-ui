import type { FacultyWithChildren } from "../types";

export const mockHierarchy: FacultyWithChildren[] = [
  {
    faculty: { id: 1, name: "Faculty of Science", code: "SCI" },
    departments: [
      {
        department: {
          id: 101,
          name: "Department of Computer Science",
          code: "CS",
          facultyId: 1,
        },
        programs: [
          {
            id: 1001,
            name: "Information Technology",
            degreeTitle: "B.Sc. Information Technology",
            durationInYears: 4,
            utmeMinimumTotalUnit: 180,
            deMinimumTotalUnit: 120,
            departmentId: 101,
          },
        ],
      },
    ],
  },
];

export function getMockStats() {
  const faculties = mockHierarchy.length;
  let departments = 0;
  let programs = 0;

  mockHierarchy.forEach((faculty) => {
    faculty.departments.forEach((department) => {
      departments += 1;
      programs += department.programs.length;
    });
  });

  return {
    totalFaculties: faculties,
    totalDepartments: departments,
    activePrograms: programs,
  };
}
