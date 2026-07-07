import { useMemo } from "react";
import type {
  MatricFormatActiveSlot,
  MatricFormatSlot,
  MatricNumberFormat,
} from "../types/matric-number-format";
import { findActiveSlot, matricSlotsMatch } from "../utils/slotLifecycleEligibility";

export type MatricSlotCardVariant =
  | "live"
  | "liveLocked"
  | "notConfigured"
  | "missingLocked";

export type MatricSlotCardModel = {
  entryMode: MatricFormatSlot;
  variant: MatricSlotCardVariant;
  format: MatricNumberFormat | null;
  showLockBanner: boolean;
  showFallbackWarning: boolean;
};

type UseMatricFormatSlotOverviewInput = {
  slots: MatricFormatActiveSlot[];
  currentSessionId: number | null;
};

function resolveCardVariant(slot: MatricFormatActiveSlot): MatricSlotCardVariant {
  const hasLiveFormat = slot.format?.status === "ACTIVE";
  if (hasLiveFormat && slot.activationLocked) return "liveLocked";
  if (hasLiveFormat) return "live";
  if (slot.activationLocked) return "missingLocked";
  return "notConfigured";
}

export function useMatricFormatSlotOverview({
  slots,
  currentSessionId,
}: UseMatricFormatSlotOverviewInput) {
  const cards = useMemo((): MatricSlotCardModel[] => {
    const defaultLive = findActiveSlot(slots, null)?.format?.status === "ACTIVE";

    return slots.map((slot) => {
      const variant = resolveCardVariant(slot);
      const showLockBanner =
        slot.activationLocked && currentSessionId !== null && variant !== "notConfigured";
      const showFallbackWarning =
        slot.entryMode !== null &&
        slot.format === null &&
        defaultLive &&
        variant === "notConfigured";

      return {
        entryMode: slot.entryMode,
        variant,
        format: slot.format,
        showLockBanner,
        showFallbackWarning,
      };
    });
  }, [currentSessionId, slots]);

  return { cards };
}

export function slotsIncludeEntryMode(
  slots: MatricFormatActiveSlot[],
  entryMode: MatricFormatSlot,
): boolean {
  return slots.some((slot) => matricSlotsMatch(slot.entryMode, entryMode));
}
