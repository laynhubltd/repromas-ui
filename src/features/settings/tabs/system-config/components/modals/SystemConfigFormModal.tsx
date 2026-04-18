// Feature: system-config
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Button, Form, Input, InputNumber, Modal, Select, Spin, Switch } from "antd";
import { useSystemConfigModal } from "../../hooks/useSystemConfigModal";
import type { ConfigKey, ConfigScope, ProgramOption, SystemConfig } from "../../types/system-config";
import {
    creditLoadValidator,
    descriptionRules,
    maxCreditsRules,
    minCreditsRules,
} from "../../utils/validators";

export type SystemConfigFormModalProps = {
  open: boolean;
  /** null = create mode, non-null = edit mode */
  target: SystemConfig | null;
  programs: ProgramOption[];
  programsLoading: boolean;
  onClose: () => void;
};

const CONFIG_KEY_OPTIONS: { value: ConfigKey; label: string }[] = [
  { value: "CREDIT_LOAD_LIMITS", label: "Credit Load Limits" },
  { value: "FORCE_CARRYOVER_FIRST", label: "Force Carryover First" },
];

const SCOPE_OPTIONS: { value: ConfigScope; label: string }[] = [
  { value: "GLOBAL", label: "Global" },
  { value: "PROGRAM", label: "Program" },
];

export function SystemConfigFormModal({
  open,
  target,
  programs,
  programsLoading,
  onClose,
}: SystemConfigFormModalProps) {
  const token = useToken();
  const { state, actions, form, flags } = useSystemConfigModal(
    target,
    open,
    onClose,
    programs,
    programsLoading,
  );
  const { formError, isLoading, isEditMode } = state;
  const { handleSubmit, handleCancel, handleConfigKeyChange, handleScopeChange } = actions;
  const { showReferenceId, showCreditFields, showCarryoverToggle, isConfigKeyReadOnly } = flags;

  return (
    <Modal
      title={isEditMode ? "Edit System Configuration" : "Create System Configuration"}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={560}
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
          {/* configKey — read-only in edit mode */}
          <Form.Item
            name="configKey"
            label={
              <span>
                Config Key <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={[{ required: true, message: "Config key is required" }]}
          >
            <Select
              placeholder="Select config key"
              disabled={isConfigKeyReadOnly}
              style={{ height: 40 }}
              options={CONFIG_KEY_OPTIONS}
              onChange={(value) => handleConfigKeyChange(value as ConfigKey)}
            />
          </Form.Item>

          {/* scope */}
          <Form.Item
            name="scope"
            label={
              <span>
                Scope <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={[{ required: true, message: "Scope is required" }]}
          >
            <Select
              placeholder="Select scope"
              style={{ height: 40 }}
              options={SCOPE_OPTIONS}
              onChange={(value) => handleScopeChange(value as ConfigScope)}
            />
          </Form.Item>

          {/* referenceId — shown only when scope === "PROGRAM" */}
          <ConditionalRenderer when={showReferenceId}>
            <Form.Item
              name="referenceId"
              label={
                <span>
                  Program <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Program is required" }]}
            >
              <Select
                placeholder={programsLoading ? "Loading programs..." : "Select program"}
                disabled={programsLoading}
                loading={programsLoading}
                showSearch
                optionFilterProp="label"
                style={{ height: 40 }}
                notFoundContent={
                  programsLoading ? <Spin size="small" /> : "No programs found"
                }
                options={programs.map((p) => ({ value: p.id, label: p.name }))}
              />
            </Form.Item>
          </ConditionalRenderer>

          {/* CREDIT_LOAD_LIMITS fields */}
          <ConditionalRenderer when={showCreditFields}>
            <Form.Item
              name="minCredits"
              label={
                <span>
                  Minimum Credits <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
                </span>
              }
              rules={minCreditsRules}
            >
              <InputNumber
                min={0}
                precision={0}
                placeholder="0"
                style={{ width: "100%", height: 40 }}
              />
            </Form.Item>

            <Form.Item
              name="maxCredits"
              label={
                <span>
                  Maximum Credits <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
                </span>
              }
              rules={[...maxCreditsRules, creditLoadValidator]}
            >
              <InputNumber
                min={0}
                precision={0}
                placeholder="0"
                style={{ width: "100%", height: 40 }}
              />
            </Form.Item>
          </ConditionalRenderer>

          {/* FORCE_CARRYOVER_FIRST toggle */}
          <ConditionalRenderer when={showCarryoverToggle}>
            <Form.Item
              name="forceCarryover"
              label="Require all mandatory courses before electives"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </ConditionalRenderer>

          {/* description */}
          <Form.Item
            name="description"
            label="Description"
            rules={descriptionRules}
            style={{ marginBottom: 0 }}
          >
            <Input.TextArea
              placeholder="Optional description..."
              rows={3}
              maxLength={255}
              showCount
            />
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
            isEditMode ? Permission.SystemConfigsUpdate : Permission.SystemConfigsCreate
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
            {isEditMode ? "Save Changes" : "Create Configuration"}
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
