// Feature: student-transition
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Alert, Badge, Button, DatePicker, Form, Input, Modal, Select, Tag } from "antd";
import dayjs from "dayjs";
import { useTransitionFormModal } from "../../hooks/useTransitionModal";
import type { StudentEnrollmentTransition } from "../../types/studentTransition";
import {
    endDateRules,
    levelIdRules,
    semesterIdRules,
    sessionIdRules,
    startDateRules,
    statusIdRules,
} from "../../utils/transitionValidators";

export type TransitionFormModalProps = {
  open: boolean;
  studentId: number;
  /** null = create mode, StudentEnrollmentTransition = edit mode */
  target: StudentEnrollmentTransition | null;
  onClose: () => void;
};

export function TransitionFormModal({ open, studentId, target, onClose }: TransitionFormModalProps) {
  const token = useToken();
  const { state, actions, form, refs } = useTransitionFormModal(target, open, onClose, studentId);
  const { formError, isLoading, isEditMode } = state;
  const { handleSubmit, handleCancel, handleSessionChange } = actions;
  const {
    statuses,
    sessions,
    semesters,
    levels,
    statusesLoading,
    sessionsLoading,
    semestersLoading,
    levelsLoading,
  } = refs;

  return (
    <Modal
      title={isEditMode ? "Edit Enrollment Transition" : "Add Enrollment Transition"}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={560}
      destroyOnHidden
      closable
      styles={{
        body: { padding: `${token.paddingSM}px ${token.paddingSM}px` },
        header: {
          margin: 0,
          padding: `${token.paddingSM}px ${token.paddingSM}px`,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        },
      }}
    >
      <div style={{ padding: 24 }}>
        <ErrorAlert variant="form" error={formError} />

        {/* Create mode: immutability warning */}
        <ConditionalRenderer when={!isEditMode}>
          <div style={{ marginBottom: 16 }}>
            <Alert
              type="warning"
              showIcon
              message="Student ID and semester cannot be changed after creation."
            />
          </div>
        </ConditionalRenderer>

        <Form form={form} layout="vertical" requiredMark={false} onFinish={handleSubmit}>
          {/* statusId */}
          <Form.Item
            name="statusId"
            label={
              <span>
                Status <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={statusIdRules}
          >
            <Select
              placeholder="Select status"
              loading={statusesLoading}
              disabled={statusesLoading}
              showSearch
              optionFilterProp="label"
              style={{ height: 40 }}
              options={statuses.map((s) => ({ value: s.id, label: s.name }))}
              optionRender={(option) => {
                const status = statuses.find((s) => s.id === option.value);
                return (
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {option.label}
                    <ConditionalRenderer when={status !== undefined}>
                      <Tag
                        color={status?.canRegisterCourses ? "green" : "default"}
                        style={{ marginLeft: "auto", fontSize: token.fontSizeSM }}
                      >
                        {status?.canRegisterCourses ? "Can Register" : "No Registration"}
                      </Tag>
                    </ConditionalRenderer>
                  </span>
                );
              }}
              labelRender={(props) => {
                const status = statuses.find((s) => s.id === props.value);
                if (!status) return <span>{props.label}</span>;
                return (
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {status.name}
                    <Badge
                      count={status.canRegisterCourses ? "Can Register" : "No Registration"}
                      color={status.canRegisterCourses ? "green" : "default"}
                      style={{ fontSize: token.fontSizeSM }}
                    />
                  </span>
                );
              }}
            />
          </Form.Item>

          {/* sessionId */}
          <Form.Item
            name="sessionId"
            label={
              <span>
                Session <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={sessionIdRules}
          >
            <Select
              placeholder="Select session"
              loading={sessionsLoading}
              disabled={sessionsLoading}
              showSearch
              optionFilterProp="label"
              style={{ height: 40 }}
              options={sessions.map((s) => ({ value: s.id, label: s.name }))}
              onChange={(value) => handleSessionChange(value as number | undefined)}
            />
          </Form.Item>

          {/* semesterId — create mode only (immutable after creation) */}
          <ConditionalRenderer when={!isEditMode}>
            <Form.Item
              name="semesterId"
              label={
                <span>
                  Semester <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
                </span>
              }
              rules={semesterIdRules}
            >
              <Select
                placeholder="Select semester"
                loading={semestersLoading}
                disabled={semestersLoading}
                showSearch
                optionFilterProp="label"
                style={{ height: 40 }}
                options={semesters.map((s) => ({ value: s.id, label: s.name }))}
              />
            </Form.Item>
          </ConditionalRenderer>

          {/* levelId */}
          <Form.Item
            name="levelId"
            label={
              <span>
                Level <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={levelIdRules}
          >
            <Select
              placeholder="Select level"
              loading={levelsLoading}
              disabled={levelsLoading}
              showSearch
              optionFilterProp="label"
              style={{ height: 40 }}
              options={levels.map((l) => ({ value: l.id, label: l.name }))}
            />
          </Form.Item>

          {/* startDate */}
          <Form.Item
            name="startDate"
            label={
              <span>
                Start Date <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={startDateRules}
            getValueProps={(value) => ({ value: value ? dayjs(value) : undefined })}
            getValueFromEvent={(date) => (date ? date.format("YYYY-MM-DD") : undefined)}
          >
            <DatePicker style={{ width: "100%", height: 40 }} />
          </Form.Item>

          {/* endDate */}
          <Form.Item
            name="endDate"
            label="End Date"
            rules={endDateRules}
            getValueProps={(value) => ({ value: value ? dayjs(value) : undefined })}
            getValueFromEvent={(date) => (date ? date.format("YYYY-MM-DD") : undefined)}
          >
            <DatePicker style={{ width: "100%", height: 40 }} />
          </Form.Item>

          {/* remarks */}
          <Form.Item name="remarks" label="Remarks" style={{ marginBottom: 0 }}>
            <Input.TextArea placeholder="Optional remarks..." rows={3} />
          </Form.Item>
        </Form>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          padding: 24,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgLayout,
        }}
      >
        <PermissionGuard
          permission={
            isEditMode
              ? Permission.StudentEnrollmentTransitionsUpdate
              : Permission.StudentEnrollmentTransitionsCreate
          }
        >
          <Button
            type="primary"
            loading={isLoading}
            disabled={isLoading}
            onClick={() => form.submit()}
            block
            style={{ height: 48, fontWeight: 600 }}
          >
            {isEditMode ? "Save Changes" : "Add Transition"}
          </Button>
        </PermissionGuard>
        <Button
          type="text"
          block
          onClick={handleCancel}
          disabled={isLoading}
          style={{
            height: 40,
            color: token.colorTextSecondary,
            fontWeight: 500,
            fontSize: token.fontSizeSM,
          }}
        >
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
