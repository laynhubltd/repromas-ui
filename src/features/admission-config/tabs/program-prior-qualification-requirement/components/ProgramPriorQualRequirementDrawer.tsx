import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import {
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
  Tag,
  Typography,
} from "antd";
import type { ProgramPriorQualificationRequirement } from "../types/program-prior-qualification-requirement";
import { formatScaleSummary } from "@/features/admission-config/tabs/qualification-type/utils/formatScaleSummary";
import { formatCreatedAt, formatThresholdSummary } from "../utils/requirementDisplay";
import {
  getAlternativeSetLabel,
  getIntentDisplayLabel,
  intentFromRequirement,
} from "../utils/requirementRuleIntent";

export type ProgramPriorQualRequirementDrawerProps = {
  requirement: ProgramPriorQualificationRequirement | null;
  open: boolean;
  onClose: () => void;
  onEdit: (requirement: ProgramPriorQualificationRequirement) => void;
  onDelete: (requirement: ProgramPriorQualificationRequirement) => void;
};

export function ProgramPriorQualRequirementDrawer({
  requirement,
  open,
  onClose,
  onEdit,
  onDelete,
}: ProgramPriorQualRequirementDrawerProps) {
  const token = useToken();
  const type = requirement?.priorQualificationType;
  const program = requirement?.program;
  const department = program?.department;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={560}
      placement="right"
      title={
        requirement ? (
          <Flex vertical gap={4}>
            <Typography.Text strong style={{ fontSize: token.fontSizeLG }}>
              {type?.code ?? "Prior Qual Requirement"}
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              {program?.name}
            </Typography.Text>
          </Flex>
        ) : (
          "Prior Qual Requirement Details"
        )
      }
      footer={
        <Flex gap={8} justify="flex-end">
          <PermissionGuard
            permission={Permission.AdmissionProgramPriorQualificationRequirementsUpdate}
          >
            <Button
              icon={<EditOutlined />}
              onClick={() => requirement && onEdit(requirement)}
              disabled={!requirement}
            >
              Edit
            </Button>
          </PermissionGuard>
          <PermissionGuard
            permission={Permission.AdmissionProgramPriorQualificationRequirementsDelete}
          >
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => requirement && onDelete(requirement)}
              disabled={!requirement}
            >
              Delete
            </Button>
          </PermissionGuard>
        </Flex>
      }
      destroyOnHidden
    >
      {requirement && (
        <Flex vertical gap={24}>
          <Descriptions title="Program" column={1} size="small" bordered>
            <Descriptions.Item label="Program">
              {program?.name ?? `#${requirement.programId}`}
            </Descriptions.Item>
            {department?.name && (
              <Descriptions.Item label="Department">{department.name}</Descriptions.Item>
            )}
            {department?.faculty?.name && (
              <Descriptions.Item label="Faculty">{department.faculty.name}</Descriptions.Item>
            )}
          </Descriptions>

          {type && (
            <Descriptions title="Qualification type" column={1} size="small" bordered>
              <Descriptions.Item label="Code">
                <Typography.Text code>{type.code}</Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label="Name">{type.name}</Descriptions.Item>
              <Descriptions.Item label="Format">
                <Tag color={ASSESSMENT_FORMAT_TAG_COLORS[type.assessmentFormat]}>
                  {getAssessmentFormatLabel(type.assessmentFormat)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Scale">
                {formatScaleSummary(type)}
              </Descriptions.Item>
            </Descriptions>
          )}

          <Descriptions title="Rule type" column={1} size="small" bordered>
            <Descriptions.Item label="How it applies">
              {getIntentDisplayLabel(intentFromRequirement(requirement))}
            </Descriptions.Item>
            {requirement.requirementGroup && (
              <Descriptions.Item label="Pick-one group">
                {getAlternativeSetLabel(requirement.requirementGroup)}
              </Descriptions.Item>
            )}
          </Descriptions>

          <Descriptions title="Threshold" column={1} size="small" bordered>
            <Descriptions.Item label="Summary">
              {formatThresholdSummary(requirement)}
            </Descriptions.Item>
            {requirement.minimumPoints != null && (
              <Descriptions.Item label="Minimum points">
                {requirement.minimumPoints}
              </Descriptions.Item>
            )}
            {requirement.minimumClass && (
              <Descriptions.Item label="Minimum class">
                <Typography.Text code>{requirement.minimumClass}</Typography.Text>
              </Descriptions.Item>
            )}
            {requirement.minimumClassRank != null && (
              <Descriptions.Item label="Minimum class rank">
                {requirement.minimumClassRank}
              </Descriptions.Item>
            )}
          </Descriptions>

          <Descriptions title="Offer context" column={1} size="small" bordered>
            <Descriptions.Item label="Entry level">
              {requirement.entryLevel?.name ?? "Not set"}
            </Descriptions.Item>
          </Descriptions>

          {!requirement.isMandatory && (
            <Alert
              type="info"
              showIcon
              message="Nice to have"
              description="This qualification is preferred but not required. The candidate can still qualify without it."
            />
          )}

          <Descriptions title="Metadata" column={1} size="small" bordered>
            <Descriptions.Item label="ID">{requirement.id}</Descriptions.Item>
            <Descriptions.Item label="Created">
              {formatCreatedAt(requirement.createdAt)}
            </Descriptions.Item>
          </Descriptions>
        </Flex>
      )}
    </Drawer>
  );
}
