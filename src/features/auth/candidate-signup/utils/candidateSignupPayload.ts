import type {
  AdmissionEntryMode,
  AdmissionLaneSelectors,
  AdmissionSignupConfig,
  AdmissionSignupConfigParams,
} from "../types/candidate-signup";

const ENTRY_MODES = new Set<string>(["UTME", "DIRECT_ENTRY", "TRANSFER"]);

export function readRawEntryModeFromSearch(
  searchParams: URLSearchParams,
): string | null {
  const raw = searchParams.get("entryMode");
  if (!raw) return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function parseLaneParamsFromSearch(
  searchParams: URLSearchParams,
): AdmissionSignupConfigParams {
  const params: AdmissionSignupConfigParams = {};
  const entryMode = readRawEntryModeFromSearch(searchParams);
  if (entryMode && ENTRY_MODES.has(entryMode)) {
    params.entryMode = entryMode as AdmissionSignupConfigParams["entryMode"];
  }
  const sessionIdRaw = searchParams.get("sessionId");
  if (sessionIdRaw) {
    const sessionId = Number(sessionIdRaw);
    if (!Number.isNaN(sessionId)) {
      params.sessionId = sessionId;
    }
  }
  return params;
}

export function buildLaneSelectors(
  config: AdmissionSignupConfig | undefined,
  urlOverrides?: AdmissionSignupConfigParams,
  selectedEntryMode?: AdmissionEntryMode | null,
): AdmissionLaneSelectors {
  const selectors: AdmissionLaneSelectors = {};

  const fallbackSingleMode =
    config?.entryModes?.length === 1
      ? config.entryModes[0].entryMode
      : undefined;
  const entryMode =
    selectedEntryMode ?? urlOverrides?.entryMode ?? fallbackSingleMode;
  if (entryMode) {
    selectors.entryMode = entryMode;
  }

  const sessionId = urlOverrides?.sessionId ?? config?.sessionId;
  if (sessionId !== undefined) {
    selectors.sessionId = sessionId;
  }

  return selectors;
}

export function withLaneSelectors<T extends Record<string, unknown>>(
  body: T,
  selectors: AdmissionLaneSelectors,
): T & AdmissionLaneSelectors {
  const result = { ...body } as T & AdmissionLaneSelectors;
  if (selectors.entryMode !== undefined) {
    result.entryMode = selectors.entryMode;
  }
  if (selectors.sessionId !== undefined) {
    result.sessionId = selectors.sessionId;
  }
  return result;
}
