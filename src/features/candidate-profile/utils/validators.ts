import type { Rule } from "antd/es/form";

export { emailRules, firstNameRules, lastNameRules } from "@/features/auth/candidate-signup/utils/validators";

export const phoneRules: Rule[] = [
  { max: 20, message: "Phone must be 20 characters or fewer" },
];
