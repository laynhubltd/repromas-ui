// Feature: admission-config — Scoring Strategy Drawer
// View complete information about a scoring strategy

import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import {
  ALL_SCREENING_METHOD_OPTIONS,
  getComponentTypeLabel,
  getLaneProfileLabel,
  getScopeLabel,
  LANE_TAG_COLORS,
  PRIOR_QUAL_STUB_WARNING,
  SCOPE_TAG_COLORS,
} from "@/shared/constants/scoringStrategyOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  Descriptions,
  Drawer,
  Flex,
  Table,
  Tag,
  Typography,
} from "antd";
import type {
  AdmissionScoringStrategy,
  ScoringComponentType,
} from "../types/scoring-strategy";
import { resolveReferenceLabel } from "../utils/resolveReferenceLabel";
import {
  locksJambToZero,
  methodIncludesPriorQual,
  resolveLaneProfileFromStrategy,
} from "../utils/scoringStrategyDisplay";
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
  const method = strategy?.strategy.screening_method;
  const laneProfile = strategy
    ? resolveLaneProfileFromStrategy(strategy)
    : null;
  const screeningMethodDetails = ALL_SCREENING_METHOD_OPTIONS.find(
    (opt) => opt.value === method,
  );
  const hideJamb =
    laneProfile && method ? locksJambToZero(laneProfile, method) : false;
  const requiresJamb = strategy?.strategy.requires_jamb ?? false;
  const components = strategy?.strategy.components ?? [];

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
      {strategy && method && (
        <Flex vertical gap={24}>
          <Descriptions
            title="Scope & Reference"
            column={1}
            size="small"
            bordered
            styles={{ label: { width: 160 } }}
          >
            <Descriptions.Item label="Scope">
              <Tag color={SCOPE_TAG_COLORS[strategy.scope]}>{scopeLabel}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Reference">
              <Typography.Text>{resolveReferenceLabel(strategy)}</Typography.Text>
              {strategy.referenceEntity?.code && (
                <Typography.Text
                  type="secondary"
                  style={{
                    display: "block",
                    fontSize: token.fontSizeSM,
                    marginTop: 4,
                  }}
                >
                  Code: {strategy.referenceEntity.code}
                </Typography.Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Lane">
              {laneProfile && (
                <Tag color={LANE_TAG_COLORS[laneProfile]}>
                  {getLaneProfileLabel(laneProfile)}
                </Tag>
              )}
            </Descriptions.Item>
          </Descriptions>

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
            <Descriptions.Item label="Requires JAMB">
              <Typography.Text>{requiresJamb ? "Yes" : "No"}</Typography.Text>
            </Descriptions.Item>
          </Descriptions>

          <ConditionalRenderer when={methodIncludesPriorQual(method)}>
            <Alert type="warning" message={PRIOR_QUAL_STUB_WARNING} showIcon />
          </ConditionalRenderer>

          <Descriptions
            title="Weight Distribution"
            column={1}
            size="small"
            bordered
            styles={{ label: { width: 160 } }}
          >
            <Descriptions.Item label="JAMB Weight">
              <Typography.Text strong style={{ fontSize: token.fontSizeLG }}>
                {hideJamb ? "—" : `${strategy.strategy.jamb_weight_percentage}%`}
              </Typography.Text>
            </Descriptions.Item>
            <Descriptions.Item label="School Weight">
              <Typography.Text strong style={{ fontSize: token.fontSizeLG }}>
                {strategy.strategy.school_weight_percentage}%
              </Typography.Text>
            </Descriptions.Item>
          </Descriptions>

          <ConditionalRenderer when={components.length > 0}>
            <Flex vertical gap={8}>
              <Typography.Text strong>Components</Typography.Text>
              <Table
                size="small"
                pagination={false}
                rowKey="type"
                dataSource={components}
                columns={[
                  {
                    title: "Component",
                    dataIndex: "type",
                    render: (type: ScoringComponentType) =>
                      getComponentTypeLabel(type),
                  },
                  {
                    title: "Weight",
                    dataIndex: "weight_percentage",
                    render: (weight: number) => `${weight}%`,
                  },
                ]}
              />
            </Flex>
          </ConditionalRenderer>

          <ScoringStrategyMaxScores
            maxJambScore={strategy.strategy.max_jamb_score}
            maxSchoolScore={strategy.strategy.max_school_score}
            variant="expanded"
            hideJamb={hideJamb}
          />

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
