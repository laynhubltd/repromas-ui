import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { REQUIREMENT_CATEGORY_LABELS } from "@/shared/constants/programOlevelRuleOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import {
  BookOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button, Collapse, Flex, Tag, Typography } from "antd";
import type { CollapseProps } from "antd";
import type { MouseEvent } from "react";
import type {
  ProgramOlevelRequirement,
  ProgramOlevelRuleGroup,
} from "../types/program-olevel-rule";

type ProgramOlevelRuleCardProps = {
  group: ProgramOlevelRuleGroup;
  onAddSubject: (group: ProgramOlevelRuleGroup) => void;
  onEditRequirement: (requirement: ProgramOlevelRequirement) => void;
  onDeleteRequirement: (requirement: ProgramOlevelRequirement) => void;
};

type RequirementSubjectListProps = {
  requirements: ProgramOlevelRequirement[];
  tagColor: string;
  emptyLabel: string;
  onEditRequirement: (requirement: ProgramOlevelRequirement) => void;
  onDeleteRequirement: (requirement: ProgramOlevelRequirement) => void;
};

function RequirementSubjectListContent({
  requirements,
  tagColor,
  emptyLabel,
  onEditRequirement,
  onDeleteRequirement,
}: RequirementSubjectListProps) {
  const token = useToken();

  if (requirements.length === 0) {
    return (
      <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
        {emptyLabel}
      </Typography.Text>
    );
  }

  return (
    <Flex vertical gap={6}>
      {requirements.map((req) => (
        <Flex key={req.id} align="center" justify="space-between" gap={8}>
          <Tag color={tagColor} style={{ margin: 0 }}>
            {req.subject?.name ?? "Unknown subject"}
          </Tag>
          <Flex align="center" gap={2} style={{ flexShrink: 0 }}>
            <PermissionGuard
              permission={Permission.AdmissionProgramOlevelRulesUpdate}
            >
              <Button
                type="text"
                size="small"
                icon={<EditOutlined style={{ fontSize: 14 }} />}
                onClick={() => onEditRequirement(req)}
                title="Edit"
              />
            </PermissionGuard>
            <PermissionGuard
              permission={Permission.AdmissionProgramOlevelRulesDelete}
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined style={{ fontSize: 14 }} />}
                onClick={() => onDeleteRequirement(req)}
                title="Remove"
              />
            </PermissionGuard>
          </Flex>
        </Flex>
      ))}
    </Flex>
  );
}

export function ProgramOlevelRuleCard({
  group,
  onAddSubject,
  onEditRequirement,
  onDeleteRequirement,
}: ProgramOlevelRuleCardProps) {
  const token = useToken();

  const scopeLabel = [group.departmentName, group.facultyName]
    .filter(Boolean)
    .join(" · ");

  const formatDate = (iso: string | null): string => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const panelKey = String(group.programId);

  const listProps = {
    onEditRequirement,
    onDeleteRequirement,
  };

  const categoryPanels: CollapseProps["items"] = [
    {
      key: "compulsory",
      label: (
        <Flex align="center" gap={8}>
          <Typography.Text strong style={{ fontSize: token.fontSizeSM }}>
            {REQUIREMENT_CATEGORY_LABELS.compulsory}
          </Typography.Text>
          <Tag color="blue" style={{ margin: 0 }}>
            {group.compulsoryCount}
          </Tag>
        </Flex>
      ),
      children: (
        <RequirementSubjectListContent
          {...listProps}
          tagColor="blue"
          requirements={group.compulsoryRequirements}
          emptyLabel="No compulsory subjects configured."
        />
      ),
    },
    {
      key: "optional",
      label: (
        <Flex align="center" gap={8}>
          <Typography.Text strong style={{ fontSize: token.fontSizeSM }}>
            {REQUIREMENT_CATEGORY_LABELS.optional}
          </Typography.Text>
          <Tag style={{ margin: 0 }}>{group.optionalCount}</Tag>
        </Flex>
      ),
      children: (
        <RequirementSubjectListContent
          {...listProps}
          tagColor="default"
          requirements={group.optionalRequirements}
          emptyLabel="No optional subjects configured."
        />
      ),
    },
  ];

  const handleAddSubjectClick = (event: MouseEvent) => {
    event.stopPropagation();
    onAddSubject(group);
  };

  const collapseItems: CollapseProps["items"] = [
    {
      key: panelKey,
      label: (
        <Flex align="center" gap={8} wrap="wrap" style={{ minWidth: 0 }}>
          <BookOutlined
            style={{ color: token.colorPrimary, fontSize: token.fontSizeLG }}
          />
          <Typography.Text
            strong
            style={{ fontSize: token.fontSizeLG, lineHeight: 1.4 }}
          >
            {group.programName}
          </Typography.Text>
          <ConditionalRenderer when={scopeLabel.length > 0}>
            <Tag color="purple" style={{ margin: 0 }}>
              {scopeLabel}
            </Tag>
          </ConditionalRenderer>
          <Tag color="blue" style={{ margin: 0 }}>
            {group.compulsoryCount} compulsory
          </Tag>
          <Tag style={{ margin: 0 }}>{group.optionalCount} optional</Tag>
        </Flex>
      ),
      extra: (
        <PermissionGuard permission={Permission.AdmissionProgramOlevelRulesCreate}>
          <Button
            type="text"
            size="small"
            icon={<PlusOutlined style={{ fontSize: 16 }} />}
            onClick={handleAddSubjectClick}
            title="Add subject"
          />
        </PermissionGuard>
      ),
      children: (
        <Flex vertical gap={12}>
          <Collapse
            bordered={false}
            defaultActiveKey={["compulsory", "optional"]}
            items={categoryPanels}
            style={{ background: token.colorBgLayout, borderRadius: token.borderRadius }}
          />

          <Typography.Text
            type="secondary"
            style={{ fontSize: token.fontSizeSM }}
          >
            {group.subjectCount} subject{group.subjectCount === 1 ? "" : "s"}
            {group.latestCreatedAt
              ? ` · Updated ${formatDate(group.latestCreatedAt)}`
              : ""}
          </Typography.Text>
        </Flex>
      ),
    },
  ];

  return (
    <Collapse
      bordered
      defaultActiveKey={[]}
      items={collapseItems}
      style={{
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadius,
        background: token.colorBgContainer,
        overflow: "hidden",
      }}
      styles={{
        header: {
          padding: "12px 16px",
          alignItems: "center",
        },
        body: {
          padding: "12px 16px 16px",
          background: token.colorBgContainer,
        },
      }}
    />
  );
}
