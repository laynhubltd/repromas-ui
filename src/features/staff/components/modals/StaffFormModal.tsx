// Feature: staff
import { useGetDepartmentsQuery } from "@/features/academic-structure/api/departmentsApi";
import { useGetFacultiesQuery } from "@/features/academic-structure/api/facultiesApi";
import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
import { useGetRolesQuery } from "@/features/role/api/rolesApi";
import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Alert, Badge, Button, DatePicker, Form, Input, Modal, Select, Tag, Typography } from "antd";
import { useStaffFormModal } from "../../hooks/useStaffModal";
import type { Staff } from "../../types/staff";
import {
    departmentIdRules,
    emailRules,
    fileNumberRules,
    firstNameRules,
    lastNameRules,
    phoneNumberRules,
} from "../../utils/validators";

export type StaffFormModalProps = {
  open: boolean;
  /** null = create mode, Staff = edit mode */
  target: Staff | null;
  onClose: () => void;
};

const SCOPE_LABEL: Record<string, string> = {
  GLOBAL: "Global",
  FACULTY: "Faculty",
  DEPARTMENT: "Department",
  PROGRAM: "Program",
};

const SCOPE_COLOR: Record<string, string> = {
  GLOBAL: "blue",
  FACULTY: "green",
  DEPARTMENT: "orange",
  PROGRAM: "purple",
};

export function StaffFormModal({ open, target, onClose }: StaffFormModalProps) {
  const token = useToken();
  const { state, actions, form } = useStaffFormModal(target, open, onClose);
  const { formError, isLoading, isEditMode } = state;
  const { handleSubmit, handleCancel } = actions;

  // Watch roleId to determine scope
  const selectedRoleId = Form.useWatch("roleId", form);

  // Roles
  const { data: rolesData, isLoading: isRolesLoading } = useGetRolesQuery(
    { sort: "name:asc", itemsPerPage: 100 },
    { skip: isEditMode }
  );
  const roles = rolesData?.member ?? [];
  const selectedRole = roles.find((r) => r.id === selectedRoleId) ?? null;
  const selectedScope = selectedRole?.scope ?? null;

  // Departments (for departmentId field)
  const { data: departmentsData, isLoading: isDepartmentsLoading } = useGetDepartmentsQuery({
    itemsPerPage: 200,
  });
  const departments = departmentsData?.member ?? [];

  // Faculties (for scopeReferenceId when scope === FACULTY)
  const { data: facultiesData, isLoading: isFacultiesLoading } = useGetFacultiesQuery(
    { itemsPerPage: 200 },
    { skip: isEditMode || selectedScope !== "FACULTY" }
  );
  const faculties = facultiesData?.member ?? [];

  // Departments for scopeReferenceId when scope === DEPARTMENT
  const { data: scopeDepartmentsData, isLoading: isScopeDepartmentsLoading } =
    useGetDepartmentsQuery(
      { itemsPerPage: 200 },
      { skip: isEditMode || selectedScope !== "DEPARTMENT" }
    );
  const scopeDepartments = scopeDepartmentsData?.member ?? [];

  // Programs for scopeReferenceId when scope === PROGRAM
  const { data: programsData, isLoading: isProgramsLoading } = useGetProgramsQuery(
    { itemsPerPage: 200 },
    { skip: isEditMode || selectedScope !== "PROGRAM" }
  );
  const programs = programsData?.member ?? [];

  // Whether to show scopeReferenceId picker
  const showScopeRef =
    !isEditMode &&
    selectedRoleId != null &&
    selectedScope != null &&
    selectedScope !== "GLOBAL";

  return (
    <Modal
      title={isEditMode ? "Edit Staff" : "Create Staff"}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={isEditMode ? 480 : 600}
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

        {/* Create mode: info callout */}
        {!isEditMode && (
          <div style={{ marginBottom: 16 }}>
            <Alert
              type="info"
              showIcon
              message="A password reset email will be sent to the staff member after creation."
            />
          </div>
        )}

        {/* Edit mode: read-only fileNumber context */}
        {isEditMode && (
          <div style={{ marginBottom: 16 }}>
            <Form layout="vertical" requiredMark={false}>
              <Form.Item label="File Number" style={{ marginBottom: 8 }}>
                <Typography.Text>{target?.fileNumber}</Typography.Text>
              </Form.Item>
            </Form>
          </div>
        )}

        <Form form={form} layout="vertical" requiredMark={false} onFinish={handleSubmit}>
          {/* ── Create-only fields ─────────────────────────────────────── */}
          {!isEditMode && (
            <>
              <Form.Item
                name="email"
                label={
                  <span>
                    Email <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
                  </span>
                }
                rules={emailRules}
              >
                <Input placeholder="e.g. staff@example.com" style={{ height: 40 }} />
              </Form.Item>

              <Form.Item name="firstName" label="First Name" rules={firstNameRules}>
                <Input placeholder="e.g. John" style={{ height: 40 }} />
              </Form.Item>

              <Form.Item name="lastName" label="Last Name" rules={lastNameRules}>
                <Input placeholder="e.g. Doe" style={{ height: 40 }} />
              </Form.Item>

              <Form.Item name="phoneNumber" label="Phone Number" rules={phoneNumberRules}>
                <Input placeholder="e.g. +2348012345678" style={{ height: 40 }} />
              </Form.Item>

              <Form.Item name="dateOfBirth" label="Date of Birth">
                <DatePicker style={{ width: "100%", height: 40 }} />
              </Form.Item>
            </>
          )}

          {/* ── Shared: departmentId ───────────────────────────────────── */}
          <Form.Item
            name="departmentId"
            label={
              <span>
                Department <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={departmentIdRules}
          >
            <Select
              placeholder="Select department"
              loading={isDepartmentsLoading}
              showSearch
              optionFilterProp="label"
              style={{ height: 40 }}
              options={departments.map((d) => ({ value: d.id, label: d.name }))}
            />
          </Form.Item>

          {/* ── Shared: fileNumber ─────────────────────────────────────── */}
          <Form.Item
            name="fileNumber"
            label={
              <span>
                File Number <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={fileNumberRules}
          >
            <Input placeholder="e.g. STAFF/CS/001" style={{ height: 40 }} />
          </Form.Item>

          {/* ── Create-only: roleId + scopeReferenceId ─────────────────── */}
          {!isEditMode && (
            <>
              <Form.Item
                name="roleId"
                label="Role"
              >
                <Select
                  placeholder="Select role (optional)"
                  loading={isRolesLoading}
                  showSearch
                  allowClear
                  optionFilterProp="label"
                  style={{ height: 40 }}
                  onChange={() => {
                    // Reset scopeReferenceId when role changes
                    form.setFieldValue("scopeReferenceId", undefined);
                  }}
                  options={roles.map((r) => ({
                    value: r.id,
                    label: r.name,
                  }))}
                  optionRender={(option) => {
                    const role = roles.find((r) => r.id === option.value);
                    return (
                      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {option.label}
                        {role && (
                          <Tag color={SCOPE_COLOR[role.scope] ?? "default"} style={{ marginLeft: "auto" }}>
                            {SCOPE_LABEL[role.scope] ?? role.scope}
                          </Tag>
                        )}
                      </span>
                    );
                  }}
                  labelRender={(props) => {
                    const role = roles.find((r) => r.id === props.value);
                    if (!role) return <span>{props.label}</span>;
                    return (
                      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {role.name}
                        <Badge
                          count={SCOPE_LABEL[role.scope] ?? role.scope}
                          color={SCOPE_COLOR[role.scope] ?? "default"}
                          style={{ fontSize: 10 }}
                        />
                      </span>
                    );
                  }}
                />
              </Form.Item>

              {/* scopeReferenceId — conditional based on selected role scope */}
              {showScopeRef && selectedScope === "FACULTY" && (
                <Form.Item name="scopeReferenceId" label="Faculty (Scope)">
                  <Select
                    placeholder="Select faculty"
                    loading={isFacultiesLoading}
                    showSearch
                    allowClear
                    optionFilterProp="label"
                    style={{ height: 40 }}
                    options={faculties.map((f) => ({ value: f.id, label: f.name }))}
                  />
                </Form.Item>
              )}

              {showScopeRef && selectedScope === "DEPARTMENT" && (
                <Form.Item name="scopeReferenceId" label="Department (Scope)">
                  <Select
                    placeholder="Select department"
                    loading={isScopeDepartmentsLoading}
                    showSearch
                    allowClear
                    optionFilterProp="label"
                    style={{ height: 40 }}
                    options={scopeDepartments.map((d) => ({ value: d.id, label: d.name }))}
                  />
                </Form.Item>
              )}

              {showScopeRef && selectedScope === "PROGRAM" && (
                <Form.Item name="scopeReferenceId" label="Program (Scope)">
                  <Select
                    placeholder="Select program"
                    loading={isProgramsLoading}
                    showSearch
                    allowClear
                    optionFilterProp="label"
                    style={{ height: 40 }}
                    options={programs.map((p) => ({ value: p.id, label: p.name }))}
                  />
                </Form.Item>
              )}
            </>
          )}

          {/* ── Shared: metadata ──────────────────────────────────────── */}
          <Form.Item name="metadata" label="Metadata" style={{ marginBottom: 0 }}>
            <Input.TextArea
              placeholder='e.g. {"key": "value"}'
              rows={3}
              style={{ fontFamily: "monospace" }}
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
          {isEditMode ? "Save Changes" : "Create Staff"}
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
