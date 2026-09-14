// Feature: settings/tabs/approval-workflows
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import {
  CheckCircleOutlined,
  EditOutlined,
  LockOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { Empty, Flex, Steps, Tag, Typography } from "antd";
import type { WorkflowStepConfigDto } from "../types/workflow-config";

type WorkflowPreviewLadderProps = {
  steps: WorkflowStepConfigDto[];
};

export function WorkflowPreviewLadder({ steps }: WorkflowPreviewLadderProps) {
  const token = useToken();
  const sortedSteps = [...steps].sort(
    (a, b) =>
      (a.sortOrder ?? a.sequenceOrder ?? 0) -
      (b.sortOrder ?? b.sequenceOrder ?? 0),
  );

  return (
    <div
      style={{
        padding: token.paddingMD,
        background: token.colorFillAlter,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,
      }}
    >
      <Typography.Title level={5} style={{ marginTop: 0, marginBottom: token.marginMD }}>
        Live Workflow Steps Preview
      </Typography.Title>

      <ConditionalRenderer when={sortedSteps.length > 0}>
        <Steps
          size="small"
          items={sortedSteps.map((s, idx) => ({
            title: (
              <Flex vertical gap={2}>
                <span style={{ fontWeight: 600, fontSize: token.fontSizeSM }}>
                  {s.label || s.name || s.stateCode || `Step #${s.id}`}
                </span>
                <Flex gap={4} wrap="wrap">
                  {s.isInitial && (
                    <Tag color="cyan" icon={<PlayCircleOutlined />}>
                      Initial
                    </Tag>
                  )}
                  {s.isTerminal && (
                    <Tag color="green" icon={<CheckCircleOutlined />}>
                      Terminal
                    </Tag>
                  )}
                  {s.isEditable ? (
                    <Tag color="purple" icon={<EditOutlined />}>
                      Editable
                    </Tag>
                  ) : (
                    <Tag icon={<LockOutlined />}>Locked</Tag>
                  )}
                </Flex>
              </Flex>
            ),
            status: s.isTerminal ? "finish" : idx === 0 ? "process" : "wait",
          }))}
        />
      </ConditionalRenderer>

      <ConditionalRenderer when={sortedSteps.length === 0}>
        <Empty description="No workflow steps configured yet." style={{ margin: `${token.marginMD}px 0` }} />
      </ConditionalRenderer>
    </div>
  );
}
