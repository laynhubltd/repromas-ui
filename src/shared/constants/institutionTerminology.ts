import type { InstitutionType } from "@/features/settings/tabs/system-config/types/system-config";

export interface AcademicUnitTerminology {
  singular: string;            // e.g. "Faculty" | "School" | "Division"
  plural: string;              // e.g. "Faculties" | "Schools" | "Divisions"
  codePlaceholder: string;     // e.g. "e.g., SCI" | "e.g., SCIT" | "e.g., SAS"
  namePlaceholder: string;     // e.g. "e.g., Faculty of Science" | "e.g., School of Computing"
  selectPlaceholder: string;   // e.g. "Select Faculty" | "Select School"
  allFilterLabel: string;      // e.g. "All Faculties" | "All Schools"
  addModalTitle: string;       // e.g. "Add New Faculty" | "Add New School"
  editModalTitle: string;      // e.g. "Edit Faculty" | "Edit School"
  deleteModalTitle: string;    // e.g. "Delete Faculty" | "Delete School"
  createButtonLabel: string;   // e.g. "Create Faculty" | "Create School"
  addButtonLabel: string;      // e.g. "+ Add Faculty" | "+ Add School"
  searchPlaceholder: string;   // e.g. "Search faculties..." | "Search schools..."
  combinedMenuLabel: string;   // e.g. "Faculty & Departments" | "Schools & Departments"
  headOfUnitTitle: string;     // e.g. "Dean of Faculty" | "Dean of School"
}

export interface ProgramAwardTerminology {
  awardSingular: string;       // e.g. "Degree" | "National Diploma (ND / HND)" | "NCE"
  awardPlural: string;         // e.g. "Degrees" | "Diplomas & Certificates"
  programSample: string;       // e.g. "e.g., B.Sc. Computer Science" | "e.g., ND Computer Science"
}

export interface InstitutionTerminology {
  academicUnit: AcademicUnitTerminology;
  program: ProgramAwardTerminology;
  headOfInstitution: string;   // e.g. "Vice-Chancellor" | "Rector" | "Provost" | "Principal"
}

export const INSTITUTION_TERMINOLOGY_MAP: Record<InstitutionType, InstitutionTerminology> = {
  CONVENTIONAL: {
    academicUnit: {
      singular: "Faculty",
      plural: "Faculties",
      codePlaceholder: "e.g., SCI",
      namePlaceholder: "e.g., Faculty of Science",
      selectPlaceholder: "Select Faculty",
      allFilterLabel: "All Faculties",
      addModalTitle: "Add New Faculty",
      editModalTitle: "Edit Faculty",
      deleteModalTitle: "Delete Faculty",
      createButtonLabel: "Create Faculty",
      addButtonLabel: "Add Faculty",
      searchPlaceholder: "Search faculties...",
      combinedMenuLabel: "Faculty & Departments",
      headOfUnitTitle: "Dean of Faculty",
    },
    program: {
      awardSingular: "Degree",
      awardPlural: "Degrees",
      programSample: "e.g., B.Sc. Computer Science",
    },
    headOfInstitution: "Vice-Chancellor",
  },

  TECHNOLOGY: {
    academicUnit: {
      singular: "School",
      plural: "Schools",
      codePlaceholder: "e.g., SCIT",
      namePlaceholder: "e.g., School of Computing & Info Technology",
      selectPlaceholder: "Select School",
      allFilterLabel: "All Schools",
      addModalTitle: "Add New School",
      editModalTitle: "Edit School",
      deleteModalTitle: "Delete School",
      createButtonLabel: "Create School",
      addButtonLabel: "Add School",
      searchPlaceholder: "Search schools...",
      combinedMenuLabel: "Schools & Departments",
      headOfUnitTitle: "Dean of School",
    },
    program: {
      awardSingular: "Degree",
      awardPlural: "Degrees",
      programSample: "e.g., B.Tech. Computer Science",
    },
    headOfInstitution: "Vice-Chancellor",
  },

  POLYTECHNIC: {
    academicUnit: {
      singular: "School",
      plural: "Schools",
      codePlaceholder: "e.g., SAS",
      namePlaceholder: "e.g., School of Applied Sciences",
      selectPlaceholder: "Select School",
      allFilterLabel: "All Schools",
      addModalTitle: "Add New School",
      editModalTitle: "Edit School",
      deleteModalTitle: "Delete School",
      createButtonLabel: "Create School",
      addButtonLabel: "Add School",
      searchPlaceholder: "Search schools...",
      combinedMenuLabel: "Schools & Departments",
      headOfUnitTitle: "Dean of School",
    },
    program: {
      awardSingular: "National Diploma (ND / HND)",
      awardPlural: "Diplomas & Certificates",
      programSample: "e.g., ND Computer Science",
    },
    headOfInstitution: "Rector",
  },

  MONOTECHNIC: {
    academicUnit: {
      singular: "School",
      plural: "Schools",
      codePlaceholder: "e.g., SPS",
      namePlaceholder: "e.g., School of Petroleum Studies",
      selectPlaceholder: "Select School",
      allFilterLabel: "All Schools",
      addModalTitle: "Add New School",
      editModalTitle: "Edit School",
      deleteModalTitle: "Delete School",
      createButtonLabel: "Create School",
      addButtonLabel: "Add School",
      searchPlaceholder: "Search schools...",
      combinedMenuLabel: "Schools & Departments",
      headOfUnitTitle: "Director of School",
    },
    program: {
      awardSingular: "National Diploma (ND / HND)",
      awardPlural: "Diplomas & Certificates",
      programSample: "e.g., ND Petroleum Engineering",
    },
    headOfInstitution: "Rector",
  },

  COLLEGE: {
    academicUnit: {
      singular: "School",
      plural: "Schools",
      codePlaceholder: "e.g., SED",
      namePlaceholder: "e.g., School of Education",
      selectPlaceholder: "Select School",
      allFilterLabel: "All Schools",
      addModalTitle: "Add New School",
      editModalTitle: "Edit School",
      deleteModalTitle: "Delete School",
      createButtonLabel: "Create School",
      addButtonLabel: "Add School",
      searchPlaceholder: "Search schools...",
      combinedMenuLabel: "Schools & Departments",
      headOfUnitTitle: "Dean of School",
    },
    program: {
      awardSingular: "Nigeria Certificate in Education (NCE)",
      awardPlural: "Certificates & Diplomas",
      programSample: "e.g., NCE Biology / Chemistry",
    },
    headOfInstitution: "Provost",
  },

  VOCATIONAL: {
    academicUnit: {
      singular: "Division",
      plural: "Divisions",
      codePlaceholder: "e.g., ETD",
      namePlaceholder: "e.g., Engineering Trades Division",
      selectPlaceholder: "Select Division",
      allFilterLabel: "All Divisions",
      addModalTitle: "Add New Division",
      editModalTitle: "Edit Division",
      deleteModalTitle: "Delete Division",
      createButtonLabel: "Create Division",
      addButtonLabel: "Add Division",
      searchPlaceholder: "Search divisions...",
      combinedMenuLabel: "Divisions & Trades",
      headOfUnitTitle: "Head of Division",
    },
    program: {
      awardSingular: "National Vocational Certificate (NVC)",
      awardPlural: "Vocational Certificates",
      programSample: "e.g., NVC Electrical Installation",
    },
    headOfInstitution: "Principal",
  },
};

export function getInstitutionTerminology(
  type?: InstitutionType | null,
): InstitutionTerminology {
  if (!type || !INSTITUTION_TERMINOLOGY_MAP[type]) {
    return INSTITUTION_TERMINOLOGY_MAP.CONVENTIONAL;
  }
  return INSTITUTION_TERMINOLOGY_MAP[type];
}

export function getAcademicUnitTerminology(
  type?: InstitutionType | null,
): AcademicUnitTerminology {
  return getInstitutionTerminology(type).academicUnit;
}
