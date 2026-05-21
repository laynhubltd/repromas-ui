import { Permission } from "@/features/access-control/permissions";
import { PermissionGuard } from "@/features/access-control/PermissionGuard";
import { useGetOlevelSubjectsQuery } from "@/features/admission-config/tabs/olevel-subject/api/olevelSubjectApi";
import { useToken } from "@/shared/hooks/useToken";
import { JAMB_OLEVEL_SUBJECTS_ITEMS_PER_PAGE } from "@/shared/constants/jambRuleOptions";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Alert, Button, Form, Modal, Select } from "antd";
import { useMemo } from "react";
import { useJambOptionFormModal } from "../../hooks/useJambRuleModal";
import type {
  JambCombinationOption,
  JambRequirementType,
} from "../../types/jamb-rule";
import { subjectIdRules } from "../../utils/validators";

type OptionGroupContext = {
  requirementType: JambRequirementType;
  requiredCount: number;
  currentOptionCount: number;
};

type OptionFormModalProps = {
  open: boolean;
  target: JambCombinationOption | null;
  presetGroupId?: number;
  excludedSubjectIds?: number[];
  groupContext?: OptionGroupContext | null;
  onClose: () => void;
};

export function OptionFormModal({
  open,
  target,
  presetGroupId,
  excludedSubjectIds = [],
  groupContext = null,
  onClose,
}: OptionFormModalProps) {
  const token = useToken();
  const isEditMode = target !== null;

  const {
    state: { formError, isSubmitting, isAddBlocked },
    actions: { handleSubmit, handleCancel },
    form,
  } = useJambOptionFormModal(
    target,
    presetGroupId,
    open,
    onClose,
    excludedSubjectIds,
    groupContext,
  );

  const { data: subjectsData, isLoading: isSubjectsLoading } =
    useGetOlevelSubjectsQuery(
      {
        sort: "name:asc",
        itemsPerPage: JAMB_OLEVEL_SUBJECTS_ITEMS_PER_PAGE,
      },
      { skip: !open },
    );

  const editSubjectId = target?.subjectId;

  const subjectOptions = useMemo(() => {
    const subjects = subjectsData?.member ?? [];
    return subjects
      .filter(
        (s) =>
          isEditMode ||
          !excludedSubjectIds.includes(s.id) ||
          s.id === editSubjectId,
      )
      .map((s) => ({
        value: s.id,
        label: s.code ? `${s.name} (${s.code})` : s.name,
      }));
  }, [subjectsData, excludedSubjectIds, isEditMode, editSubjectId]);

  const addBlockedMessage =
    groupContext != null && isAddBlocked
      ? `Required count (${groupContext.requiredCount}) is too high for ${groupContext.currentOptionCount} subject${groupContext.currentOptionCount === 1 ? "" : "s"}. Edit the group and lower required count to ${groupContext.currentOptionCount + 1} or less before adding another subject.`
      : null;

  return (
    <Modal
      title={isEditMode ? "Edit Subject Option" : "Add Subject Option"}
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

        <ConditionalRenderer when={!!addBlockedMessage}>
          <Alert type="warning" showIcon message={addBlockedMessage} style={{ marginBottom: 16 }} />
        </ConditionalRenderer>

        <Form form={form} layout="vertical" requiredMark={false} onFinish={handleSubmit}>
          {!isEditMode && (
            <Form.Item name="groupId" hidden>
              <Select />
            </Form.Item>
          )}

          <Form.Item name="subjectId" label="Subject" rules={subjectIdRules}>
            <Select
              placeholder="Select O'Level subject"
              loading={isSubjectsLoading}
              options={subjectOptions}
              showSearch
              optionFilterProp="label"
              disabled={isAddBlocked}
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
            isEditMode
              ? Permission.AdmissionJambRulesUpdate
              : Permission.AdmissionJambRulesCreate
          }
        >
          <Button
            type="primary"
            loading={isSubmitting}
            disabled={isSubmitting || isAddBlocked}
            onClick={() => form.submit()}
            block
            style={{ height: 48, fontWeight: 600 }}
          >
            {isEditMode ? "Save Subject" : "Add Subject"}
          </Button>
        </PermissionGuard>
        <Button type="text" block onClick={handleCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
