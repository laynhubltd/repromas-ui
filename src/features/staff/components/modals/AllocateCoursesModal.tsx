import React from "react";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { LevelSelect } from "@/components/ui-kit/data-entry/LevelSelect";
import {
  Alert,
  Button,
  Flex,
  Input,
  Modal,
  Select,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useAllocateCoursesModal } from "../../hooks/useAllocateCoursesModal";
import type { Staff } from "../../types/staff";
import type {
  AllocationRole,
  CourseAllocationTableRow,
} from "../../types/courseAllocation";
import {
  ALLOCATION_ROLE_OPTIONS,
  getAllocationRoleTagColor,
} from "../../utils/allocationRoleUtils";

export type AllocateCoursesModalProps = {
  open: boolean;
  staff: Staff | null;
  onClose: () => void;
  onSuccess?: () => void;
};

export function AllocateCoursesModal({
  open,
  staff,
  onClose,
  onSuccess,
}: AllocateCoursesModalProps) {
  const token = useToken();

  const { state, actions } = useAllocateCoursesModal({
    open,
    staff,
    onClose,
    onSuccess,
  });

  const {
    selectedSessionId,
    programId,
    levelId,
    search,
    selectedCourseConfigIds,
    selectedRowKeys,
    expandedRowKeys,
    roleOverrides,
    conflictCourseConfigId,
    conflictMessage,
    sessions,
    programs,
    tableRows,
    isSessionsLoading,
    isProgramsLoading,
    isConfigsLoading,
    isSubmitting,
    summaryCounts,
  } = state;

  const {
    handleSessionChange,
    handleProgramFilterChange,
    handleLevelFilterChange,
    handleSearchChange,
    handleRoleChange,
    handleSelectionChange,
    handleExpandedRowsChange,
    handleSubmit,
    handleCancel,
  } = actions;

  const columns: ColumnsType<CourseAllocationTableRow> = [
    {
      title: "Course",
      key: "course",
      width: "50%",
      render: (_, record) => {
        if (record.isGroup) {
          return (
            <Flex align="center" gap={8}>
              <Typography.Text strong style={{ fontSize: 13 }}>
                {record.label}
              </Typography.Text>
              {record.isActiveForAdmission && (
                <Tag color="blue" style={{ margin: 0, fontSize: 11 }}>
                  Active for Admission
                </Tag>
              )}
              <Tag style={{ margin: 0, fontSize: 11 }}>
                {record.totalCourses} course{record.totalCourses === 1 ? "" : "s"}
              </Tag>
            </Flex>
          );
        }

        return (
          <Flex vertical gap={2}>
            <Flex align="center" gap={6}>
              <Typography.Text strong style={{ fontSize: 13 }}>
                {record.code}
              </Typography.Text>
              {record.courseStatus && (
                <Tag color="geekblue" style={{ margin: 0, fontSize: 10 }}>
                  {record.courseStatus}
                </Tag>
              )}
            </Flex>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {record.title}
            </Typography.Text>
          </Flex>
        );
      },
    },
    {
      title: "Level / Semester",
      key: "levelSemester",
      width: "25%",
      render: (_, record) => {
        if (record.isGroup) return null;
        const parts = [record.levelName, record.semesterName].filter(Boolean);
        return (
          <Typography.Text style={{ fontSize: 12 }}>
            {parts.length > 0 ? parts.join(" • ") : "—"}
          </Typography.Text>
        );
      },
    },
    {
      title: "Units",
      key: "creditUnit",
      width: "8%",
      align: "center",
      render: (_, record) => {
        if (record.isGroup) return null;
        return (
          <Typography.Text style={{ fontSize: 12 }}>
            {record.creditUnit ?? "—"}
          </Typography.Text>
        );
      },
    },
    {
      title: "Allocation Role",
      key: "role",
      width: "17%",
      render: (_, record) => {
        if (record.isGroup) return null;
        const isSelected = selectedCourseConfigIds.includes(record.id);
        const currentRole = roleOverrides[record.id] ?? "PRIMARY";

        return (
          <Select<AllocationRole>
            size="small"
            value={currentRole}
            disabled={!isSelected}
            onChange={(role) => handleRoleChange(record.id, role)}
            style={{ width: 140 }}
            options={ALLOCATION_ROLE_OPTIONS.map((opt) => ({
              value: opt.value,
              label: (
                <Tag
                  color={getAllocationRoleTagColor(opt.value)}
                  style={{ margin: 0, fontSize: 11 }}
                >
                  {opt.label}
                </Tag>
              ),
            }))}
          />
        );
      },
    },
  ];

  const staffDisplayName = staff
    ? `${staff.firstName ?? ""} ${staff.lastName ?? ""}`.trim() || staff.fileNumber
    : "Lecturer";

  return (
    <Modal
      open={open}
      title={
        <Typography.Title level={4} style={{ margin: 0 }}>
          Allocate Courses — {staffDisplayName}
        </Typography.Title>
      }
      onCancel={handleCancel}
      width={1000}
      footer={null}
      destroyOnClose
      styles={{
        body: {
          padding: 0,
        },
      }}
    >
      {/* Staff Context Header Bar */}
      <div
        style={{
          padding: `${token.paddingSM}px ${token.paddingMD}px`,
          background: token.colorBgLayout,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Flex justify="space-between" align="center" wrap="wrap" gap={8}>
          <Flex align="center" gap={12}>
            <div>
              <Typography.Text strong style={{ fontSize: 14 }}>
                {staffDisplayName}
              </Typography.Text>
              {staff?.fileNumber && (
                <Typography.Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                  ({staff.fileNumber})
                </Typography.Text>
              )}
            </div>
            {staff?.department?.name && (
              <Tag color="cyan" style={{ margin: 0 }}>
                {staff.department.name}
              </Tag>
            )}
          </Flex>

          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Assign courses across curriculum versions for the selected session
          </Typography.Text>
        </Flex>
      </div>

      <div style={{ padding: token.paddingMD }}>
        {/* Conflict Warning Banner */}
        {conflictCourseConfigId && conflictMessage && (
          <Alert
            type="warning"
            showIcon
            closable
            message="Primary Lecturer Assignment Conflict"
            description={conflictMessage}
            style={{ marginBottom: token.marginMD }}
          />
        )}

        {/* Filter Toolbar */}
        <Flex gap={12} wrap="wrap" align="center" style={{ marginBottom: token.marginMD }}>
          <div style={{ width: 220 }}>
            <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
              Academic Session
            </Typography.Text>
            <Select
              placeholder="Select Session"
              allowClear={false}
              loading={isSessionsLoading}
              value={selectedSessionId}
              onChange={handleSessionChange}
              style={{ width: "100%" }}
              options={sessions.map((s) => ({
                value: s.id,
                label: s.name,
                isCurrent: s.isCurrent,
              }))}
              optionRender={(option) => (
                <Flex justify="space-between" align="center">
                  <span>{option.data.label}</span>
                  {option.data.isCurrent && (
                    <Tag color="green" style={{ margin: 0, fontSize: 10 }}>
                      Current
                    </Tag>
                  )}
                </Flex>
              )}
            />
          </div>

          <div style={{ width: 240 }}>
            <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
              Program
            </Typography.Text>
            <Select
              placeholder="Select Program"
              allowClear={false}
              showSearch
              optionFilterProp="label"
              loading={isProgramsLoading}
              value={programId}
              onChange={handleProgramFilterChange}
              style={{ width: "100%" }}
              options={programs.map((p) => ({
                value: p.id,
                label: p.name || p.code,
              }))}
            />
          </div>

          <div style={{ width: 200 }}>
            <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
              Level
            </Typography.Text>
            <LevelSelect
              placeholder="All Levels"
              allowClear
              value={levelId}
              onChange={handleLevelFilterChange}
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ flex: 1, minWidth: 220 }}>
            <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
              Search Courses
            </Typography.Text>
            <Input.Search
              placeholder="Search by code or title…"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              allowClear
            />
          </div>
        </Flex>

        {/* Grouped Course Configurations Tree Table */}
        <Table<CourseAllocationTableRow>
          size="small"
          columns={columns}
          dataSource={tableRows}
          rowKey="key"
          loading={isConfigsLoading}
          expandedRowKeys={expandedRowKeys}
          onExpandedRowsChange={handleExpandedRowsChange}
          rowSelection={{
            type: "checkbox",
            selectedRowKeys,
            onChange: (keys) => handleSelectionChange(keys as React.Key[]),
            checkStrictly: false,
          }}
          pagination={false}
          scroll={{ y: 480 }}
          locale={{
            emptyText: !programId
              ? "Please select a program to view courses."
              : "No courses found matching your criteria.",
          }}
        />
      </div>

      {/* Sticky Bottom Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: `${token.paddingSM}px ${token.paddingMD}px`,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgLayout,
        }}
      >
        <div>
          <Typography.Text strong style={{ fontSize: 13 }}>
            Selected: {summaryCounts.totalSelected} course
            {summaryCounts.totalSelected === 1 ? "" : "s"}
          </Typography.Text>
          {summaryCounts.totalSelected > 0 && (
            <Typography.Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
              ({[
                summaryCounts.primaryCount > 0 ? `${summaryCounts.primaryCount} Primary` : null,
                summaryCounts.coLecturerCount > 0 ? `${summaryCounts.coLecturerCount} Co-Lecturer` : null,
                summaryCounts.assistantCount > 0 ? `${summaryCounts.assistantCount} Assistant` : null,
                summaryCounts.markerCount > 0 ? `${summaryCounts.markerCount} Marker` : null,
              ]
                .filter(Boolean)
                .join(", ")})
            </Typography.Text>
          )}
        </div>

        <Flex gap={8}>
          <Button onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <PermissionGuard permission={Permission.CoursesManage}>
            <Button
              type="primary"
              loading={isSubmitting}
              disabled={isSubmitting || selectedCourseConfigIds.length === 0}
              onClick={handleSubmit}
            >
              Allocate Selected ({selectedCourseConfigIds.length})
            </Button>
          </PermissionGuard>
        </Flex>
      </div>
    </Modal>
  );
}
