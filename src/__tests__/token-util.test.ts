/**
 * token-util — clock-skew tolerance tests.
 *
 * Regression: isTokenExpired compared the JWT `exp` claim against the local
 * clock with ZERO tolerance. On machines whose clock ran ahead, freshly
 * issued tokens looked expired and users were bounced back to /login right
 * after a successful login, with no console error.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  isTokenExpired,
  TOKEN_CLOCK_SKEW_LEEWAY_SECONDS,
} from "@/shared/utils/token-util";

/** Base64url-encode (jwt-decode requires the URL-safe alphabet). */
function base64url(value: string): string {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Build an unsigned JWT-shaped token with the given exp (seconds since epoch). */
function buildToken(expSeconds: number): string {
  const header = base64url(JSON.stringify({ alg: "none", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({ sub: "test-user", exp: Math.floor(expSeconds) }),
  );
  return `${header}.${payload}.signature`;
}

describe("isTokenExpired", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("returns false for a token expiring in the future", () => {
    const now = Date.now();
    vi.setSystemTime(now);
    expect(isTokenExpired(buildToken(now / 1000 + 3600))).toBe(false);
  });

  it("tolerates client clocks running ahead within the leeway", () => {
    const now = Date.now();
    vi.setSystemTime(now);
    // exp is 60s in the past by the local clock — within the 300s leeway,
    // so it is treated as skew, not expiry.
    expect(isTokenExpired(buildToken(now / 1000 - 60))).toBe(false);
  });

  it("still reports expiry beyond the leeway", () => {
    const now = Date.now();
    vi.setSystemTime(now);
    const pastLeeway = now / 1000 - (TOKEN_CLOCK_SKEW_LEEWAY_SECONDS + 60);
    expect(isTokenExpired(buildToken(pastLeeway))).toBe(true);
  });

  it("boundary: exactly at the leeway edge is not expired", () => {
    // Whole-second clock — buildToken floors exp, and a fractional "now"
    // would push the comparison past the edge by the lost fraction.
    const now = Math.floor(Date.now() / 1000) * 1000;
    vi.setSystemTime(now);
    // exp + leeway === now → `exp + leeway < now` is false.
    expect(
      isTokenExpired(buildToken(now / 1000 - TOKEN_CLOCK_SKEW_LEEWAY_SECONDS)),
    ).toBe(false);
  });

  it("honours an explicit zero leeway", () => {
    const now = Date.now();
    vi.setSystemTime(now);
    expect(isTokenExpired(buildToken(now / 1000 - 1), 0)).toBe(true);
    expect(isTokenExpired(buildToken(now / 1000 + 60), 0)).toBe(false);
  });

  it("treats malformed tokens as expired", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(isTokenExpired("not-a-jwt")).toBe(true);
    expect(isTokenExpired("")).toBe(true);
  });

  it("regression: a 1h-valid token on a clock running 2h ahead is within server validity", () => {
    // The login-loop scenario: the server issues a token valid for 1 hour,
    // but the client clock is 2 hours ahead. The local check inevitably says
    // "expired" (skew exceeds any sane leeway) — which is exactly why no
    // routing gate may use this function as a hard gate. Documented here so
    // the constraint survives refactors.
    const realNow = Date.now();
    const token = buildToken(realNow / 1000 + 3600);
    vi.setSystemTime(realNow + 2 * 3600 * 1000);
    expect(isTokenExpired(token)).toBe(true); // local clock's (wrong) verdict
  });
});
