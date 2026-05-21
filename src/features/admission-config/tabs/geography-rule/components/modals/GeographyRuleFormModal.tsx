import { PermissionGuard } from "@/features/access-control/PermissionGuard";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { QUOTA_TYPE_FORM_OPTIONS } from "@/shared/constants/geographyRuleOptions";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Button, Form, Modal, Radio, Select, Typography } from "antd";
import { useMemo } from "react";
import { useGeographyRuleFormModal } from "../../hooks/useGeographyRuleModal";
import type { GeographyRuleRow } from "../../hooks/useGeographyRuleTab";
import type { AdmissionGeographyRule } from "../../types/geography-rule";
import type { NigerianState } from "../../types/state";
import { quotaTypeRules, stateIdRules } from "../../utils/validators";

type GeographyRuleFormModalProps = {
  open: boolean;
  target: AdmissionGeographyRule | null;
  onClose: () => void;
  configuredStateIds: Set<number>;
  states: NigerianState[];
  editRow?: GeographyRuleRow | null;
};

export function GeographyRuleFormModal({
  open,
  target,
  onClose,
  configuredStateIds,
  states,
  editRow,
}: GeographyRuleFormModalProps) {
  const token = useToken();

  const {
    state: { isEditMode, formError, isSubmitting },
    actions: { handleSubmit, handleCancel },
    form,
  } = useGeographyRuleFormModal({ target, open, onClose, configuredStateIds });

  const stateOptions = useMemo(
    () =>
      states.map((s) => ({
        value: s.id,
        label: `${s.name} (${s.code})`,
        disabled: configuredStateIds.has(s.id),
      })),
    [states, configuredStateIds],
  );

  const stateDisplay =
    editRow?.stateName ??
    states.find((s) => s.id === target?.stateId)?.name ??
    (target ? "Unknown state" : "");

  const stateCodeDisplay =
    editRow?.stateCode ??
    states.find((s) => s.id === target?.stateId)?.code ??
    "";

  return (
    <Modal
      title={isEditMode ? "Edit Geography Rule" : "Create Geography Rule"}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={480}
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

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleSubmit}
        >
          <ConditionalRenderer when={isEditMode}>
            <div style={{ marginBottom: 24 }}>
              <Typography.Text
                type="secondary"
                style={{ fontSize: token.fontSizeSM }}
              >
                State
              </Typography.Text>
              <div style={{ marginTop: 4 }}>
                <Typography.Text strong>
                  {stateDisplay}
                  {stateCodeDisplay ? ` (${stateCodeDisplay})` : ""}
                </Typography.Text>
              </div>
              <Typography.Text
                type="secondary"
                style={{ fontSize: token.fontSizeSM, display: "block", marginTop: 8 }}
              >
                State cannot be changed after creation.
              </Typography.Text>
            </div>
          </ConditionalRenderer>

          <ConditionalRenderer when={!isEditMode}>
            <Form.Item
              name="stateId"
              label={
                <span>
                  State{" "}
                  <span style={{ color: token.colorError, fontWeight: 700 }}>
                    *
                  </span>
                </span>
              }
              rules={stateIdRules}
            >
              <Select
                showSearch
                placeholder="Select a Nigerian state"
                optionFilterProp="label"
                style={{ width: "100%" }}
                options={stateOptions}
              />
            </Form.Item>
          </ConditionalRenderer>

          <Form.Item
            name="quotaType"
            label={
              <span>
                Quota category{" "}
                <span style={{ color: token.colorError, fontWeight: 700 }}>
                  *
                </span>
              </span>
            }
            rules={quotaTypeRules}
          >
            <Radio.Group>
              {QUOTA_TYPE_FORM_OPTIONS.map((opt) => (
                <Radio key={opt.value} value={opt.value}>
                  {opt.label}
                </Radio>
              ))}
            </Radio.Group>
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
              ? Permission.AdmissionGeographyRulesUpdate
              : Permission.AdmissionGeographyRulesCreate
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
            {isEditMode ? "Save Changes" : "Create Rule"}
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
