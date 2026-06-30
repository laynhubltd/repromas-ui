import {
  getLaneProfileLabel,
  getScopeLabel,
  getScreeningMethodLabel,
  LANE_TAG_COLORS,
  SCOPE_TAG_COLORS,
} from "@/shared/constants/scoringStrategyOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import {
  CalculatorOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { Button, Collapse, Dropdown, Flex, Tag, Typography } from "antd";
import type { CollapseProps, MenuProps } from "antd";
import type { MouseEvent } from "react";
import { useMemo } from "react";
import type { AdmissionScoringStrategy } from "../types/scoring-strategy";
import { resolveReferenceLabel } from "../utils/resolveReferenceLabel";
import {
  formatComponentsSummary,
  isMixedComponentMethod,
  locksJambToZero,
  resolveLaneProfileFromStrategy,
} from "../utils/scoringStrategyDisplay";
import { ScoringStrategyMaxScores } from "./ScoringStrategyMaxScores";

type ScoringStrategyCardProps = {
  strategy: AdmissionScoringStrategy;
  canEdit: boolean;
  canDelete: boolean;
  onView: (strategy: AdmissionScoringStrategy) => void;
  onEdit: (strategy: AdmissionScoringStrategy) => void;
  onDelete: (strategy: AdmissionScoringStrategy) => void;
};

function formatUpdatedAt(updatedAt: string | null): string {
  if (!updatedAt) return "Just created";
  return new Date(updatedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ScoringStrategyCard({
  strategy,
  canEdit,
  canDelete,
  onView,
  onEdit,
  onDelete,
}: ScoringStrategyCardProps) {
  const token = useToken();
  const method = strategy.strategy.screening_method;
  const laneProfile = resolveLaneProfileFromStrategy(strategy);
  const laneLabel = getLaneProfileLabel(laneProfile);
  const hideJamb = locksJambToZero(laneProfile, method);
  const componentsSummary = formatComponentsSummary(
    strategy.strategy.components,
  );
  const requiresJamb = strategy.strategy.requires_jamb ?? false;

  const referenceLabel = resolveReferenceLabel(strategy);

  const menuItems = useMemo<MenuProps["items"]>(() => {
    const items: MenuProps["items"] = [
      {
        key: "view",
        label: "View details",
        icon: <EyeOutlined />,
        onClick: () => onView(strategy),
      },
    ];

    if (canEdit) {
      items.push({
        key: "edit",
        label: "Edit",
        icon: <EditOutlined />,
        onClick: () => onEdit(strategy),
      });
    }

    if (canDelete) {
      items.push({ type: "divider" });
      items.push({
        key: "delete",
        label: "Delete",
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => onDelete(strategy),
      });
    }

    return items;
  }, [canDelete, canEdit, onDelete, onEdit, onView, strategy]);

  const handleActionsClick = (event: MouseEvent) => {
    event.stopPropagation();
  };

  const collapseItems: CollapseProps["items"] = [
    {
      key: String(strategy.id),
      label: (
        <Flex align="center" gap={8} wrap="wrap" style={{ minWidth: 0 }}>
          <CalculatorOutlined
            style={{ color: token.colorPrimary, fontSize: token.fontSizeLG }}
          />
          <Tag color={SCOPE_TAG_COLORS[strategy.scope]} style={{ margin: 0 }}>
            {getScopeLabel(strategy.scope)}
          </Tag>
          <Typography.Text
            strong
            style={{ fontSize: token.fontSizeLG, lineHeight: 1.4 }}
            ellipsis={{ tooltip: referenceLabel }}
          >
            {referenceLabel}
          </Typography.Text>
          <Tag color={LANE_TAG_COLORS[laneProfile]} style={{ margin: 0 }}>
            {laneLabel}
          </Tag>
          <Tag style={{ margin: 0 }}>
            {getScreeningMethodLabel(method)}
          </Tag>
          <ConditionalRenderer when={requiresJamb}>
            <Tag color="blue" style={{ margin: 0 }}>
              JAMB {strategy.strategy.jamb_weight_percentage}%
            </Tag>
          </ConditionalRenderer>
          <ConditionalRenderer when={!isMixedComponentMethod(method)}>
            <Tag color="purple" style={{ margin: 0 }}>
              School {strategy.strategy.school_weight_percentage}%
            </Tag>
          </ConditionalRenderer>
          <ConditionalRenderer when={Boolean(componentsSummary)}>
            <Tag color="geekblue" style={{ margin: 0 }}>
              {componentsSummary}
            </Tag>
          </ConditionalRenderer>
        </Flex>
      ),
      extra: (
        <Dropdown
          menu={{ items: menuItems }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Button
            type="text"
            size="small"
            icon={<MoreOutlined />}
            title="Actions"
            onClick={handleActionsClick}
          />
        </Dropdown>
      ),
      children: (
        <Flex vertical gap={12}>
          <ConditionalRenderer when={Boolean(strategy.description)}>
            <Typography.Text
              type="secondary"
              style={{ fontSize: token.fontSizeSM }}
            >
              {strategy.description}
            </Typography.Text>
          </ConditionalRenderer>

          <ScoringStrategyMaxScores
            maxJambScore={strategy.strategy.max_jamb_score}
            maxSchoolScore={strategy.strategy.max_school_score}
            variant="compact"
            hideJamb={hideJamb}
          />

          <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            Updated {formatUpdatedAt(strategy.updatedAt)}
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
