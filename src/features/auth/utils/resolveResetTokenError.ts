import {
  PASSWORD_RESET_TOKEN_ERROR_DEFAULT,
  PASSWORD_RESET_TOKEN_ERROR_EXPIRED,
  PASSWORD_RESET_TOKEN_ERROR_INVALID,
  PASSWORD_RESET_TOKEN_ERROR_USED,
} from "@/shared/constants/passwordResetOptions";

export function resolveResetTokenError(detail: string | undefined): string {
  if (!detail) {
    return PASSWORD_RESET_TOKEN_ERROR_DEFAULT;
  }

  const normalized = detail.toLowerCase();

  if (normalized.includes("expired")) {
    return PASSWORD_RESET_TOKEN_ERROR_EXPIRED;
  }

  if (normalized.includes("invalid")) {
    return PASSWORD_RESET_TOKEN_ERROR_INVALID;
  }

  if (normalized.includes("already been used")) {
    return PASSWORD_RESET_TOKEN_ERROR_USED;
  }

  return PASSWORD_RESET_TOKEN_ERROR_DEFAULT;
}
