export type AcknowledgementSlipModel = {
  acknowledgementNumber: string;
  verifyUrl: string;
  applicantName: string;
  profilePictureUrl: string | null;
  jambRegNo: string | null;
  programmeName: string | null;
  cycleName: string | null;
  entryMode: string | null;
  candidateId: number;
  applicationId: number;
  submittedAt: string | null;
  logoUrl: string | null;
  schoolName: string | null;
};

export type PrintableApplicationDocumentModel = {
  acknowledgementNumber: string;
  applicantName: string;
  profilePictureUrl: string | null;
  jambRegNo: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  stateName: string | null;
  lgaName: string | null;
  email: string | null;
  phone: string | null;
  programmeName: string | null;
  cycleName: string | null;
  entryMode: string | null;
  applicationStatus: string;
  submittedAt: string | null;
  candidateId: number;
  applicationId: number;
  logoUrl: string | null;
  schoolName: string | null;
  jambScores: { subject: string; score: number }[];
  olevelSittings: {
    examType: string;
    examYear: number;
    examRegNo: string | null;
    grades: { subject: string; grade: string }[];
  }[];
  documents: { filename: string; documentType: string; status: string }[];
};
