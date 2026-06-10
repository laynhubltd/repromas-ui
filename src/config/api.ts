/**
 * API configuration – single source for base URLs and env.
 */
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "https://api.repromas.cloud/api",
  appName: import.meta.env.VITE_APP_NAME ?? "Repromas",
} as const;
