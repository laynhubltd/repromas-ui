import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { ASSESSMENT_FORMAT_OPTIONS } from "@/shared/constants/priorQualificationTypeOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import {
  Alert,
  Button,
  Form,
  Input,
  Modal,
  Select,
  Switch,
  Typography,
} from "antd";
import { useQualificationTypeFormModal } from "../../hooks/useQualificationTypeModal";
import type { PriorQualificationType } from "../../types/prior-qualification-type";
import {
  assessmentFormatRules,
  codeRules,
  nameRules,
} from "../../utils/validators";
import { ScaleDefinitionEditor } from "../scale/ScaleDefinitionEditor";

type QualificationTypeFormModalProps = {
  open: boolean;
  target: PriorQualificationType | null;
  onClose: () => void;
};

export function QualificationTypeFormModal({
  open,
  target,
  onClose,
}: QualificationTypeFormModalProps) {
  const token = useToken();
  const { state, actions, form } = useQualificationTypeFormModal(
    target,
    open,
    onClose,
  );
  const {
    isEditMode,
    isSubmitting,
    assessmentFormat,
    formatChanged,
    formError,
  } = state;
  const {
    handleSubmit,
    handleCancel,
    handleAssessmentFormatChange,
    handleCodePreview,
  } = actions;

  const codeValue = Form.useWatch("code", form);

  return (
    <Modal
      open={open}
      title={isEditMode ? "Edit Qualification Type" : "Create Qualification Type"}
      onCancel={handleCancel}
      width={720}
      footer={[
        <Button key="cancel" onClick={handleCancel} disabled={isSubmitting}>
          Cancel
        </Button>,
        <PermissionGuard
          key="submit"
          permission={
            isEditMode
              ? Permission.AdmissionPriorQualificationTypesUpdate
              : Permission.AdmissionPriorQualificationTypesCreate
          }
        >
          <Button
            type="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
            onClick={() => form.submit()}
          >
            {isEditMode ? "Save Changes" : "Create Qualification Type"}
          </Button>
        </PermissionGuard>,
      ]}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ marginTop: token.marginMD }}
        initialValues={{ isActive: true, assessmentFormat: "POINTS" }}
      >
        {formError && <ErrorAlert error={formError} />}

        {formatChanged && (
          <Alert
            type="warning"
            showIcon
            message="Assessment format changed"
            description="Existing candidate rows for this type may become incompatible with the new scale."
            style={{ marginBottom: token.marginMD }}
          />
        )}

        {!isEditMode ? (
          <Form.Item
            name="code"
            label={
              <span>
                Code&nbsp;
                <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                  (stored uppercase)
                </Typography.Text>
              </span>
            }
            rules={codeRules}
            extra={
              codeValue
                ? `Will be saved as ${handleCodePreview(String(codeValue))}`
                : "Unique code, e.g. IJMB"
            }
          >
            <Input placeholder="e.g. IJMB" maxLength={50} style={{ textTransform: "uppercase" }} />
          </Form.Item>
        ) : (
          <Form.Item label="Code">
            <Typography.Text code>{target?.code}</Typography.Text>
          </Form.Item>
        )}

        <Form.Item name="name" label="Name" rules={nameRules}>
          <Input placeholder="e.g. Interim Joint Matriculation Board (IJMB)" maxLength={150} />
        </Form.Item>

        <Form.Item
          name="assessmentFormat"
          label="Assessment format"
          rules={assessmentFormatRules}
        >
          <Select
            options={ASSESSMENT_FORMAT_OPTIONS.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
            onChange={handleAssessmentFormatChange}
          />
        </Form.Item>

        <ScaleDefinitionEditor form={form} assessmentFormat={assessmentFormat} />

        <Form.Item
          name="isActive"
          label="Active"
          valuePropName="checked"
          extra="Deactivate instead of delete when type has historical candidate data."
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}
