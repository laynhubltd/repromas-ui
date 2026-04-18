// Feature: settings-timeframe
import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Button, Checkbox, DatePicker, Form, Modal, Select, Tag } from "antd";
import dayjs from "dayjs";
import { useUpsertTimeFrameModal } from "../hooks/useUpsertTimeFrameModal";
import type { EventType, Scope, SystemTimeFrame } from "../types/system-timeframe";
import { dateRangeRule, referenceIdRule } from "../utils/validators";
import { ReferencePickerField } from "./ReferencePickerField";

type UpsertTimeFrameModalProps = {
  open: boolean;
  target: SystemTimeFrame | null;
  onClose: () => void;
};

const EVENT_TYPE_OPTIONS: { value: EventType; label: string }[] = [
  { value: "APPLICATION", label: "Application" },
  { value: "ACCEPTANCE_FEE", label: "Acceptance Fee" },
  { value: "COURSE_REGISTRATION", label: "Course Registration" },
  { value: "ADD_DROP", label: "Add / Drop" },
  { value: "RESULT_UPLOAD", label: "Result Upload" },
];

const SCOPE_OPTIONS: { value: Scope; label: string }[] = [
  { value: "GLOBAL", label: "Global" },
  { value: "FACULTY", label: "Faculty" },
  { value: "DEPARTMENT", label: "Department" },
  { value: "PROGRAM", label: "Program" },
  { value: "LEVEL", label: "Level" },
  { value: "STUDENT", label: "Student" },
];

export function UpsertTimeFrameModal({ open, target, onClose }: UpsertTimeFrameModalProps) {
  const token = useToken();
  const isEditMode = target !== null;

  const {
    form,
    formError,
    isSubmitting,
    sessions,
    semesters,
    semesterTypes,
    sessionsLoading,
    semestersLoading,
    selectedSessionId,
    onSessionChange,
    handleSubmit,
    handleCancel,
  } = useUpsertTimeFrameModal(open, target, onClose);

  // Watch scope and startAt for conditional rendering and validation
  const scope: Scope = Form.useWatch("scope", form) ?? "GLOBAL";
  const startAt: string | null = Form.useWatch("startAt", form) ?? null;

  const semesterLabel = (semId: number) => {
    const sem = semesters.find((s) => s.id === semId);
    if (!sem) return `Semester #${semId}`;
    const typeName = semesterTypes.find((st) => st.id === sem.semesterTypeId)?.name ?? `Type #${sem.semesterTypeId}`;
    return typeName;
  };

  return (
    <Modal
      title={isEditMode ? "Edit Time Frame" : "Add Time Frame"}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width="100%"
      style={{ maxWidth: 560 }}
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

        <Form form={form} layout="vertical" requiredMark={false} onFinish={handleSubmit}>
          {/* Event Type */}
          <Form.Item
            name="eventType"
            label={<span>Event Type <span style={{ color: token.colorError, fontWeight: 700 }}>*</span></span>}
            rules={[{ required: true, message: "Please select an event type" }]}
          >
            <Select
              placeholder="Select event type"
              style={{ height: 40 }}
              options={EVENT_TYPE_OPTIONS}
            />
          </Form.Item>

          {/* Scope */}
          <Form.Item
            name="scope"
            label={<span>Scope <span style={{ color: token.colorError, fontWeight: 700 }}>*</span></span>}
            rules={[{ required: true, message: "Please select a scope" }]}
          >
            <Select
              placeholder="Select scope"
              style={{ height: 40 }}
              options={SCOPE_OPTIONS}
            />
          </Form.Item>

          {/* Reference Picker — conditional on scope */}
          {scope && scope !== "GLOBAL" && (
            <Form.Item
              name="referenceId"
              label={<span>Reference <span style={{ color: token.colorError, fontWeight: 700 }}>*</span></span>}
              rules={[referenceIdRule(scope)]}
            >
              {/* Form.Item injects value/onChange into ReferencePickerField */}
              <ReferencePickerField scope={scope} />
            </Form.Item>
          )}

          {/* Session */}
          <Form.Item name="sessionId" label="Session">
            <Select
              allowClear
              placeholder="Select session (optional)"
              style={{ height: 40 }}
              loading={sessionsLoading}
              onChange={(val) => onSessionChange(val ?? null)}
              options={sessions.map((s) => ({
                value: s.id,
                label: (
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {s.name}
                    {s.isCurrent && (
                      <Tag color="green" style={{ margin: 0, fontSize: 11 }}>
                        Current
                      </Tag>
                    )}
                  </span>
                ),
              }))}
            />
          </Form.Item>

          {/* Semester */}
          <Form.Item name="semesterId" label="Semester">
            <Select
              allowClear
              placeholder={selectedSessionId ? "Select semester (optional)" : "Select a session first"}
              style={{ height: 40 }}
              disabled={selectedSessionId === null}
              loading={semestersLoading}
              options={semesters.map((sem) => ({
                value: sem.id,
                label: semesterLabel(sem.id),
              }))}
            />
          </Form.Item>

          {/* Start At */}
          <Form.Item
            name="startAt"
            label={<span>Start Time <span style={{ color: token.colorError, fontWeight: 700 }}>*</span></span>}
            rules={[{ required: true, message: "Start time is required" }]}
            getValueFromEvent={(date) => (date ? date.toISOString() : null)}
            getValueProps={(value) => ({ value: value ? dayjs(value) : undefined })}
          >
            <DatePicker
              showTime
              style={{ width: "100%", height: 40 }}
              placeholder="Select start date and time"
            />
          </Form.Item>

          {/* End At */}
          <Form.Item
            name="endAt"
            label={<span>End Time <span style={{ color: token.colorError, fontWeight: 700 }}>*</span></span>}
            rules={[
              { required: true, message: "End time is required" },
              dateRangeRule(startAt),
            ]}
            getValueFromEvent={(date) => (date ? date.toISOString() : null)}
            getValueProps={(value) => ({ value: value ? dayjs(value) : undefined })}
          >
            <DatePicker
              showTime
              style={{ width: "100%", height: 40 }}
              placeholder="Select end date and time"
            />
          </Form.Item>

          {/* isLateWindow */}
          <Form.Item name="isLateWindow" valuePropName="checked">
            <Checkbox>Late Window (late fee applies)</Checkbox>
          </Form.Item>

          {/* isActive */}
          <Form.Item name="isActive" valuePropName="checked" style={{ marginBottom: 0 }}>
            <Checkbox>Active</Checkbox>
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
        <Button
          type="primary"
          loading={isSubmitting}
          disabled={isSubmitting}
          onClick={() => form.submit()}
          block
          style={{ height: 48, fontWeight: 600 }}
        >
          {isEditMode ? "Save Changes" : "Add Time Frame"}
        </Button>
        <Button
          type="text"
          block
          onClick={handleCancel}
          disabled={isSubmitting}
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
