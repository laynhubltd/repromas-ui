import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp: number; // Expiration time in seconds since epoch
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded: DecodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Current time in seconds
    return decoded.exp < currentTime;
  } catch (error) {
    console.error("Error decoding token or token is invalid:", error);
    return true; // Assume expired or invalid if decoding fails
  }
}
