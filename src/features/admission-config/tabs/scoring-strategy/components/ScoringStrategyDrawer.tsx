// Feature: admission-config — Scoring Strategy Drawer
// View complete information about a scoring strategy

import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import {
  getScopeLabel,
  SCREENING_METHOD_OPTIONS,
  SCOPE_TAG_COLORS,
} from "@/shared/constants/scoringStrategyOptions";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Descriptions, Drawer, Flex, Tag, Typography } from "antd";
import type { AdmissionScoringStrategy } from "../types/scoring-strategy";
import { resolveReferenceLabel } from "../utils/resolveReferenceLabel";
import { ScoringStrategyMaxScores } from "./ScoringStrategyMaxScores";

export type ScoringStrategyDrawerProps = {
  strategy: AdmissionScoringStrategy | null;
  open: boolean;
  onClose: () => void;
  onEdit: (strategy: AdmissionScoringStrategy) => void;
  onDelete: (strategy: AdmissionScoringStrategy) => void;
};

export function ScoringStrategyDrawer({
  strategy,
  open,
  onClose,
  onEdit,
  onDelete,
}: ScoringStrategyDrawerProps) {
  const token = useToken();

  const scopeLabel = strategy ? getScopeLabel(strategy.scope) : "";

  // Get screening method details
  const screeningMethodDetails = SCREENING_METHOD_OPTIONS.find(
    (opt) => opt.value === strategy?.strategy.screening_method
  );

  // Format updated at
  const formatUpdatedAt = (updatedAt: string | null): string => {
    if (!updatedAt) return "Just created";
    return new Date(updatedAt).toLocaleString();
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={560}
      placement="right"
      title={
        strategy ? (
          <Flex vertical gap={4}>
            <Typography.Text strong style={{ fontSize: token.fontSizeLG }}>
              {scopeLabel} Scoring Strategy
            </Typography.Text>
            {strategy.referenceEntity && (
              <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                {strategy.referenceEntity.name}
              </Typography.Text>
            )}
          </Flex>
        ) : (
          "Scoring Strategy Details"
        )
      }
      footer={
        <Flex gap={8} justify="flex-end">
          <PermissionGuard permission={Permission.AdmissionScoringStrategiesUpdate}>
            <Button
              icon={<EditOutlined />}
              onClick={() => strategy && onEdit(strategy)}
              disabled={!strategy}
            >
              Edit
            </Button>
          </PermissionGuard>
          <PermissionGuard permission={Permission.AdmissionScoringStrategiesDelete}>
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => strategy && onDelete(strategy)}
              disabled={!strategy}
            >
              Delete
            </Button>
          </PermissionGuard>
        </Flex>
      }
      destroyOnHidden
    >
      {strategy && (
        <Flex vertical gap={24}>
          {/* Scope & Reference */}
          <Descriptions
            title="Scope & Reference"
            column={1}
            size="small"
            bordered
            styles={{ label: { width: 160 } }}
          >
            <Descriptions.Item label="Scope">
              <Tag color={SCOPE_TAG_COLORS[strategy.scope]}>
                {scopeLabel}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Reference">
              <Typography.Text>
                {resolveReferenceLabel(strategy)}
              </Typography.Text>
              {strategy.referenceEntity?.code && (
                <Typography.Text
                  type="secondary"
                  style={{ display: "block", fontSize: token.fontSizeSM, marginTop: 4 }}
                >
                  Code: {strategy.referenceEntity.code}
                </Typography.Text>
              )}
            </Descriptions.Item>
          </Descriptions>

          {/* Screening Method */}
          <Descriptions
            title="Screening Method"
            column={1}
            size="small"
            bordered
            styles={{ label: { width: 160 } }}
          >
            <Descriptions.Item label="Method">
              <Flex vertical gap={4}>
                <Typography.Text strong>{screeningMethodDetails?.label}</Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                  {screeningMethodDetails?.description}
                </Typography.Text>
              </Flex>
            </Descriptions.Item>
          </Descriptions>

          {/* Weight Distribution */}
          <Descriptions
            title="Weight Distribution"
            column={1}
            size="small"
            bordered
            styles={{ label: { width: 160 } }}
          >
            <Descriptions.Item label="JAMB Weight">
              <Typography.Text strong style={{ fontSize: token.fontSizeLG }}>
                {strategy.strategy.jamb_weight_percentage}%
              </Typography.Text>
            </Descriptions.Item>
            <Descriptions.Item label="School Weight">
              <Typography.Text strong style={{ fontSize: token.fontSizeLG }}>
                {strategy.strategy.school_weight_percentage}%
              </Typography.Text>
            </Descriptions.Item>
          </Descriptions>

          <ScoringStrategyMaxScores
            maxJambScore={strategy.strategy.max_jamb_score}
            maxSchoolScore={strategy.strategy.max_school_score}
            variant="expanded"
          />

          {/* Description */}
          {strategy.description && (
            <Descriptions
              title="Description"
              column={1}
              size="small"
              bordered
              styles={{ label: { width: 160 } }}
            >
              <Descriptions.Item label="Notes">
                <Typography.Text>{strategy.description}</Typography.Text>
              </Descriptions.Item>
            </Descriptions>
          )}

          {/* Metadata */}
          <Descriptions
            title="Metadata"
            column={1}
            size="small"
            bordered
            styles={{ label: { width: 160 } }}
          >
            <Descriptions.Item label="Last Updated">
              <Typography.Text type="secondary">
                {formatUpdatedAt(strategy.updatedAt)}
              </Typography.Text>
            </Descriptions.Item>
          </Descriptions>
        </Flex>
      )}
    </Drawer>
  );
}
