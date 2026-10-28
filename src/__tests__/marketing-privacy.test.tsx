import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { render, screen, within } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import themeReducer from "@/app/state/theme-slice";
import { getOnboardingRouteEntries } from "@/app/routing/module-routes/onboarding";
import { PRIVACY_SECTIONS } from "@/features/onboarding-privacy";
import { PRIVACY_NOTICE_STATUS } from "@/features/onboarding-privacy/utils/privacy-content";
import { CONTACT_EMAIL } from "@/shared/constants/marketingLinks";

function renderApex(path: string) {
  const store = configureStore({ reducer: combineReducers({ theme: themeReducer }) });
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>{getOnboardingRouteEntries()}</Routes>
      </MemoryRouter>
    </Provider>,
  );
}

describe("privacy notice page", () => {
  it("shows the notice with its date, its review status and a contents list for every section", () => {
    renderApex("/privacy");

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Privacy Notice");
    expect(screen.getByText("28 October 2026")).toHaveAttribute("dateTime", "2026-10-28");
    if (PRIVACY_NOTICE_STATUS === "draft") {
      expect(screen.getByRole("note")).toHaveTextContent("Draft for legal review");
    } else {
      expect(screen.queryByRole("note")).not.toBeInTheDocument();
    }

    const contents = screen.getByRole("navigation", { name: "On this page" });
    expect(within(contents).getAllByRole("link")).toHaveLength(PRIVACY_SECTIONS.length);
    expect(within(contents).getByRole("link", { name: "8. Your rights" })).toHaveAttribute("href", "#your-rights");
  });

  it("covers every disclosure section 27 of the NDPA 2023 requires before collecting data", () => {
    renderApex("/privacy");

    // (a) identity and contact, (b) lawful basis and purpose, (c) recipients, (d) rights,
    // (e) retention, (f) complaint to the Commission, (g) automated decision-making
    const required = ["who-we-are", "how-we-use", "sharing", "your-rights", "retention", "complaints", "automated-decisions"];
    for (const id of required) {
      expect(document.getElementById(id), id).not.toBeNull();
    }
    expect(screen.getByRole("link", { name: "Nigeria Data Protection Commission" })).toHaveAttribute(
      "href",
      "https://ndpc.gov.ng",
    );
    expect(screen.getAllByRole("link", { name: CONTACT_EMAIL })[0]).toHaveAttribute("href", `mailto:${CONTACT_EMAIL}`);
  });

  it("lays data out in labelled tables", () => {
    renderApex("/privacy");

    const retention = screen.getByRole("table", { name: "How long each kind of data is kept" });
    expect(within(retention).getByRole("rowheader", { name: "IP addresses used to limit repeated submissions" })).toBeInTheDocument();
  });

  it("is linked from the site footer", () => {
    renderApex("/privacy");

    expect(screen.getByRole("link", { name: "Privacy notice" })).toHaveAttribute("href", "/privacy");
  });
});
