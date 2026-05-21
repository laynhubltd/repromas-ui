// Feature: grading-config
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import {
    DeleteOutlined,
    EditOutlined,
    TrophyOutlined,
} from "@ant-design/icons";
import { Button, Flex, Tag, Typography } from "antd";
import type { GradingSystem } from "../types/grading-system";

type GradingSystemCardProps = {
  system: GradingSystem;
  onEdit: (s: GradingSystem) => void;
  onDelete: (s: GradingSystem) => void;
};

const SCOPE_COLOR: Record<string, string> = {
  GLOBAL: "blue",
  FACULTY: "green",
  DEPARTMENT: "orange",
  PROGRAM: "purple",
};

export function GradingSystemCard({
  system,
  onEdit,
  onDelete,
}: GradingSystemCardProps) {
  const token = useToken();

  return (
    <div
      style={{
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadius,
        background: token.colorBgContainer,
        padding: "16px 20px",
      }}
    >
      <Flex align="flex-start" justify="space-between" gap={12}>
        {/* Left: info */}
        <Flex vertical gap={6} style={{ flex: 1, minWidth: 0 }}>
          {/* Name + scope tag */}
          <Flex align="center" gap={8} wrap="wrap">
            <TrophyOutlined
              style={{ color: token.colorPrimary, fontSize: token.fontSizeLG }}
            />
            <Typography.Text
              strong
              style={{ fontSize: token.fontSizeLG, lineHeight: 1.4 }}
            >
              {system.name}
            </Typography.Text>
            <Tag
              color={SCOPE_COLOR[system.scope] ?? "default"}
              style={{ margin: 0 }}
            >
              {system.scope}
            </Tag>
          </Flex>

          {/* GPA-based indicator */}
          <Flex align="center" gap={8} wrap="wrap">
            <ConditionalRenderer when={system.isGpaBased}>
              <Tag color="gold" style={{ margin: 0 }}>
                GPA-Based
              </Tag>
            </ConditionalRenderer>
            <ConditionalRenderer
              when={system.isGpaBased && system.maxCgpa !== null}
            >
              <Typography.Text
                type="secondary"
                style={{ fontSize: token.fontSizeSM }}
              >
                Max CGPA: <strong>{system.maxCgpa}</strong>
              </Typography.Text>
            </ConditionalRenderer>
            <ConditionalRenderer when={!system.isGpaBased}>
              <Tag style={{ margin: 0 }}>Non-GPA</Tag>
            </ConditionalRenderer>
          </Flex>

          {/* Reference entity name (non-GLOBAL only) */}
          <ConditionalRenderer
            when={system.scope !== "GLOBAL" && system.referenceEntity !== null}
          >
            <Typography.Text
              type="secondary"
              style={{ fontSize: token.fontSizeSM }}
            >
              <strong>Bearer:</strong> {system.referenceEntity?.name}
            </Typography.Text>
          </ConditionalRenderer>
          <ConditionalRenderer
            when={system.scope !== "GLOBAL" && system.referenceEntity === null}
          >
            <Typography.Text
              type="warning"
              style={{ fontSize: token.fontSizeSM }}
            >
              Referenced entity not found.
            </Typography.Text>
          </ConditionalRenderer>
        </Flex>

        {/* Right: actions */}
        <Flex align="center" gap={4} style={{ flexShrink: 0 }}>
          <PermissionGuard permission={Permission.GradingSchemaConfigsUpdate}>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined style={{ fontSize: 16 }} />}
              onClick={() => onEdit(system)}
              title="Edit"
            />
          </PermissionGuard>
          <PermissionGuard permission={Permission.GradingSchemaConfigsDelete}>
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined style={{ fontSize: 16 }} />}
              onClick={() => onDelete(system)}
              title="Delete"
            />
          </PermissionGuard>
        </Flex>
      </Flex>
    </div>
  );
}
