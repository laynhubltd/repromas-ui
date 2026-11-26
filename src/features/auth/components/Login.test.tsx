import { brandingLoaded, themeReducer } from "@/app/state/theme-slice";
import { getAdmissionTourStorageKey } from "@/features/auth/candidate-signup/utils/admissionTourStorage";
import { configureStore } from "@reduxjs/toolkit";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Login from "./Login";

const mockLoginMutate = vi.fn();
const mockUseGetAdmissionSignupConfigQuery = vi.fn();

vi.mock("@/features/auth/api/auth-api", () => ({
  useLoginMutation: () => [
    mockLoginMutate,
    { isLoading: false, isError: false, error: undefined },
  ],
}));

vi.mock("@/features/auth/candidate-signup/api/candidateSignupApi", () => ({
  useGetAdmissionSignupConfigQuery: () =>
    mockUseGetAdmissionSignupConfigQuery(),
}));

const openConfig = {
  cycleId: 42,
  name: "2025/2026 Admission",
  status: "APPLICATION_OPEN",
  entryModes: [
    { entryMode: "UTME", identityMode: "JAMB" },
    { entryMode: "DIRECT_ENTRY", identityMode: "JAMB" },
    { entryMode: "TRANSFER", identityMode: "OPEN" },
  ],
  batchNo: 1,
  startDate: "2026-06-01T12:00:00Z",
  endDate: "2026-08-31T12:00:00Z",
};

function makeMemoryStorage(): Storage {
  let data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => {
      data = new Map();
    },
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, String(value));
    },
    removeItem: (key: string) => {
      data.delete(key);
    },
    key: (index: number) => [...data.keys()][index] ?? null,
  };
}

function setViewportMatch(isDesktopOrTablet: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: query.includes("min-width: 768px") ? isDesktopOrTablet : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: () => false,
    }),
  });
}

function renderLogin() {
  const store = configureStore({ reducer: { theme: themeReducer } });
  store.dispatch(brandingLoaded({ tenantName: "fpb" }));
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </Provider>,
  );
}

describe("Login admissions editorial & process tour", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("localStorage", makeMemoryStorage());
    vi.stubGlobal("sessionStorage", makeMemoryStorage());
    setViewportMatch(true);
    mockLoginMutate.mockReset();
    mockUseGetAdmissionSignupConfigQuery.mockReturnValue({
      data: openConfig,
      isLoading: false,
      isFetching: false,
    });
    if (!globalThis.ResizeObserver) {
      globalThis.ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
      };
    }
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("renders bottom editorial panel and auto-opens Tour after 400ms on desktop/tablet", () => {
    const { container } = renderLogin();

    const bottomPanel = container.querySelector(
      ".auth-illustration-panel__bottom",
    );
    expect(bottomPanel).toBeInTheDocument();
    expect(bottomPanel).toHaveTextContent("2025/2026 Admissions are open.");
    expect(bottomPanel).toHaveTextContent(
      "Prospective UTME, Direct Entry, and Transfer candidates can register and complete their applications online before August 31, 2026.",
    );

    expect(
      screen.queryByText("How to apply (3 quick steps)"),
    ).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(450);
    });

    expect(screen.getByText("How to apply (3 quick steps)")).toBeInTheDocument();
    expect(
      screen.getByText("Select entry mode & verify details"),
    ).toBeInTheDocument();
    expect(screen.getByText("Create candidate account")).toBeInTheDocument();
    expect(
      screen.getByText("Complete & submit application"),
    ).toBeInTheDocument();
  });

  it("cancels pending auto-open when focusing Email during initial 400ms", () => {
    renderLogin();

    fireEvent.focus(screen.getByPlaceholderText("Email address"));
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(
      screen.queryByText("How to apply (3 quick steps)"),
    ).not.toBeInTheDocument();
    expect(
      window.localStorage.getItem(getAdmissionTourStorageKey(42)),
    ).toBe("1");
  });

  it("dismisses open Tour on Email focus and allows re-opening via How to apply", () => {
    renderLogin();

    act(() => {
      vi.advanceTimersByTime(450);
    });
    expect(screen.getByText("How to apply (3 quick steps)")).toBeInTheDocument();

    fireEvent.focus(screen.getByPlaceholderText("Email address"));
    expect(
      screen.queryByText("How to apply (3 quick steps)"),
    ).not.toBeInTheDocument();
    expect(
      window.localStorage.getItem(getAdmissionTourStorageKey(42)),
    ).toBe("1");

    const triggers = screen.getAllByRole("button", { name: "How to apply" });
    fireEvent.click(triggers[triggers.length - 1]!);
    expect(screen.getByText("How to apply (3 quick steps)")).toBeInTheDocument();
  });

  it("does not mount Tour on mobile (<768px) and renders original below-form notice + Candidate sign-up button", () => {
    setViewportMatch(false);
    renderLogin();

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(
      screen.queryByText("How to apply (3 quick steps)"),
    ).not.toBeInTheDocument();

    expect(screen.getByRole("note")).toHaveTextContent(
      "Prospective UTME, Direct Entry, and Transfer candidates can register and complete their applications online before August 31, 2026.",
    );
    expect(
      screen.getByRole("button", { name: "Candidate sign-up" }),
    ).toBeInTheDocument();
  });

  it("hides editorial panel, tour, and mobile banner when admissions are closed", () => {
    mockUseGetAdmissionSignupConfigQuery.mockReturnValue({
      data: { ...openConfig, status: "CLOSED", entryModes: [] },
      isLoading: false,
      isFetching: false,
    });

    const { container } = renderLogin();
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(
      container.querySelector(".auth-illustration-panel__bottom"),
    ).toBeNull();
    expect(
      screen.queryByText("How to apply (3 quick steps)"),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Candidate sign-up" })).toBeNull();
  });
});
