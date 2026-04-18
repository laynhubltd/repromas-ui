import { InlineStatus, NotificationItem, NotificationTray, type NotificationRecord } from "@/components/ui-kit";
import { Button } from "antd";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";

describe("ui-kit notifiers", () => {
  it.each([
    ["info", "status", "polite"],
    ["success", "status", "polite"],
    ["warning", "alert", "assertive"],
    ["error", "alert", "assertive"],
  ] as const)(
    "renders %s severity with expected role and aria-live semantics",
    (severity, expectedRole, expectedLiveMode) => {
      render(
        <InlineStatus
          severity={severity}
          title={`${severity} notifier`}
          body="Status body"
          timestamp="now"
        />,
      );

      const notifier = screen.getByRole(expectedRole);
      expect(notifier).toHaveAttribute("aria-live", expectedLiveMode);
      expect(screen.getByText(`${severity} notifier`)).toBeInTheDocument();
    },
  );

  it("renders item slots and allows dismiss interaction", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();

    render(
      <NotificationItem
        id="notif-1"
        severity="warning"
        title="Quota threshold reached"
        body="Approvers should review allocation limits."
        timestamp="09:45"
        action={<Button type="link">Review</Button>}
        dismissible
        onDismiss={onDismiss}
      />,
    );

    expect(screen.getByText("Quota threshold reached")).toBeInTheDocument();
    expect(screen.getByText("Approvers should review allocation limits.")).toBeInTheDocument();
    expect(screen.getByText("09:45")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Review" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).toHaveBeenCalledWith("notif-1");
  });

  it("supports grouped tray mode and keyboard focus movement", async () => {
    const user = userEvent.setup();
    const notifications: NotificationRecord[] = [
      {
        id: "notif-1",
        groupKey: "now",
        groupLabel: "Now",
        severity: "info",
        title: "Data import started",
        body: "The import job is running in the background.",
      },
      {
        id: "notif-2",
        groupKey: "now",
        groupLabel: "Now",
        severity: "success",
        title: "Data import finished",
        body: "All records were processed successfully.",
      },
      {
        id: "notif-3",
        groupKey: "earlier",
        groupLabel: "Earlier",
        severity: "error",
        title: "Export failed",
        body: "Retry the export after validating filters.",
      },
    ];

    render(
      <NotificationTray
        notifications={notifications}
        mode="grouped"
        ariaLabel="Demo tray"
        autoFocusFirst
      />,
    );

    expect(screen.getByRole("region", { name: "Demo tray" })).toBeInTheDocument();
    expect(screen.getByText("Now")).toBeInTheDocument();
    expect(screen.getByText("Earlier")).toBeInTheDocument();

    const items = screen.getAllByRole("article");
    await waitFor(() => expect(items[0]).toHaveFocus());

    await user.keyboard("{ArrowDown}");
    expect(items[1]).toHaveFocus();

    await user.keyboard("{ArrowUp}");
    expect(items[0]).toHaveFocus();
  });
});
