// Feature: staff
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Descriptions, Drawer, Flex, Tag, Typography } from "antd";
import { useStaffDrawer } from "../hooks/useStaffDrawer";
import type { Staff } from "../types/staff";

export type StaffDrawerProps = {
  staffId: number | null;
  open: boolean;
  onClose: () => void;
  onEdit: (staff: Staff) => void;
  onDelete: (staff: Staff) => void;
};

export function StaffDrawer({ staffId, open, onClose, onEdit, onDelete }: StaffDrawerProps) {
  const token = useToken();
  const { state, actions } = useStaffDrawer(staffId, open);
  const { staff, isLoading, isError } = state;
  const { refetch } = actions;

  const profile = staff?.profile ?? null;
  const department = staff?.department ?? null;

  const fullName =
    profile?.firstName || profile?.lastName
      ? [profile.firstName, profile.lastName].filter(Boolean).join(" ")
      : null;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={480}
      placement="right"
      title={
        staff ? (
          <Flex vertical gap={2}>
            <Typography.Text strong style={{ fontSize: token.fontSize }}>
              {fullName ?? <Typography.Text type="secondary">No name</Typography.Text>}
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              {staff.fileNumber}
            </Typography.Text>
          </Flex>
        ) : (
          "Staff Profile"
        )
      }
      footer={
        <Flex gap={8} justify="flex-end">
          <PermissionGuard permission={Permission.StaffUpdate}>
            <Button
              icon={<EditOutlined />}
              onClick={() => staff && onEdit(staff)}
              disabled={!staff}
            >
              Edit
            </Button>
          </PermissionGuard>
          <PermissionGuard permission={Permission.StaffDelete}>
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => staff && onDelete(staff)}
              disabled={!staff}
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
          <ErrorAlert variant="section" error="Failed to load staff profile" onRetry={refetch} />
        ) : staff ? (
          <Flex vertical gap={24}>
            {/* Department */}
            <Descriptions
              title="Department"
              column={1}
              size="small"
              bordered
              styles={{ label: { width: 140 } }}
            >
              <Descriptions.Item label="Department">
                {department?.name ?? (
                  <Typography.Text type="secondary">No department assigned</Typography.Text>
                )}
              </Descriptions.Item>
            </Descriptions>

            {/* Identity */}
            <Descriptions
              title="Identity"
              column={1}
              size="small"
              bordered
              styles={{ label: { width: 140 } }}
            >
              <Descriptions.Item label="Email">
                {profile?.email ?? <Typography.Text type="secondary">—</Typography.Text>}
              </Descriptions.Item>
            </Descriptions>

            {/* Roles */}
            {staff.roles && staff.roles.length > 0 ? (
              <Descriptions
                title="Roles"
                column={1}
                size="small"
                bordered
                styles={{ label: { width: 140 } }}
              >
                {staff.roles.map((r) => (
                  <Descriptions.Item key={r.roleId} label={r.roleName}>
                    <Tag color="blue">{r.scope}</Tag>
                  </Descriptions.Item>
                ))}
              </Descriptions>
            ) : (
              <div>
                <Typography.Text
                  strong
                  style={{ display: "block", marginBottom: 8, fontSize: token.fontSize }}
                >
                  Roles
                </Typography.Text>
                <Typography.Text type="secondary">No roles assigned</Typography.Text>
              </div>
            )}

            {/* Profile */}
            {profile ? (
              <Descriptions
                title="Profile"
                column={1}
                size="small"
                bordered
                styles={{ label: { width: 140 } }}
              >
                <Descriptions.Item label="First Name">
                  {profile.firstName ?? <Typography.Text type="secondary">—</Typography.Text>}
                </Descriptions.Item>
                <Descriptions.Item label="Last Name">
                  {profile.lastName ?? <Typography.Text type="secondary">—</Typography.Text>}
                </Descriptions.Item>
                <Descriptions.Item label="Phone Number">
                  {profile.phoneNumber ?? <Typography.Text type="secondary">—</Typography.Text>}
                </Descriptions.Item>
                <Descriptions.Item label="Date of Birth">
                  {profile.dateOfBirth ?? <Typography.Text type="secondary">—</Typography.Text>}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <div>
                <Typography.Text
                  strong
                  style={{ display: "block", marginBottom: 8, fontSize: token.fontSize }}
                >
                  Profile
                </Typography.Text>
                <Typography.Text type="secondary">Profile not available</Typography.Text>
              </div>
            )}
          </Flex>
        ) : null}
      </DataLoader>
    </Drawer>
  );
}
