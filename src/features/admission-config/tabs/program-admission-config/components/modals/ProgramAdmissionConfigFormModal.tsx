import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Button, Form, Modal, Select, Space, Typography } from "antd";
import { useProgramAdmissionConfigFormModal } from "../../hooks/useProgramAdmissionConfigModal";
import type { ProgramAdmissionConfig } from "../../types/program-admission-config";
import { programIdRules } from "../../utils/validators";
import { CapacityQuotaFields } from "../form/CapacityQuotaFields";
import { CutoffFields } from "../form/CutoffFields";
import { JambFloorField } from "../form/JambFloorField";
import { OlevelCreditGateSection } from "../form/OlevelCreditGateSection";

type ProgramAdmissionConfigFormModalProps = {
  open: boolean;
  target: ProgramAdmissionConfig | null;
  onClose: () => void;
};

export function ProgramAdmissionConfigFormModal({
  open,
  target,
  onClose,
}: ProgramAdmissionConfigFormModalProps) {
  const {
    state: {
      isEditMode,
      formError,
      isSubmitting,
      programLocked,
      totalSeatsUsed,
      programOptions,
      programsLoading,
      noProgramsAvailable,
    },
    actions: { handleSubmit, handleCancel, applyFederalPreset, initializeForm },
    form,
  } = useProgramAdmissionConfigFormModal(target, open, onClose);

  const handleAfterOpenChange = (visible: boolean) => {
    if (visible) {
      initializeForm(target);
    }
  };

  return (
    <Modal
      title={isEditMode ? "Edit Admission Cut-offs/Quota" : "Create Admission Cut-offs/Quota"}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={720}
      destroyOnHidden
      closable
      afterOpenChange={handleAfterOpenChange}
    >
      <ErrorAlert error={formError} />
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={handleSubmit}
      >
        <Form.Item
          name="programId"
          label="Program"
          rules={programIdRules}
          extra={
            programLocked
              ? "Program cannot be changed after slots have been allocated."
              : noProgramsAvailable
                ? "Every program already has an admission config, or programs are still loading."
                : undefined
          }
        >
          <Select
            placeholder="Select program"
            options={programOptions}
            showSearch
            optionFilterProp="label"
            disabled={programLocked}
            loading={programsLoading}
            notFoundContent={
              programsLoading ? "Loading programs..." : "No programs available"
            }
          />
        </Form.Item>

        <CapacityQuotaFields
          form={form}
          target={target}
          onApplyFederalPreset={applyFederalPreset}
        />

        <CutoffFields />

        <OlevelCreditGateSection defaultExpanded={!isEditMode} />

        <JambFloorField />

        <ConditionalRenderer when={isEditMode && totalSeatsUsed > 0}>
          <Typography.Text type="warning" style={{ display: "block", marginBottom: 16 }}>
            {totalSeatsUsed} slots have already been used. Reducing capacity or quota
            percentages below used slots will be rejected by the API.
          </Typography.Text>
        </ConditionalRenderer>

        <Form.Item style={{ marginBottom: 0 }}>
          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button onClick={handleCancel}>Cancel</Button>
            <PermissionGuard
              permission={
                isEditMode
                  ? Permission.AdmissionProgramAdmissionConfigsUpdate
                  : Permission.AdmissionProgramAdmissionConfigsCreate
              }
            >
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                {isEditMode ? "Save Changes" : "Create Config"}
              </Button>
            </PermissionGuard>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
