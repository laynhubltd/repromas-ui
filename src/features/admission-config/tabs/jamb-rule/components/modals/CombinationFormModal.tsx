import { Permission } from "@/features/access-control/permissions";
import { PermissionGuard } from "@/features/access-control/PermissionGuard";
import { useGetDepartmentsQuery } from "@/features/academic-structure/api/departmentsApi";
import { useGetFacultiesQuery } from "@/features/academic-structure/api/facultiesApi";
import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
import { useToken } from "@/shared/hooks/useToken";
import { JAMB_SCOPE_OPTIONS } from "@/shared/constants/jambRuleOptions";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Alert, Button, Form, Input, InputNumber, Modal, Select, Typography } from "antd";
import { useMemo } from "react";
import {
  useJambCombinationFormModal,
  useJambGlobalRuleGuard,
} from "../../hooks/useJambRuleModal";
import type { JambSubjectCombination } from "../../types/jamb-rule";
import { resolveReferenceLabel } from "../../utils/resolveReferenceLabel";
import {
  combinationNameRules,
  priorityWeightRules,
  scopeRules,
} from "../../utils/validators";

type CombinationFormModalProps = {
  open: boolean;
  target: JambSubjectCombination | null;
  onClose: () => void;
  onCreated?: (combination: JambSubjectCombination) => void;
};

export function CombinationFormModal({
  open,
  target,
  onClose,
  onCreated,
}: CombinationFormModalProps) {
  const token = useToken();
  const isEditMode = target !== null;

  const {
    state: { formError, isSubmitting },
    actions: { handleSubmit, handleCancel },
    form,
  } = useJambCombinationFormModal(target, open, onClose, onCreated);

  const { hasExistingGlobal } = useJambGlobalRuleGuard(open, !isEditMode);

  const scopeValue = Form.useWatch("scope", form);

  const shouldFetchFaculties = open && (scopeValue === "FACULTY" || (isEditMode && target?.scope === "FACULTY"));
  const shouldFetchDepartments = open && (scopeValue === "DEPARTMENT" || (isEditMode && target?.scope === "DEPARTMENT"));
  const shouldFetchPrograms = open && (scopeValue === "PROGRAM" || (isEditMode && target?.scope === "PROGRAM"));

  const { data: facultiesData, isLoading: isFacultiesLoading } =
    useGetFacultiesQuery(
      { sort: "name:asc", itemsPerPage: 100 },
      { skip: !shouldFetchFaculties },
    );

  const { data: departmentsData, isLoading: isDepartmentsLoading } =
    useGetDepartmentsQuery(
      { sort: "name:asc", itemsPerPage: 100 },
      { skip: !shouldFetchDepartments },
    );

  const { data: programsData, isLoading: isProgramsLoading } =
    useGetProgramsQuery(
      { sort: "name:asc", itemsPerPage: 100 },
      { skip: !shouldFetchPrograms },
    );

  const referenceOptions = useMemo(() => {
    if (scopeValue === "FACULTY") {
      return (facultiesData?.member ?? []).map((f) => ({
        value: f.id,
        label: f.name,
      }));
    }
    if (scopeValue === "DEPARTMENT") {
      return (departmentsData?.member ?? []).map((d) => ({
        value: d.id,
        label: d.name,
      }));
    }
    if (scopeValue === "PROGRAM") {
      return (programsData?.member ?? []).map((p) => ({
        value: p.id,
        label: p.name,
      }));
    }
    return [];
  }, [scopeValue, facultiesData, departmentsData, programsData]);

  const isLoadingRefs =
    isFacultiesLoading || isDepartmentsLoading || isProgramsLoading;

  const editReferenceLabel = useMemo(() => {
    if (!target || target.scope === "GLOBAL") return "Institution default";
    return resolveReferenceLabel(
      target.scope,
      target.referenceId,
      facultiesData?.member ?? [],
      departmentsData?.member ?? [],
      programsData?.member ?? [],
    );
  }, [target, facultiesData?.member, departmentsData?.member, programsData?.member]);

  return (
    <Modal
      title={isEditMode ? "Edit JAMB Combination" : "Create JAMB Combination"}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={560}
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

        <ConditionalRenderer when={!isEditMode && hasExistingGlobal}>
          <Alert
            type="info"
            showIcon
            message="A GLOBAL combination already exists. Only one institution default is allowed."
            style={{ marginBottom: 16 }}
          />
        </ConditionalRenderer>

        <Form form={form} layout="vertical" requiredMark={false} onFinish={handleSubmit}>
          <Form.Item name="name" label="Name" rules={combinationNameRules}>
            <Input placeholder="e.g. Computer Science UTME rule" />
          </Form.Item>

          <ConditionalRenderer when={isEditMode}>
            <div style={{ marginBottom: 16 }}>
              <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                Scope
              </Typography.Text>
              <div style={{ marginTop: 4 }}>
                <Typography.Text strong>{target?.scope}</Typography.Text>
              </div>
              <ConditionalRenderer when={target?.scope !== "GLOBAL"}>
                <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM, display: "block", marginTop: 8 }}>
                  Reference
                </Typography.Text>
                <Typography.Text strong style={{ display: "block", marginTop: 4 }}>
                  {editReferenceLabel}
                </Typography.Text>
              </ConditionalRenderer>
              <Typography.Text
                type="secondary"
                style={{ fontSize: token.fontSizeSM, display: "block", marginTop: 8 }}
              >
                Scope and reference cannot be changed after creation. Delete and recreate to retarget.
              </Typography.Text>
            </div>
          </ConditionalRenderer>

          <ConditionalRenderer when={!isEditMode}>
            <Form.Item name="scope" label="Scope" rules={scopeRules}>
              <Select
                placeholder="Select scope"
                options={JAMB_SCOPE_OPTIONS.filter(
                  (opt) =>
                    !(opt.value === "GLOBAL" && hasExistingGlobal),
                )}
              />
            </Form.Item>

            <ConditionalRenderer when={scopeValue && scopeValue !== "GLOBAL"}>
              <Form.Item
                name="referenceId"
                label="Reference"
                rules={[{ required: true, message: "Reference is required" }]}
              >
                <Select
                  placeholder="Select reference"
                  loading={isLoadingRefs}
                  options={referenceOptions}
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
            </ConditionalRenderer>
          </ConditionalRenderer>

          <Form.Item
            name="priorityWeight"
            label="Priority Weight"
            rules={priorityWeightRules}
            tooltip="Higher weight wins when multiple rules match. Prefer unique weights per scope level."
          >
            <InputNumber min={0} style={{ width: "100%" }} placeholder="0" />
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
            disabled={isSubmitting}
            onClick={() => form.submit()}
            block
            style={{ height: 48, fontWeight: 600 }}
          >
            {isEditMode ? "Save Changes" : "Create Combination"}
          </Button>
        </PermissionGuard>
        <Button type="text" block onClick={handleCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
