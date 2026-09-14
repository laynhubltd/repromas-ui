// Feature: staff
import { useState } from "react";
import {
  Button,
  Descriptions,
  Drawer,
  Flex,
  Tabs,
  Tag,
  Typography,
} from "antd";
import { BookOutlined, DeleteOutlined, EditOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useInstitutionTerminology } from "@/shared/hooks/useInstitutionTerminology";
import { useToken } from "@/shared/hooks/useToken";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { useStaffDrawer } from "../hooks/useStaffDrawer";
import type { Staff } from "../types/staff";
import { AllocateCoursesModal } from "./modals/AllocateCoursesModal";
import { StaffAllocatedCoursesTable } from "./StaffAllocatedCoursesTable";

export type StaffDrawerProps = {
  staffId: number | null;
  open: boolean;
  onClose: () => void;
  onEdit: (staff: Staff) => void;
  onDelete: (staff: Staff) => void;
};

export function StaffDrawer({ staffId, open, onClose, onEdit, onDelete }: StaffDrawerProps) {
  const token = useToken();
  const terminology = useInstitutionTerminology();
  const { state, actions } = useStaffDrawer(staffId, open);
  const { staff, isLoading, isError } = state;
  const { refetch } = actions;

  const [activeTab, setActiveTab] = useState<string>("overview");
  const [allocateModalOpen, setAllocateModalOpen] = useState(false);

  const profile = staff?.profile ?? null;
  const department = staff?.department ?? null;

  const fullName =
    profile?.firstName || profile?.lastName
      ? [profile.firstName, profile.lastName].filter(Boolean).join(" ")
      : staff?.firstName || staff?.lastName
      ? [staff?.firstName, staff?.lastName].filter(Boolean).join(" ")
      : null;

  const handleDrawerClose = () => {
    setActiveTab("overview");
    onClose();
  };

  return (
    <>
      <Drawer
        open={open}
        onClose={handleDrawerClose}
        width={720}
        placement="right"
        title={
          staff ? (
            <Flex vertical gap={2}>
              <Typography.Text strong style={{ fontSize: token.fontSize }}>
                {fullName ?? <Typography.Text type="secondary">No name</Typography.Text>}
              </Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                {staff.fileNumber}
                {department?.name ? ` · ${department.name}` : ""}
              </Typography.Text>
            </Flex>
          ) : (
            "Staff Profile"
          )
        }
        footer={
          <Flex gap={8} justify="space-between" align="center">
            <div>
              <PermissionGuard permission={Permission.CoursesManage}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setAllocateModalOpen(true)}
                  disabled={!staff}
                >
                  Allocate Courses
                </Button>
              </PermissionGuard>
            </div>
            <Flex gap={8}>
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
          </Flex>
        }
        destroyOnHidden
      >
        <DataLoader loading={isLoading} loader={<SkeletonRows count={5} variant="card" />}>
          {isError ? (
            <ErrorAlert variant="section" error="Failed to load staff profile" onRetry={refetch} />
          ) : staff ? (
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: "overview",
                  label: (
                    <span>
                      <UserOutlined style={{ marginRight: 6 }} />
                      Overview
                    </span>
                  ),
                  children: (
                    <Flex vertical gap={24} style={{ paddingTop: 8 }}>
                      {/* Department */}
                      <Descriptions
                        title="Department"
                        column={1}
                        size="small"
                        bordered
                        styles={{ label: { width: 140 } }}
                      >
                        <Descriptions.Item label={terminology.academicUnit.singular}>
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
                  ),
                },
                {
                  key: "allocated-courses",
                  label: (
                    <span>
                      <BookOutlined style={{ marginRight: 6 }} />
                      Allocated Courses
                    </span>
                  ),
                  children: (
                    <div style={{ paddingTop: 8 }}>
                      <StaffAllocatedCoursesTable
                        staffId={staff.id}
                        onOpenAllocate={() => setAllocateModalOpen(true)}
                      />
                    </div>
                  ),
                },
              ]}
            />
          ) : null}
        </DataLoader>
      </Drawer>

      {/* Allocate Courses Modal */}
      <AllocateCoursesModal
        open={allocateModalOpen}
        staff={staff}
        onClose={() => setAllocateModalOpen(false)}
        onSuccess={refetch}
      />
    </>
  );
}
