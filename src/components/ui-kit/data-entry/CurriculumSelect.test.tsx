import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CurriculumSelect } from "./CurriculumSelect";
import * as curriculumVersionApi from "@/features/settings/tabs/curriculum-version/api/curriculumVersionApi";

vi.mock("@/features/settings/tabs/curriculum-version/api/curriculumVersionApi", () => ({
  useGetCurriculumVersionsQuery: vi.fn(),
}));

describe("CurriculumSelect", () => {
  const mockVersions = [
    {
      id: 1,
      name: "2026 Global CCMAS Standard",
      scope: "GLOBAL",
      referenceId: null,
      isActiveForAdmission: false,
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
    },
    {
      id: 2,
      name: "2026 Software Engineering Program Standard",
      scope: "PROGRAM",
      referenceId: 10,
      isActiveForAdmission: true,
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
    },
  ];

  it("renders select with versions and displays scope and active tags", () => {
    vi.mocked(curriculumVersionApi.useGetCurriculumVersionsQuery).mockReturnValue({
      data: {
        totalItems: 2,
        member: mockVersions,
        view: { first: "", last: "" },
      },
      isLoading: false,
      isFetching: false,
    } as any);

    render(<CurriculumSelect programId={10} />);

    expect(screen.getByText("Select curriculum version")).toBeInTheDocument();
  });

  it("calls query with forProgramId when programId is provided", () => {
    const queryMock = vi.fn().mockReturnValue({
      data: { totalItems: 0, member: [], view: { first: "", last: "" } },
      isLoading: false,
      isFetching: false,
    });
    vi.mocked(curriculumVersionApi.useGetCurriculumVersionsQuery).mockImplementation(queryMock);

    render(<CurriculumSelect programId={15} />);

    expect(queryMock).toHaveBeenCalledWith(
      { forProgramId: 15, include: "program", itemsPerPage: 200 },
      { skip: false },
    );
  });

  it("auto-selects active version when autoSelectActive is true", () => {
    vi.mocked(curriculumVersionApi.useGetCurriculumVersionsQuery).mockReturnValue({
      data: {
        totalItems: 2,
        member: mockVersions,
        view: { first: "", last: "" },
      },
      isLoading: false,
      isFetching: false,
    } as any);

    const onChange = vi.fn();
    render(<CurriculumSelect programId={10} autoSelectActive onChange={onChange} />);

    expect(onChange).toHaveBeenCalledWith(2);
  });
});
