import { describe, expect, it } from "vitest";
import type { BillableEventPolicySeedResult } from "@/features/billing/tabs/fee-policies/types/billable-event-policy";
import type { FeeEventsTabLabelMaps } from "../../types/fee-events-tab";
import {
  buildSeedCreatedLines,
  formatSeedPolicyHint,
  getSeedConfigurePricingParams,
} from "../seedFromCatalogDisplay";

const emptyLabelMaps: FeeEventsTabLabelMaps = {
  triggerLabels: {},
  guardLabels: {},
  timingLabels: {},
  codeLabels: {},
  fulfilledStatusLabels: {},
  occurrenceLabels: { PER_SESSION: "Per session" },
  periodLabels: { SESSION: "Session" },
  arrearsLabels: {},
};

describe("seedFromCatalogDisplay", () => {
  it("formats policy hint with period when present", () => {
    expect(
      formatSeedPolicyHint(
        {
          id: 1,
          code: "REGISTRATION_FEE",
          eventId: 12,
          versionNo: 1,
          isActive: true,
          occurrenceMode: "PER_SESSION",
          periodType: "SESSION",
        },
        emptyLabelMaps,
      ),
    ).toBe("v1 policy, session");
  });

  it("builds created lines and configure-pricing params", () => {
    const result: BillableEventPolicySeedResult = {
      implementedOnly: true,
      skipExisting: true,
      createdCount: 1,
      skippedCount: 0,
      createdEvents: [
        {
          id: 12,
          code: "REGISTRATION_FEE",
          name: "Registration Fee",
          isActive: true,
          currentPolicy: null,
        },
      ],
      createdPolicies: [
        {
          id: 45,
          code: "REGISTRATION_FEE",
          eventId: 12,
          versionNo: 1,
          isActive: true,
          occurrenceMode: "PER_SESSION",
          periodType: "SESSION",
        },
      ],
      skipped: [],
    };

    expect(buildSeedCreatedLines(result, emptyLabelMaps)).toEqual([
      "Registration Fee (REGISTRATION_FEE) — v1 policy, session",
    ]);
    expect(getSeedConfigurePricingParams(result)).toEqual({
      eventCode: "REGISTRATION_FEE",
      billableEventPolicyId: 45,
    });
  });
});
