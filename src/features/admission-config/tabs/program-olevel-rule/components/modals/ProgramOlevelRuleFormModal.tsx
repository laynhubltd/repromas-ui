import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useGetOlevelSubjectsQuery } from "@/features/admission-config/tabs/olevel-subject/api/olevelSubjectApi";
import { OLEVEL_SUBJECT_SORT_DEFAULT } from "@/shared/constants/olevelSubjectOptions";
import { REQUIREMENT_CATEGORY_FORM_OPTIONS } from "@/shared/constants/programOlevelRuleOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Button, Flex, Form, Modal, Radio, Select, Typography } from "antd";
import { useMemo } from "react";
import { useProgramOlevelRuleFormModal } from "../../hooks/useProgramOlevelRuleModal";
import type { ProgramOlevelRequirement } from "../../types/program-olevel-rule";
import { programIdRules, subjectIdRules } from "../../utils/validators";

type ProgramOlevelRuleFormModalProps = {
  open: boolean;
  target: ProgramOlevelRequirement | null;
  presetProgramId: number | undefined;
  onClose: () => void;
  programs: { id: number; name: string; department?: { name: string } | null }[];
  getSubjectIdsForProgram: (programId: number) => number[];
};

export function ProgramOlevelRuleFormModal({
  open,
  target,
  presetProgramId,
  onClose,
  programs,
  getSubjectIdsForProgram,
}: ProgramOlevelRuleFormModalProps) {
  const token = useToken();

  const {
    state: { isEditMode, formError, isSubmitting, programLocked },
    actions: { handleSubmit, handleCancel },
    form,
  } = useProgramOlevelRuleFormModal(target, open, onClose, presetProgramId);

  const programId = Form.useWatch("programId", form);

  const { data: subjectsData, isLoading: isSubjectsLoading } =
    useGetOlevelSubjectsQuery({
      itemsPerPage: 100,
      sort: OLEVEL_SUBJECT_SORT_DEFAULT,
    });

  const subjects = subjectsData?.member ?? [];

  const programOptions = useMemo(
    () =>
      programs.map((p) => ({
        value: p.id,
        label: p.department?.name
          ? `${p.name} (${p.department.name})`
          : p.name,
      })),
    [programs],
  );

  const assignedSubjectIds = useMemo(() => {
    if (programId === undefined) return new Set<number>();
    const ids = getSubjectIdsForProgram(programId);
    if (isEditMode && target) {
      return new Set(ids.filter((id) => id !== target.subjectId));
    }
    return new Set(ids);
  }, [programId, getSubjectIdsForProgram, isEditMode, target]);

  const subjectOptions = useMemo(
    () =>
      subjects.map((s) => ({
        value: s.id,
        label: s.code ? `${s.name} (${s.code})` : s.name,
        disabled: assignedSubjectIds.has(s.id),
      })),
    [subjects, assignedSubjectIds],
  );

  const catalogEmpty = !isSubjectsLoading && subjects.length === 0;

  const title = isEditMode
    ? "Edit Program O'Level Requirement"
    : presetProgramId !== undefined
      ? "Add O'Level Subject"
      : "Create Program O'Level Requirement";

  return (
    <Modal
      title={title}
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

        {catalogEmpty && (
          <Typography.Text
            type="warning"
            style={{ display: "block", marginBottom: 16 }}
          >
            No O'Level subjects in the catalog. Populate or create subjects in
            the O'Level Subjects tab first.
          </Typography.Text>
        )}

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleSubmit}
        >
          <Form.Item
            name="programId"
            label={
              <span>
                Program <Typography.Text type="danger">*</Typography.Text>
              </span>
            }
            rules={programIdRules}
          >
            <Select
              placeholder="Select program"
              options={programOptions}
              showSearch
              optionFilterProp="label"
              disabled={programLocked}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="subjectId"
            label={
              <span>
                O'Level subject <Typography.Text type="danger">*</Typography.Text>
              </span>
            }
            rules={subjectIdRules}
            extra="One subject per save. Add more subjects using Add subject on the program card."
          >
            <Select
              placeholder="Select subject"
              options={subjectOptions}
              loading={isSubjectsLoading}
              disabled={catalogEmpty || programId === undefined}
              showSearch
              optionFilterProp="label"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="isCompulsory"
            label="Requirement category"
            rules={[{ required: true, message: "Select compulsory or optional" }]}
          >
            <Radio.Group style={{ width: "100%" }}>
              <Flex vertical gap={8}>
                {REQUIREMENT_CATEGORY_FORM_OPTIONS.map((option) => (
                  <Radio key={String(option.value)} value={option.value}>
                    <Flex vertical gap={0}>
                      <Typography.Text strong>{option.label}</Typography.Text>
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: token.fontSizeSM }}
                      >
                        {option.description}
                      </Typography.Text>
                    </Flex>
                  </Radio>
                ))}
              </Flex>
            </Radio.Group>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              <Button onClick={handleCancel}>Cancel</Button>
              <PermissionGuard
                permission={
                  isEditMode
                    ? Permission.AdmissionProgramOlevelRulesUpdate
                    : Permission.AdmissionProgramOlevelRulesCreate
                }
              >
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isSubmitting}
                  disabled={catalogEmpty}
                  style={{ fontWeight: 600 }}
                >
                  {isEditMode ? "Save Changes" : "Create Requirement"}
                </Button>
              </PermissionGuard>
            </div>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}
