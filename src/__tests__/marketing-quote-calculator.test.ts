import { describe, expect, it } from "vitest";
import { buildTenantLoginUrl } from "@/app/routing/module-routes/onboarding/utils/build-tenant-login-url";
import { computeQuote, formatNaira, PRICE_BOOK } from "@/features/onboarding-pricing";
import type { QuoteSelection } from "@/features/onboarding-pricing";

const BASE: QuoteSelection = {
  institutionType: "polytechnic",
  paymentModel: "licence",
  onboarding: "standard",
  extraTrainingDays: 0,
  onshoreHosting: false,
  transcriptDigitisation: false,
  term: 1,
};

describe("formatNaira", () => {
  it("formats whole naira with thousands separators", () => {
    expect(formatNaira(1200000)).toBe("₦1,200,000");
    expect(formatNaira(0)).toBe("₦0");
  });
});

describe("computeQuote", () => {
  it("charges the institution licence per session", () => {
    const quote = computeQuote(BASE, PRICE_BOOK);
    expect(quote.total).toBe(1_200_000);
    expect(quote.totalLabel).toBe("Per session");
    expect(quote.oneTime).toBe(0);
    expect(quote.showCommitmentOffer).toBe(true);
    expect(quote.lines[0]).toEqual({ label: "Polytechnic licence", value: "₦1,200,000" });
  });

  it("adds onshore hosting to the recurring total and discounts a 3-session licence", () => {
    const quote = computeQuote({ ...BASE, institutionType: "university", onshoreHosting: true, term: 3 }, PRICE_BOOK);
    expect(quote.total).toBe((2_400_000 + 600_000) * 2.5);
    expect(quote.totalLabel).toBe("3-session total");
  });

  it("charges on-site onboarding and training days once", () => {
    const quote = computeQuote({ ...BASE, onboarding: "onsite", extraTrainingDays: 2 }, PRICE_BOOK);
    expect(quote.oneTime).toBe(450_000 + 2 * 150_000);
    expect(quote.total).toBe(1_200_000);
  });

  it("caps training days at the price book maximum", () => {
    const quote = computeQuote({ ...BASE, extraTrainingDays: 50 }, PRICE_BOOK);
    expect(quote.oneTime).toBe(PRICE_BOOK.maxTrainingDays * PRICE_BOOK.trainingDay);
  });

  it("gives the partnership no upfront licence and no 3-session discount", () => {
    const quote = computeQuote(
      { ...BASE, paymentModel: "partnership", onshoreHosting: true, term: 3, transcriptDigitisation: true },
      PRICE_BOOK,
    );
    expect(quote.total).toBe(600_000 * 3);
    expect(quote.showCommitmentOffer).toBe(false);
    expect(quote.lines).toContainEqual({ label: "Partnership licence", value: "₦0 upfront" });
    expect(quote.lines).toContainEqual({ label: "Transcript digitisation", value: "Included" });
  });

  it("quotes multi-campus licences individually", () => {
    const quote = computeQuote({ ...BASE, institutionType: "group" }, PRICE_BOOK);
    expect(quote.total).toBeNull();
    expect(quote.lines[0]).toEqual({ label: "Multi-campus / State licence", value: "Quoted" });
  });
});

describe("buildTenantLoginUrl", () => {
  it("prefixes localhost with the slug and keeps the port", () => {
    expect(buildTenantLoginUrl("fedpoly", { protocol: "http:", hostname: "localhost", port: "5173" })).toBe(
      "http://fedpoly.localhost:5173/auth/login",
    );
  });

  it("uses the last two labels of the apex domain", () => {
    expect(buildTenantLoginUrl("fedpoly", { protocol: "https:", hostname: "www.repromas.app", port: "" })).toBe(
      "https://fedpoly.repromas.app/auth/login",
    );
  });
});
