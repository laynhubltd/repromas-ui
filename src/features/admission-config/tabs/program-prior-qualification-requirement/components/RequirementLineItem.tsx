import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { Button, Dropdown, Flex, Tag, Typography } from "antd";
import type { MenuProps } from "antd";
import { useMemo } from "react";
import type { ProgramPriorQualificationRequirement } from "../types/program-prior-qualification-requirement";
import { formatThresholdSummary } from "../utils/requirementDisplay";
import {
  getIntentDisplayLabel,
  intentFromRequirement,
} from "../utils/requirementRuleIntent";

type RequirementLineItemProps = {
  requirement: ProgramPriorQualificationRequirement;
  canEdit: boolean;
  canDelete: boolean;
  onView: (requirement: ProgramPriorQualificationRequirement) => void;
  onEdit: (requirement: ProgramPriorQualificationRequirement) => void;
  onDelete: (requirement: ProgramPriorQualificationRequirement) => void;
};

export function RequirementLineItem({
  requirement,
  canEdit,
  canDelete,
  onView,
  onEdit,
  onDelete,
}: RequirementLineItemProps) {
  const type = requirement.priorQualificationType;

  const intent = intentFromRequirement(requirement);

  const menuItems = useMemo<MenuProps["items"]>(() => {
    const items: MenuProps["items"] = [
      {
        key: "view",
        label: "View details",
        icon: <EyeOutlined />,
        onClick: () => onView(requirement),
      },
    ];

    if (canEdit) {
      items.push({
        key: "edit",
        label: "Edit",
        icon: <EditOutlined />,
        onClick: () => onEdit(requirement),
      });
    }

    if (canDelete) {
      items.push({ type: "divider" });
      items.push({
        key: "delete",
        label: "Delete",
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => onDelete(requirement),
      });
    }

    return items;
  }, [canDelete, canEdit, onDelete, onEdit, onView, requirement]);

  return (
    <Flex align="center" justify="space-between" gap={8} wrap="wrap">
      <Flex align="center" gap={8} wrap="wrap">
        <Tag color="blue">{type?.code ?? `#${requirement.priorQualificationTypeId}`}</Tag>
        <Typography.Text>{formatThresholdSummary(requirement)}</Typography.Text>
        {requirement.entryLevel?.name && (
          <Tag>{requirement.entryLevel.name}</Tag>
        )}
        {!requirement.isMandatory && (
          <Tag color="default">{getIntentDisplayLabel(intent)}</Tag>
        )}
      </Flex>
      <Dropdown menu={{ items: menuItems }} trigger={["click"]} placement="bottomRight">
        <Button type="text" size="small" icon={<MoreOutlined />} aria-label="Row actions" />
      </Dropdown>
    </Flex>
  );
}
