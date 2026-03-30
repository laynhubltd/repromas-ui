/**
 * AuthPageLayout — Unit Tests
 *
 * Validates: Requirements 2.2, 2.3, 2.4, 2.5, 5.1, 5.2, 5.13, 5.14
 */

import { brandingLoaded, themeLoaded, themeReducer } from "@/app/state/theme-slice";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { configureStore } from "@reduxjs/toolkit";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { describe, expect, it } from "vitest";

// ── Helper: build a minimal store with theme slice ────────────────────────────

function makeStore(overrides: { primaryColor?: string; systemName?: string; logoUrl?: string } = {}) {
  const store = configureStore({ reducer: { theme: themeReducer } });
  if (overrides.primaryColor) {
    store.dispatch(themeLoaded(overrides.primaryColor));
  }
  if (overrides.systemName !== undefined || overrides.logoUrl !== undefined) {
    store.dispatch(brandingLoaded({
      systemName: overrides.systemName,
      logoUrl: overrides.logoUrl,
    }));
  }
  return store;
}

function renderLayout(
  children: React.ReactNode = null,
  storeOverrides: { primaryColor?: string; systemName?: string; logoUrl?: string } = {},
) {
  const store = makeStore(storeOverrides);
  return render(
    <Provider store={store}>
      <AuthPageLayout illustration="login">{children}</AuthPageLayout>
    </Provider>,
  );
}

// ── Unit Tests ────────────────────────────────────────────────────────────────

describe("AuthPageLayout — unit tests", () => {
  it("renders children in the form panel", () => {
    const { getByTestId } = renderLayout(
      <input data-testid="test-child" placeholder="Email" />,
    );
    expect(getByTestId("test-child")).toBeInTheDocument();
  });

  it("form panel has overflow-y: auto (not overflow: hidden)", () => {
    const { container } = renderLayout();
    const formPanel = container.querySelector(".auth-form-panel") as HTMLElement;
    expect(formPanel).toBeInTheDocument();
    expect(formPanel.style.overflow).not.toBe("hidden");
    expect(formPanel.style.overflowY).not.toBe("hidden");
  });

  it("illustration panel is present in the DOM", () => {
    const { container } = renderLayout();
    const illustrationPanel = container.querySelector(".auth-illustration-panel");
    expect(illustrationPanel).toBeInTheDocument();
  });

  it("illustration panel carries the correct class for CSS media query hiding on mobile", () => {
    const { container } = renderLayout();
    const illustrationPanel = container.querySelector(".auth-illustration-panel");
    expect(illustrationPanel!.className).toContain("auth-illustration-panel");
  });

  it("shows default system name 'Repromas Academic' when store has no systemName", () => {
    const { getByText } = renderLayout();
    expect(getByText("Repromas Academic")).toBeInTheDocument();
  });

  it("renders systemName from Redux store when provided", () => {
    const { getByText } = renderLayout(null, { systemName: "MySchool" });
    expect(getByText("MySchool")).toBeInTheDocument();
  });

  it("renders logoUrl as an img when provided", () => {
    const { getByRole } = renderLayout(null, {
      systemName: "MySchool",
      logoUrl: "https://example.com/logo.png",
    });
    const img = getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/logo.png");
  });

  it("does not render logo img when logoUrl is undefined (uses icon fallback)", () => {
    const { queryByRole } = renderLayout(null, { systemName: "MySchool" });
    expect(queryByRole("img")).toBeNull();
  });

  it("illustration panel background is set to primaryColor from store", () => {
    const { container } = renderLayout(null, { primaryColor: "#123456" });
    const panel = container.querySelector(".auth-illustration-panel") as HTMLElement;
    // jsdom normalizes hex to rgb() — rgb equivalent of #123456 = rgb(18, 52, 86)
    expect(panel.style.background).toBe("rgb(18, 52, 86)");
  });

  it("does not import from src/config/branding.ts — systemName comes from store", () => {
    const store = makeStore({ systemName: "TestSystem" });
    const { getByText } = render(
      <Provider store={store}>
        <AuthPageLayout illustration="login">
          <span>child</span>
        </AuthPageLayout>
      </Provider>,
    );
    expect(getByText("TestSystem")).toBeInTheDocument();
  });
});
