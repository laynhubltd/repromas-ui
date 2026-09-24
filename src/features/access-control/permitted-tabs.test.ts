import { describe, expect, it } from "vitest";
import type { ConfigTabGroupDefinition } from "@/components/ui-kit/config-tabs/types";
import { Permission } from "./permissions";
import { filterPermittedGroups, filterPermittedTabs } from "./permitted-tabs";

describe("filterPermittedGroups", () => {
  const isAllowed = (req?: any) => {
    if (!req) return true;
    if (Array.isArray(req)) {
      return req.includes(Permission.AdmissionCyclesList) || req.includes(Permission.OlevelSubjectsList);
    }
    return req === Permission.AdmissionCyclesList || req === Permission.OlevelSubjectsList;
  };

  const sampleGroups: ConfigTabGroupDefinition[] = [
    {
      key: "foundation",
      label: "Foundation",
      tabs: [
        {
          key: "admission-cycle",
          label: "Admission Cycle",
          children: "Cycle Tab",
          permission: Permission.AdmissionCyclesList,
        },
        {
          key: "matric-format",
          label: "Matric Format",
          children: "Matric Tab",
          permission: Permission.MatricNumberFormatsList,
        },
      ],
    },
    {
      key: "qualifications",
      label: "Qualifications",
      tabs: [
        {
          key: "olevel-subject",
          label: "OLevel Subject",
          children: "Subject Tab",
          permission: Permission.OlevelSubjectsList,
        },
      ],
    },
    {
      key: "denied-group",
      label: "Denied Group",
      tabs: [
        {
          key: "scoring",
          label: "Scoring Strategy",
          children: "Scoring Tab",
          permission: Permission.PostUtmeScoresList,
        },
      ],
    },
  ];

  it("filters tabs and drops groups with zero permitted tabs", () => {
    const result = filterPermittedGroups(sampleGroups, isAllowed);
    expect(result).toHaveLength(2);
    expect(result[0].key).toBe("foundation");
    expect(result[0].tabs).toHaveLength(1);
    expect(result[0].tabs[0].key).toBe("admission-cycle");

    expect(result[1].key).toBe("qualifications");
    expect(result[1].tabs).toHaveLength(1);
    expect(result[1].tabs[0].key).toBe("olevel-subject");
  });

  it("drops group if group-level permission is denied", () => {
    const groupsWithGroupPerm: ConfigTabGroupDefinition[] = [
      {
        key: "foundation",
        label: "Foundation",
        permission: Permission.PostUtmeScoresList, // Denied
        tabs: [
          {
            key: "admission-cycle",
            label: "Admission Cycle",
            children: "Cycle Tab",
            permission: Permission.AdmissionCyclesList,
          },
        ],
      },
    ];

    const result = filterPermittedGroups(groupsWithGroupPerm, isAllowed);
    expect(result).toEqual([]);
  });

  it("returns empty array safely when all groups are unauthorized", () => {
    const result = filterPermittedGroups([], isAllowed);
    expect(result).toEqual([]);
    expect(filterPermittedGroups(null, isAllowed)).toEqual([]);
  });
});

describe("filterPermittedTabs", () => {
  it("filters flat tab items", () => {
    const tabs = [
      { key: "1", permission: Permission.UsersList },
      { key: "2", permission: Permission.UsersDelete },
    ];
    const isAllowed = (p: any) => p === Permission.UsersList;
    const result = filterPermittedTabs(tabs, isAllowed);
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe("1");
  });
});
