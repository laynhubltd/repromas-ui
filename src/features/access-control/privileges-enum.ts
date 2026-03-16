/**
 * Privilege identifiers for role-based menu and route access.
 * Extend as repromas features (e.g. admission) are added.
 */
export const Privilege = {
  DashboardRead: "dashboard:re",
  AdmissionRead: "admission:re",
  AdmissionCreate: "admission:crt",
  AdmissionUpdate: "admission:upd",
} as const;

export type Privilege = (typeof Privilege)[keyof typeof Privilege];
