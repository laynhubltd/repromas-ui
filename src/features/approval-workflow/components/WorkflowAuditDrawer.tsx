// Feature: approval-workflow
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { Drawer, Empty, Flex, Tag, Timeline, Typography } from "antd";
import { useWorkflowAudit } from "../hooks/useWorkflowAudit";
import type { WorkflowTargetEntity } from "../types/approval-workflow";

type WorkflowAuditDrawerProps = {
  open: boolean;
  targetEntity: WorkflowTargetEntity;
  targetId: number;
  onClose: () => void;
};

export function WorkflowAuditDrawer({
  open,
  targetEntity,
  targetId,
  onClose,
}: WorkflowAuditDrawerProps) {
  const token = useToken();
  const { state } = useWorkflowAudit({ targetEntity, targetId, open });
  const { history, isLoading } = state;

  const hasHistory = history.length > 0;

  return (
    <Drawer
      title={
        <Flex align="center" gap={token.marginXS}>
          <HistoryOutlined style={{ color: token.colorPrimary }} />
          <span>Workflow Audit History</span>
        </Flex>
      }
      open={open}
      onClose={onClose}
      width={480}
      destroyOnHidden
    >
      <DataLoader loading={isLoading} loader={<SkeletonRows count={4} />}>
        <ConditionalRenderer when={hasHistory}>
          <Timeline
            style={{ marginTop: token.marginMD }}
            items={history.map((entry) => {
              const actionTitle = entry.actionName || entry.action || "Workflow Action";
              const actorDisplay = entry.actorUserName || entry.actingUserName || (entry.actorUserId ? `User #${entry.actorUserId}` : "User");
              const fromState = entry.fromState || entry.fromStepName || "—";
              const toState = entry.toState || entry.toStepName || "—";

              return {
                icon: <CheckCircleOutlined style={{ color: token.colorPrimary }} />,
                content: (
                  <div
                    style={{
                      padding: token.paddingSM,
                      background: token.colorFillAlter,
                      border: `1px solid ${token.colorBorderSecondary}`,
                      borderRadius: token.borderRadius,
                      marginBottom: token.marginSM,
                    }}
                  >
                    <Flex justify="space-between" align="center" style={{ marginBottom: 4 }}>
                      <Typography.Text strong style={{ fontSize: token.fontSize }}>
                        {actionTitle}
                      </Typography.Text>
                      <Flex align="center" gap={4}>
                        <ClockCircleOutlined style={{ fontSize: 11, color: token.colorTextTertiary }} />
                        <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                          {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : ""}
                        </Typography.Text>
                      </Flex>
                    </Flex>

                    <Flex align="center" gap={6} style={{ marginBottom: 6, flexWrap: "wrap" }}>
                      <Tag color="blue">{entry.actingRoleName || "Staff"}</Tag>
                      <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                        {actorDisplay}
                      </Typography.Text>
                    </Flex>

                    <Flex align="center" gap={6} style={{ marginBottom: 6 }}>
                      <Tag>{fromState}</Tag>
                      <ArrowRightOutlined style={{ fontSize: 11, color: token.colorTextTertiary }} />
                      <Tag color="green">{toState}</Tag>
                    </Flex>

                    <ConditionalRenderer when={Boolean(entry.comment)}>
                      <div
                        style={{
                          marginTop: 6,
                          padding: `${token.paddingXXS}px ${token.paddingXS}px`,
                          background: token.colorBgContainer,
                          borderLeft: `3px solid ${token.colorPrimary}`,
                          borderRadius: token.borderRadiusXS,
                          fontSize: token.fontSizeSM,
                          color: token.colorTextSecondary,
                          fontStyle: "italic",
                        }}
                      >
                        "{entry.comment}"
                      </div>
                    </ConditionalRenderer>
                  </div>
                ),
              };
            })}
          />
        </ConditionalRenderer>

        <ConditionalRenderer when={!hasHistory && !isLoading}>
          <Empty description="No workflow actions recorded yet." style={{ marginTop: token.marginXL }} />
        </ConditionalRenderer>
      </DataLoader>
    </Drawer>
  );
}
