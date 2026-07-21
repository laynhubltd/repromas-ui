import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { Button, DatePicker, Flex, Form, Input, Modal, Select, Typography } from "antd";
import type { Dayjs } from "dayjs";
import type { useUserFormModal } from "../../hooks/useUserModal";
import type { TenantUser } from "../../types/user-management";
import {
  dateOfBirthRules,
  emailRules,
  firstNameRules,
  lastNameRules,
  phoneRules,
  roleRules,
} from "../../utils/validators";

type UserFormController = ReturnType<typeof useUserFormModal>;

type UserFormModalProps = {
  open: boolean;
  target: TenantUser | null;
  controller: UserFormController;
  roleOptions: { value: number; label: string }[];
  isRolesLoading: boolean;
};

export function UserFormModal({
  open,
  target,
  controller,
  roleOptions,
  isRolesLoading,
}: UserFormModalProps) {
  const token = useToken();
  const { state, actions, form } = controller;
  const isEditMode = target !== null;

  return (
    <Modal
      title={isEditMode ? "Edit User" : "Add User"}
      open={open}
      onCancel={actions.handleCancel}
      footer={null}
      width={560}
      closable
      destroyOnHidden
      styles={{
        body: { padding: `${token.paddingSM}px ${token.paddingSM}px` },
        header: {
          margin: 0,
          padding: `${token.paddingSM}px ${token.paddingSM}px`,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        },
      }}
    >
      <div style={{ padding: "16px 24px" }}>
        {/* Re-mount form on each open/target change via key — initialValues applied fresh */}
        <Form
          key={`user-form-${target?.id ?? "new"}-${open ? "open" : "closed"}`}
          form={form}
          layout="vertical"
          size="middle"
          initialValues={state.initialValues}
        >
          {/* Email — required on create, locked on edit */}
          <Form.Item name="email" label="Email" rules={emailRules}>
            <Input
              type="email"
              placeholder="e.g. john.smith@university.edu"
              autoComplete="off"
              readOnly={isEditMode}
              disabled={isEditMode}
            />
          </Form.Item>

          <ConditionalRenderer when={!isEditMode}>
            <div
              style={{
                background: token.colorBgLayout,
                border: `1px solid ${token.colorBorder}`,
                borderRadius: token.borderRadius,
                padding: "10px 14px",
                marginBottom: 16,
              }}
            >
              <Typography.Text
                type="secondary"
                style={{ fontSize: token.fontSizeSM }}
              >
                A temporary password will be generated automatically. The user
                will receive an email to set their own password.
              </Typography.Text>
            </div>
          </ConditionalRenderer>

          <Flex gap={12}>
            <Form.Item
              name="firstName"
              label="First Name"
              rules={firstNameRules}
              style={{ flex: 1 }}
            >
              <Input placeholder="e.g. John" autoComplete="off" />
            </Form.Item>

            <Form.Item
              name="lastName"
              label="Last Name"
              rules={lastNameRules}
              style={{ flex: 1 }}
            >
              <Input placeholder="e.g. Smith" autoComplete="off" />
            </Form.Item>
          </Flex>

          <Form.Item name="phoneNumber" label="Phone Number" rules={phoneRules}>
            <Input
              type="tel"
              placeholder="e.g. +2348012345678"
              autoComplete="off"
            />
          </Form.Item>

          {/* Date of birth — edit only */}
          <ConditionalRenderer when={isEditMode}>
            <Form.Item
              name="dateOfBirth"
              label="Date of Birth"
              rules={dateOfBirthRules}
              getValueProps={(value: string | null | undefined) => ({
                value: value ? (value as unknown as Dayjs) : null,
              })}
              getValueFromEvent={(date: Dayjs | null) =>
                date ? date.format("YYYY-MM-DD") : null
              }
            >
              <DatePicker
                style={{ width: "100%" }}
                format="YYYY-MM-DD"
                placeholder="Select date of birth"
              />
            </Form.Item>
          </ConditionalRenderer>

          {/* Role — create only; changes go through Manage Roles modal */}
          <ConditionalRenderer when={!isEditMode}>
            <Form.Item name="roleId" label="Role" rules={roleRules}>
              <Select
                showSearch
                filterOption={(input, opt) =>
                  String(opt?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                placeholder="Select a role"
                loading={isRolesLoading}
                options={roleOptions}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </ConditionalRenderer>

          {/* Scope reference — create only, shown when selected role is non-GLOBAL */}
          <ConditionalRenderer when={!isEditMode && state.needsScopeRef}>
            <Form.Item
              name="scopeReferenceId"
              label={`${(state.selectedRoleScope ?? "Scope").charAt(0).toUpperCase()}${(state.selectedRoleScope ?? "scope").slice(1).toLowerCase()}`}
            >
              <Select
                showSearch
                allowClear
                filterOption={(input, opt) =>
                  String(opt?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                placeholder={`Select ${(state.selectedRoleScope ?? "scope").toLowerCase()}`}
                loading={state.isScopeRefLoading}
                options={state.scopeRefOptions}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </ConditionalRenderer>

          <ConditionalRenderer when={isEditMode}>
            <div
              style={{
                background: token.colorBgLayout,
                border: `1px solid ${token.colorBorder}`,
                borderRadius: token.borderRadius,
                padding: "10px 14px",
                marginBottom: 16,
              }}
            >
              <Typography.Text
                type="secondary"
                style={{ fontSize: token.fontSizeSM }}
              >
                To change this user's role use the{" "}
                <Typography.Text strong style={{ fontSize: token.fontSizeSM }}>
                  Manage Roles
                </Typography.Text>{" "}
                action from the table menu.
              </Typography.Text>
            </div>
          </ConditionalRenderer>
        </Form>

        <Flex justify="flex-end" gap={8} style={{ marginTop: 8 }}>
          <Button onClick={actions.handleCancel} disabled={state.isSubmitting}>
            Cancel
          </Button>
          <Button
            type="primary"
            loading={state.isSubmitting}
            onClick={() => void actions.handleSubmit()}
          >
            {isEditMode ? "Save Changes" : "Create User"}
          </Button>
        </Flex>
      </div>
    </Modal>
  );
}
