import type { InstitutionType } from "@/features/settings/tabs/system-config/types/system-config";

export type InstitutionTypeOption = {
  value: InstitutionType;
  label: string;
  description: string;
};

export const INSTITUTION_TYPE_OPTIONS: InstitutionTypeOption[] = [
  {
    value: "CONVENTIONAL",
    label: "Conventional University",
    description: "Standard university awarding B.Sc, B.A, etc., structured into Faculties.",
  },
  {
    value: "TECHNOLOGY",
    label: "University of Technology",
    description: "Specialized university awarding B.Tech, B.Eng, structured into Schools/Faculties.",
  },
  {
    value: "POLYTECHNIC",
    label: "Polytechnic",
    description: "Technical institution awarding ND & HND, structured into Schools.",
  },
  {
    value: "COLLEGE",
    label: "College of Education / Agriculture",
    description: "Specialized college awarding NCE, Diplomas, or professional certificates.",
  },
  {
    value: "MONOTECHNIC",
    label: "Monotechnic",
    description: "Single-discipline specialized technical college.",
  },
  {
    value: "VOCATIONAL",
    label: "Vocational & Technical College",
    description: "Practical skill-acquisition and TVET modular certifications.",
  },
];

export function getInstitutionTypeOption(
  value: string | undefined | null,
): InstitutionTypeOption | undefined {
  return INSTITUTION_TYPE_OPTIONS.find((opt) => opt.value === value);
}

export function getInstitutionTypeLabel(
  value: string | undefined | null,
): string {
  const match = getInstitutionTypeOption(value);
  return match ? match.label : (value ?? "—");
}
