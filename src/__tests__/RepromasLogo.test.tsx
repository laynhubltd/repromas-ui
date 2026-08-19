import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Provider } from "react-redux";
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { RepromasLogo } from "@/components/layout/RepromasLogo";
import themeReducer from "@/app/state/theme-slice";
import { authReducer } from "@/features/auth/state/auth-slice";
import type { RoleEntity } from "@/features/auth/types";

function renderWithStore(
  ui: React.ReactElement,
  options: {
    themeOverrides?: Partial<{
      logoUrl?: string;
      tenantName?: string;
      schoolName?: string;
      systemName?: string;
    }>;
    authOverrides?: {
      scope?: "GLOBAL" | "DEPARTMENT" | "FACULTY" | "PROGRAM" | "STUDENT" | "CANDIDATE";
      entity?: RoleEntity;
    };
  } = {}
) {
  const store = configureStore({
    reducer: combineReducers({
      theme: themeReducer,
      auth: authReducer,
    }),
    preloadedState: {
      theme: {
        primaryColor: "transparent",
        systemName: options.themeOverrides?.systemName,
        schoolName: options.themeOverrides?.schoolName,
        tagline: undefined,
        logoUrl: options.themeOverrides?.logoUrl,
        tenantName: options.themeOverrides?.tenantName,
      },
      auth: {
        userProfile: null,
        token: null,
        refreshToken: null,
        isAuthenticated: true,
        profiles: [],
        currentRole: null,
        currentProfileId: null,
        bootstrapComplete: true,
        roles: [],
        permissions: [],
        activeRole: options.authOverrides?.scope
          ? {
              name: options.authOverrides.scope,
              scope: options.authOverrides.scope,
              scopeReferenceId: 1,
              entity: options.authOverrides.entity ?? null,
            }
          : null,
        roleSwitcherOpen: false,
        tenantId: 1,
        entity: options.authOverrides?.entity ?? null,
      },
    },
  });

  return render(<Provider store={store}>{ui}</Provider>);
}

describe("RepromasLogo Component (Scope Department / Admin Default)", () => {
  it("renders 'Admin' subtitle when active role scope is GLOBAL", () => {
    renderWithStore(<RepromasLogo customSlug="futb" />, {
      authOverrides: { scope: "GLOBAL", entity: null },
    });

    expect(screen.getByTestId("repromas-logo-slug-title")).toHaveTextContent("FUTB");
    expect(screen.getByTestId("repromas-logo-scope-subtitle")).toHaveTextContent("Admin");
  });

  it("renders Department name when active role scope is DEPARTMENT", () => {
    renderWithStore(<RepromasLogo customSlug="futb" />, {
      authOverrides: {
        scope: "DEPARTMENT",
        entity: {
          id: 10,
          facultyId: 1,
          name: "Computer Science",
          code: "CSC",
          createdAt: "",
          updatedAt: "",
          faculty: { id: 1, name: "Science", code: "SCI", createdAt: "", updatedAt: "" },
        } as unknown as RoleEntity,
      },
    });

    expect(screen.getByTestId("repromas-logo-slug-title")).toHaveTextContent("FUTB");
    expect(screen.getByTestId("repromas-logo-scope-subtitle")).toHaveTextContent("Computer Science");
  });

  it("renders Department name when active role scope is PROGRAM", () => {
    renderWithStore(<RepromasLogo customSlug="futb" />, {
      authOverrides: {
        scope: "PROGRAM",
        entity: {
          id: 20,
          departmentId: 10,
          name: "B.Sc Computer Science",
          code: "BSC-CSC",
          createdAt: "",
          updatedAt: "",
          department: {
            id: 10,
            facultyId: 1,
            name: "Information Technology",
            code: "IT",
            createdAt: "",
            updatedAt: "",
            faculty: { id: 1, name: "Computing", code: "COMP", createdAt: "", updatedAt: "" },
          },
        } as unknown as RoleEntity,
      },
    });

    expect(screen.getByTestId("repromas-logo-scope-subtitle")).toHaveTextContent("Information Technology");
  });

  it("falls back to SVG mark when custom logo image errors on load", () => {
    renderWithStore(<RepromasLogo customLogoUrl="https://example.com/broken.png" />);

    const img = screen.getByTestId("repromas-logo-img");
    fireEvent.error(img);

    const svgMark = screen.getByTestId("repromas-logo-svg");
    expect(svgMark).toBeInTheDocument();
  });

  it("renders collapsed logo mark when collapsed is true", () => {
    renderWithStore(<RepromasLogo collapsed />);

    const logoWrapper = screen.getByTestId("repromas-logo");
    expect(logoWrapper).toHaveClass("repromas-logo--collapsed");
    expect(screen.getByTestId("repromas-logo-svg")).toBeInTheDocument();
  });
});
