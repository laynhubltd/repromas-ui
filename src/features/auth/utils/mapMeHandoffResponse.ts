import type { LoginResponse } from "../types";
import type { MeHandoffResponse } from "../types/me-handoff";
import { mapLoginResponse } from "./mapLoginResponse";

/** Handoff payload matches login bootstrap fields; reuse login mapper. */
export function mapMeHandoffToLoginResponse(raw: unknown): LoginResponse {
  return mapLoginResponse(raw as MeHandoffResponse);
}
