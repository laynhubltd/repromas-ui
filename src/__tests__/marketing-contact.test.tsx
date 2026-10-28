import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter, Routes } from "react-router-dom";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { isEndpointAllowedOnCurrentHost } from "@/app/api/apex-endpoint-whitelist";
import themeReducer from "@/app/state/theme-slice";
import { getOnboardingRouteEntries } from "@/app/routing/module-routes/onboarding";
import { isValidContactPhone } from "@/features/onboarding-contact/utils/validators";
import { CONTACT_EMAIL } from "@/shared/constants/marketingLinks";

const mockUnwrap = vi.fn();
const mockSubmit = vi.fn(() => ({ unwrap: mockUnwrap }));
const mockHandleApiError = vi.fn();

vi.mock("@/features/onboarding-contact/api/contact-api", () => ({
  useSubmitContactRequestMutation: () => [mockSubmit, { isLoading: false }],
}));
vi.mock("@/shared/hooks/useApiError", () => ({ useApiError: () => mockHandleApiError }));

function renderContact(path = "/contact") {
  const store = configureStore({ reducer: combineReducers({ theme: themeReducer }) });
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>{getOnboardingRouteEntries()}</Routes>
      </MemoryRouter>
    </Provider>,
  );
}

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Full name"), "  Amina Okafor ");
  await user.type(screen.getByLabelText("Work email"), "amina@futb.edu.ng");
  await user.type(screen.getByLabelText("Institution"), "Federal Polytechnic Bali");
  await user.click(screen.getByRole("combobox", { name: "Type of institution" }));
  await user.click(await screen.findByTitle("Polytechnic"));
  await user.click(screen.getByRole("combobox", { name: "Your role" }));
  await user.click(await screen.findByTitle("Registrar"));
}

describe("contact page", () => {
  beforeAll(() => {
    // antd's auto-sizing textarea needs it; jsdom doesn't provide one.
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  beforeEach(() => {
    mockSubmit.mockClear();
    mockUnwrap.mockReset();
    mockHandleApiError.mockReset();
  });

  it("opens as a demo request with the reassurance panel beside the form", () => {
    renderContact();

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Let's Talk About Your Institution's Records");
    expect(screen.getByRole("radio", { name: "Book a demo" })).toBeChecked();
    expect(screen.getByRole("button", { name: "Book my demo" })).toBeInTheDocument();
    expect(screen.getByLabelText("Work email")).toHaveAttribute("autocomplete", "email");
    expect(screen.getByLabelText(/^Phone or WhatsApp/)).toHaveAttribute("type", "tel");
    expect(screen.getByText("Phone or WhatsApp").closest("label")).toHaveTextContent("(optional)");
    expect(screen.getByRole("link", { name: CONTACT_EMAIL })).toHaveAttribute("href", `mailto:${CONTACT_EMAIL}`);
    expect(within(screen.getByRole("complementary")).getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByRole("link", { name: "Read our privacy notice" })).toHaveAttribute("href", "/privacy");
  });

  it("sends /pricing to the contact form while the pricing page is hidden", () => {
    renderContact("/pricing");

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Let's Talk About Your Institution's Records");
    expect(screen.getByRole("radio", { name: "Pricing & quotation" })).toBeChecked();
  });

  it("pre-selects pricing when opened from a quotation button", () => {
    renderContact("/contact?topic=pricing");

    expect(screen.getByRole("radio", { name: "Pricing & quotation" })).toBeChecked();
    expect(screen.getByRole("button", { name: "Send message" })).toBeInTheDocument();
  });

  it("explains every missing required field and sends nothing", async () => {
    const user = userEvent.setup();
    renderContact();

    await user.click(screen.getByRole("button", { name: "Book my demo" }));

    expect(await screen.findByText("Enter your full name.")).toBeInTheDocument();
    expect(screen.getByText("Enter your work email address.")).toBeInTheDocument();
    expect(screen.getByText("Enter the name of your institution.")).toBeInTheDocument();
    expect(screen.getByText("Choose your type of institution.")).toBeInTheDocument();
    expect(screen.getByText("Choose your role.")).toBeInTheDocument();
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("sends a clean payload and replaces the form with a confirmation", async () => {
    mockUnwrap.mockResolvedValue({ reference: "RPM-261028-4F9A2C", receivedAt: "2026-10-28T16:42:00+01:00" });
    const user = userEvent.setup();
    renderContact();

    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: "Book my demo" }));

    await waitFor(() => expect(mockSubmit).toHaveBeenCalledTimes(1));
    expect(mockSubmit).toHaveBeenCalledWith({
      topic: "demo",
      fullName: "Amina Okafor",
      email: "amina@futb.edu.ng",
      phone: null,
      institution: "Federal Polytechnic Bali",
      institutionType: "polytechnic",
      role: "registrar",
      studentPopulation: null,
      message: null,
      sourcePage: "/contact",
      website: null,
    });

    const success = await screen.findByTestId("contact-success");
    expect(success).toHaveTextContent("Thank you, we've got your message, Amina");
    expect(success).toHaveTextContent("RPM-261028-4F9A2C");
    expect(success).toHaveFocus();
    expect(screen.queryByRole("button", { name: "Book my demo" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Send another message" }));
    expect(screen.getByLabelText("Full name")).toHaveValue("");
  }, 20_000);

  it("hands a failed request to the shared error pipeline and keeps the form", async () => {
    const failure = { status: 400, data: { type: "/errors/validation" } };
    mockUnwrap.mockRejectedValue(failure);
    const user = userEvent.setup();
    renderContact();

    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: "Book my demo" }));

    await waitFor(() => expect(mockHandleApiError).toHaveBeenCalledTimes(1));
    expect(mockHandleApiError).toHaveBeenCalledWith(
      failure,
      expect.objectContaining({ context: { screen: "form", method: "POST" } }),
    );
    expect(screen.queryByTestId("contact-success")).not.toBeInTheDocument();
  }, 20_000);
});

describe("contact form rules", () => {
  it.each([
    ["0803 123 4567", true],
    ["+234 803-123-4567", true],
    ["2347031234567", true],
    ["+44 20 7946 0958", true],
    ["12345", false],
    ["0603 123 4567", false],
  ])("treats %s as valid: %s", (phone, expected) => {
    expect(isValidContactPhone(phone)).toBe(expected);
  });

  it("allows the contact endpoint on the apex host", () => {
    expect(isEndpointAllowedOnCurrentHost("/contact-requests")).toBe(true);
  });
});
