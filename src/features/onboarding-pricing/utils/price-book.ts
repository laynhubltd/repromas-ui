import type { PriceBook } from "../types";

/**
 * Published price book for the quote builder and the full price list.
 *
 * DRAFT: every figure below is a placeholder for layout, anchored on the ₦1,160,340 FPB renewal.
 * Replace them with approved prices, then set `status` to "approved" to remove the draft notice.
 */
export const PRICE_BOOK: PriceBook = {
  status: "draft",
  licencePerSession: {
    polytechnic: 1_200_000,
    "college-of-education": 1_200_000,
    university: 2_400_000,
    group: null,
  },
  onsiteOnboarding: 450_000,
  trainingDay: 150_000,
  onshoreHostingPerSession: 600_000,
  threeSessionChargedSessions: 2.5,
  maxTrainingDays: 10,
};
