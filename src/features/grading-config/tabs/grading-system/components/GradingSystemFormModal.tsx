// Feature: grading-config
import { useGetDepartmentsQuery } from "@/features/academic-structure/api/departmentsApi";
import { useGetFacultiesQuery } from "@/features/academic-structure/api/facultiesApi";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
import { useGetCurriculumVersionsQuery } from "@/features/settings/tabs/curriculum-version/api/curriculumVersionApi";
import { GRADING_SYSTEM_SCOPE_OPTIONS } from "@/shared/constants/gradingSystemOptions";
import { LevelSelect } from "@/components/ui-kit/data-entry/LevelSelect";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import {
    Button,
    Form,
    Input,
    InputNumber,
    Modal,
    Select,
    Switch,
    Typography,
} from "antd";
import { useGradingSystemFormModal } from "../hooks/useGradingSystemModal";
import type { GradingSystem } from "../types/grading-system";
import {
    curriculumVersionIdRules,
    maxCgpaRules,
    nameRules,
    referenceIdRules,
    scopeRules,
} from "../utils/validators";

type GradingSystemFormModalProps = {
  open: boolean;
  target: GradingSystem | null;
  onClose: () => void;
};

export function GradingSystemFormModal({
  open,
  target,
  onClose,
}: GradingSystemFormModalProps) {
  const token = useToken();
  const { state, actions, form } = useGradingSystemFormModal(
    target,
    open,
    onClose,
  );
  const { isEditMode, isSubmitting, scope, isGpaBased } = state;
  const {
    handleSubmit,
    handleCancel,
    handleScopeChange,
    handleIsGpaBasedChange,
  } = actions;

  // Reference entity data — fetched based on scope
  const { data: facultiesData, isLoading: facultiesLoading } =
    useGetFacultiesQuery(
      { itemsPerPage: 200 },
      { skip: scope !== "FACULTY" || isEditMode },
    );
  const { data: departmentsData, isLoading: departmentsLoading } =
    useGetDepartmentsQuery(
      { itemsPerPage: 200 },
      { skip: scope !== "DEPARTMENT" || isEditMode },
    );
  const { data: programsData, isLoading: programsLoading } =
    useGetProgramsQuery(
      { itemsPerPage: 200 },
      { skip: scope !== "PROGRAM" || isEditMode },
    );

  // Curriculum version options
  const { data: curriculumVersionsData, isLoading: cvLoading } =
    useGetCurriculumVersionsQuery({ itemsPerPage: 200 }, { skip: !open });

  const faculties = facultiesData?.member ?? [];
  const departments = departmentsData?.member ?? [];
  const programs = programsData?.member ?? [];
  const curriculumVersions = curriculumVersionsData?.member ?? [];

  const isReferenceLoading =
    facultiesLoading || departmentsLoading || programsLoading;
  const isNonGlobal = scope !== "GLOBAL";

  // Reference entity options based on scope
  const referenceOptions =
    scope === "FACULTY"
      ? faculties.map((f) => ({ value: f.id, label: f.name }))
      : scope === "DEPARTMENT"
        ? departments.map((d) => ({ value: d.id, label: d.name }))
        : scope === "PROGRAM"
          ? programs.map((p) => ({ value: p.id, label: p.name }))
          : [];

  const referenceLabel =
    scope === "FACULTY"
      ? "Faculty"
      : scope === "DEPARTMENT"
        ? "Department"
        : scope === "PROGRAM"
          ? "Program"
          : "Reference Entity";

  return (
    <Modal
      title={isEditMode ? "Edit Grading System" : "Create Grading System"}
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
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleSubmit}
        >
          {/* Scope — editable in create mode, read-only in edit mode */}
          <ConditionalRenderer when={!isEditMode}>
            <Form.Item
              name="scope"
              label={
                <span>
                  Scope{" "}
                  <span style={{ color: token.colorError, fontWeight: 700 }}>
                    *
                  </span>
                </span>
              }
              rules={scopeRules}
            >
              <Select
                placeholder="Select scope"
                style={{ height: 40 }}
                options={GRADING_SYSTEM_SCOPE_OPTIONS}
                onChange={(value) => handleScopeChange(value)}
              />
            </Form.Item>
          </ConditionalRenderer>

          <ConditionalRenderer when={isEditMode && target !== null}>
            <Form.Item label="Scope">
              <Typography.Text>{target?.scope}</Typography.Text>
            </Form.Item>
          </ConditionalRenderer>

          {/* Reference entity — editable in create mode (non-GLOBAL), read-only in edit mode */}
          <ConditionalRenderer when={!isEditMode && isNonGlobal}>
            <Form.Item
              name="referenceId"
              label={
                <span>
                  {referenceLabel}{" "}
                  <span style={{ color: token.colorError, fontWeight: 700 }}>
                    *
                  </span>
                </span>
              }
              rules={referenceIdRules}
            >
              <Select
                placeholder={
                  isReferenceLoading ? "Loading..." : `Select ${referenceLabel}`
                }
                disabled={isReferenceLoading}
                loading={isReferenceLoading}
                showSearch
                optionFilterProp="label"
                style={{ height: 40 }}
                options={referenceOptions}
              />
            </Form.Item>
          </ConditionalRenderer>

          <ConditionalRenderer
            when={isEditMode && target !== null && target.scope !== "GLOBAL"}
          >
            <Form.Item label={referenceLabel}>
              <Typography.Text>
                {target?.referenceEntity?.name ?? "—"}
              </Typography.Text>
            </Form.Item>
          </ConditionalRenderer>

          {/* Name */}
          <Form.Item
            name="name"
            label={
              <span>
                Name{" "}
                <span style={{ color: token.colorError, fontWeight: 700 }}>
                  *
                </span>
              </span>
            }
            rules={nameRules}
          >
            <Input
              placeholder="e.g. Standard 5-Point Scale"
              style={{ height: 40 }}
            />
          </Form.Item>

          {/* isGpaBased */}
          <Form.Item
            name="isGpaBased"
            label="GPA-Based"
            valuePropName="checked"
          >
            <Switch onChange={handleIsGpaBasedChange} />
          </Form.Item>

          {/* maxCgpa — shown and required only when isGpaBased */}
          <ConditionalRenderer when={isGpaBased}>
            <Form.Item
              name="maxCgpa"
              label={
                <span>
                  Max CGPA{" "}
                  <span style={{ color: token.colorError, fontWeight: 700 }}>
                    *
                  </span>
                </span>
              }
              rules={maxCgpaRules}
            >
              <InputNumber
                min={1.0}
                max={10.0}
                step={0.01}
                precision={2}
                placeholder="e.g. 5.00"
                style={{ width: "100%", height: 40 }}
              />
            </Form.Item>
          </ConditionalRenderer>

          {/* levelId — optional */}
          <Form.Item name="levelId" label="Level (optional)">
            <LevelSelect
              placeholder="Select level (optional)"
              allowClear
              style={{ height: 40 }}
            />
          </Form.Item>

          {/* curriculumVersionId — required on create, optional on edit */}
          <Form.Item
            name="curriculumVersionId"
            label={
              isEditMode ? (
                "Curriculum Version (optional)"
              ) : (
                <span>
                  Curriculum Version{" "}
                  <span style={{ color: token.colorError, fontWeight: 700 }}>
                    *
                  </span>
                </span>
              )
            }
            rules={isEditMode ? undefined : curriculumVersionIdRules}
            style={{ marginBottom: 0 }}
          >
            <Select
              placeholder={
                cvLoading
                  ? "Loading..."
                  : isEditMode
                    ? "Select curriculum version (optional)"
                    : "Select curriculum version"
              }
              disabled={cvLoading}
              loading={cvLoading}
              allowClear={isEditMode}
              showSearch
              optionFilterProp="label"
              style={{ height: 40 }}
              options={curriculumVersions.map((cv) => ({
                value: cv.id,
                label: cv.name,
              }))}
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
              ? Permission.GradingSchemaConfigsUpdate
              : Permission.GradingSchemaConfigsCreate
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
            {isEditMode ? "Save Changes" : "Create"}
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
