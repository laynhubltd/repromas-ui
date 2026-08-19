import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AppIcon } from "@/shared/ui/AppIcon";
import DashboardSvg from "@/assets/hugeicons/svg/stroke/dashboard/dashboard-square-01.svg?react";
import { Button } from "antd";

describe("AppIcon Component (Local Hugeicons)", () => {
  it("renders SVG when using icon string name", () => {
    render(<AppIcon name="dashboard" />);

    const wrapper = screen.getByTestId("app-icon-wrapper");
    expect(wrapper).toBeInTheDocument();

    const svg = wrapper.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders SVG when using direct SVG component", () => {
    render(<AppIcon icon={DashboardSvg} />);

    const wrapper = screen.getByTestId("app-icon-wrapper");
    expect(wrapper).toBeInTheDocument();

    const svg = wrapper.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("applies preset and custom numeric sizes correctly", () => {
    const { rerender } = render(<AppIcon name="dashboard" size="sm" />);
    let wrapper = screen.getByTestId("app-icon-wrapper");
    expect(wrapper).toHaveStyle({ width: "16px", height: "16px" });

    rerender(<AppIcon name="dashboard" size="lg" />);
    wrapper = screen.getByTestId("app-icon-wrapper");
    expect(wrapper).toHaveStyle({ width: "22px", height: "22px" });

    rerender(<AppIcon name="dashboard" size={32} />);
    wrapper = screen.getByTestId("app-icon-wrapper");
    expect(wrapper).toHaveStyle({ width: "32px", height: "32px" });
  });

  it("supports custom color and styles", () => {
    render(
      <AppIcon
        name="dashboard"
        color="#006747"
      />
    );

    const wrapper = screen.getByTestId("app-icon-wrapper");
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveStyle({ color: "#006747" });
  });

  it("renders alternate icon when showAlt is true", () => {
    const { rerender } = render(
      <AppIcon
        name="dashboard"
        altName="user"
        showAlt={false}
      />
    );

    let svg = screen.getByTestId("app-icon-wrapper").querySelector("svg");
    expect(svg).toBeInTheDocument();

    rerender(
      <AppIcon
        name="dashboard"
        altName="user"
        showAlt={true}
      />
    );

    svg = screen.getByTestId("app-icon-wrapper").querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders correctly inside an Ant Design Button", () => {
    render(
      <Button icon={<AppIcon name="dashboard" size="sm" />}>
        Dashboard Action
      </Button>
    );

    const button = screen.getByRole("button", { name: /Dashboard Action/i });
    expect(button).toBeInTheDocument();
    expect(button.querySelector("svg")).toBeInTheDocument();
  });
});
