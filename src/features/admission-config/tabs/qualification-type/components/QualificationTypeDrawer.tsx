import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import {
  ASSESSMENT_FORMAT_OPTIONS,
  ASSESSMENT_FORMAT_TAG_COLORS,
  getAssessmentFormatLabel,
} from "@/shared/constants/priorQualificationTypeOptions";
import { useToken } from "@/shared/hooks/useToken";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  Descriptions,
  Drawer,
  Flex,
  List,
  Tag,
  Typography,
} from "antd";
import type { PriorQualificationType } from "../types/prior-qualification-type";
import { formatScaleSummary } from "../utils/formatScaleSummary";
import {
  formatCreatedAt,
  formatQualificationTypeSubtitle,
  formatQualificationTypeTitle,
  getClassificationScaleDetail,
} from "../utils/qualificationTypeDisplay";

export type QualificationTypeDrawerProps = {
  type: PriorQualificationType | null;
  open: boolean;
  onClose: () => void;
  onEdit: (type: PriorQualificationType) => void;
  onDelete: (type: PriorQualificationType) => void;
};

export function QualificationTypeDrawer({
  type,
  open,
  onClose,
  onEdit,
  onDelete,
}: QualificationTypeDrawerProps) {
  const token = useToken();

  const formatDetails = type
    ? ASSESSMENT_FORMAT_OPTIONS.find((option) => option.value === type.assessmentFormat)
    : undefined;

  const classificationDetail = type
    ? getClassificationScaleDetail(type.scaleDefinition)
    : null;

  const scale = type?.scaleDefinition;
  const showPointsScale = type?.assessmentFormat === "POINTS";
  const showCgpaScale = type?.assessmentFormat === "CGPA";
  const showPassFailScale = type?.assessmentFormat === "PASS_FAIL";

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={560}
      placement="right"
      title={
        type ? (
          <Flex vertical gap={4}>
            <Typography.Text strong style={{ fontSize: token.fontSizeLG }}>
              {formatQualificationTypeTitle(type)}
            </Typography.Text>
            <Typography.Text code style={{ fontSize: token.fontSizeSM }}>
              {formatQualificationTypeSubtitle(type)}
            </Typography.Text>
          </Flex>
        ) : (
          "Qualification Type Details"
        )
      }
      footer={
        <Flex gap={8} justify="flex-end">
          <PermissionGuard permission={Permission.AdmissionPriorQualificationTypesUpdate}>
            <Button
              icon={<EditOutlined />}
              onClick={() => type && onEdit(type)}
              disabled={!type}
            >
              Edit
            </Button>
          </PermissionGuard>
          <PermissionGuard permission={Permission.AdmissionPriorQualificationTypesDelete}>
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => type && onDelete(type)}
              disabled={!type}
            >
              Delete
            </Button>
          </PermissionGuard>
        </Flex>
      }
      destroyOnHidden
    >
      {type && (
        <Flex vertical gap={24}>
          <Descriptions
            title="Identity"
            column={1}
            size="small"
            bordered
            styles={{ label: { width: 160 } }}
          >
            <Descriptions.Item label="Code">
              <Typography.Text code>{type.code}</Typography.Text>
            </Descriptions.Item>
            <Descriptions.Item label="Name">
              <Typography.Text>{type.name}</Typography.Text>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {type.isActive ? (
                <Tag color="success">Active</Tag>
              ) : (
                <Tag color="default">Inactive</Tag>
              )}
            </Descriptions.Item>
          </Descriptions>

          <Descriptions
            title="Assessment"
            column={1}
            size="small"
            bordered
            styles={{ label: { width: 160 } }}
          >
            <Descriptions.Item label="Format">
              <Flex vertical gap={4}>
                <Tag color={ASSESSMENT_FORMAT_TAG_COLORS[type.assessmentFormat]}>
                  {getAssessmentFormatLabel(type.assessmentFormat)}
                </Tag>
                {formatDetails?.description && (
                  <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                    {formatDetails.description}
                  </Typography.Text>
                )}
              </Flex>
            </Descriptions.Item>
            <Descriptions.Item label="Scale summary">
              <Typography.Text>{formatScaleSummary(type)}</Typography.Text>
            </Descriptions.Item>
          </Descriptions>

          <Flex vertical gap={8}>
            <Typography.Text strong>Scale definition</Typography.Text>

            {showPointsScale && (
              <Descriptions column={1} size="small" bordered styles={{ label: { width: 160 } }}>
                <Descriptions.Item label="Maximum points">
                  <Typography.Text strong>
                    {(scale as { maxPoints?: number })?.maxPoints ?? "—"}
                  </Typography.Text>
                </Descriptions.Item>
              </Descriptions>
            )}

            {type.assessmentFormat === "CLASSIFICATION" && classificationDetail && (
              <Flex vertical gap={8}>
                <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                  {classificationDetail.label}
                </Typography.Text>
                <List
                  size="small"
                  bordered
                  dataSource={classificationDetail.items}
                  renderItem={(item, index) => (
                    <List.Item>
                      <Flex gap={12} align="center" style={{ width: "100%" }}>
                        <Typography.Text type="secondary" style={{ width: 24 }}>
                          {index + 1}.
                        </Typography.Text>
                        <Typography.Text code>{item}</Typography.Text>
                        {index === 0 && <Tag color="gold">Best</Tag>}
                      </Flex>
                    </List.Item>
                  )}
                />
              </Flex>
            )}

            {type.assessmentFormat === "CLASSIFICATION" && !classificationDetail && (
              <Typography.Text type="secondary">No scale entries configured.</Typography.Text>
            )}

            {showCgpaScale && (
              <Descriptions column={1} size="small" bordered styles={{ label: { width: 160 } }}>
                <Descriptions.Item label="Minimum">
                  <Typography.Text>{(scale as { min?: number })?.min ?? "—"}</Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item label="Maximum">
                  <Typography.Text strong>
                    {(scale as { max?: number })?.max ?? "—"}
                  </Typography.Text>
                </Descriptions.Item>
              </Descriptions>
            )}

            {showPassFailScale && (
              <Flex gap={8}>
                <Tag>PASS</Tag>
                <Tag>FAIL</Tag>
              </Flex>
            )}
          </Flex>

          {!type.isActive && (
            <Alert
              type="info"
              showIcon
              message="Inactive type"
              description="This type is hidden from form option resolvers but remains available in historical candidate data."
            />
          )}

          <Descriptions
            title="Metadata"
            column={1}
            size="small"
            bordered
            styles={{ label: { width: 160 } }}
          >
            <Descriptions.Item label="ID">
              <Typography.Text type="secondary">{type.id}</Typography.Text>
            </Descriptions.Item>
            <Descriptions.Item label="Created">
              <Typography.Text type="secondary">
                {formatCreatedAt(type.createdAt)}
              </Typography.Text>
            </Descriptions.Item>
          </Descriptions>
        </Flex>
      )}
    </Drawer>
  );
}
