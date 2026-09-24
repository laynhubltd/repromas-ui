import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp: number; // Expiration time in seconds since epoch
}

/**
 * Clock-skew leeway (seconds) applied when comparing a JWT `exp` claim
 * against the local clock. Client clocks routinely drift by minutes; with
 * zero tolerance a machine whose clock ran ahead saw every freshly issued
 * token as "expired", which silently bounced users back to the login page
 * right after a successful login. Five minutes matches the leeway defaults
 * of common JWT validators (e.g. jsonwebtoken's clockTolerance guidance).
 */
export const TOKEN_CLOCK_SKEW_LEEWAY_SECONDS = 300;

/**
 * Advisory check only — the server is the arbiter of expiry (a genuinely
 * expired token gets a 401, which the API layer resolves via the refresh
 * flow). Never use this as a hard routing gate on its own: routing gates
 * must key off token PRESENCE, not client-clock expiry.
 */
export function isTokenExpired(
  token: string,
  leewaySeconds: number = TOKEN_CLOCK_SKEW_LEEWAY_SECONDS,
): boolean {
  try {
    const decoded: DecodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Current time in seconds
    return decoded.exp + leewaySeconds < currentTime;
  } catch (error) {
    console.error("Error decoding token or token is invalid:", error);
    return true; // Assume expired or invalid if decoding fails
  }
}
