import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Descriptions, Drawer, Flex, Tag, Typography } from "antd";
import type { ProgramAdmissionConfig } from "../types/program-admission-config";
import { OlevelSubjectLabel } from "./OlevelSubjectLabel";
import {
  formatCreatedAt,
  formatCutoffSummary,
  formatGatePlainSummary,
  formatJambFloor,
  formatQuotaSummary,
} from "../utils/configDisplay";
import { computeQuotaSeats } from "../utils/seatMath";

export type ProgramAdmissionConfigDrawerProps = {
  config: ProgramAdmissionConfig | null;
  open: boolean;
  onClose: () => void;
  onEdit: (config: ProgramAdmissionConfig) => void;
  onDelete: (config: ProgramAdmissionConfig) => void;
};

export function ProgramAdmissionConfigDrawer({
  config,
  open,
  onClose,
  onEdit,
  onDelete,
}: ProgramAdmissionConfigDrawerProps) {
  const token = useToken();
  const seats = config ? computeQuotaSeats(config) : null;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={560}
      placement="right"
      title={
        config ? (
          <Flex vertical gap={4}>
            <Typography.Text strong style={{ fontSize: token.fontSizeLG }}>
              {config.program?.name ?? "Unknown program"}
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              {config.program?.department?.name ?? "Department not loaded"}
              {config.program?.department?.faculty?.name
                ? ` · ${config.program.department.faculty.name}`
                : ""}
            </Typography.Text>
          </Flex>
        ) : (
          "Admission Config Details"
        )
      }
      footer={
        <Flex gap={8} justify="flex-end">
          <PermissionGuard permission={Permission.AdmissionProgramAdmissionConfigsUpdate}>
            <Button
              icon={<EditOutlined />}
              onClick={() => config && onEdit(config)}
              disabled={!config}
            >
              Edit
            </Button>
          </PermissionGuard>
          <PermissionGuard permission={Permission.AdmissionProgramAdmissionConfigsDelete}>
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => config && onDelete(config)}
              disabled={!config}
            >
              Delete
            </Button>
          </PermissionGuard>
        </Flex>
      }
    >
      {config && seats && (
        <Flex vertical gap={token.marginLG}>
          <Descriptions bordered size="small" column={1} title="Capacity & quota">
            <Descriptions.Item label="Total capacity">
              {config.totalCapacity}
            </Descriptions.Item>
            <Descriptions.Item label="Quota split">
              {formatQuotaSummary(config)}
            </Descriptions.Item>
            <Descriptions.Item label="Merit slots">
              {config.meritSeatsUsed} used / {seats.meritAvailable} available (
              {seats.meritAllocated} allocated)
            </Descriptions.Item>
            <Descriptions.Item label="Catchment slots">
              {config.catchmentSeatsUsed} used / {seats.catchmentAvailable} available (
              {seats.catchmentAllocated} allocated)
            </Descriptions.Item>
            <Descriptions.Item label="ELDS slots">
              {config.eldsSeatsUsed} used / {seats.eldsAvailable} available (
              {seats.eldsAllocated} allocated)
            </Descriptions.Item>
          </Descriptions>

          <Descriptions bordered size="small" column={1} title="Cut-offs">
            <Descriptions.Item label="Thresholds">
              {formatCutoffSummary(config)}
            </Descriptions.Item>
            <Descriptions.Item label="Note">
              Post-scoring aggregate minimums (Merit ≥ Catchment ≥ ELDS).
            </Descriptions.Item>
          </Descriptions>

          <Descriptions bordered size="small" column={1} title="O-Level credit gate">
            <Descriptions.Item label="Summary">
              {formatGatePlainSummary(config)}
            </Descriptions.Item>
            <Descriptions.Item label="Minimum credits">
              {config.minimumOlevelCredits}
            </Descriptions.Item>
            <Descriptions.Item label="Max sittings">
              {config.maxOlevelSittings}
            </Descriptions.Item>
            <Descriptions.Item label="English required">
              <Tag color={config.requireOlevelEnglish ? "blue" : "default"}>
                {config.requireOlevelEnglish ? "Yes" : "No"}
              </Tag>
            </Descriptions.Item>
            {config.requireOlevelEnglish && (
              <Descriptions.Item label="English subject">
                <OlevelSubjectLabel subjectId={config.englishSubjectId} />
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Mathematics required">
              <Tag color={config.requireOlevelMathematics ? "blue" : "default"}>
                {config.requireOlevelMathematics ? "Yes" : "No"}
              </Tag>
            </Descriptions.Item>
            {config.requireOlevelMathematics && (
              <Descriptions.Item label="Mathematics subject">
                <OlevelSubjectLabel subjectId={config.mathematicsSubjectId} />
              </Descriptions.Item>
            )}
          </Descriptions>

          <Descriptions bordered size="small" column={1} title="UTME floor">
            <Descriptions.Item label="Minimum JAMB score">
              {formatJambFloor(config)}
            </Descriptions.Item>
          </Descriptions>

          <Descriptions bordered size="small" column={1} title="Metadata">
            <Descriptions.Item label="ID">{config.id}</Descriptions.Item>
            <Descriptions.Item label="Created">
              {formatCreatedAt(config.createdAt)}
            </Descriptions.Item>
          </Descriptions>
        </Flex>
      )}
    </Drawer>
  );
}
