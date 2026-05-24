import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import {
  ADMISSION_CYCLE_IDENTITY_MODE_OPTIONS,
  identityModeColorByValue,
  identityModeLabelByValue,
} from "@/shared/constants/admissionCycleOptions";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Radio,
  Select,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useAdmissionCycleFormModal } from "../../hooks/useAdmissionCycleModal";
import type {
  AcademicSessionOption,
  AdmissionCycle,
} from "../../types/admission-cycle";
import {
  endDateAfterStartDateRule,
  nameRules,
  sessionIdRules,
} from "../../utils/validators";

type AdmissionCycleFormModalProps = {
  open: boolean;
  target: AdmissionCycle | null;
  onClose: () => void;
  sessions: AcademicSessionOption[];
  usedSessionIds: Set<number>;
};

export function AdmissionCycleFormModal({
  open,
  target,
  onClose,
  sessions,
  usedSessionIds,
}: AdmissionCycleFormModalProps) {
  const token = useToken();

  const {
    state: {
      isEditMode,
      isSubmitting,
      sessionOptions,
      canEditIdentityMode,
      identityMode,
    },
    actions: { handleSubmit, handleCancel, handleSessionChange },
    form,
  } = useAdmissionCycleFormModal(target, open, onClose, sessions, usedSessionIds);

  const startDate = Form.useWatch("startDate", form);

  return (
    <Modal
      title={isEditMode ? "Edit Admission Cycle" : "Create Admission Cycle"}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={520}
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
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleSubmit}
        >
          <ConditionalRenderer when={!isEditMode}>
            <Form.Item
              name="sessionId"
              label={
                <span>
                  Academic session{" "}
                  <span style={{ color: token.colorError, fontWeight: 700 }}>
                    *
                  </span>
                </span>
              }
              rules={sessionIdRules}
            >
              <Select
                placeholder="Select academic session"
                options={sessionOptions}
                onChange={handleSessionChange}
                style={{ height: 40 }}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </ConditionalRenderer>

          <ConditionalRenderer when={isEditMode && target !== null}>
            <Form.Item label="Academic session">
              <Typography.Text>
                {sessions.find((s) => s.id === target?.sessionId)?.name ??
                  "Unknown session"}
              </Typography.Text>
              <Typography.Text
                type="secondary"
                style={{ display: "block", fontSize: token.fontSizeSM }}
              >
                Session cannot be changed after creation.
              </Typography.Text>
            </Form.Item>
          </ConditionalRenderer>

          <Form.Item
            name="name"
            label={
              <span>
                Cycle name{" "}
                <span style={{ color: token.colorError, fontWeight: 700 }}>
                  *
                </span>
              </span>
            }
            rules={nameRules}
          >
            <Input
              placeholder="e.g. 2025/2026 UTME Admission"
              maxLength={255}
              style={{ height: 40 }}
            />
          </Form.Item>

          <ConditionalRenderer when={canEditIdentityMode}>
            <Form.Item
              name="admissionIdentityMode"
              label={
                <span>
                  Identity mode{" "}
                  <span style={{ color: token.colorError, fontWeight: 700 }}>
                    *
                  </span>
                </span>
              }
              rules={[{ required: true, message: "Select an identity mode." }]}
            >
              <Radio.Group style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {ADMISSION_CYCLE_IDENTITY_MODE_OPTIONS.map((opt) => (
                  <Radio key={opt.value} value={opt.value}>
                    <Typography.Text strong>{opt.label}</Typography.Text>
                    <Typography.Text
                      type="secondary"
                      style={{ display: "block", fontSize: token.fontSizeSM }}
                    >
                      {opt.helper}
                    </Typography.Text>
                  </Radio>
                ))}
              </Radio.Group>
            </Form.Item>
          </ConditionalRenderer>

          <ConditionalRenderer when={!canEditIdentityMode}>
            <Form.Item name="admissionIdentityMode" hidden>
              <Input />
            </Form.Item>
            <Form.Item label="Identity mode">
              <Tag color={identityModeColorByValue[identityMode] ?? "default"}>
                {identityModeLabelByValue[identityMode] ?? identityMode}
              </Tag>
              <Typography.Text
                type="secondary"
                style={{ display: "block", fontSize: token.fontSizeSM, marginTop: 8 }}
              >
                Identity mode is locked after applications open.
              </Typography.Text>
            </Form.Item>
          </ConditionalRenderer>

          <Form.Item
            name="startDate"
            label="Planned start date"
            getValueFromEvent={(value) => value ?? null}
            getValueProps={(value) => ({
              value: value ? dayjs(value) : undefined,
            })}
          >
            <DatePicker style={{ width: "100%", height: 40 }} />
          </Form.Item>

          <Form.Item
            name="endDate"
            label="Planned end date"
            getValueFromEvent={(value) => value ?? null}
            getValueProps={(value) => ({
              value: value ? dayjs(value) : undefined,
            })}
            rules={[
              endDateAfterStartDateRule(() =>
                startDate ? startDate.toISOString() : null,
              ),
            ]}
          >
            <DatePicker style={{ width: "100%", height: 40 }} />
          </Form.Item>

          <ConditionalRenderer when={isEditMode && target !== null}>
            <Form.Item label="Status">
              <Typography.Text>{target?.status.replace(/_/g, " ")}</Typography.Text>
              <Typography.Text
                type="secondary"
                style={{ display: "block", fontSize: token.fontSizeSM }}
              >
                Use the advance action to change cycle status.
              </Typography.Text>
            </Form.Item>
          </ConditionalRenderer>
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
              ? Permission.AdmissionCyclesUpdate
              : Permission.AdmissionCyclesCreate
          }
        >
          <Button
            type="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
            onClick={() => form.submit()}
            block
            style={{ height: 48, fontWeight: 600 }}
          >
            {isEditMode ? "Save Changes" : "Create Cycle"}
          </Button>
        </PermissionGuard>
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
