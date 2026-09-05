import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  it("renders active/enrolled status tags", () => {
    render(<StatusBadge status="Active Enrollment" />);
    expect(screen.getByText("Active Enrollment")).toBeInTheDocument();
  });

  it("renders graduated status tags", () => {
    render(<StatusBadge status="Graduated" />);
    expect(screen.getByText("Graduated")).toBeInTheDocument();
  });

  it("renders warning/suspension status tags", () => {
    render(<StatusBadge status="Suspended" />);
    expect(screen.getByText("Suspended")).toBeInTheDocument();
  });

  it("renders error/withdrawn status tags", () => {
    render(<StatusBadge status="Withdrawn" />);
    expect(screen.getByText("Withdrawn")).toBeInTheDocument();
  });

  it("renders unknown for empty status", () => {
    render(<StatusBadge status="" />);
    expect(screen.getByText("Unknown")).toBeInTheDocument();
  });
});
