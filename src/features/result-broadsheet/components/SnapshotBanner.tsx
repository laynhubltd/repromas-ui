// Feature: result-broadsheet
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import {
  CheckCircleFilled,
  EyeOutlined,
  FileProtectOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Button, Flex, Tag, Typography } from "antd";
import type { BroadsheetSourceModel } from "../types/result-broadsheet";

type SnapshotBannerProps = {
  sourceModel: BroadsheetSourceModel;
  onToggleMode: () => void;
};

export function SnapshotBanner({
  sourceModel,
  onToggleMode,
}: SnapshotBannerProps) {
  const token = useToken();
  const isSnapshot = sourceModel.source === "SNAPSHOT";
  const isPublished = Boolean(sourceModel.isPublished);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: `${token.paddingXS}px ${token.paddingSM}px`,
        background: isSnapshot ? token.colorFillAlter : token.colorWarningBg,
        border: `1px solid ${isSnapshot ? token.colorBorderSecondary : token.colorWarningBorder}`,
        borderRadius: token.borderRadiusLG,
        marginBottom: token.marginMD,
      }}
    >
      <Flex align="center" gap={token.marginSM} wrap="wrap">
        {isSnapshot ? (
          <FileProtectOutlined style={{ color: token.colorPrimary, fontSize: token.fontSizeLG }} />
        ) : (
          <WarningOutlined style={{ color: token.colorWarning, fontSize: token.fontSizeLG }} />
        )}

        <Typography.Text style={{ fontSize: token.fontSizeSM }}>
          {isSnapshot ? (
            <span>
              <strong>Viewing Official Frozen Snapshot</strong>
              {" — submitted on "}
              {new Date(sourceModel.frozenAt).toLocaleDateString()} at{" "}
              {new Date(sourceModel.frozenAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
              .
            </span>
          ) : (
            <span>
              <strong>Viewing Live Draft Data</strong> — grades and standing calculations may still be in progress.
            </span>
          )}
        </Typography.Text>

        <ConditionalRenderer when={isPublished}>
          <Tag color="green" icon={<CheckCircleFilled />}>
            PUBLISHED
          </Tag>
        </ConditionalRenderer>
      </Flex>

      <Button
        type="link"
        size="small"
        icon={<EyeOutlined />}
        onClick={onToggleMode}
        style={{ padding: 0, height: "auto", fontSize: token.fontSizeSM }}
      >
        {isSnapshot ? "View live draft data" : "Switch to frozen snapshot"}
      </Button>
    </div>
  );
}
