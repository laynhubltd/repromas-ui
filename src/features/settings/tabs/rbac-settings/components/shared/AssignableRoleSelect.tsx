import { Alert, Flex, Select, Tooltip } from "antd";
import type { SelectProps } from "antd";
import React from "react";
import { useAssignableRolePicker } from "../../hooks/useAssignableRolePicker";
import type { Role } from "../../types/rbac";
import { ScopeBadge } from "../ScopeBadge";

export type AssignableRoleSelectProps = Omit<
  SelectProps<number, { value: number; label: React.ReactNode; role: Role }>,
  "options"
> & {
  targetUserId?: number | null;
  onRoleSelect?: (role: Role | null) => void;
  showEmptyAlert?: boolean;
};

export function AssignableRoleSelect({
  targetUserId,
  onRoleSelect,
  showEmptyAlert = true,
  disabled,
  placeholder = "Select a role",
  ...selectProps
}: AssignableRoleSelectProps) {
  const { roles, isLoading, isSelfAssignmentRestricted, isEmpty } =
    useAssignableRolePicker({ targetUserId });

  const roleOptions = roles.map((role) => ({
    value: role.id,
    role,
    label: (
      <Flex align="center" justify="space-between" style={{ width: "100%" }}>
        <span>{role.name}</span>
        <ScopeBadge scope={role.scope} />
      </Flex>
    ),
  }));

  const handleChange: SelectProps<number>["onChange"] = (value, option) => {
    selectProps.onChange?.(value, option as never);
    if (onRoleSelect) {
      const selected = roles.find((r) => r.id === value) ?? null;
      onRoleSelect(selected);
    }
  };

  if (isSelfAssignmentRestricted) {
    return (
      <Flex vertical gap={8}>
        <Tooltip title="Self-assignment is restricted by administrative policy.">
          <Select
            {...selectProps}
            disabled
            placeholder="Self-assignment restricted"
            style={{ width: "100%", ...selectProps.style }}
          />
        </Tooltip>
        <Alert
          type="warning"
          showIcon
          message="Self-assignment restricted"
          description="Users cannot assign roles to themselves under the delegated authority policy."
          style={{ fontSize: 12 }}
        />
      </Flex>
    );
  }

  if (isEmpty && showEmptyAlert) {
    return (
      <Flex vertical gap={8}>
        <Select
          {...selectProps}
          disabled
          placeholder="No assignable roles"
          style={{ width: "100%", ...selectProps.style }}
        />
        <Alert
          type="info"
          showIcon
          message="No assignable roles configured"
          description="You do not have administrative privileges to assign roles. Contact your institution's System Administrator to configure your authority range."
          style={{ fontSize: 12 }}
        />
      </Flex>
    );
  }

  return (
    <Select
      {...selectProps}
      disabled={disabled || isLoading}
      loading={isLoading}
      placeholder={placeholder}
      options={roleOptions}
      onChange={handleChange}
      showSearch
      filterOption={(input, option) => {
        const role = option?.role as Role | undefined;
        if (!role) return false;
        return (
          role.name.toLowerCase().includes(input.toLowerCase()) ||
          role.scope.toLowerCase().includes(input.toLowerCase())
        );
      }}
      style={{ width: "100%", ...selectProps.style }}
    />
  );
}
