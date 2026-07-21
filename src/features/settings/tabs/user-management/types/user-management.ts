// ── Embedded user role (from the list response) ───────────────────────────────

/**
 * Lightweight role assignment embedded in the user list response.
 * Use this to display the user's tenant roles without an extra fetch.
 */
export type UserRoleEmbed = {
  roleId: number;
  roleName: string;
  scope: string;
  scopeReferenceId: number | null;
};

// ── User entity ───────────────────────────────────────────────────────────────

/**
 * A staff user belonging to this tenant.
 * Returned by GET /api/auth/users and GET /api/auth/users/{id}.
 * `password` is never present in any response.
 */
export type TenantUser = {
  id: number;
  email: string;
  /** Platform-level roles (e.g. "ROLE_ADMIN", "ROLE_USER") — not tenant roles. */
  roles: string[];
  profileId: number | null;
  profilePictureUrl: string | null;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  dateOfBirth: string | null; // ISO 8601 date string e.g. "1985-03-15"
  /** Tenant role assignments embedded in the list response. */
  userRoles: UserRoleEmbed[];
};

// ── List response ─────────────────────────────────────────────────────────────

/** Collection response from GET /api/auth/users */
export type TenantUsersListResponse = {
  totalItems: number;
  member: TenantUser[];
};

/** Query params for GET /api/auth/users */
export type TenantUsersListParams = {
  page?: number;
  itemsPerPage?: number;
  /** Server-side filter: ?email=<value> */
  email?: string;
};

// ── Mutation request bodies ───────────────────────────────────────────────────

/**
 * Body for POST /api/auth/users.
 * `password` is a temporary placeholder — the user replaces it via the reset link.
 * `sendPasswordReset: true` triggers the welcome email immediately.
 */
export type CreateUserRequest = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roleId: number;
  scopeReferenceId: number | null;
  sendPasswordReset: boolean;
};

/**
 * Body for PATCH /api/auth/users/{id}.
 * Must be sent with Content-Type: application/merge-patch+json.
 * Only include fields you want to change — omitted fields are left unchanged.
 * Email and password are intentionally not editable via this endpoint.
 */
export type UpdateUserRequest = {
  id: number;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string | null; // ISO 8601 date string
};

/** Body for POST /api/auth/forgot-password */
export type ResendPasswordRequest = {
  email: string;
};

/** Response from POST /api/auth/forgot-password */
export type ResendPasswordResponse = {
  message: string;
  mail_sent: boolean;
};

// ── User role assignment ──────────────────────────────────────────────────────

/** Body for POST /api/users/{userId}/roles */
export type AssignUserRoleRequest = {
  userId: number;
  roleId: number;
  scopeReferenceId: number | null;
};

/**
 * Full user role assignment record from GET /api/users/{userId}/roles.
 * The `id` field is the UserRole record ID — needed for display/audit only.
 * DELETE uses roleId in the URL, not this id.
 */
export type UserRoleDetail = {
  id: number;
  userId: number;
  roleId: number;
  roleName: string;
  scope: string;
  scopeReferenceId: number | null;
  tenantId: number;
  assignedAt: string;
};

/** Response from POST /api/users/{userId}/roles (201) */
export type UserRoleAssignment = {
  id: number;
  userId: number;
  roleId: number;
  scopeReferenceId: number | null;
  assignedAt: string;
};

// ── Derived UI helpers ────────────────────────────────────────────────────────

/** Resolves a display name for a user — falls back to email if no profile names. */
export function resolveUserDisplayName(user: TenantUser): string {
  const first = user.firstName?.trim();
  const last = user.lastName?.trim();
  if (first && last) return `${first} ${last}`;
  if (first) return first;
  if (last) return last;
  return user.email;
}

/** Resolves initials for the avatar fallback (max 2 chars). */
export function resolveUserInitials(user: TenantUser): string {
  const first = user.firstName?.trim();
  const last = user.lastName?.trim();
  if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
  if (first) return first.slice(0, 2).toUpperCase();
  if (last) return last.slice(0, 2).toUpperCase();
  return user.email.slice(0, 2).toUpperCase();
}
