import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Provider } from "react-redux";
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { PageSEO } from "@/shared/ui/PageSEO";
import themeReducer from "@/app/state/theme-slice";

function renderWithStore(
  ui: React.ReactElement,
  themeOverrides: Partial<{
    tenantName?: string;
    schoolName?: string;
    systemName?: string;
  }> = {}
) {
  const store = configureStore({
    reducer: combineReducers({
      theme: themeReducer,
    }),
    preloadedState: {
      theme: {
        primaryColor: "transparent",
        systemName: themeOverrides.systemName,
        schoolName: themeOverrides.schoolName,
        tagline: undefined,
        logoUrl: undefined,
        tenantName: themeOverrides.tenantName,
      },
    },
  });

  return render(<Provider store={store}>{ui}</Provider>);
}

describe("PageSEO Component", () => {
  it("renders page title and sets document.title", () => {
    renderWithStore(<PageSEO title="Candidate Portal" />);
    expect(document.title).toContain("Candidate Portal");
    expect(document.title).toContain("REPROMAS");
  });

  it("formats title with tenant school name when available", () => {
    renderWithStore(<PageSEO title="Admissions" />, {
      tenantName: "Federal University of Technology Babura",
    });

    expect(document.title).toContain("Admissions");
    expect(document.title).toContain("REPROMAS");
  });

  it("sets custom title without suffix when includeTenantSuffix is false", () => {
    renderWithStore(
      <PageSEO title="Custom Standalone Title" includeTenantSuffix={false} />
    );

    expect(document.title).toBe("Custom Standalone Title");
  });
});
