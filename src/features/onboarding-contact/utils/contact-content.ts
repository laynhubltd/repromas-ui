import type { ContactStep } from "../types";

export const CONTACT_SEO = {
  title: "Contact Us & Book a Demo",
  description:
    "Book a 30-minute REPROMAS demo, ask about pricing, or get help for your university, polytechnic or college of education. We reply within one business day.",
};

export const CONTACT_HERO = {
  pill: "Contact",
  title: "Let's Talk About Your Institution's Records",
  text: "Book a 30-minute demo, ask about pricing or get help. Tell us a little about your institution and the right person will reply within one business day.",
};

export const CONTACT_NEXT_STEPS_HEADING = "What happens next";

export const CONTACT_NEXT_STEPS: ContactStep[] = [
  {
    title: "We reply within one business day",
    text: "Monday to Friday, West Africa Time. You'll also get an email confirming we have your message.",
  },
  {
    title: "A 30-minute demo, on your records",
    text: "We walk through admissions, fees, registration and results the way your institution runs them.",
  },
  {
    title: "A pilot plan or a quotation",
    text: "Start with a free 90-day pilot on one faculty, or take a quotation to your management.",
  },
];

export const CONTACT_DIRECT_HEADING = "Prefer to reach us directly?";

export const CONTACT_FORM_COPY = {
  heading: "Tell us about your institution",
  topicLabel: "What would you like to talk about?",
  fullNameLabel: "Full name",
  emailLabel: "Work email",
  emailHint: "Use your institution email if you have one.",
  phoneLabel: "Phone or WhatsApp",
  phoneHint: "So we can confirm your demo time.",
  institutionLabel: "Institution",
  institutionTypeLabel: "Type of institution",
  roleLabel: "Your role",
  studentPopulationLabel: "Number of students",
  messageLabel: "What would you like to see or ask?",
  messagePlaceholder: "For example: how results move from score entry to senate approval.",
  selectPlaceholder: "Choose one",
  privacy: "We'll use these details only to respond to your request and arrange your demo. We won't add you to a mailing list.",
  privacyLinkLabel: "Read our privacy notice",
  privacyHref: "/privacy",
  submitDemo: "Book my demo",
  submitOther: "Send message",
  submitting: "Sending…",
};

export const CONTACT_SUCCESS_COPY = {
  title: "Thank you, we've got your message",
  referenceLabel: "Your reference",
  text: "We'll reply within one business day. A confirmation is on its way to your inbox; if you can't see it, check your spam folder.",
  whatsapp: "Need us sooner? Message us on WhatsApp",
  sendAnother: "Send another message",
};
