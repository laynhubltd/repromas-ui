/** Values the API accepts (see repromas-api Notification\Domain\Enum). */
export type ContactTopic = "demo" | "pricing" | "partnership" | "support" | "other";
export type ContactInstitutionType = "university" | "polytechnic" | "college_of_education" | "other";
export type ContactRole =
  | "registrar"
  | "exams_and_records"
  | "bursar"
  | "ict_director"
  | "dean_or_hod"
  | "principal_officer"
  | "other";
export type StudentPopulationBand = "under_5k" | "5k_to_15k" | "15k_to_30k" | "over_30k";

export type ContactOption<T extends string> = {
  value: T;
  label: string;
};

export type ContactFormValues = {
  topic: ContactTopic;
  fullName: string;
  email: string;
  phone?: string;
  institution: string;
  institutionType?: ContactInstitutionType;
  role?: ContactRole;
  studentPopulation?: StudentPopulationBand;
  message?: string;
  /** Honeypot, hidden from people. */
  website?: string;
};

export type ContactRequestPayload = {
  topic: ContactTopic;
  fullName: string;
  email: string;
  phone: string | null;
  institution: string;
  institutionType: ContactInstitutionType | null;
  role: ContactRole | null;
  studentPopulation: StudentPopulationBand | null;
  message: string | null;
  sourcePage: string;
  website: string | null;
};

export type ContactRequestReceipt = {
  reference: string;
  receivedAt: string;
};

export type ContactStep = {
  title: string;
  text: string;
};

export type ContactChannel = {
  label: string;
  value: string;
  href: string;
};
