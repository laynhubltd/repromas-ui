import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import {
  ConditionalRenderer,
  centeredBox,
} from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Flex, Tag, Typography } from "antd";
import { resolveReferenceLabel } from "../utils/resolveReferenceLabel";
import type {
  JambCombinationGroup,
  JambCombinationOption,
  JambSubjectCombination,
} from "../types/jamb-rule";
import { JambRuleGroupCard } from "./JambRuleGroupCard";

type JambRuleDetailBuilderProps = {
  combination: JambSubjectCombination | null;
  groups: JambCombinationGroup[];
  isLoading: boolean;
  isError: boolean;
  faculties: Array<{ id: number; name: string }>;
  departments: Array<{ id: number; name: string }>;
  programs: Array<{ id: number; name: string }>;
  onAddGroup: () => void;
  onEditGroup: (group: JambCombinationGroup) => void;
  onDeleteGroup: (group: JambCombinationGroup) => void;
  onAddOption: (groupId: number) => void;
  onEditOption: (option: JambCombinationOption) => void;
  onDeleteOption: (option: JambCombinationOption) => void;
  onRetry: () => void;
};

const scopeTagColor: Record<string, string> = {
  GLOBAL: "blue",
  FACULTY: "purple",
  DEPARTMENT: "orange",
  PROGRAM: "green",
};

export function JambRuleDetailBuilder({
  combination,
  groups,
  isLoading,
  isError,
  faculties,
  departments,
  programs,
  onAddGroup,
  onEditGroup,
  onDeleteGroup,
  onAddOption,
  onEditOption,
  onDeleteOption,
  onRetry,
}: JambRuleDetailBuilderProps) {
  const token = useToken();

  const containerStyle = {
    border: `1px solid ${token.colorBorder}`,
    borderRadius: token.borderRadius,
    background: token.colorBgContainer,
    padding: 16,
    minHeight: 320,
  };

  if (combination == null) {
    return (
      <div style={containerStyle}>
        <Flex
          align="center"
          justify="center"
          style={{ minHeight: 280, padding: 24 }}
        >
          <Typography.Text type="secondary">
            Select a combination to view and edit its requirement groups.
          </Typography.Text>
        </Flex>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <Flex vertical gap={16}>
          <Flex vertical gap={8}>
            <Flex gap={8} align="center" wrap="wrap">
              <Typography.Text strong style={{ fontSize: token.fontSizeLG }}>
                {combination.name}
              </Typography.Text>
              <Tag color={scopeTagColor[combination.scope] ?? "default"}>
                {combination.scope}
              </Tag>
            </Flex>
            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              {resolveReferenceLabel(
                combination.scope,
                combination.referenceId,
                faculties,
                departments,
                programs,
              )}{" "}
              · Priority weight {combination.priorityWeight}
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              Higher priority wins when multiple scoped rules match a candidate&apos;s
              program at screening.
            </Typography.Text>
          </Flex>

          <Flex justify="space-between" align="center">
            <Typography.Text strong>Requirement Groups</Typography.Text>
            <PermissionGuard permission={Permission.AdmissionJambRulesCreate}>
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={onAddGroup}
              >
                Add Group
              </Button>
            </PermissionGuard>
          </Flex>

          <DataLoader
            loading={isLoading}
            loader={<SkeletonRows count={3} variant="card" />}
          >
            <ConditionalRenderer when={isError}>
              <ErrorAlert
                variant="section"
                error="Failed to load requirement groups."
                onRetry={onRetry}
              />
            </ConditionalRenderer>

            <ConditionalRenderer
              when={!isError && groups.length === 0}
              wrapper={centeredBox({
                border: `1px dashed ${token.colorBorder}`,
                borderRadius: token.borderRadius,
                background: token.colorBgLayout,
              })}
            >
              <Typography.Text
                type="secondary"
                style={{ display: "block", marginBottom: 12, textAlign: "center" }}
              >
                No requirement groups yet. Add English (Compulsory) and science
                subjects (Any Of) to complete this rule.
              </Typography.Text>
              <PermissionGuard permission={Permission.AdmissionJambRulesCreate}>
                <Button type="primary" icon={<PlusOutlined />} onClick={onAddGroup}>
                  Add First Group
                </Button>
              </PermissionGuard>
            </ConditionalRenderer>

            <ConditionalRenderer when={!isError && groups.length > 0}>
              <Flex vertical gap={12}>
                {groups.map((group) => (
                  <JambRuleGroupCard
                    key={group.id}
                    group={group}
                    onEditGroup={onEditGroup}
                    onDeleteGroup={onDeleteGroup}
                    onAddOption={onAddOption}
                    onEditOption={onEditOption}
                    onDeleteOption={onDeleteOption}
                  />
                ))}
              </Flex>
            </ConditionalRenderer>
          </DataLoader>
      </Flex>
    </div>
  );
}
