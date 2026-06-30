import { describe, expect, it } from "vitest";
import { buildListQueryParams } from "./buildListQueryParams";

describe("buildListQueryParams", () => {
  it("includes pagination defaults", () => {
    const params = buildListQueryParams({
      page: 2,
      debouncedProgramNameSearch: "",
      debouncedDepartmentNameSearch: "",
    });
    expect(params.page).toBe(2);
    expect(params.itemsPerPage).toBe(20);
    expect(params.sort).toBe("programId:asc");
    expect(params.include).toBe("program.department.faculty");
  });

  it("maps program and department search independently", () => {
    const params = buildListQueryParams({
      page: 1,
      debouncedProgramNameSearch: "computer",
      debouncedDepartmentNameSearch: "science",
    });
    expect(params["search[program.name]"]).toBe("computer");
    expect(params["search[program.department.name]"]).toBe("science");
  });

  it("omits search params when blank", () => {
    const params = buildListQueryParams({
      page: 1,
      debouncedProgramNameSearch: "   ",
      debouncedDepartmentNameSearch: "",
    });
    expect(params["search[program.name]"]).toBeUndefined();
    expect(params["search[program.department.name]"]).toBeUndefined();
  });

  it("maps program filter to exact programId", () => {
    const params = buildListQueryParams({
      page: 1,
      debouncedProgramNameSearch: "",
      debouncedDepartmentNameSearch: "",
      programFilter: 42,
    });
    expect(params["exact[programId]"]).toBe(42);
  });
});
