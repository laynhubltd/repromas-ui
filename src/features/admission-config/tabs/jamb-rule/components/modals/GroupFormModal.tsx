import { Permission } from "@/features/access-control/permissions";
import { PermissionGuard } from "@/features/access-control/PermissionGuard";
import { useToken } from "@/shared/hooks/useToken";
import { JAMB_REQUIREMENT_TYPE_OPTIONS } from "@/shared/constants/jambRuleOptions";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Alert, Button, Form, Input, InputNumber, Modal, Select } from "antd";
import type { FormInstance } from "antd/es/form";
import { useJambGroupFormModal } from "../../hooks/useJambRuleModal";
import type { JambCombinationGroup } from "../../types/jamb-rule";
import {
  groupNameRules,
  requirementTypeRules,
  requiredCountRules,
} from "../../utils/validators";

type GroupFormModalProps = {
  open: boolean;
  target: JambCombinationGroup | null;
  combinationId: number | null;
  existingOptionCount?: number;
  onClose: () => void;
};

type AnyOfGroupFieldsProps = {
  form: FormInstance;
  isEditMode: boolean;
  existingOptionCount: number;
};

function AnyOfGroupFields({
  form,
  isEditMode,
  existingOptionCount,
}: AnyOfGroupFieldsProps) {
  const requirementType = Form.useWatch("requirementType", form);

  if (requirementType !== "ANY_OF") {
    return null;
  }

  if (!isEditMode) {
    return (
      <Alert
        type="info"
        showIcon
        message="Any Of groups start with required count 1 so you can add subjects. After adding subjects, edit this group to set how many are required (pick N of M)."
        style={{ marginBottom: 16 }}
      />
    );
  }

  const maxRequiredCount = Math.max(1, existingOptionCount);

  return (
    <>
      <Form.Item
        name="requiredCount"
        label="Required Count"
        rules={requiredCountRules}
        tooltip="Number of subjects the candidate must match from this group"
        extra={
          existingOptionCount > 0
            ? `Must be between 1 and ${existingOptionCount} (current subject count).`
            : "Add subjects first, then raise required count up to the number of options."
        }
      >
        <InputNumber min={1} max={maxRequiredCount} style={{ width: "100%" }} />
      </Form.Item>
    </>
  );
}

export function GroupFormModal({
  open,
  target,
  combinationId,
  existingOptionCount = 0,
  onClose,
}: GroupFormModalProps) {
  const token = useToken();
  const isEditMode = target !== null;

  const {
    state: { formError, isSubmitting },
    actions: { handleSubmit, handleCancel },
    form,
  } = useJambGroupFormModal(
    target,
    combinationId,
    open,
    onClose,
    existingOptionCount,
  );

  return (
    <Modal
      title={isEditMode ? "Edit Requirement Group" : "Add Requirement Group"}
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
        <ErrorAlert variant="form" error={formError} />

        <Form form={form} layout="vertical" requiredMark={false} onFinish={handleSubmit}>
          <Form.Item name="name" label="Group Name" rules={groupNameRules}>
            <Input placeholder="e.g. English Language" />
          </Form.Item>

          <Form.Item
            name="requirementType"
            label="Requirement Type"
            rules={requirementTypeRules}
          >
            <Select
              options={JAMB_REQUIREMENT_TYPE_OPTIONS.map((opt) => ({
                value: opt.value,
                label: opt.label,
              }))}
            />
          </Form.Item>

          <AnyOfGroupFields
            form={form}
            isEditMode={isEditMode}
            existingOptionCount={existingOptionCount}
          />
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
              ? Permission.AdmissionJambRulesUpdate
              : Permission.AdmissionJambRulesCreate
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
            {isEditMode ? "Save Group" : "Add Group"}
          </Button>
        </PermissionGuard>
        <Button type="text" block onClick={handleCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
