import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import {
  ADMISSION_CYCLE_ENTRY_MODE_OPTIONS,
  ADMISSION_CYCLE_IDENTITY_MODE_OPTIONS,
  ADMISSION_CYCLE_UI_COPY,
  identityModeColorByValue,
  identityModeLabelByValue,
} from "@/shared/constants/admissionCycleOptions";
import { Alert, Button, DatePicker, Form, Input, InputNumber, Modal, Radio, Select, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { useAdmissionCycleFormModal } from "../../hooks/useAdmissionCycleModal";
import type {
  AcademicSessionOption,
  AdmissionCycle,
} from "../../types/admission-cycle";
import { formatEntryBatchLabel } from "../../utils/admissionCycleDisplay";
import {
  batchNoRules,
  endDateAfterStartDateRule,
  entryModeRules,
  nameRules,
  sessionIdRules,
} from "../../utils/validators";

type AdmissionCycleFormModalProps = {
  open: boolean;
  target: AdmissionCycle | null;
  onClose: () => void;
  sessions: AcademicSessionOption[];
  existingCycles: AdmissionCycle[];
};

type AdmissionCycleEditFieldsProps = {
  target: AdmissionCycle;
  sessions: AcademicSessionOption[];
  supersededCycleName: string | null;
  token: ReturnType<typeof useToken>;
};

function AdmissionCycleEditFields({
  target,
  sessions,
  supersededCycleName,
  token,
}: AdmissionCycleEditFieldsProps) {
  return (
    <>
      <Form.Item label="Academic session">
        <Typography.Text>
          {sessions.find((s) => s.id === target.sessionId)?.name ??
            "Unknown session"}
        </Typography.Text>
        <Typography.Text
          type="secondary"
          style={{ display: "block", fontSize: token.fontSizeSM }}
        >
          Session cannot be changed after creation.
        </Typography.Text>
      </Form.Item>

      <Form.Item label={ADMISSION_CYCLE_UI_COPY.entryBatchFieldLabel}>
        <Tag>{formatEntryBatchLabel(target.entryMode, target.batchNo)}</Tag>
        <Typography.Text
          type="secondary"
          style={{ display: "block", fontSize: token.fontSizeSM, marginTop: 8 }}
        >
          {ADMISSION_CYCLE_UI_COPY.entryBatchImmutableHint}
        </Typography.Text>
      </Form.Item>

      <ConditionalRenderer when={supersededCycleName !== null}>
        <Form.Item label="Supersedes">
          <Typography.Text>{supersededCycleName}</Typography.Text>
        </Form.Item>
      </ConditionalRenderer>

      <Form.Item label="Status">
        <Typography.Text>{target.status.replace(/_/g, " ")}</Typography.Text>
        <Typography.Text
          type="secondary"
          style={{ display: "block", fontSize: token.fontSizeSM }}
        >
          Use advance or roll back actions to change cycle status.
        </Typography.Text>
      </Form.Item>
    </>
  );
}

export function AdmissionCycleFormModal({
  open,
  target,
  onClose,
  sessions,
  existingCycles,
}: AdmissionCycleFormModalProps) {
  const token = useToken();
  const modalKey = target?.id ?? "create";

  const {
    state: {
      isEditMode,
      isSubmitting,
      sessionOptions,
      supersedesOptions,
      canEditIdentityMode,
      identityMode,
      isSlotOccupied,
      initialValues,
      supersededCycleName,
    },
    actions: {
      handleSubmit,
      handleCancel,
      handleSessionChange,
      handleEntryModeChange,
      handleBatchNoChange,
    },
    form,
  } = useAdmissionCycleFormModal(target, onClose, sessions, existingCycles);

  const startDate = Form.useWatch("startDate", form);

  return (
    <Modal
      key={modalKey}
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
          key={modalKey}
          form={form}
          layout="vertical"
          requiredMark={false}
          initialValues={initialValues}
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

            <Form.Item
              name="entryMode"
              label={
                <span>
                  Entry mode{" "}
                  <span style={{ color: token.colorError, fontWeight: 700 }}>
                    *
                  </span>
                </span>
              }
              rules={entryModeRules}
            >
              <Select
                placeholder="Select entry mode"
                options={ADMISSION_CYCLE_ENTRY_MODE_OPTIONS.map((opt) => ({
                  value: opt.value,
                  label: opt.label,
                }))}
                onChange={handleEntryModeChange}
                style={{ height: 40 }}
              />
            </Form.Item>

            <Form.Item
              name="batchNo"
              label={
                <span>
                  Batch number{" "}
                  <span style={{ color: token.colorError, fontWeight: 700 }}>
                    *
                  </span>
                </span>
              }
              rules={batchNoRules}
            >
              <InputNumber
                min={1}
                precision={0}
                style={{ width: "100%", height: 40 }}
                onChange={handleBatchNoChange}
              />
            </Form.Item>

            <ConditionalRenderer when={supersedesOptions.length > 0}>
              <Form.Item
                name="supersedesCycleId"
                label="Supersedes cycle (optional)"
              >
                <Select
                  placeholder={ADMISSION_CYCLE_UI_COPY.supersedesPlaceholder}
                  allowClear
                  options={supersedesOptions}
                  style={{ height: 40 }}
                />
              </Form.Item>
            </ConditionalRenderer>

            <ConditionalRenderer when={isSlotOccupied}>
              <Alert
                type="error"
                showIcon
                message={ADMISSION_CYCLE_UI_COPY.duplicateCycleAlertTitle}
                description={ADMISSION_CYCLE_UI_COPY.duplicateCycleAlertDescription}
                style={{ marginBottom: 16 }}
              />
            </ConditionalRenderer>
          </ConditionalRenderer>

          {target !== null && isEditMode ? (
            <AdmissionCycleEditFields
              target={target}
              sessions={sessions}
              supersededCycleName={supersededCycleName}
              token={token}
            />
          ) : null}

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
            disabled={isSubmitting || (!isEditMode && isSlotOccupied)}
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
