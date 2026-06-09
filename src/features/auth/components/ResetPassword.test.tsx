import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Form } from "antd";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import ResetPassword from "./ResetPassword";

const mockHandleSubmit = vi.fn();
const mockHandleRequestNewLink = vi.fn();

vi.mock("../hooks/useResetPassword", () => ({
  useResetPassword: vi.fn(),
}));

vi.mock("@/components/auth/AuthPageLayout", () => ({
  AuthPageLayout: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

import { useResetPassword } from "../hooks/useResetPassword";

const mockedUseResetPassword = vi.mocked(useResetPassword);

function renderWithHook(flags: {
  isLoading?: boolean;
  tokenMissing?: boolean;
  submitSucceeded?: boolean;
  submitDisabled?: boolean;
  sectionError?: string | null;
}) {
  function Wrapper() {
    const [form] = Form.useForm();
    mockedUseResetPassword.mockReturnValue({
      state: {
        form,
        sectionError: flags.sectionError ?? null,
      },
      actions: {
        handleSubmit: mockHandleSubmit,
        handleRequestNewLink: mockHandleRequestNewLink,
      },
      flags: {
        isLoading: flags.isLoading ?? false,
        tokenMissing: flags.tokenMissing ?? false,
        submitSucceeded: flags.submitSucceeded ?? false,
        submitDisabled: flags.submitDisabled ?? false,
      },
    });
    return <ResetPassword />;
  }

  return render(
    <MemoryRouter>
      <Wrapper />
    </MemoryRouter>,
  );
}

describe("ResetPassword", () => {
  it("renders password form when token is present", () => {
    renderWithHook({ tokenMissing: false });
    expect(screen.getByText("Set a new password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("New password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reset password" }),
    ).toBeInTheDocument();
  });

  it("renders request new link when token is missing", async () => {
    renderWithHook({ tokenMissing: true, submitDisabled: true });
    expect(screen.getByText("Invalid reset link")).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Request a new link" }));
    expect(mockHandleRequestNewLink).toHaveBeenCalled();
  });
});
