/**
 * Central route path definitions – single source of truth for navigation and route matching.
 */
export const appPaths = {
  login: "/login",
  signUp: "/sign-up",
  unauthorized: "/unauthorized",
  forgotPassword: "/forgot-password",
  roleSelection: "/role-selection",

  dashboard: "/dashboard",
  staffs: "/staffs",
  students: "/students",
  academicStructure: "/academic-structure",
  settings: "/settings",
  home: "/",
} as const;
