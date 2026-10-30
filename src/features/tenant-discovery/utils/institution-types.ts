import type { InstitutionCategory, InstitutionTypeOption } from "../types";

export const INSTITUTION_TYPE_OPTIONS: InstitutionTypeOption[] = [
  // Higher Education
  { value: "UNIVERSITY", label: "University", category: "Higher Education" },
  { value: "POLYTECHNIC", label: "Polytechnic", category: "Higher Education" },
  { value: "COLLEGE_OF_EDUCATION", label: "College of Education", category: "Higher Education" },
  { value: "MONOTECHNIC", label: "Monotechnic", category: "Higher Education" },
  {
    value: "INNOVATION_ENTERPRISE_INSTITUTION",
    label: "Innovation Enterprise Institution (IEI)",
    category: "Higher Education",
  },
  {
    value: "VOCATIONAL_ENTERPRISE_INSTITUTION",
    label: "Vocational Enterprise Institution (VEI)",
    category: "Higher Education",
  },

  // Basic Education
  {
    value: "BASIC_EDUCATION",
    label: "Basic Education (Primary & Junior Secondary)",
    category: "Basic Education",
  },
  {
    value: "SENIOR_SECONDARY_SCHOOL",
    label: "Senior Secondary School (SSS)",
    category: "Basic Education",
  },

  // Other
  { value: "OTHER", label: "Other Educational Institution", category: "Other" },
];

export const INSTITUTION_CATEGORIES: InstitutionCategory[] = [
  "Higher Education",
  "Basic Education",
  "Other",
];
