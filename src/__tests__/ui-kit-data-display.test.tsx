import { ItemList, Table, type ItemListItem, type TableProps } from "@/components/ui-kit";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";

interface ActivityRow {
  key: string;
  module: string;
  owner: string;
}

const ACTIVITY_COLUMNS: TableProps<ActivityRow>["columns"] = [
  {
    title: "Module",
    dataIndex: "module",
    key: "module",
  },
  {
    title: "Owner",
    dataIndex: "owner",
    key: "owner",
  },
];

describe("ui-kit data display", () => {
  it("renders table header and empty state content with defaults", () => {
    render(
      <Table<ActivityRow>
        header={{
          title: "Recent Activity",
          subtitle: "Shared wrapper behavior",
        }}
        columns={ACTIVITY_COLUMNS}
        dataSource={[]}
        rowKey="key"
        emptyState={{
          title: "No activity yet",
          description: "Activity appears here after updates.",
        }}
      />,
    );

    expect(screen.getByText("Recent Activity")).toBeInTheDocument();
    expect(screen.getByText("Shared wrapper behavior")).toBeInTheDocument();
    expect(screen.getByText("No activity yet")).toBeInTheDocument();
    expect(screen.getByText("Activity appears here after updates.")).toBeInTheDocument();
  });

  it("renders table rows and loading state", () => {
    const rows: ActivityRow[] = [
      { key: "row-1", module: "Admissions", owner: "Operations" },
      { key: "row-2", module: "Programs", owner: "Academic Team" },
    ];

    const { container, rerender } = render(
      <Table<ActivityRow> columns={ACTIVITY_COLUMNS} dataSource={rows} rowKey="key" />,
    );

    expect(screen.getByText("Admissions")).toBeInTheDocument();
    expect(screen.getByText("Programs")).toBeInTheDocument();

    rerender(<Table<ActivityRow> columns={ACTIVITY_COLUMNS} dataSource={rows} rowKey="key" loading />);

    expect(container.querySelector(".ant-spin")).toBeInTheDocument();
  });

  it("renders simple and media item list variants with slots", () => {
    const simpleItems: ItemListItem[] = [
      {
        key: "simple-1",
        leading: <span aria-label="simple-leading">S</span>,
        content: "Simple Row",
        trailing: "Meta",
      },
    ];

    const { rerender } = render(<ItemList variant="simple" items={simpleItems} />);

    expect(screen.getByText("Simple Row")).toBeInTheDocument();
    expect(screen.getByText("Meta")).toBeInTheDocument();
    expect(screen.getByLabelText("simple-leading")).toBeInTheDocument();

    rerender(
      <ItemList
        variant="media"
        items={[
          {
            key: "media-1",
            leading: <span aria-label="media-leading">M</span>,
            content: <span>Media Row</span>,
            trailing: "Updated now",
          },
        ]}
      />,
    );

    expect(screen.getByText("Media Row")).toBeInTheDocument();
    expect(screen.getByText("Updated now")).toBeInTheDocument();
    expect(screen.getByLabelText("media-leading")).toBeInTheDocument();
  });

  it("supports navigation interaction with click and keyboard, and blocks disabled rows", async () => {
    const user = userEvent.setup();
    const onListItemClick = vi.fn();
    const onActiveClick = vi.fn();
    const onDisabledClick = vi.fn();

    render(
      <ItemList
        variant="navigation"
        onItemClick={onListItemClick}
        items={[
          {
            key: "route-active",
            content: "Open Sessions",
            onClick: onActiveClick,
          },
          {
            key: "route-disabled",
            content: "Open Archive",
            onClick: onDisabledClick,
            disabled: true,
          },
        ]}
      />,
    );

    const activeButton = screen.getByRole("button", { name: /Open Sessions/i });
    const disabledButton = screen.getByRole("button", { name: /Open Archive/i });

    await user.click(activeButton);
    expect(onActiveClick).toHaveBeenCalledTimes(1);
    expect(onListItemClick).toHaveBeenCalledWith(
      expect.objectContaining({ key: "route-active" }),
      0,
    );

    activeButton.focus();
    await user.keyboard("{Enter}");
    expect(onActiveClick).toHaveBeenCalledTimes(2);

    expect(disabledButton).toBeDisabled();
    await user.click(disabledButton);
    expect(onDisabledClick).not.toHaveBeenCalled();
  });
});
