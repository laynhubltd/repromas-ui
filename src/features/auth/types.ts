export type ApiRole = {
  name: string;
  scope: string;
  scopeReferenceId: number | null;
  entity: unknown | null;
};

export type AuthProfile = {
  id: number;
  userId: number;
  tenantId: number;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  dateOfBirth: string | null;
  score: number;
  metadata: unknown | null;
  email: string;
};

export type LoginRequest = { email: string; password: string };
export type LoginResponse = {
  token: string;
  refresh_token: string;
  profile: AuthProfile;
  roles: ApiRole[];
  permissions: string[];
};

export type SignUpRequest = { email: string; password: string };
export type SignUpResponse = { message?: string };
export type ForgotPasswordRequest = { email: string };

export type UserProfile = {
  id: string;
  userId?: number;
  tenantId?: number;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  /** @deprecated Legacy multi-profile login; no longer sent by API */
  role?: UserRole;
  /** @deprecated Legacy multi-profile login */
  company?: { id: string; name: string; type?: string };
};

export type UserRole = {
  name: string;
  scope?: string;
  scopeReferenceId?: number | null;
};

/** @deprecated Legacy multi-profile login */
export type SimpleUserProfile = {
  profileId: string;
  role: { name: string; description?: string };
  company: { id: string; name: string; type?: string };
};

export type TokenResponse = { accessToken?: string; refreshToken?: string };
