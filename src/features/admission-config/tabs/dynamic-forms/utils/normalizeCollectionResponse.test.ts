import { describe, expect, it } from "vitest";
import { normalizeCollectionResponse } from "./normalizeCollectionResponse";

describe("normalizeCollectionResponse", () => {
  it("returns plain arrays as-is", () => {
    expect(normalizeCollectionResponse([{ id: 1 }])).toEqual([{ id: 1 }]);
  });

  it("extracts member from paginated payloads", () => {
    expect(
      normalizeCollectionResponse({
        totalItems: 1,
        member: [{ id: 2 }],
      }),
    ).toEqual([{ id: 2 }]);
  });

  it("returns empty array for unexpected shapes", () => {
    expect(normalizeCollectionResponse(null)).toEqual([]);
    expect(normalizeCollectionResponse({})).toEqual([]);
  });
});
