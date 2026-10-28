import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { render, screen, within } from "@testing-library/react";
import type { ReactElement } from "react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import themeReducer from "@/app/state/theme-slice";
import { getOnboardingRouteEntries } from "@/app/routing/module-routes/onboarding";
import { HOME_MODULE_LANES } from "@/features/onboarding-home/utils/home-content";
import { PricingPage } from "@/features/onboarding-pricing";
import { PLATFORM_CATEGORIES } from "@/features/onboarding-platform/utils/platform-content";

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

/** Renders one page directly, for pages that are built but not routed (e.g. Pricing while it is hidden). */
function renderPage(page: ReactElement) {
  const store = configureStore({ reducer: combineReducers({ theme: themeReducer }) });
  return render(
    <Provider store={store}>
      <MemoryRouter>{page}</MemoryRouter>
    </Provider>,
  );
}

describe("marketing shell", () => {
  it("renders the main navigation and conversion buttons", () => {
    renderApex("/");
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(within(nav).queryByRole("link", { name: "Pricing" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Book a Demo" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "Talk to an Advisor" }).length).toBeGreaterThan(0);
  });

  it("opens the institution sign-in modal", async () => {
    const user = userEvent.setup();
    renderApex("/");
    await user.click(screen.getByRole("button", { name: /^Sign in$/ }));
    expect(await screen.findByText("Sign in to your institution", { selector: ".ant-modal-title" })).toBeInTheDocument();
  });
});

describe("home page", () => {
  it("renders the hero, all module tiles and no empty proof sections", () => {
    renderApex("/");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("One System to Run Your Institution's Academic Record");
    expect(screen.getAllByTestId("module-tile")).toHaveLength(17);
    expect(screen.queryByText("Trusted by Institutions Across Nigeria")).not.toBeInTheDocument();
    expect(screen.queryByText("What Our Institutions Say")).not.toBeInTheDocument();
    expect(screen.queryByText("Guides for Registries")).not.toBeInTheDocument();
  });

  it("groups the module tiles into lifecycle lanes that link to their platform sections", () => {
    renderApex("/");
    const lanes = screen.getAllByTestId("module-lane");
    expect(lanes.map((lane) => within(lane).getByRole("heading", { level: 3 }).textContent)).toEqual([
      "Admissions",
      "Bursary",
      "Academics",
      "Results & Governance",
    ]);
    expect(within(lanes[1]).getByRole("link", { name: "Online Payments" })).toHaveAttribute("href", "/platform#pf-bursary");
    expect(screen.getByRole("link", { name: "Student Portal" })).toHaveAttribute("href", "/platform#pf-people");
    expect(screen.getByRole("link", { name: "View all 31 modules" })).toHaveAttribute("href", "/platform");
  });

  it("keeps each lane's feature count and link in step with the platform categories", () => {
    for (const lane of HOME_MODULE_LANES) {
      const category = PLATFORM_CATEGORIES.find((item) => lane.href === `/platform#${item.id}`);
      expect(category, lane.title).toBeDefined();
      expect(category?.features).toHaveLength(lane.featureCount);
    }
  });
});

describe("platform page", () => {
  it("lists every category with its feature count", () => {
    renderApex("/platform");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("The Complete Academic Records Platform");
    expect(screen.getAllByTestId("platform-feature")).toHaveLength(38);
    expect(screen.getByRole("heading", { level: 2, name: "Bursary" })).toBeInTheDocument();
    expect(screen.getByText("6 features")).toBeInTheDocument();
    expect(screen.getByText("Rolling out 2026/27")).toBeInTheDocument();
  });

  it("redirects the old /services route", () => {
    renderApex("/services");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("The Complete Academic Records Platform");
  });
});

describe("pricing while it is hidden", () => {
  it("links nowhere to the pricing page and sends state systems to a quotation request", () => {
    renderApex("/");

    expect(screen.queryByRole("link", { name: "Pricing" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "State systems" })).toHaveAttribute("href", "/contact?topic=pricing");
    expect(screen.getByText("Pricing Agreed With You")).toBeInTheDocument();
    expect(screen.queryByText(/Not Per Student/)).not.toBeInTheDocument();
  });
});

/** The page stays built and tested so it can be published again with VITE_SHOW_PRICING=true. */
describe("pricing page", () => {
  it("updates the quote as options change", async () => {
    const user = userEvent.setup();
    renderPage(<PricingPage />);

    expect(screen.getByTestId("quote-total")).toHaveTextContent("₦1,200,000");
    expect(screen.getAllByText(/Draft pricing for review/i)).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: /University/ }));
    expect(screen.getByTestId("quote-total")).toHaveTextContent("₦2,400,000");

    await user.click(screen.getByRole("button", { name: "3 sessions" }));
    expect(screen.getByTestId("quote-total")).toHaveTextContent("₦6,000,000");

    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: /Partnership/ }));
    expect(screen.getByTestId("quote-total")).toHaveTextContent("₦0");
    expect(screen.queryByText("Commit to 3 sessions")).not.toBeInTheDocument();
  });

  it("charges on-site onboarding once", async () => {
    const user = userEvent.setup();
    renderPage(<PricingPage />);
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: /On-site/ }));
    await user.click(screen.getByRole("button", { name: "More training days" }));
    expect(screen.getByTestId("quote-one-time")).toHaveTextContent("₦600,000");
  });
});
