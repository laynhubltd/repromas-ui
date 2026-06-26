import type { Rule } from "antd/es/form";
import {
  confirmPasswordRules,
  passwordRules,
} from "@/features/auth/utils/validators";

export { validateProfilePicture } from "./profilePictureValidators";

export const currentPasswordRules: Rule[] = [
  { required: true, message: "Please enter your current password" },
];

export const newPasswordRules = (
  getCurrentPassword: () => unknown,
): Rule[] => [
  ...passwordRules,
  {
    validator(_: unknown, value: string) {
      const current = getCurrentPassword();
      if (!value || !current || value !== current) {
        return Promise.resolve();
      }
      return Promise.reject(
        new Error("New password must be different from your current password"),
      );
    },
  },
];

export const changePasswordConfirmRules = (
  getNewPassword: () => unknown,
): Rule[] => confirmPasswordRules(getNewPassword);
