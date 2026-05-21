import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Alert, Button, Flex, Tag, Typography } from "antd";
import { useJambRuleGroupCard } from "../hooks/useJambRuleGroupCard";
import type {
  JambCombinationGroup,
  JambCombinationOption,
} from "../types/jamb-rule";

type JambRuleGroupCardProps = {
  group: JambCombinationGroup;
  onEditGroup: (group: JambCombinationGroup) => void;
  onDeleteGroup: (group: JambCombinationGroup) => void;
  onAddOption: (groupId: number) => void;
  onEditOption: (option: JambCombinationOption) => void;
  onDeleteOption: (option: JambCombinationOption) => void;
};

export function JambRuleGroupCard({
  group,
  onEditGroup,
  onDeleteGroup,
  onAddOption,
  onEditOption,
  onDeleteOption,
}: JambRuleGroupCardProps) {
  const token = useToken();
  const { state } = useJambRuleGroupCard(group);
  const {
    options,
    optionCount,
    isLoading,
    isError,
    isAnyOf,
    isAddBlocked,
    isIncomplete,
    isSatisfied,
    subjectsNeeded,
    maxRequiredCountToAddNext,
  } = state;

  const requirementLabel = (() => {
    if (group.requirementType === "COMPULSORY") {
      return "All subjects required";
    }
    if (isLoading) {
      return `Pick ${group.requiredCount} of …`;
    }
    return `Pick ${group.requiredCount} of ${optionCount}`;
  })();

  return (
    <div
      style={{
        border: `1px solid ${token.colorBorder}`,
        borderRadius: token.borderRadius,
        background: token.colorBgContainer,
        padding: 16,
      }}
    >
      <Flex justify="space-between" align="flex-start" gap={12} wrap="wrap">
        <Flex vertical gap={4} flex={1}>
          <Flex gap={8} align="center" wrap="wrap">
            <Typography.Text strong>{group.name}</Typography.Text>
            <Tag color={group.requirementType === "COMPULSORY" ? "blue" : "purple"}>
              {group.requirementType === "COMPULSORY" ? "Compulsory" : "Any Of"}
            </Tag>
            <ConditionalRenderer when={isAnyOf && isSatisfied}>
              <Tag color="success">Ready</Tag>
            </ConditionalRenderer>
            <ConditionalRenderer when={isAnyOf && isIncomplete && !isAddBlocked}>
              <Tag color="warning">
                {subjectsNeeded === 1
                  ? "Add 1 more subject"
                  : `Add ${subjectsNeeded} more subjects`}
              </Tag>
            </ConditionalRenderer>
            <ConditionalRenderer when={isAddBlocked}>
              <Tag color="error">Cannot add subjects yet</Tag>
            </ConditionalRenderer>
          </Flex>
          <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            {requirementLabel}
          </Typography.Text>
        </Flex>

        <Flex gap={8}>
          <PermissionGuard permission={Permission.AdmissionJambRulesUpdate}>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEditGroup(group)}
            />
          </PermissionGuard>
          <PermissionGuard permission={Permission.AdmissionJambRulesDelete}>
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDeleteGroup(group)}
            />
          </PermissionGuard>
        </Flex>
      </Flex>

      <ConditionalRenderer when={isAddBlocked}>
        <Alert
          type="warning"
          showIcon
          style={{ marginTop: 12 }}
          message={`Required count (${group.requiredCount}) is too high for ${optionCount} subject${optionCount === 1 ? "" : "s"}. Edit this group and lower required count to ${maxRequiredCountToAddNext} or less, then add subjects.`}
        />
      </ConditionalRenderer>

      <DataLoader
        loading={isLoading}
        loader={<SkeletonRows count={2} variant="inline" />}
        minHeight="60px"
      >
        <ConditionalRenderer when={isError}>
          <ErrorAlert variant="section" error="Failed to load group options." />
        </ConditionalRenderer>

        <ConditionalRenderer when={!isError && options.length === 0}>
          <Typography.Text
            type="secondary"
            style={{
              display: "block",
              marginTop: 12,
              fontSize: token.fontSizeSM,
            }}
          >
            {isAddBlocked
              ? "Lower the required count before adding subjects to this group."
              : "No subjects in this group yet."}
          </Typography.Text>
        </ConditionalRenderer>

        <ConditionalRenderer when={!isError && options.length > 0}>
          <Flex vertical gap={4} style={{ marginTop: 12 }}>
            {options.map((option) => (
              <Flex
                key={option.id}
                justify="space-between"
                align="center"
                style={{
                  padding: "8px 12px",
                  borderBottom: `1px solid ${token.colorBorderSecondary}`,
                }}
              >
                <Flex vertical gap={2}>
                  <Typography.Text>
                    {option.subject?.name ?? "Unknown subject"}
                  </Typography.Text>
                  <ConditionalRenderer when={!!option.subject?.code}>
                    <Typography.Text
                      type="secondary"
                      style={{ fontSize: token.fontSizeSM }}
                    >
                      {option.subject?.code}
                    </Typography.Text>
                  </ConditionalRenderer>
                </Flex>
                <Flex gap={4}>
                  <PermissionGuard permission={Permission.AdmissionJambRulesUpdate}>
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => onEditOption(option)}
                    />
                  </PermissionGuard>
                  <PermissionGuard permission={Permission.AdmissionJambRulesDelete}>
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => onDeleteOption(option)}
                    />
                  </PermissionGuard>
                </Flex>
              </Flex>
            ))}
          </Flex>
        </ConditionalRenderer>
      </DataLoader>

      <PermissionGuard permission={Permission.AdmissionJambRulesCreate}>
        <Button
          type="link"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => onAddOption(group.id)}
          disabled={isAddBlocked}
          style={{ padding: 0, marginTop: 8 }}
        >
          Add subject
        </Button>
      </PermissionGuard>
    </div>
  );
}
