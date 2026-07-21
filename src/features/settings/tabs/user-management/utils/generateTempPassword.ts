/**
 * Generates a temporary password for new user accounts.
 *
 * Format: `Temp@` + 8 random alphanumeric characters.
 * Satisfies the backend minimum of 8 total chars and includes
 * a special character so it passes common password policies.
 *
 * The admin does not need to invent a password — this is auto-filled
 * in the create form. The user replaces it via the emailed reset link.
 */
export function generateTempPassword(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let suffix = "";

  // Use crypto.getRandomValues when available (browser + modern Node),
  // fall back to Math.random for environments where it is unavailable.
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    const buf = new Uint8Array(8);
    globalThis.crypto.getRandomValues(buf);
    for (const byte of buf) {
      suffix += chars[byte % chars.length];
    }
  } else {
    for (let i = 0; i < 8; i++) {
      suffix += chars[Math.floor(Math.random() * chars.length)];
    }
  }

  return `Temp@${suffix}`;
}
