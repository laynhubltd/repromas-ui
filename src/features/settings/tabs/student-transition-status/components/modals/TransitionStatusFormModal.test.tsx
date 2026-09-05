import { render, screen } from "@testing-library/react";
import { Form } from "antd";
import React from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { TransitionStatusFormModal } from "./TransitionStatusFormModal";

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const mockUseTransitionStatusFormModal = vi.fn();

vi.mock("@/features/access-control", () => ({
  PermissionGuard: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock("../../hooks/useTransitionStatusModal", () => ({
  useTransitionStatusFormModal: (...args: unknown[]) =>
    mockUseTransitionStatusFormModal(...args),
}));

function FormModalTestWrapper({
  presetNote = null,
  coherenceWarnings = [],
}: {
  presetNote?: string | null;
  coherenceWarnings?: string[];
}) {
  const [form] = Form.useForm();
  mockUseTransitionStatusFormModal.mockReturnValue({
    state: {
      isLoading: false,
      isEditMode: false,
      isInUse: false,
      showCourseRegWarning: false,
      isDefault: false,
      isDefaultSwitchDisabled: false,
      semanticKind: "OTHER",
      managedBy: "BOTH",
      presetNote,
      coherenceWarnings,
    },
    actions: {
      handleSubmit: vi.fn(),
      handleCancel: vi.fn(),
      handleSemanticKindChange: vi.fn(),
      handleManagedByChange: vi.fn(),
      dismissPresetNote: vi.fn(),
      handleCanRegisterCoursesChange: vi.fn(),
      handleIsDefaultChange: vi.fn(),
      setIsInUse: vi.fn(),
    },
    form,
  });

  return (
    <TransitionStatusFormModal
      open
      target={null}
      isInUse={false}
      hasNoDefaultInTenant={false}
      onClose={vi.fn()}
    />
  );
}

describe("TransitionStatusFormModal", () => {
  it("renders Status Type selector as first field and Managed By selector", () => {
    render(<FormModalTestWrapper />);

    expect(
      screen.getByText(/Status Type \(Universal Academic Classification\)/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Managed By/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create Status" }),
    ).toBeInTheDocument();
  });

  it("renders preset banner when presetNote is active", () => {
    render(
      <FormModalTestWrapper
        presetNote="Suggested settings applied for Deferred / Leave — review before saving."
      />,
    );

    expect(
      screen.getByText(
        /Suggested settings applied for Deferred \/ Leave — review before saving\./i,
      ),
    ).toBeInTheDocument();
  });

  it("renders non-blocking coherence warnings when misconfigured", () => {
    render(
      <FormModalTestWrapper
        coherenceWarnings={["Terminal status type on a non-terminal status."]}
      />,
    );

    expect(
      screen.getByText(/Terminal status type on a non-terminal status\./i),
    ).toBeInTheDocument();
  });
});
