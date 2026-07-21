import type { Rule } from "antd/es/form";

// ── Email ─────────────────────────────────────────────────────────────────────

export const emailRules: Rule[] = [
  { required: true, message: "Email is required." },
  { type: "email", message: "Enter a valid email address." },
  { max: 180, message: "Email must be 180 characters or fewer." },
];

// ── Name fields ───────────────────────────────────────────────────────────────

export const firstNameRules: Rule[] = [
  { max: 80, message: "First name must be 80 characters or fewer." },
];

export const lastNameRules: Rule[] = [
  { max: 80, message: "Last name must be 80 characters or fewer." },
];

// ── Phone ─────────────────────────────────────────────────────────────────────

export const phoneRules: Rule[] = [
  {
    pattern: /^\+?[0-9\s-]{7,20}$/,
    message:
      "Enter a valid phone number (7–20 digits, optional leading + and spaces).",
  },
];

// ── Password (temp placeholder on create) ────────────────────────────────────

export const passwordRules: Rule[] = [
  { required: true, message: "Password is required." },
  { min: 8, message: "Password must be at least 8 characters." },
];

// ── Date of birth ─────────────────────────────────────────────────────────────

export const dateOfBirthRules: Rule[] = [
  // No required constraint — date of birth is optional on the edit form.
  // AntD DatePicker returns a Dayjs object; the hook converts it to ISO string.
];

// ── Role ──────────────────────────────────────────────────────────────────────

export const roleRules: Rule[] = [
  { required: true, message: "Please select a role." },
];
