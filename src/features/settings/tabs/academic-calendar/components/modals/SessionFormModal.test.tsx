import { render, screen } from "@testing-library/react";
import { Form } from "antd";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { SessionFormModal } from "./SessionFormModal";

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
  };
});

const mockUseSessionFormModal = vi.fn();

vi.mock("../../hooks/useSessionModal", () => ({
  useSessionFormModal: (...args: unknown[]) => mockUseSessionFormModal(...args),
}));

function CreateContainer() {
  const [form] = Form.useForm();
  mockUseSessionFormModal.mockReturnValue({
    state: { isLoading: false, isEditMode: false },
    actions: {
      handleSubmit: vi.fn(),
      handleCancel: vi.fn(),
    },
    form,
  });

  return <SessionFormModal open={true} target={null} onClose={vi.fn()} />;
}

function EditContainer() {
  const [form] = Form.useForm();
  mockUseSessionFormModal.mockReturnValue({
    state: { isLoading: false, isEditMode: true },
    actions: {
      handleSubmit: vi.fn(),
      handleCancel: vi.fn(),
    },
    form,
  });

  return (
    <SessionFormModal
      open={true}
      target={{
        id: 1,
        name: "2025/2026",
        rankOrder: 4,
        startDate: null,
        endDate: null,
        isCurrent: true,
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01",
        semesters: null,
      }}
      onClose={vi.fn()}
    />
  );
}

describe("SessionFormModal", () => {
  it("renders create modal with Rank / Order field", () => {
    render(<CreateContainer />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getAllByText("Create Session").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Rank / Order")).toBeInTheDocument();
    expect(
      screen.getByText("Optional: leave blank to auto-assign the next sequence number."),
    ).toBeInTheDocument();
  });

  it("renders edit modal with Rank / Order field", () => {
    render(<EditContainer />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getAllByText("Edit Session").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText(/Rank \/ Order/)).toBeInTheDocument();
  });
});
