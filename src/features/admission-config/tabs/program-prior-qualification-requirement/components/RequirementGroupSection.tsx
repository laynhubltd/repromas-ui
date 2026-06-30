import {
  AND_GROUP_LABEL,
  getOrGroupSectionHeader,
} from "@/shared/constants/programPriorQualRequirementOptions";
import { useToken } from "@/shared/hooks/useToken";
import { Flex, Tag, Typography } from "antd";
import type { ProgramPriorQualificationRequirement } from "../types/program-prior-qualification-requirement";
import { RequirementLineItem } from "./RequirementLineItem";

type RequirementGroupSectionProps = {
  title: string;
  accentLabel?: string;
  accentColor?: string;
  requirements: ProgramPriorQualificationRequirement[];
  canEdit: boolean;
  canDelete: boolean;
  onView: (requirement: ProgramPriorQualificationRequirement) => void;
  onEdit: (requirement: ProgramPriorQualificationRequirement) => void;
  onDelete: (requirement: ProgramPriorQualificationRequirement) => void;
};

export function RequirementGroupSection({
  title,
  accentLabel,
  accentColor = "blue",
  requirements,
  canEdit,
  canDelete,
  onView,
  onEdit,
  onDelete,
}: RequirementGroupSectionProps) {
  const token = useToken();

  if (requirements.length === 0) return null;

  return (
    <Flex
      vertical
      gap={8}
      style={{
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadius,
        padding: token.paddingSM,
        background: token.colorFillAlter,
      }}
    >
      <Flex align="center" gap={8} wrap="wrap">
        {accentLabel && (
          <Tag color={accentColor} style={{ margin: 0 }}>
            {accentLabel}
          </Tag>
        )}
        {title ? (
          <Typography.Text strong style={{ fontSize: token.fontSizeSM }}>
            {title}
          </Typography.Text>
        ) : null}
      </Flex>
      <Flex vertical gap={8}>
        {requirements.map((requirement) => (
          <RequirementLineItem
            key={requirement.id}
            requirement={requirement}
            canEdit={canEdit}
            canDelete={canDelete}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </Flex>
    </Flex>
  );
}

export function AndRequirementSection(props: Omit<RequirementGroupSectionProps, "title" | "accentLabel">) {
  return (
    <RequirementGroupSection
      accentLabel={AND_GROUP_LABEL}
      accentColor="blue"
      title=""
      {...props}
    />
  );
}

export function OrRequirementSection({
  groupKey,
  ...props
}: Omit<RequirementGroupSectionProps, "title" | "accentLabel"> & { groupKey: string }) {
  const { accentLabel, title } = getOrGroupSectionHeader(groupKey);
  return (
    <RequirementGroupSection
      accentLabel={accentLabel}
      accentColor="orange"
      title={title}
      {...props}
    />
  );
}
