import type {
  ContactInstitutionType,
  ContactOption,
  ContactRole,
  ContactTopic,
  StudentPopulationBand,
} from "../types";

/** Option labels match the API's enum labels, so the team email reads the same as the form. */
export const CONTACT_TOPIC_OPTIONS: ContactOption<ContactTopic>[] = [
  { value: "demo", label: "Book a demo" },
  { value: "pricing", label: "Pricing & quotation" },
  { value: "partnership", label: "Partnership" },
  { value: "support", label: "Support" },
  { value: "other", label: "Something else" },
];

export const CONTACT_INSTITUTION_TYPE_OPTIONS: ContactOption<ContactInstitutionType>[] = [
  { value: "university", label: "University" },
  { value: "polytechnic", label: "Polytechnic" },
  { value: "college_of_education", label: "College of Education" },
  { value: "other", label: "Other" },
];

export const CONTACT_ROLE_OPTIONS: ContactOption<ContactRole>[] = [
  { value: "registrar", label: "Registrar" },
  { value: "exams_and_records", label: "Exams & Records" },
  { value: "bursar", label: "Bursar" },
  { value: "ict_director", label: "ICT Director" },
  { value: "dean_or_hod", label: "Dean / HOD" },
  { value: "principal_officer", label: "VC / Rector / Provost" },
  { value: "other", label: "Other" },
];

export const CONTACT_STUDENT_POPULATION_OPTIONS: ContactOption<StudentPopulationBand>[] = [
  { value: "under_5k", label: "Under 5,000" },
  { value: "5k_to_15k", label: "5,000 – 15,000" },
  { value: "15k_to_30k", label: "15,000 – 30,000" },
  { value: "over_30k", label: "Over 30,000" },
];

export const DEFAULT_CONTACT_TOPIC: ContactTopic = "demo";

export function parseContactTopic(value: string | null): ContactTopic {
  return CONTACT_TOPIC_OPTIONS.find((option) => option.value === value)?.value ?? DEFAULT_CONTACT_TOPIC;
}
