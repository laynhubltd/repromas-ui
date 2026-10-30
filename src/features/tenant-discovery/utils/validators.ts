import type { Rule } from "antd/es/form";

export const nameRules: Rule[] = [
  { required: true, message: "Institution name is required." },
  { min: 3, message: "Institution name must be at least 3 characters." },
  { max: 255, message: "Institution name must be 255 characters or fewer." },
  {
    pattern: /^[a-zA-Z0-9\s&'().,-]+$/,
    message: "Name can only contain letters, numbers, spaces, and & ' ( ) . , -",
  },
];

export const codeRules: Rule[] = [
  { required: true, message: "Institution code is required." },
  { min: 2, message: "Code must be at least 2 characters." },
  { max: 20, message: "Code must be 20 characters or fewer." },
  {
    pattern: /^[A-Z0-9]+$/,
    message: "Code must be uppercase alphanumeric (e.g. KANOPOLY, FUTB).",
  },
];

export const slugRules: Rule[] = [
  { required: true, message: "Tenant slug is required." },
  { min: 3, message: "Slug must be at least 3 characters." },
  { max: 63, message: "Slug must be 63 characters or fewer." },
  {
    pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    message: "Slug must be lowercase alphanumeric with single hyphens (e.g. kanopoly).",
  },
];

export const institutionTypeRules: Rule[] = [
  { required: true, message: "Please select an institution type." },
];

export const emailRules: Rule[] = [
  { required: true, message: "Administrator email is required." },
  { type: "email", message: "Please enter a valid email address." },
  { max: 180, message: "Email must be 180 characters or fewer." },
];

export const primaryColorRules: Rule[] = [
  { required: true, message: "Primary colour is required." },
  {
    pattern: /^#[0-9A-Fa-f]{6}$/,
    message: "Primary colour must be a valid 6-digit hex code (e.g. #2E1065).",
  },
];

export const taglineRules: Rule[] = [
  { min: 2, message: "Tagline must be at least 2 characters." },
  { max: 150, message: "Tagline must be 150 characters or fewer." },
];

export const mottoRules: Rule[] = [
  { min: 2, message: "Motto must be at least 2 characters." },
  { max: 150, message: "Motto must be 150 characters or fewer." },
];

export const fullAddressRules: Rule[] = [
  { min: 5, message: "Address must be at least 5 characters." },
  { max: 500, message: "Address must be 500 characters or fewer." },
];

export function getPostalCodeRules(isNigerian: boolean): Rule[] {
  if (isNigerian) {
    return [
      {
        pattern: /^\d{6}$/,
        message: "Enter a 6-digit Nigerian postal code (for example 700001).",
      },
    ];
  }
  return [
    {
      pattern: /^[a-zA-Z0-9\s-]{3,10}$/,
      message: "Enter a valid postal code (3–10 characters).",
    },
  ];
}

export const phoneRules: Rule[] = [
  {
    pattern: /^(?:\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}$|^(?:\+?234|0)[789][01]\d{8}$/,
    message: "Enter a valid phone number (e.g. 0803 123 4567 or +2348031234567).",
  },
];

export const contactEmailRules: Rule[] = [
  { type: "email", message: "Please enter a valid contact email." },
  { max: 180, message: "Contact email must be 180 characters or fewer." },
];

export const customDomainRules: Rule[] = [
  { max: 253, message: "Custom domain must be 253 characters or fewer." },
  {
    validator: async (_: unknown, value?: string) => {
      if (!value) return;
      const trimmed = value.trim().toLowerCase();
      if (
        trimmed.endsWith("repromas.app") ||
        trimmed.endsWith("repromas.com") ||
        trimmed.includes("localhost")
      ) {
        throw new Error("Custom domain cannot use platform domains (repromas.app / repromas.com).");
      }
      if (!/^[a-z0-9]+([.-][a-z0-9]+)*\.[a-z]{2,}$/.test(trimmed)) {
        throw new Error("Enter a valid domain name (e.g. portal.university.edu.ng).");
      }
    },
  },
];

export const facebookRules: Rule[] = [
  { max: 500, message: "URL must be 500 characters or fewer." },
  {
    pattern: /^https?:\/\/(?:www\.)?(?:facebook\.com|fb\.com)\/.+$/i,
    message: "Enter a valid Facebook URL (https://facebook.com/...).",
  },
];

export const twitterRules: Rule[] = [
  { max: 500, message: "URL must be 500 characters or fewer." },
  {
    pattern: /^https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/.+$/i,
    message: "Enter a valid X / Twitter URL (https://x.com/...).",
  },
];

export const linkedinRules: Rule[] = [
  { max: 500, message: "URL must be 500 characters or fewer." },
  {
    pattern: /^https?:\/\/(?:www\.)?linkedin\.com\/(?:school|company|in)\/.+$/i,
    message: "Enter a valid LinkedIn URL (https://linkedin.com/school/...).",
  },
];

export const youtubeRules: Rule[] = [
  { max: 500, message: "URL must be 500 characters or fewer." },
  {
    pattern: /^https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/.+$/i,
    message: "Enter a valid YouTube URL (https://youtube.com/...).",
  },
];

export const logoUrlRules: Rule[] = [
  { max: 500, message: "Logo URL must be 500 characters or fewer." },
  {
    pattern: /^https?:\/\/.+\.(?:png|jpg|jpeg|gif|webp)(?:\?.*)?$/i,
    message: "Enter a valid image URL ending in .png, .jpg, .jpeg, .webp, or .gif",
  },
];
