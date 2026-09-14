import { useState } from "react";
import {
  Badge,
  Button,
  Flex,
  Popconfirm,
  Select,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useGetAcademicSessionsQuery } from "@/features/settings";
import { useToken } from "@/shared/hooks/useToken";
import {
  useDeleteCourseAllocationMutation,
  useGetCourseAllocationsQuery,
} from "../api/courseAllocationsApi";
import type { CourseAllocation } from "../types/courseAllocation";
import {
  getAllocationRoleLabel,
  getAllocationRoleTagColor,
} from "../utils/allocationRoleUtils";
import { EditAllocationRoleModal } from "./modals/EditAllocationRoleModal";

export type StaffAllocatedCoursesTableProps = {
  staffId: number;
  onOpenAllocate?: () => void;
};

export function StaffAllocatedCoursesTable({
  staffId,
  onOpenAllocate,
}: StaffAllocatedCoursesTableProps) {
  const token = useToken();

  const [selectedSessionId, setSelectedSessionId] = useState<number | undefined>(undefined);
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(true);
  const [page, setPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const [editingAllocation, setEditingAllocation] = useState<CourseAllocation | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Queries & Mutations
  const { data: sessionsData, isLoading: isSessionsLoading } = useGetAcademicSessionsQuery({
    itemsPerPage: 100,
  });
  const sessions = sessionsData?.member ?? [];

  const {
    data: allocationsData,
    isLoading: isAllocationsLoading,
    isFetching: isAllocationsFetching,
    refetch,
  } = useGetCourseAllocationsQuery({
    "exact[staffId]": staffId,
    "exact[academicSessionId]": selectedSessionId,
    "exact[isActive]": isActiveFilter,
    include: "courseConfiguration,academicSession,staff",
    page,
    itemsPerPage,
    sort: "createdAt:desc",
  });

  const [deleteAllocation, { isLoading: isDeleting }] = useDeleteCourseAllocationMutation();

  const allocations = allocationsData?.member ?? [];
  const totalItems = allocationsData?.totalItems ?? 0;

  const handleDeactivate = async (allocationId: number) => {
    try {
      await deleteAllocation({ id: allocationId }).unwrap();
      message.success("Course allocation deactivated successfully.");
      refetch();
    } catch {
      message.error("Failed to deactivate course allocation.");
    }
  };

  const handleOpenEditRole = (record: CourseAllocation) => {
    setEditingAllocation(record);
    setEditModalOpen(true);
  };

  const handleCloseEditRole = () => {
    setEditModalOpen(false);
    setEditingAllocation(null);
  };

  const columns: ColumnsType<CourseAllocation> = [
    {
      title: "Course",
      key: "course",
      render: (_, record) => {
        const config = record.courseConfiguration;
        const course = config?.course;
        return (
          <Flex vertical gap={2}>
            <Typography.Text strong>
              {course?.code ?? `Course #${config?.courseId ?? record.courseConfigurationId}`}
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              {course?.title ?? "Untitled Course"}
            </Typography.Text>
          </Flex>
        );
      },
    },
    {
      title: "Program & Level",
      key: "programLevel",
      render: (_, record) => {
        const config = record.courseConfiguration;
        const semesterLabel = config?.semester?.displayLabel || config?.semesterType?.name;
        const levelName = config?.level?.name;
        const subLabel = [levelName, semesterLabel].filter(Boolean).join(" · ");
        return (
          <Flex vertical gap={2}>
            <Typography.Text style={{ fontSize: token.fontSizeSM }}>
              {config?.program?.name || config?.program?.code || "—"}
            </Typography.Text>
            {subLabel && (
              <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                {subLabel}
              </Typography.Text>
            )}
          </Flex>
        );
      },
    },
    {
      title: "Session",
      key: "session",
      width: 120,
      render: (_, record) => (
        <Typography.Text>{record.academicSession?.name ?? `Session #${record.academicSessionId}`}</Typography.Text>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      width: 140,
      render: (role) => (
        <Tag color={getAllocationRoleTagColor(role)} style={{ margin: 0 }}>
          {getAllocationRoleLabel(role)}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: 90,
      render: (isActive: boolean) => (
        <Badge status={isActive ? "success" : "default"} text={isActive ? "Active" : "Inactive"} />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 90,
      align: "right",
      render: (_, record) => (
        <Flex gap={4} justify="flex-end">
          <PermissionGuard permission={Permission.CoursesManage}>
            <Tooltip title="Edit Role">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleOpenEditRole(record)}
              />
            </Tooltip>
            {record.isActive && (
              <Popconfirm
                title="Deactivate Course Allocation"
                description="Are you sure you want to deactivate this course allocation? Grading history will be preserved."
                onConfirm={() => handleDeactivate(record.id)}
                okText="Deactivate"
                okButtonProps={{ danger: true, loading: isDeleting }}
                cancelText="Cancel"
              >
                <Tooltip title="Deactivate">
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                  />
                </Tooltip>
              </Popconfirm>
            )}
          </PermissionGuard>
        </Flex>
      ),
    },
  ];

  return (
    <Flex vertical gap={16}>
      {/* Controls & Filter Bar */}
      <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
        <Flex gap={8} align="center" wrap="wrap">
          <Select
            placeholder="All Academic Sessions"
            allowClear
            loading={isSessionsLoading}
            value={selectedSessionId}
            onChange={(val) => {
              setSelectedSessionId(val);
              setPage(1);
            }}
            style={{ width: 200 }}
            options={sessions.map((s) => ({
              value: s.id,
              label: s.name,
              isCurrent: s.isCurrent,
            }))}
            optionRender={(option) => (
              <Flex align="center" justify="space-between">
                <span>{option.data.label}</span>
                {option.data.isCurrent && (
                  <Tag color="green" style={{ margin: 0, fontSize: 10 }}>
                    Current
                  </Tag>
                )}
              </Flex>
            )}
          />

          <Select
            placeholder="Status"
            value={isActiveFilter}
            onChange={(val) => {
              setIsActiveFilter(val);
              setPage(1);
            }}
            style={{ width: 120 }}
            options={[
              { value: undefined, label: "All Status" },
              { value: true, label: "Active" },
              { value: false, label: "Inactive" },
            ]}
          />
        </Flex>

        {onOpenAllocate && (
          <PermissionGuard permission={Permission.CoursesManage}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onOpenAllocate}
            >
              Allocate Courses
            </Button>
          </PermissionGuard>
        )}
      </Flex>

      {/* Allocations Table */}
      <Table<CourseAllocation>
        size="small"
        columns={columns}
        dataSource={allocations}
        rowKey="id"
        loading={isAllocationsLoading || isAllocationsFetching}
        pagination={{
          current: page,
          pageSize: itemsPerPage,
          total: totalItems,
          onChange: (p, ps) => {
            setPage(p);
            if (ps) setItemsPerPage(ps);
          },
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} allocated courses`,
        }}
      />

      {/* Edit Role Modal */}
      <EditAllocationRoleModal
        allocation={editingAllocation}
        open={editModalOpen}
        onClose={handleCloseEditRole}
        onSuccess={refetch}
      />
    </Flex>
  );
}
