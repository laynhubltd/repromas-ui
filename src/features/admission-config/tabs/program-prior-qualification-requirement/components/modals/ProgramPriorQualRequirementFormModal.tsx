import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import type { PriorQualificationType } from "@/features/admission-config/tabs/qualification-type/types/prior-qualification-type";
import { getAssessmentFormatLabel } from "@/shared/constants/priorQualificationTypeOptions";
import { LevelSelect } from "@/components/ui-kit/data-entry/LevelSelect";
import { useToken } from "@/shared/hooks/useToken";
import { Button, Form, Modal, Select, Tag, Typography } from "antd";
import { useMemo } from "react";
import { useProgramPriorQualRequirementFormModal } from "../../hooks/useProgramPriorQualRequirementModal";
import type { ProgramPriorQualificationRequirement } from "../../types/program-prior-qualification-requirement";
import {
  priorQualificationTypeIdRules,
  programIdRules,
} from "../../utils/validators";
import { RequirementRuleIntentField } from "../form/RequirementRuleIntentField";
import { RequirementThresholdFields } from "../form/RequirementThresholdFields";

type ProgramPriorQualRequirementFormModalProps = {
  open: boolean;
  target: ProgramPriorQualificationRequirement | null;
  presetProgramId: number | undefined;
  onClose: () => void;
  programs: { id: number; name: string; department?: { name: string } | null }[];
  qualificationTypes: PriorQualificationType[];
  getUsedTypeIdsForProgram: (programId: number | undefined) => number[];
};

export function ProgramPriorQualRequirementFormModal({
  open,
  target,
  presetProgramId,
  onClose,
  programs,
  qualificationTypes,
  getUsedTypeIdsForProgram,
}: ProgramPriorQualRequirementFormModalProps) {
  const token = useToken();
  const {
    state: { isEditMode, isSubmitting, programLocked, typeLocked },
    actions: { handleSubmit, handleCancel },
    form,
  } = useProgramPriorQualRequirementFormModal(
    target,
    open,
    onClose,
    presetProgramId,
    getUsedTypeIdsForProgram,
    qualificationTypes,
  );

  const programId = Form.useWatch("programId", form);
  const selectedTypeId = Form.useWatch("priorQualificationTypeId", form);
  const usedTypeIdsForProgram = getUsedTypeIdsForProgram(programId);

  const programOptions = useMemo(
    () =>
      programs.map((program) => ({
        value: program.id,
        label: program.department?.name
          ? `${program.name} (${program.department.name})`
          : program.name,
      })),
    [programs],
  );

  const selectedType = useMemo(
    () =>
      qualificationTypes.find((type) => type.id === selectedTypeId) ??
      target?.priorQualificationType ??
      null,
    [qualificationTypes, selectedTypeId, target?.priorQualificationType],
  );

  const typeOptions = useMemo(() => {
    const disabledIds = new Set(
      programId && !isEditMode ? usedTypeIdsForProgram : [],
    );
    return qualificationTypes.map((type) => ({
      value: type.id,
      label: `${type.code} — ${type.name}`,
      disabled: disabledIds.has(type.id),
    }));
  }, [qualificationTypes, programId, isEditMode, usedTypeIdsForProgram]);

  return (
    <Modal
      open={open}
      title={isEditMode ? "Edit Prior Qual Requirement" : "Add Prior Qual Requirement"}
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
              ? Permission.AdmissionProgramPriorQualificationRequirementsUpdate
              : Permission.AdmissionProgramPriorQualificationRequirementsCreate
          }
        >
          <Button
            type="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
            onClick={() => form.submit()}
          >
            {isEditMode ? "Save Changes" : "Add Requirement"}
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
        initialValues={{ ruleIntent: "must_have", groupMode: "standalone", isMandatory: true }}
      >
        <Form.Item name="programId" label="Program" rules={programIdRules}>
          <Select
            placeholder="Select program"
            options={programOptions}
            disabled={programLocked}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>

        <Form.Item
          name="priorQualificationTypeId"
          label="Qualification type"
          rules={priorQualificationTypeIdRules}
          extra={
            selectedType ? (
              <Tag style={{ marginTop: 4 }}>
                {getAssessmentFormatLabel(selectedType.assessmentFormat)}
              </Tag>
            ) : undefined
          }
        >
          <Select
            placeholder="Select qualification type"
            options={typeOptions}
            disabled={typeLocked}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>

        <Form.Item
          name="levelId"
          label="Applies to Level (Optional)"
          extra="Leave blank if requirement applies to all levels of the program."
        >
          <LevelSelect
            placeholder="Select a specific level (Optional)"
            allowClear
            showSearch
          />
        </Form.Item>

        <RequirementRuleIntentField />

        <RequirementThresholdFields selectedType={selectedType} />

        <Form.Item name="entryLevelId" label="Entry level (optional)">
          <LevelSelect
            placeholder="Select entry level"
            allowClear
            showSearch
          />
        </Form.Item>

        {isEditMode && (
          <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            Program and qualification type cannot be changed after creation.
          </Typography.Text>
        )}
      </Form>
    </Modal>
  );
}
