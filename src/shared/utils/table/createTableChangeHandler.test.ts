import { describe, expect, it, vi } from "vitest";
import { createTableChangeHandler } from "./createTableChangeHandler";

interface TestRecord {
  id: number;
  name: string;
}

describe("createTableChangeHandler", () => {
  it("delegates to onPageChange when extra.action is paginate", () => {
    const onPageChange = vi.fn();
    const onSortChange = vi.fn();
    const handler = createTableChangeHandler<TestRecord>({
      onPageChange,
      onSortChange,
      defaultSort: "name:asc",
    });

    handler(
      { current: 2, pageSize: 10 },
      {},
      {},
      { action: "paginate", currentDataSource: [] },
    );

    expect(onPageChange).toHaveBeenCalledWith(2, 10);
    expect(onSortChange).not.toHaveBeenCalled();
  });

  it("delegates to onSortChange when extra.action is sort", () => {
    const onPageChange = vi.fn();
    const onSortChange = vi.fn();
    const handler = createTableChangeHandler<TestRecord>({
      onPageChange,
      onSortChange,
      defaultSort: "name:asc",
    });

    handler(
      { current: 1, pageSize: 10 },
      {},
      { columnKey: "name", order: "descend" },
      { action: "sort", currentDataSource: [] },
    );

    expect(onSortChange).toHaveBeenCalledWith("name:desc");
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("respects isSortFieldAllowed whitelist", () => {
    const onPageChange = vi.fn();
    const onSortChange = vi.fn();
    const handler = createTableChangeHandler<TestRecord>({
      onPageChange,
      onSortChange,
      defaultSort: "name:asc",
      isSortFieldAllowed: (field) => field === "name",
    });

    handler(
      { current: 1, pageSize: 10 },
      {},
      { columnKey: "disallowed", order: "ascend" },
      { action: "sort", currentDataSource: [] },
    );

    expect(onSortChange).not.toHaveBeenCalled();
  });

  it("reverts to defaultSort when sort order is cleared", () => {
    const onPageChange = vi.fn();
    const onSortChange = vi.fn();
    const handler = createTableChangeHandler<TestRecord>({
      onPageChange,
      onSortChange,
      defaultSort: "name:asc",
    });

    handler(
      { current: 1, pageSize: 10 },
      {},
      { columnKey: "name", order: undefined },
      { action: "sort", currentDataSource: [] },
    );

    expect(onSortChange).toHaveBeenCalledWith("name:asc");
  });
});

