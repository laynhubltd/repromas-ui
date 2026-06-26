import { useToken } from "@/shared/hooks/useToken";
import { GATEWAY_CONFIG_UI_COPY } from "@/shared/constants/gatewayConfigOptions";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { CheckCircleOutlined, WarningOutlined } from "@ant-design/icons";
import { Badge, Flex, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo } from "react";
import type { CoverageMatrixRow } from "../utils/buildCoverageMatrix";

type GatewayCoverageMatrixProps = {
  rows: CoverageMatrixRow[];
};

export function GatewayCoverageMatrix({ rows }: GatewayCoverageMatrixProps) {
  const token = useToken();

  const columns = useMemo<ColumnsType<CoverageMatrixRow>>(
    () => [
      {
        title: "Scope",
        dataIndex: "scopeLabel",
        key: "scopeLabel",
        ellipsis: true,
        render: (label: string, record) => (
          <Flex align="center" gap={8}>
            <ConditionalRenderer when={record.isGlobal}>
              <Badge
                count="Global"
                style={{
                  backgroundColor: token.colorPrimary,
                  fontSize: token.fontSizeSM,
                }}
              />
            </ConditionalRenderer>
            <Typography.Text ellipsis={{ tooltip: label }}>{label}</Typography.Text>
          </Flex>
        ),
      },
      {
        title: "Active provider",
        dataIndex: "activeProvider",
        key: "activeProvider",
        width: 200,
        render: (provider: string | null) =>
          provider ? (
            <Flex align="center" gap={6}>
              <CheckCircleOutlined style={{ color: token.colorPrimary }} />
              <Typography.Text>{provider}</Typography.Text>
            </Flex>
          ) : (
            <Flex align="center" gap={6}>
              <WarningOutlined style={{ color: token.colorError }} />
              <Typography.Text type="danger">No coverage</Typography.Text>
            </Flex>
          ),
      },
      {
        title: "Status",
        key: "status",
        width: 120,
        render: (_: unknown, record) =>
          record.hasGap ? (
            <Badge status="error" text="Gap" />
          ) : (
            <Badge status="success" text="Covered" />
          ),
      },
    ],
    [token.colorError, token.colorPrimary, token.fontSizeSM],
  );

  return (
    <Flex vertical gap={8}>
      <Typography.Title level={5} style={{ margin: 0 }}>
        {GATEWAY_CONFIG_UI_COPY.coverageMatrixTitle}
      </Typography.Title>
      <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
        {GATEWAY_CONFIG_UI_COPY.coverageMatrixHint}
      </Typography.Text>
      <Table<CoverageMatrixRow>
        rowKey="key"
        dataSource={rows}
        columns={columns}
        size="small"
        pagination={false}
        scroll={{ x: 480 }}
      />
    </Flex>
  );
}
