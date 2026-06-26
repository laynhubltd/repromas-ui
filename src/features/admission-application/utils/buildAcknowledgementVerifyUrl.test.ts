import { appPaths } from "@/app/routing/app-path";
import { describe, expect, it } from "vitest";
import { buildAcknowledgementVerifyUrl } from "./buildAcknowledgementVerifyUrl";

describe("buildAcknowledgementVerifyUrl", () => {
  it("builds URL with application ref query", () => {
    const url = buildAcknowledgementVerifyUrl(99);
    expect(url).toContain(`${appPaths.StudentApplication}?ref=99`);
  });
});
