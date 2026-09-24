import { describe, expect, it } from "vitest";
import { Permission } from "./permissions";
import {
  filterPermittedSegmentedOptions,
  type PermittedSegmentedOption,
} from "./permitted-segmented";

describe("filterPermittedSegmentedOptions", () => {
  const isAllowed = (req?: any) => {
    if (!req) return true;
    return req === Permission.ProgramsList || req === Permission.CoursesList;
  };

  it("filters out unauthorized segmented options", () => {
    const options: PermittedSegmentedOption<string>[] = [
      { label: "Programs", value: "programs", permission: Permission.ProgramsList },
      { label: "Config", value: "config", permission: Permission.ProgramsManage },
      { label: "Courses", value: "courses", permission: Permission.CoursesList },
    ];

    const result = filterPermittedSegmentedOptions(options, isAllowed);
    expect(result).toHaveLength(2);
    expect(result.map((o) => o.value)).toEqual(["programs", "courses"]);
  });

  it("handles null or empty options array safely", () => {
    expect(filterPermittedSegmentedOptions(null, isAllowed)).toEqual([]);
    expect(filterPermittedSegmentedOptions([], isAllowed)).toEqual([]);
  });
});
