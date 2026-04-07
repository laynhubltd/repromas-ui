// Feature: program-graduation-config
import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
import { useGetCurriculumVersionsQuery } from "@/features/settings/tabs/curriculum-version/api/curriculumVersionApi";
import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Button, Form, InputNumber, Modal, Select, Typography } from "antd";
import { useGraduationRequirementFormModal } from "../../hooks/useGraduationRequirementModal";
import type { ProgramGraduationRequirement } from "../../types/graduation-requirement";
import {
    creditRules,
    entryModeRules,
    nonNegativeCreditRules,
} from "../../utils/validators";

export type GraduationRequirementFormModalProps = {
  open: boolean;
  /** null = create mode, ProgramGraduationRequirement = edit mode */
  target: ProgramGraduationRequirement | null;
  onClose: () => void;
};

const ENTRY_MODE_OPTIONS = [
  { value: "UTME", label: "UTME" },
  { value: "DIRECT_ENTRY", label: "Direct Entry" },
  { value: "TRANSFER", label: "Transfer" },
];

export function GraduationRequirementFormModal({
  open,
  target,
  onClose,
}: GraduationRequirementFormModalProps) {
  const token = useToken();
  const { state, actions, form } = useGraduationRequirementFormModal(target, open, onClose);
  const { formError, isLoading, isEditMode } = state;
  const { handleSubmit, handleCancel } = actions;

  const { data: programsData, isLoading: isProgramsLoading } = useGetProgramsQuery({
    itemsPerPage: 200,
  });
  const programs = programsData?.member ?? [];

  const { data: curriculumVersionsData, isLoading: isCurriculumVersionsLoading } =
    useGetCurriculumVersionsQuery({ itemsPerPage: 200 });
  const curriculumVersions = curriculumVersionsData?.member ?? [];

  // Credit invariant validator factory
  const makeCreditInvariantValidator = () => ({
    validator: async (_: unknown, _value: unknown) => {
      const total = form.getFieldValue("minTotalCredits") as number | undefined;
      const core = form.getFieldValue("minCoreCredits") as number | undefined;
      const elective = form.getFieldValue("minElectiveCredits") as number | undefined;
      if (total == null || core == null || elective == null) return;
      const sum = (core ?? 0) + (elective ?? 0);
      if (sum > total) {
        return Promise.reject(
          new Error(
            `Core + elective credits (${sum}) cannot exceed total credits (${total})`,
          ),
        );
      }
    },
  });

  return (
    <Modal
      title={isEditMode ? "Edit Graduation Requirement" : "Create Graduation Requirement"}
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
        <ErrorAlert error={formError} />
        <Form form={form} layout="vertical" requiredMark={false} onFinish={handleSubmit}>
          {/* Program — editable in create, read-only in edit */}
          {isEditMode ? (
            <Form.Item label="Program">
              <Typography.Text>
                {programs.find((p) => p.id === target?.programId)?.name ??
                  `Program #${target?.programId}`}
              </Typography.Text>
            </Form.Item>
          ) : (
            <Form.Item
              name="programId"
              label={
                <span>
                  Program <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Program is required" }]}
            >
              <Select
                placeholder="Select program"
                loading={isProgramsLoading}
                showSearch
                optionFilterProp="label"
                style={{ height: 40 }}
                options={programs.map((p) => ({ value: p.id, label: p.name }))}
              />
            </Form.Item>
          )}

          {/* Curriculum Version — Select in both create and edit mode */}
          <Form.Item
            name="curriculumVersionId"
            label={
              <span>
                Curriculum Version{" "}
                <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={[{ required: true, message: "Curriculum version is required" }]}
          >
            <Select
              placeholder="Select curriculum version"
              loading={isCurriculumVersionsLoading}
              showSearch
              optionFilterProp="label"
              style={{ height: 40 }}
              options={curriculumVersions.map((v) => ({ value: v.id, label: v.name }))}
            />
          </Form.Item>

          <Form.Item
            name="entryMode"
            label={
              <span>
                Entry Mode <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={entryModeRules}
          >
            <Select
              placeholder="Select entry mode"
              style={{ height: 40 }}
              options={ENTRY_MODE_OPTIONS}
            />
          </Form.Item>

          <Form.Item
            name="minTotalCredits"
            label={
              <span>
                Min Total Credits{" "}
                <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={creditRules}
          >
            <InputNumber
              min={1}
              precision={0}
              style={{ width: "100%", height: 40 }}
              placeholder="e.g. 120"
              onChange={() => {
                form.validateFields(["minCoreCredits", "minElectiveCredits"]).catch(() => {});
              }}
            />
          </Form.Item>

          <Form.Item
            name="minCoreCredits"
            label={
              <span>
                Min Core Credits{" "}
                <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={[...nonNegativeCreditRules, makeCreditInvariantValidator()]}
          >
            <InputNumber
              min={0}
              precision={0}
              style={{ width: "100%", height: 40 }}
              placeholder="e.g. 80"
              onChange={() => {
                form.validateFields(["minElectiveCredits"]).catch(() => {});
              }}
            />
          </Form.Item>

          <Form.Item
            name="minElectiveCredits"
            label={
              <span>
                Min Elective Credits{" "}
                <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={[...nonNegativeCreditRules, makeCreditInvariantValidator()]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber
              min={0}
              precision={0}
              style={{ width: "100%", height: 40 }}
              placeholder="e.g. 20"
              onChange={() => {
                form.validateFields(["minCoreCredits"]).catch(() => {});
              }}
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
        <Button
          type="primary"
          loading={isLoading}
          disabled={isLoading}
          onClick={() => form.submit()}
          block
          style={{ height: 48, fontWeight: 600 }}
        >
          {isEditMode ? "Save Changes" : "Create Requirement"}
        </Button>
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
