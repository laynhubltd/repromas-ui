import type { FacultyWithChildren } from "./types";

/** Mock hierarchy for development. Replace with API data. */
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
          {
            id: 1002,
            name: "Computer Science",
            degreeTitle: "B.Sc. Computer Science",
            durationInYears: 4,
            utmeMinimumTotalUnit: 180,
            deMinimumTotalUnit: 120,
            departmentId: 101,
          },
        ],
      },
    ],
  },
  {
    faculty: { id: 2, name: "Faculty of Law", code: "LAW" },
    departments: [],
  },
];

export function getMockStats() {
  const faculties = mockHierarchy.length;
  let departments = 0;
  let programs = 0;
  mockHierarchy.forEach((f) => {
    f.departments.forEach((d) => {
      departments += 1;
      programs += d.programs.length;
    });
  });
  return { totalFaculties: faculties, totalDepartments: departments, activePrograms: programs };
}
