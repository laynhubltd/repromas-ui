import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { BookOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Collapse, Flex, Tag, Typography } from "antd";
import type { CollapseProps } from "antd";
import type { MouseEvent } from "react";
import type {
  ProgramPriorQualificationRequirement,
  ProgramPriorQualRequirementGroup,
} from "../types/program-prior-qualification-requirement";
import {
  AndRequirementSection,
  OrRequirementSection,
} from "./RequirementGroupSection";

type ProgramPriorQualRequirementCardProps = {
  group: ProgramPriorQualRequirementGroup;
  canEdit: boolean;
  canDelete: boolean;
  onAddRequirement: (group: ProgramPriorQualRequirementGroup) => void;
  onViewRequirement: (requirement: ProgramPriorQualificationRequirement) => void;
  onEditRequirement: (requirement: ProgramPriorQualificationRequirement) => void;
  onDeleteRequirement: (requirement: ProgramPriorQualificationRequirement) => void;
};

export function ProgramPriorQualRequirementCard({
  group,
  canEdit,
  canDelete,
  onAddRequirement,
  onViewRequirement,
  onEditRequirement,
  onDeleteRequirement,
}: ProgramPriorQualRequirementCardProps) {
  const token = useToken();
  const scopeLabel = [group.departmentName, group.facultyName]
    .filter(Boolean)
    .join(" · ");

  const handleAddClick = (event: MouseEvent) => {
    event.stopPropagation();
    onAddRequirement(group);
  };

  const sectionProps = {
    canEdit,
    canDelete,
    onView: onViewRequirement,
    onEdit: onEditRequirement,
    onDelete: onDeleteRequirement,
  };

  const collapseItems: CollapseProps["items"] = [
    {
      key: String(group.programId),
      label: (
        <Flex align="center" gap={8} wrap="wrap" style={{ minWidth: 0 }}>
          <BookOutlined
            style={{ color: token.colorPrimary, fontSize: token.fontSizeLG }}
          />
          <Typography.Text strong style={{ fontSize: token.fontSizeLG }}>
            {group.programName}
          </Typography.Text>
          <ConditionalRenderer when={scopeLabel.length > 0}>
            <Tag color="purple">{scopeLabel}</Tag>
          </ConditionalRenderer>
          <Tag color="blue">{group.requirementCount} requirements</Tag>
        </Flex>
      ),
      extra: (
        <PermissionGuard
          permission={Permission.AdmissionProgramPriorQualificationRequirementsCreate}
        >
          <Button
            type="text"
            size="small"
            icon={<PlusOutlined />}
            onClick={handleAddClick}
            title="Add requirement"
          />
        </PermissionGuard>
      ),
      children: (
        <Flex vertical gap={12}>
          {group.orGroups.map((orGroup) => (
            <OrRequirementSection
              key={orGroup.key}
              groupKey={orGroup.key}
              requirements={orGroup.requirements}
              {...sectionProps}
            />
          ))}
          <AndRequirementSection
            requirements={group.andRequirements}
            {...sectionProps}
          />
          <PermissionGuard
            permission={Permission.AdmissionProgramPriorQualificationRequirementsCreate}
          >
            <Button type="dashed" block onClick={() => onAddRequirement(group)}>
              Add requirement to this program
            </Button>
          </PermissionGuard>
        </Flex>
      ),
    },
  ];

  return <Collapse items={collapseItems} defaultActiveKey={[String(group.programId)]} />;
}
