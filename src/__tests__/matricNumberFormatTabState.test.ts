import { describe, expect, it } from "vitest";
import {
  MatricNumberFormatTabActionType,
  initialMatricNumberFormatTabState,
  matricNumberFormatTabReducer,
} from "@/features/admission-config/tabs/matric-number-format/state/matricNumberFormatTabState";
import type { MatricNumberFormat } from "@/features/admission-config/tabs/matric-number-format/types/matric-number-format";

const mockFormat: MatricNumberFormat = {
  id: 1,
  code: "FMT-2026",
  entryMode: null,
  status: "ACTIVE",
  template: "{sessionUpperYYYY}/REG/{seq:6}",
  tokenOptions: {},
  counterPartition: "TENANT",
  sequencePadding: 6,
  initialValue: 1,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-02T00:00:00Z",
};

describe("matricNumberFormatTabReducer", () => {
  it("opens deactivate modal with target", () => {
    const state = matricNumberFormatTabReducer(initialMatricNumberFormatTabState, {
      type: MatricNumberFormatTabActionType.OpenDeactivate,
      target: mockFormat,
    });

    expect(state.deactivateTarget).toEqual(mockFormat);
  });

  it("closes deactivate modal", () => {
    const state = matricNumberFormatTabReducer(
      { ...initialMatricNumberFormatTabState, deactivateTarget: mockFormat },
      { type: MatricNumberFormatTabActionType.CloseDeactivate },
    );

    expect(state.deactivateTarget).toBeNull();
  });

  it("resets deactivate target on Reset", () => {
    const state = matricNumberFormatTabReducer(
      { ...initialMatricNumberFormatTabState, deactivateTarget: mockFormat },
      { type: MatricNumberFormatTabActionType.Reset },
    );

    expect(state).toEqual(initialMatricNumberFormatTabState);
  });

  it("opens reactivate modal with target", () => {
    const state = matricNumberFormatTabReducer(initialMatricNumberFormatTabState, {
      type: MatricNumberFormatTabActionType.OpenReactivate,
      target: { ...mockFormat, status: "INACTIVE" },
    });

    expect(state.reactivateTarget?.status).toBe("INACTIVE");
  });

  it("closes reactivate modal", () => {
    const inactive = { ...mockFormat, status: "INACTIVE" as const };
    const state = matricNumberFormatTabReducer(
      { ...initialMatricNumberFormatTabState, reactivateTarget: inactive },
      { type: MatricNumberFormatTabActionType.CloseReactivate },
    );

    expect(state.reactivateTarget).toBeNull();
  });

  it("sets entry mode filter and resets page", () => {
    const state = matricNumberFormatTabReducer(
      { ...initialMatricNumberFormatTabState, page: 3 },
      { type: MatricNumberFormatTabActionType.SetEntryModeFilter, value: "UTME" },
    );

    expect(state.entryModeFilter).toBe("UTME");
    expect(state.page).toBe(1);
  });

  it("opens create modal for a specific slot with preset lane", () => {
    const state = matricNumberFormatTabReducer(initialMatricNumberFormatTabState, {
      type: MatricNumberFormatTabActionType.OpenCreateForSlot,
      entryMode: "DIRECT_ENTRY",
    });

    expect(state.createOpen).toBe(true);
    expect(state.createEntryMode).toBe("DIRECT_ENTRY");
  });

  it("clears create entry mode when create modal closes", () => {
    const state = matricNumberFormatTabReducer(
      {
        ...initialMatricNumberFormatTabState,
        createOpen: true,
        createEntryMode: "TRANSFER",
      },
      { type: MatricNumberFormatTabActionType.CloseCreate },
    );

    expect(state.createOpen).toBe(false);
    expect(state.createEntryMode).toBeUndefined();
  });
});
