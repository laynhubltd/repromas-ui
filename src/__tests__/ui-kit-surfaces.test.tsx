import { Accordion, Card, DashCard, Panel, ResponsiveCollapsibleGrid } from "@/components/ui-kit";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";

function appearsBefore(first: HTMLElement, second: HTMLElement): boolean {
  return Boolean(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING);
}

describe("ui-kit surfaces", () => {
  it("renders Card with header/body/footer slots", () => {
    render(
      <Card header="Surface Header" footer={<span>Surface Footer</span>}>
        <span>Surface Body</span>
      </Card>,
    );

    expect(screen.getByText("Surface Header")).toBeInTheDocument();
    expect(screen.getByText("Surface Body")).toBeInTheDocument();
    expect(screen.getByText("Surface Footer")).toBeInTheDocument();
  });

  it("renders DashCard KPI/title/meta/action pattern", () => {
    render(
      <DashCard
        title="Active Sessions"
        meta="Current authenticated users"
        value={128}
        trend="Up 6% this week"
        actions={<button type="button">View</button>}
      />,
    );

    expect(screen.getByText("Active Sessions")).toBeInTheDocument();
    expect(screen.getByText("Current authenticated users")).toBeInTheDocument();
    expect(screen.getByText("128")).toBeInTheDocument();
    expect(screen.getByText("Up 6% this week")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View" })).toBeInTheDocument();
  });

  it("toggles Panel collapse state when collapsible", async () => {
    const user = userEvent.setup();
    const onCollapseChange = vi.fn();

    render(
      <Panel title="System Health" collapsible onCollapseChange={onCollapseChange}>
        <span>Panel Body Content</span>
      </Panel>,
    );

    const toggleButton = screen.getByRole("button", { name: "Collapse panel section" });
    expect(toggleButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Panel Body Content")).toBeInTheDocument();

    await user.click(toggleButton);

    expect(onCollapseChange).toHaveBeenCalledWith(true);
    expect(toggleButton).toHaveTextContent("Expand");
    expect(toggleButton).toHaveAttribute("aria-expanded", "false");
  });

  it("supports keyboard-safe accordion interaction in single mode", async () => {
    const user = userEvent.setup();

    render(
      <Accordion
        expansionMode="single"
        items={[
          {
            key: "foundation",
            title: "Foundation",
            content: <span>Foundation body</span>,
          },
          {
            key: "behavior",
            title: "Behavior",
            content: <span>Behavior body</span>,
          },
        ]}
      />,
    );

    const foundationToggle = screen.getByRole("tab", { name: /Foundation/i });
    const behaviorToggle = screen.getByRole("tab", { name: /Behavior/i });

    expect(foundationToggle).toHaveAttribute("aria-expanded", "false");
    expect(behaviorToggle).toHaveAttribute("aria-expanded", "false");

    foundationToggle.focus();
    await user.keyboard("{Enter}");
    expect(foundationToggle).toHaveAttribute("aria-expanded", "true");
    expect(foundationToggle).toHaveAttribute("tabindex", "0");

    await user.click(behaviorToggle);
    expect(behaviorToggle).toHaveAttribute("aria-expanded", "true");
    expect(foundationToggle).toHaveAttribute("aria-expanded", "false");
  });

  it("supports multiple expansion mode and emits active keys", async () => {
    const user = userEvent.setup();
    const onActiveKeysChange = vi.fn();

    render(
      <Accordion
        expansionMode="multiple"
        onActiveKeysChange={onActiveKeysChange}
        items={[
          {
            key: "users",
            title: "Users",
            content: <span>Users body</span>,
          },
          {
            key: "roles",
            title: "Roles",
            content: <span>Roles body</span>,
          },
        ]}
      />,
    );

    const usersToggle = screen.getByRole("button", { name: /Users/i });
    const rolesToggle = screen.getByRole("button", { name: /Roles/i });

    await user.click(usersToggle);
    await user.click(rolesToggle);

    expect(usersToggle).toHaveAttribute("aria-expanded", "true");
    expect(rolesToggle).toHaveAttribute("aria-expanded", "true");

    const latestKeys = onActiveKeysChange.mock.calls[onActiveKeysChange.mock.calls.length - 1]?.[0];
    expect(latestKeys).toEqual(expect.arrayContaining(["users", "roles"]));
  });

  it("renders responsive grid content directly when mode is desktop grid", () => {
    render(
      <ResponsiveCollapsibleGrid
        mode="grid"
        sections={[
          {
            key: "modules",
            title: "Modules",
            content: <span>Modules desktop content</span>,
            desktopColProps: { md: 12 },
          },
          {
            key: "sessions",
            title: "Sessions",
            content: <span>Sessions desktop content</span>,
            desktopColProps: { md: 12 },
          },
        ]}
      />,
    );

    expect(screen.getByText("Modules desktop content")).toBeInTheDocument();
    expect(screen.getByText("Sessions desktop content")).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: /Modules/i })).not.toBeInTheDocument();
  });

  it("renders responsive grid as mobile accordion preserving section order", async () => {
    const user = userEvent.setup();
    const onMobileExpandedKeysChange = vi.fn();

    render(
      <ResponsiveCollapsibleGrid
        mode="collapse"
        onMobileExpandedKeysChange={onMobileExpandedKeysChange}
        sections={[
          {
            key: "admissions",
            title: "Admissions",
            subtitle: "Setup and workflows",
            content: <span>Admissions desktop content</span>,
            mobileContent: <span>Admissions mobile content</span>,
          },
          {
            key: "programs",
            title: "Programs",
            subtitle: "Curriculum and publishing",
            content: <span>Programs desktop content</span>,
            mobileContent: <span>Programs mobile content</span>,
          },
        ]}
      />,
    );

    const admissionsToggle = screen.getByRole("tab", { name: /Admissions/i });
    const programsToggle = screen.getByRole("tab", { name: /Programs/i });

    expect(appearsBefore(admissionsToggle, programsToggle)).toBe(true);

    await user.click(admissionsToggle);
    expect(admissionsToggle).toHaveAttribute("aria-expanded", "true");

    const latestKeys =
      onMobileExpandedKeysChange.mock.calls[onMobileExpandedKeysChange.mock.calls.length - 1]?.[0];
    expect(latestKeys).toEqual(["admissions"]);
  });
});
