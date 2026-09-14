// Feature: approval-workflow
import { useToken } from "@/shared/hooks/useToken";
import { HistoryOutlined, LockOutlined } from "@ant-design/icons";
import { Button, Flex, Typography } from "antd";

type WorkflowLockBannerProps = {
  stepName?: string;
  onViewHistory?: () => void;
};

export function WorkflowLockBanner({
  stepName,
  onViewHistory,
}: WorkflowLockBannerProps) {
  const token = useToken();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: `${token.paddingXS}px ${token.paddingSM}px`,
        background: token.colorFillAlter,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadius,
        marginBottom: token.marginSM,
      }}
    >
      <Flex align="center" gap={token.marginXS}>
        <LockOutlined style={{ color: token.colorWarning }} />
        <Typography.Text style={{ fontSize: token.fontSizeSM }}>
          <strong>Score entry locked</strong>
          {stepName ? ` — currently at step "${stepName}".` : " — awaiting review."}
        </Typography.Text>
      </Flex>

      {onViewHistory && (
        <Button
          type="link"
          size="small"
          icon={<HistoryOutlined />}
          onClick={onViewHistory}
          style={{ padding: 0, height: "auto" }}
        >
          View history
        </Button>
      )}
    </div>
  );
}
