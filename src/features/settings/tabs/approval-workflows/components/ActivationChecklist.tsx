// Feature: settings/tabs/approval-workflows
import { useToken } from "@/shared/hooks/useToken";
import {
  CloseCircleFilled,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import { Alert, Button, Flex, List, Typography } from "antd";
import type { WorkflowActivationViolation } from "../types/workflow-config";

type ActivationChecklistProps = {
  violations: WorkflowActivationViolation[];
  onDismiss: () => void;
};

export function ActivationChecklist({
  violations,
  onDismiss,
}: ActivationChecklistProps) {
  const token = useToken();

  if (violations.length === 0) return null;

  return (
    <Alert
      type="error"
      showIcon
      icon={<ExclamationCircleFilled />}
      style={{
        borderRadius: token.borderRadiusLG,
        marginBottom: token.marginMD,
      }}
      message={
        <Flex justify="space-between" align="center">
          <Typography.Text strong style={{ fontSize: token.fontSize }}>
            Workflow Activation Blocked ({violations.length}{" "}
            {violations.length === 1 ? "requirement" : "requirements"} unfulfilled)
          </Typography.Text>
          <Button size="small" type="text" onClick={onDismiss}>
            Dismiss
          </Button>
        </Flex>
      }
      description={
        <div style={{ marginTop: token.marginSM }}>
          <Typography.Paragraph type="secondary" style={{ marginBottom: token.marginSM }}>
            The following structural rules must be satisfied before this workflow can be activated for live score sheets and broadsheets:
          </Typography.Paragraph>

          <List
            size="small"
            dataSource={violations}
            renderItem={(v) => (
              <List.Item style={{ padding: "6px 0", borderBottom: "none" }}>
                <Flex align="flex-start" gap={token.marginXS}>
                  <CloseCircleFilled style={{ color: token.colorError, marginTop: 3 }} />
                  <Flex vertical gap={2}>
                    <Typography.Text strong style={{ fontSize: token.fontSizeSM }}>
                      {v.message}
                    </Typography.Text>
                    {v.code && (
                      <Typography.Text type="secondary" style={{ fontSize: 11, fontFamily: "monospace" }}>
                        Rule: {v.code}
                      </Typography.Text>
                    )}
                  </Flex>
                </Flex>
              </List.Item>
            )}
          />
        </div>
      }
    />
  );
}
