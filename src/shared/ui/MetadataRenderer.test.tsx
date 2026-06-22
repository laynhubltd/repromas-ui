import { MetadataRenderer } from "@/shared/ui/MetadataRenderer";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

describe("MetadataRenderer", () => {
  it("renders empty state for null metadata", () => {
    render(<MetadataRenderer value={null} title="Metadata" />);
    expect(screen.getByText("No metadata available.")).toBeInTheDocument();
  });

  it("renders object keys in structured descriptions mode", () => {
    render(
      <MetadataRenderer
        value={{
          entry_mode: "UTME",
          certificate_exam_jamb: true,
        }}
        title="Metadata"
        showRawToggle={false}
      />,
    );

    expect(screen.getByText("Entry Mode")).toBeInTheDocument();
    expect(screen.getByText("UTME")).toBeInTheDocument();
    expect(screen.getByText("Certificate Exam Jamb")).toBeInTheDocument();
    expect(screen.getByText("Yes")).toBeInTheDocument();
  });

  it("renders primitive arrays as tags", () => {
    render(
      <MetadataRenderer
        value={["UTME", "DE"]}
        showRawToggle={false}
      />,
    );

    expect(screen.getByText("UTME")).toBeInTheDocument();
    expect(screen.getByText("DE")).toBeInTheDocument();
  });

  it("shows raw JSON when toggled", async () => {
    const user = userEvent.setup();
    render(
      <MetadataRenderer
        value={{ source: "manual" }}
        title="Metadata"
      />,
    );

    await user.click(screen.getByText("Raw JSON"));
    expect(screen.getByText(/"source": "manual"/)).toBeInTheDocument();
  });

  it("copies raw JSON to clipboard", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", {
      ...navigator,
      clipboard: { writeText },
    });

    render(<MetadataRenderer value={{ copied: true }} title="Metadata" />);

    await user.click(screen.getByText("Raw JSON"));
    await user.click(screen.getByText("Copy JSON"));
    expect(writeText).toHaveBeenCalledWith(JSON.stringify({ copied: true }, null, 2));

    vi.unstubAllGlobals();
  });
});
