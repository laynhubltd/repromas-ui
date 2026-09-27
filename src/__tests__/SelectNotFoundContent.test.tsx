import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SelectNotFoundContent } from "../shared/ui/SelectNotFoundContent";

describe("SelectNotFoundContent", () => {
  it("renders spin loader when loading is true", () => {
    render(<SelectNotFoundContent loading={true} />);
    expect(screen.getByTestId("select-not-found-loading")).toBeInTheDocument();
    expect(screen.queryByTestId("select-not-found-empty")).not.toBeInTheDocument();
  });

  it("renders accessible empty state when loading is false", () => {
    render(<SelectNotFoundContent loading={false} emptyText="No courses match" />);
    expect(screen.getByTestId("select-not-found-empty")).toBeInTheDocument();
    expect(screen.getByText("No courses match")).toBeInTheDocument();
    expect(screen.queryByTestId("select-not-found-loading")).not.toBeInTheDocument();
  });

  it("uses default empty description if not provided", () => {
    render(<SelectNotFoundContent loading={false} />);
    expect(screen.getByText("No matching records found")).toBeInTheDocument();
  });
});
