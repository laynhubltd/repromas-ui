import { describe, expect, it, vi } from "vitest";
import { applyUniqueOrderUpdates } from "./applyUniqueOrderUpdates";

describe("applyUniqueOrderUpdates", () => {
  it("applies temp orders then final 1-based orders sequentially", async () => {
    const calls: number[] = [];
    const items = [{ id: "a" }, { id: "b" }, { id: "c" }];

    await applyUniqueOrderUpdates(items, async (_item, order) => {
      calls.push(order);
    });

    expect(calls).toEqual([10_000, 10_001, 10_002, 1, 2, 3]);
  });

  it("preserves item order in final pass", async () => {
    const applyOrder = vi.fn(async () => undefined);
    const items = [{ id: 1 }, { id: 2 }];

    await applyUniqueOrderUpdates(items, applyOrder);

    expect(applyOrder).toHaveBeenCalledTimes(4);
    expect(applyOrder.mock.calls[0]).toEqual([{ id: 1 }, 10_000]);
    expect(applyOrder.mock.calls[1]).toEqual([{ id: 2 }, 10_001]);
    expect(applyOrder.mock.calls[2]).toEqual([{ id: 1 }, 1]);
    expect(applyOrder.mock.calls[3]).toEqual([{ id: 2 }, 2]);
  });
});
