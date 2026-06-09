import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useForgotPassword } from "./useForgotPassword";

const mockUnwrap = vi.fn();
const mockForgotPassword = vi.fn(() => ({ unwrap: mockUnwrap }));

vi.mock("@/features/auth/api/auth-api", () => ({
  useForgotPasswordMutation: () => [mockForgotPassword, { isLoading: false }],
}));

vi.mock("@/shared/hooks/useApiError", () => ({
  useApiError: () => vi.fn(),
}));

describe("useForgotPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("enters success phase on 200 without exposing reset_link", async () => {
    mockUnwrap.mockResolvedValue({
      email: "user@example.com",
      message: "Password reset link generated.",
      reset_link: "https://futb.localhost/auth/reset-password/secret-token",
      mail_sent: true,
    });

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.actions.handleSubmit({ email: "user@example.com" });
    });

    expect(result.current.flags.isSuccess).toBe(true);
    expect(result.current.state.submittedEmail).toBe("user@example.com");
    expect(result.current.state).not.toHaveProperty("reset_link");
    expect(result.current.state).not.toHaveProperty("response");
  });
});
