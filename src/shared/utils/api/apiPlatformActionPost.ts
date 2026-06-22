/**
 * Request options for API Platform POST actions that have no payload.
 * Axios drops Content-Type on bodyless POSTs; sending `{}` keeps the header
 * so the server deserialize pipeline does not return 415.
 */
export const apiPlatformActionPost = {
  data: {},
  headers: {
    Accept: "application/ld+json",
    "Content-Type": "application/ld+json",
  },
} as const;
