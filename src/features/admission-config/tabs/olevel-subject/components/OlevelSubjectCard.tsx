import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Flex, Tag, Typography } from "antd";
import type { OlevelSubject } from "../types/olevel-subject";

type OlevelSubjectCardProps = {
  subject: OlevelSubject;
  onEdit: (subject: OlevelSubject) => void;
  onDelete: (subject: OlevelSubject) => void;
};

export function OlevelSubjectCard({
  subject,
  onEdit,
  onDelete,
}: OlevelSubjectCardProps) {
  const token = useToken();

  const formatCreatedAt = (createdAt: string): string =>
    new Date(createdAt).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div
      style={{
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadius,
        background: token.colorBgContainer,
        padding: "12px 16px",
      }}
    >
      <Flex align="center" justify="space-between" gap={12}>
        <Flex
          align="center"
          gap={12}
          wrap="wrap"
          style={{ flex: 1, minWidth: 0 }}
        >
          <Typography.Text
            strong
            style={{ fontSize: token.fontSizeLG, minWidth: 0 }}
            ellipsis={{ tooltip: subject.name }}
          >
            {subject.name}
          </Typography.Text>

          <ConditionalRenderer when={subject.code !== null && subject.code !== ""}>
            <Tag style={{ margin: 0 }}>{subject.code}</Tag>
          </ConditionalRenderer>

          <Typography.Text
            type="secondary"
            style={{ fontSize: token.fontSizeSM }}
          >
            Added {formatCreatedAt(subject.createdAt)}
          </Typography.Text>
        </Flex>

        <Flex align="center" gap={4} style={{ flexShrink: 0 }}>
          <PermissionGuard permission={Permission.AdmissionOlevelSubjectsUpdate}>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined style={{ fontSize: 16 }} />}
              onClick={() => onEdit(subject)}
              title="Edit"
            />
          </PermissionGuard>
          <PermissionGuard permission={Permission.AdmissionOlevelSubjectsDelete}>
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined style={{ fontSize: 16 }} />}
              onClick={() => onDelete(subject)}
              title="Delete"
            />
          </PermissionGuard>
        </Flex>
      </Flex>
    </div>
  );
}
