// Feature: program-credit-limits
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import {
    Button,
    Form,
    InputNumber,
    Modal,
    Select,
    Tag,
    Typography,
} from "antd";
import { useCreditLimitFormModal } from "../../hooks/useCreditLimitModal";
import type {
    LevelOption,
    ProgramOption,
    RegistrationCreditLimit,
    SemesterTypeOption,
    SessionOption,
    StatusOption,
} from "../../types/credit-limits";
import {
    maxCreditsRules,
    minCreditsRules,
    priorityWeightRules,
    validateCreditRange,
} from "../../utils/validators";

export type CreditLimitFormModalProps = {
  open: boolean;
  target: RegistrationCreditLimit | null;
  programs: ProgramOption[];
  levels: LevelOption[];
  sessions: SessionOption[];
  semesterTypes: SemesterTypeOption[];
  statuses: StatusOption[];
  programsLoading: boolean;
  levelsLoading: boolean;
  sessionsLoading: boolean;
  semesterTypesLoading: boolean;
  statusesLoading: boolean;
  onClose: () => void;
};

export function CreditLimitFormModal({
  open,
  target,
  programs,
  levels,
  sessions,
  semesterTypes,
  statuses,
  programsLoading,
  levelsLoading,
  sessionsLoading,
  semesterTypesLoading,
  statusesLoading,
  onClose,
}: CreditLimitFormModalProps) {
  const token = useToken();
  const { state, actions, form, flags } = useCreditLimitFormModal(
    target,
    open,
    onClose,
  );
  const { formError, isLoading, isEditMode } = state;
  const { handleSubmit, handleCancel } = actions;

  const crossFieldValidator = ({
    getFieldValue,
  }: {
    getFieldValue: (name: string) => unknown;
  }) => ({
    validator(_: unknown, value: number) {
      const min = getFieldValue("minCredits") as number;
      const error = validateCreditRange(min, value);
      return error ? Promise.reject(new Error(error)) : Promise.resolve();
    },
  });

  return (
    <Modal
      title={isEditMode ? "Edit Credit Limit" : "Create Credit Limit"}
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

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleSubmit}
        >
          {/* programId */}
          <Form.Item name="programId" label="Program">
            <Select
              placeholder="Any program"
              allowClear
              disabled={isEditMode || programsLoading}
              loading={programsLoading}
              showSearch
              optionFilterProp="label"
              style={{ height: 40 }}
              options={[
                { value: null, label: "Any program" },
                ...programs.map((p) => ({ value: p.id, label: p.name })),
              ]}
            />
          </Form.Item>

          {/* levelId */}
          <Form.Item name="levelId" label="Level">
            <Select
              placeholder="Any level"
              allowClear
              disabled={isEditMode || levelsLoading}
              loading={levelsLoading}
              showSearch
              optionFilterProp="label"
              style={{ height: 40 }}
              options={[
                { value: null, label: "Any level" },
                ...levels.map((l) => ({ value: l.id, label: l.name })),
              ]}
            />
          </Form.Item>

          {/* sessionId */}
          <Form.Item name="sessionId" label="Session">
            <Select
              placeholder="Any session"
              allowClear
              disabled={isEditMode || sessionsLoading}
              loading={sessionsLoading}
              showSearch
              optionFilterProp="label"
              style={{ height: 40 }}
              options={[
                { value: null, label: "Any session" },
                ...sessions.map((s) => ({
                  value: s.id,
                  label: s.isCurrent ? (
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      {s.name}
                      <Tag
                        color="green"
                        style={{ margin: 0, lineHeight: "18px" }}
                      >
                        Current
                      </Tag>
                    </span>
                  ) : (
                    s.name
                  ),
                })),
              ]}
            />
          </Form.Item>

          {/* semesterTypeId */}
          <Form.Item name="semesterTypeId" label="Semester Type">
            <Select
              placeholder="Any semester type"
              allowClear
              disabled={isEditMode || semesterTypesLoading}
              loading={semesterTypesLoading}
              showSearch
              optionFilterProp="label"
              style={{ height: 40 }}
              options={[
                { value: null, label: "Any semester type" },
                ...semesterTypes.map((st) => ({
                  value: st.id,
                  label: st.name,
                })),
              ]}
            />
          </Form.Item>

          {/* statusId */}
          <Form.Item name="statusId" label="Student Status">
            <Select
              placeholder="Any status"
              allowClear
              disabled={isEditMode || statusesLoading}
              loading={statusesLoading}
              showSearch
              optionFilterProp="label"
              style={{ height: 40 }}
              options={[
                { value: null, label: "Any status" },
                ...statuses.map((s) => ({ value: s.id, label: s.name })),
              ]}
            />
          </Form.Item>

          {/* minCredits */}
          <Form.Item
            name="minCredits"
            label={
              <span>
                Minimum Credits{" "}
                <span style={{ color: token.colorError, fontWeight: 700 }}>
                  *
                </span>
              </span>
            }
            rules={minCreditsRules}
          >
            <InputNumber
              min={1}
              precision={0}
              placeholder="0"
              style={{ width: "100%", height: 40 }}
            />
          </Form.Item>

          {/* maxCredits */}
          <Form.Item
            name="maxCredits"
            label={
              <span>
                Maximum Credits{" "}
                <span style={{ color: token.colorError, fontWeight: 700 }}>
                  *
                </span>
              </span>
            }
            rules={[...maxCreditsRules, crossFieldValidator]}
            dependencies={["minCredits"]}
          >
            <InputNumber
              min={1}
              precision={0}
              placeholder="0"
              style={{ width: "100%", height: 40 }}
            />
          </Form.Item>

          {/* priorityWeight */}
          <Form.Item
            name="priorityWeight"
            label={
              <span>
                Priority Weight{" "}
                <span style={{ color: token.colorError, fontWeight: 700 }}>
                  *
                </span>
              </span>
            }
            rules={priorityWeightRules}
            style={{ marginBottom: 4 }}
          >
            <InputNumber
              min={0}
              precision={0}
              defaultValue={0}
              placeholder="0"
              style={{ width: "100%", height: 40 }}
            />
          </Form.Item>

          {/* Priority weight hint — shown only when at least one dimension is set */}
          <ConditionalRenderer when={flags.dimensionCount > 0}>
            <Typography.Text
              type="secondary"
              style={{
                fontSize: token.fontSizeSM,
                display: "block",
                marginBottom: 16,
              }}
            >
              Suggested: {flags.suggestedPriorityWeight} based on{" "}
              {flags.dimensionCount} dimension(s) set.
            </Typography.Text>
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
              ? Permission.RegistrationCreditLimitsUpdate
              : Permission.RegistrationCreditLimitsCreate
          }
        >
          <Button
            type="primary"
            block
            loading={isLoading}
            onClick={handleSubmit}
          >
            {isEditMode ? "Save Changes" : "Create Credit Limit"}
          </Button>
        </PermissionGuard>

        <Button block onClick={handleCancel} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
