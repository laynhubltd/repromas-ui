import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { RenderSection } from "../../types";
import { DynamicFormSectionView } from "./DynamicFormSectionView";

const mockSection: RenderSection = {
  id: 1,
  title: "Personal",
  description: "Enter your details",
  stepOrder: 1,
  fields: [
    {
      fieldKey: "email",
      label: "Email Address",
      helpText: null,
      fieldType: "EMAIL",
      isRequired: true,
      isReadOnly: false,
      displayOrder: 1,
      options: null,
      ui: null,
    },
    {
      fieldKey: "phone",
      label: "Phone",
      helpText: null,
      fieldType: "PHONE",
      isRequired: false,
      isReadOnly: false,
      displayOrder: 2,
      options: null,
      ui: null,
    },
  ],
};

describe("DynamicFormSectionView", () => {
  it("renders fields from render section", () => {
    render(
      <DynamicFormSectionView
        section={mockSection}
        values={{}}
        onFieldChange={vi.fn()}
      />,
    );
    expect(screen.getByText("Email Address")).toBeInTheDocument();
    expect(screen.getByText("Phone")).toBeInTheDocument();
    expect(screen.getByText("Enter your details")).toBeInTheDocument();
  });

  it("calls onFieldChange when input changes", async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    render(
      <DynamicFormSectionView
        section={mockSection}
        values={{ email: "" }}
        onFieldChange={onFieldChange}
      />,
    );
    const input = screen.getAllByRole("textbox")[0];
    await user.type(input, "a");
    expect(onFieldChange).toHaveBeenCalled();
  });

  it("renders field errors in the form item help slot", () => {
    const { container } = render(
      <DynamicFormSectionView
        section={mockSection}
        values={{ email: "bad" }}
        onFieldChange={vi.fn()}
        fieldErrors={{ email: "Email is required." }}
      />,
    );

    expect(screen.getByText("Email is required.")).toBeInTheDocument();
    expect(
      container.querySelector(".ant-form-item-explain-error"),
    ).toHaveTextContent("Email is required.");
  });
});
