import { describe, expect, it } from "vitest";
import { Permission } from "./permissions";
import { filterPermittedMenuItems, type PermittedMenuItem } from "./permitted-menu";

describe("filterPermittedMenuItems", () => {
  const isAllowed = (req?: any) => {
    if (!req) return true;
    if (Array.isArray(req)) {
      return req.includes(Permission.UsersCreate) || req.includes(Permission.UsersList);
    }
    return req === Permission.UsersCreate || req === Permission.UsersList;
  };

  it("filters out unauthorized items and keeps permitted ones", () => {
    const items: PermittedMenuItem[] = [
      { key: "1", label: "View Users", permission: Permission.UsersList },
      { key: "2", label: "Delete Users", permission: Permission.UsersDelete },
      { key: "3", label: "Create User", permission: Permission.UsersCreate },
    ];

    const result = filterPermittedMenuItems(items, isAllowed);
    expect(result).toHaveLength(2);
    expect(result.map((i: any) => i.key)).toEqual(["1", "3"]);
  });

  it("sanitizes leading and trailing dividers", () => {
    const items: PermittedMenuItem[] = [
      { type: "divider" },
      { key: "1", label: "Delete", permission: Permission.UsersDelete },
      { type: "divider" },
      { key: "2", label: "View Users", permission: Permission.UsersList },
      { type: "divider" },
    ];

    const result = filterPermittedMenuItems(items, isAllowed);
    expect(result).toHaveLength(1);
    expect((result[0] as any).key).toBe("2");
  });

  it("collapses consecutive duplicate dividers", () => {
    const items: PermittedMenuItem[] = [
      { key: "1", label: "View Users", permission: Permission.UsersList },
      { type: "divider" },
      { key: "deleted", label: "Delete", permission: Permission.UsersDelete },
      { type: "divider" },
      { key: "2", label: "Create User", permission: Permission.UsersCreate },
    ];

    const result = filterPermittedMenuItems(items, isAllowed);
    expect(result).toHaveLength(3);
    expect((result[0] as any).key).toBe("1");
    expect((result[1] as any).type).toBe("divider");
    expect((result[2] as any).key).toBe("2");
  });

  it("recursively filters submenus and drops empty submenus", () => {
    const items: PermittedMenuItem[] = [
      {
        key: "sub1",
        label: "User Actions",
        children: [
          { key: "sub1-1", label: "Delete", permission: Permission.UsersDelete },
        ],
      },
      {
        key: "sub2",
        label: "Creation Actions",
        children: [
          { key: "sub2-1", label: "Create", permission: Permission.UsersCreate },
          { key: "sub2-2", label: "Delete", permission: Permission.UsersDelete },
        ],
      },
    ];

    const result = filterPermittedMenuItems(items, isAllowed);
    expect(result).toHaveLength(1);
    expect((result[0] as any).key).toBe("sub2");
    expect((result[0] as any).children).toHaveLength(1);
    expect((result[0] as any).children[0].key).toBe("sub2-1");
  });

  it("returns empty array when all items are unauthorized or items is null/empty", () => {
    expect(filterPermittedMenuItems(null, isAllowed)).toEqual([]);
    expect(filterPermittedMenuItems([], isAllowed)).toEqual([]);

    const deniedItems: PermittedMenuItem[] = [
      { key: "1", label: "Delete", permission: Permission.UsersDelete },
      { key: "2", label: "Edit", permission: Permission.UsersUpdate },
    ];
    expect(filterPermittedMenuItems(deniedItems, isAllowed)).toEqual([]);
  });
});
