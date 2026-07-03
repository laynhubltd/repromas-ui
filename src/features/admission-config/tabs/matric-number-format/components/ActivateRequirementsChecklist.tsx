import type { ActivationBlocker } from "../utils/templateTokenHelpers";
import { useToken } from "@/shared/hooks/useToken";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { Flex, Typography } from "antd";

type ActivateRequirementsChecklistProps = {
  blockers: ActivationBlocker[];
};

export function ActivateRequirementsChecklist({
  blockers,
}: ActivateRequirementsChecklistProps) {
  const token = useToken();
  const unmet = blockers.filter((b) => !b.met);

  if (unmet.length === 0) return null;

  return (
    <Flex
      vertical
      gap={6}
      style={{
        padding: token.paddingSM,
        background: token.colorBgLayout,
        borderRadius: token.borderRadius,
        border: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <Typography.Text strong style={{ fontSize: token.fontSizeSM }}>
        Before you can activate:
      </Typography.Text>
      {blockers.map((blocker) => (
        <Flex key={blocker.key} align="flex-start" gap={8}>
          {blocker.met ? (
            <CheckCircleOutlined style={{ color: token.colorSuccess, marginTop: 2 }} />
          ) : (
            <CloseCircleOutlined style={{ color: token.colorError, marginTop: 2 }} />
          )}
          <Typography.Text
            style={{
              fontSize: token.fontSizeSM,
              color: blocker.met ? token.colorTextSecondary : token.colorText,
            }}
          >
            {blocker.label}
          </Typography.Text>
        </Flex>
      ))}
    </Flex>
  );
}
