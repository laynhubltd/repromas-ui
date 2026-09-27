import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TruncationNotice } from "../shared/ui/TruncationNotice";

describe("TruncationNotice", () => {
  it("renders warning message when totalItems > currentCount", () => {
    render(<TruncationNotice totalItems={145} currentCount={100} />);
    expect(screen.getByTestId("truncation-notice")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Showing first 100 of 145 records\. Narrow your search or filters to locate unlisted records\./,
      ),
    ).toBeInTheDocument();
  });

  it("renders custom message when provided and truncated", () => {
    render(
      <TruncationNotice
        totalItems={50}
        currentCount={30}
        customMessage="Only showing 30 of 50."
      />,
    );
    expect(screen.getByText("Only showing 30 of 50.")).toBeInTheDocument();
  });

  it("returns null when totalItems <= currentCount", () => {
    const { container } = render(
      <TruncationNotice totalItems={20} currentCount={20} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("returns null when totalItems < currentCount", () => {
    const { container } = render(
      <TruncationNotice totalItems={5} currentCount={10} />,
    );
    expect(container.firstChild).toBeNull();
  });
});
