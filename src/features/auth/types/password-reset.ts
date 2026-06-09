export type ForgotPasswordRequest = { email: string };

export type ForgotPasswordResponse = {
  email: string;
  message: string;
  reset_link: string | null;
  mail_sent: boolean;
};

export type ResetPasswordRequest = {
  token: string;
  newPassword: string;
};
