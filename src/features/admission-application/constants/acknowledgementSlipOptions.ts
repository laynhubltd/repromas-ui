export const ACKNOWLEDGEMENT_REFERENCE_PREFIX = "APP";

export const ACKNOWLEDGEMENT_SLIP_UI_COPY = {
  documentTitle: "Application Acknowledgement Slip",
  headline: "Application Acknowledgement Slip",
  confirmationTitle: "Application received",
  confirmationBody:
    "Your admission application has been submitted successfully. Keep your acknowledgement slip for your records.",
  statusLine:
    "This confirms your application has been received and is under review.",
  acknowledgementNo: "Acknowledgement No.",
  dateSubmitted: "Date submitted",
  applicantName: "Applicant name",
  jambRegNo: "JAMB registration number",
  programmeApplied: "Programme applied",
  admissionCycle: "Admission cycle",
  candidateId: "Candidate ID",
  applicationId: "Application ID",
  entryMode: "Entry mode",
  nextStepsTitle: "What happens next",
  footerNote: "Generated electronically — no signature required",
  printSlip: "Print acknowledgement slip",
  viewApplication: "View application",
  backToHome: "Back to home",
} as const;

export const ACKNOWLEDGEMENT_NEXT_STEPS = [
  "Keep this slip for your records and screening (if required by your institution).",
  "Await screening and document verification updates on your Application page.",
  "Check Home for progress and notifications.",
  "Contact the admissions office for enquiries — quote your acknowledgement number.",
] as const;
