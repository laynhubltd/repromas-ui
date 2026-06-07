import { validators } from "@/shared/utils/validators";
import type { Rule } from "antd/es/form";

export { jambRegNoRules } from "@/features/admission-candidate/utils/validators";

export const emailRules: Rule[] = [
  { required: true, message: "Email is required" },
  {
    validator: (_: unknown, value: string) =>
      !value || validators.email(value)
        ? Promise.resolve()
        : Promise.reject(new Error("Enter a valid email address")),
  },
];

export const passwordRules: Rule[] = [
  { required: true, message: "Password is required" },
  {
    validator: (_: unknown, value: string) =>
      !value || validators.password(value)
        ? Promise.resolve()
        : Promise.reject(new Error("Password must be at least 8 characters")),
  },
];

export const confirmPasswordRules = (getPassword: () => unknown): Rule[] => [
  { required: true, message: "Please confirm your password" },
  {
    validator(_: unknown, value: string) {
      if (!value || getPassword() === value) {
        return Promise.resolve();
      }
      return Promise.reject(new Error("Passwords do not match"));
    },
  },
];

export const dateOfBirthRules: Rule[] = [
  { required: true, message: "Date of birth is required" },
];

export const genderRules: Rule[] = [
  { required: true, message: "Gender is required" },
];

export const lgaIdRules: Rule[] = [
  { required: true, message: "LGA is required" },
];

export {
  firstNameRules,
  lastNameRules,
  stateIdRules,
} from "@/features/admission-candidate/utils/validators";
