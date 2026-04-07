// Feature: student
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Descriptions, Drawer, Flex, Typography } from "antd";
import { useStudentDrawer } from "../hooks/useStudentDrawer";
import { StatusBadge } from "./StatusBadge";

type StudentDrawerProps = {
  studentId: number | null;
  open: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function StudentDrawer({
  studentId,
  open,
  onClose,
  onEdit,
  onDelete,
}: StudentDrawerProps) {
  const token = useToken();
  const { state, actions } = useStudentDrawer(studentId, open);
  const { student, isLoading, isError } = state;
  const { refetch } = actions;

  const faculty = student?.program?.department?.faculty;
  const department = student?.program?.department;
  const program = student?.program;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={480}
      placement="right"
      title={
        student ? (
          <Flex align="center" gap={8}>
            <Typography.Text strong style={{ fontSize: token.fontSize }}>
              {student.firstName} {student.lastName}
            </Typography.Text>
            <StatusBadge status={student.status} />
          </Flex>
        ) : (
          "Student Profile"
        )
      }
      footer={
        <Flex gap={8} justify="flex-end">
          <PermissionGuard permission={Permission.StudentsUpdate}>
            <Button icon={<EditOutlined />} onClick={onEdit} disabled={!student}>
              Edit
            </Button>
          </PermissionGuard>
          <PermissionGuard permission={Permission.StudentsDelete}>
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={onDelete}
              disabled={!student}
            >
              Delete
            </Button>
          </PermissionGuard>
        </Flex>
      }
      destroyOnHidden
    >
      <DataLoader loading={isLoading} loader={<SkeletonRows count={5} variant="card" />}>
        {isError ? (
          <ErrorAlert variant="section" error="Failed to load student profile" onRetry={refetch} />
        ) : student ? (
          <Flex vertical gap={24}>
            {/* Academic hierarchy */}
            {(faculty || department || program) && (
              <div>
                <Typography.Text
                  type="secondary"
                  style={{ fontSize: token.fontSizeSM, display: "block", marginBottom: 6 }}
                >
                  Academic Hierarchy
                </Typography.Text>
                <Breadcrumb
                  items={[
                    faculty ? { title: faculty.name } : null,
                    department ? { title: department.name } : null,
                    program ? { title: program.name } : null,
                  ].filter(Boolean) as { title: string }[]}
                />
              </div>
            )}

            {/* Identity */}
            <Descriptions
              title="Identity"
              column={1}
              size="small"
              bordered
              styles={{ label: { width: 140 } }}
            >
              <Descriptions.Item label="Matric Number">
                <Typography.Text copyable>{student.matricNumber}</Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {student.email ?? <Typography.Text type="secondary">—</Typography.Text>}
              </Descriptions.Item>
              <Descriptions.Item label="Entry Mode">{student.entryMode}</Descriptions.Item>
            </Descriptions>

            {/* Academic placement */}
            <Descriptions
              title="Academic Placement"
              column={1}
              size="small"
              bordered
              styles={{ label: { width: 140 } }}
            >
              <Descriptions.Item label="Entry Level">
                {student.entryLevel?.name ?? (
                  <Typography.Text type="secondary">—</Typography.Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Current Level">
                {student.currentLevel?.name ?? (
                  <Typography.Text type="secondary">—</Typography.Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Curriculum Version">
                {student.curriculumVersion?.name ?? (
                  <Typography.Text type="secondary">—</Typography.Text>
                )}
              </Descriptions.Item>
            </Descriptions>

            {/* Enrollment */}
            <div>
              <Typography.Text
                strong
                style={{ display: "block", marginBottom: 8, fontSize: token.fontSize }}
              >
                Enrollment
              </Typography.Text>
              {student.currentEnrollmentTransition ? (
                <Descriptions column={1} size="small" bordered styles={{ label: { width: 140 } }}>
                  {Object.entries(student.currentEnrollmentTransition).map(([key, value]) => (
                    <Descriptions.Item key={key} label={key}>
                      {String(value)}
                    </Descriptions.Item>
                  ))}
                </Descriptions>
              ) : (
                <Typography.Text type="secondary">No enrollment data</Typography.Text>
              )}
            </div>
          </Flex>
        ) : null}
      </DataLoader>
    </Drawer>
  );
}
