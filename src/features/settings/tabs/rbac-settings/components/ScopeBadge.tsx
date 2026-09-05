import { useInstitutionTerminology } from "@/shared/hooks/useInstitutionTerminology";
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
  CANDIDATE: "cyan",
};

export function ScopeBadge({ scope }: ScopeBadgeProps) {
  const { academicUnit } = useInstitutionTerminology();
  const label = scope === "FACULTY" ? academicUnit.singular : deriveScopeLabel(scope);
  return <Tag color={SCOPE_COLOUR[scope]}>{label}</Tag>;
}
