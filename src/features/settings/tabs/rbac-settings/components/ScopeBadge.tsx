import { Tag } from "antd";
import { deriveScopeLabel, type RoleScope } from "../types/rbac";

type ScopeBadgeProps = {
  scope: RoleScope;
};

const SCOPE_COLOUR: Record<RoleScope, string> = {
  GLOBAL: "blue",
  FACULTY: "purple",
  DEPARTMENT: "orange",
  PROGRAM: "green",
};

export function ScopeBadge({ scope }: ScopeBadgeProps) {
  return <Tag color={SCOPE_COLOUR[scope]}>{deriveScopeLabel(scope)}</Tag>;
}
