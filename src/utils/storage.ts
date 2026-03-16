/**
 * Local storage abstraction for auth and user data – single place for keys and access.
 */
const PREFIX = "repromas";
const TOKEN_KEY = `${PREFIX}_token`;
const REFRESH_TOKEN_KEY = `${PREFIX}_refresh_token`;
const USER_KEY = `${PREFIX}_user`;
const PROFILE_KEY = `${PREFIX}_profile`;

export const storage = {
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),

  setRefreshToken: (refreshToken: string) =>
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken),
  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),
  removeRefreshToken: () => localStorage.removeItem(REFRESH_TOKEN_KEY),

  setUser: (user: object) =>
    localStorage.setItem(USER_KEY, JSON.stringify(user)),
  getUser: <T = unknown>(): T | null => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  },
  removeUser: () => localStorage.removeItem(USER_KEY),

  setProfile: (profile: object) =>
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)),
  getProfile: <T = unknown>(): T | null => {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  },
  removeProfile: () => localStorage.removeItem(PROFILE_KEY),

  clearAll: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(PROFILE_KEY);
  },
};
