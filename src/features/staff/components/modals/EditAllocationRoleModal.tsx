import { useState } from "react";
import { Form, Modal, Select, Tag, Typography, message } from "antd";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useCreateCourseAllocationMutation } from "../../api/courseAllocationsApi";
import type { AllocationRole, CourseAllocation } from "../../types/courseAllocation";
import {
  ALLOCATION_ROLE_OPTIONS,
  getAllocationRoleTagColor,
  parseAllocationConflictError,
} from "../../utils/allocationRoleUtils";

export type EditAllocationRoleModalProps = {
  allocation: CourseAllocation | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function EditAllocationRoleModal({
  allocation,
  open,
  onClose,
  onSuccess,
}: EditAllocationRoleModalProps) {
  const [role, setRole] = useState<AllocationRole | undefined>(allocation?.role);
  const [updateAllocation, { isLoading }] = useCreateCourseAllocationMutation();

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && allocation) {
      setRole(allocation.role);
    }
  };

  const handleSubmit = async () => {
    if (!allocation || !role) return;

    try {
      await updateAllocation({
        staffId: allocation.staffId,
        courseConfigurationId: allocation.courseConfigurationId,
        academicSessionId: allocation.academicSessionId,
        role,
      }).unwrap();

      message.success("Course allocation role updated successfully.");
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const conflict = parseAllocationConflictError(err);
      if (conflict) {
        message.error(conflict.message);
      } else {
        message.error("Failed to update role. Please try again.");
      }
    }
  };

  const course = allocation?.courseConfiguration?.course;
  const session = allocation?.academicSession;

  return (
    <Modal
      title="Edit Course Allocation Role"
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Save Role"
      confirmLoading={isLoading}
      afterOpenChange={handleOpenChange}
      destroyOnHidden
      okButtonProps={{
        disabled: !role || role === allocation?.role,
      }}
    >
      <Form layout="vertical" style={{ marginTop: 16 }}>
        <div style={{ marginBottom: 16 }}>
          <Typography.Text type="secondary" style={{ display: "block", fontSize: 12 }}>
            Course
          </Typography.Text>
          <Typography.Text strong>
            {course?.code} — {course?.title}
          </Typography.Text>
        </div>

        {session && (
          <div style={{ marginBottom: 16 }}>
            <Typography.Text type="secondary" style={{ display: "block", fontSize: 12 }}>
              Academic Session
            </Typography.Text>
            <Typography.Text>{session.name}</Typography.Text>
          </div>
        )}

        <Form.Item label="Staff Allocation Role" required>
          <PermissionGuard
            permission={Permission.CoursesManage}
            fallback={<Typography.Text type="secondary">Permission required</Typography.Text>}
          >
            <Select<AllocationRole>
              value={role || allocation?.role}
              onChange={(val) => setRole(val)}
              options={ALLOCATION_ROLE_OPTIONS}
              style={{ width: "100%" }}
              optionRender={(option) => (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Tag color={getAllocationRoleTagColor(option.value as AllocationRole)}>
                    {option.label}
                  </Tag>
                </div>
              )}
            />
          </PermissionGuard>
        </Form.Item>
      </Form>
    </Modal>
  );
}
