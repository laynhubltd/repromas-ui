import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer, centeredBox } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Flex,
  Modal,
  Popconfirm,
  Select,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import type { useManageUserRolesModal } from "../../hooks/useUserModal";
import type { TenantUser, UserRoleDetail } from "../../types/user-management";
import { resolveUserDisplayName } from "../../types/user-management";

type ManageRolesController = ReturnType<typeof useManageUserRolesModal>;

type ManageUserRolesModalProps = {
  open: boolean;
  target: TenantUser | null;
  controller: ManageRolesController;
};

// ── Single assignment row ─────────────────────────────────────────────────────

type AssignmentRowProps = {
  assignment: UserRoleDetail;
  isRevoking: boolean;
  onRevoke: (assignment: UserRoleDetail) => void;
};

function AssignmentRow({ assignment, isRevoking, onRevoke }: AssignmentRowProps) {
  const token = useToken();

  return (
    <Flex
      justify="space-between"
      align="center"
      style={{
        padding: "10px 14px",
        border: `1px solid ${token.colorBorder}`,
        borderRadius: token.borderRadius,
        background: token.colorBgContainer,
        marginBottom: 8,
      }}
    >
      <Flex vertical gap={2} style={{ flex: 1, minWidth: 0 }}>
        <Typography.Text strong style={{ fontSize: token.fontSize }}>
          {assignment.roleName}
        </Typography.Text>
        <Flex gap={6} align="center">
          <Tag style={{ margin: 0, fontSize: token.fontSizeSM }}>
            {assignment.scope}
          </Tag>
          <ConditionalRenderer when={assignment.scopeReferenceId !== null}>
            <Typography.Text
              type="secondary"
              style={{ fontSize: token.fontSizeSM }}
            >
              Ref #{assignment.scopeReferenceId}
            </Typography.Text>
          </ConditionalRenderer>
        </Flex>
      </Flex>

      <Popconfirm
        title="Remove role"
        description={`Remove "${assignment.roleName}" from this user?`}
        okText="Remove"
        okButtonProps={{ danger: true }}
        cancelText="Cancel"
        onConfirm={() => onRevoke(assignment)}
        placement="topRight"
      >
        <Tooltip title="Remove role">
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            loading={isRevoking}
          />
        </Tooltip>
      </Popconfirm>
    </Flex>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

export function ManageUserRolesModal({
  open,
  target,
  controller,
}: ManageUserRolesModalProps) {
  const token = useToken();
  const { state, actions, flags } = controller;

  return (
    <Modal
      title="Manage Roles"
      open={open}
      onCancel={actions.handleClose}
      footer={null}
      width={520}
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
        {/* User context banner */}
        <div
          style={{
            background: token.colorBgLayout,
            border: `1px solid ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            padding: "10px 14px",
            marginBottom: 20,
          }}
        >
          <Typography.Text
            type="secondary"
            style={{ fontSize: token.fontSizeSM, display: "block" }}
          >
            User
          </Typography.Text>
          <Typography.Text strong>
            {target ? resolveUserDisplayName(target) : "—"}
          </Typography.Text>
        </div>

        {/* Current assignments section */}
        <Typography.Text
          strong
          style={{ display: "block", marginBottom: 10, fontSize: token.fontSize }}
        >
          Current Roles
        </Typography.Text>

        <DataLoader
          loading={state.isLoadingAssignments}
          loader={<SkeletonRows count={2} variant="inline" />}
          minHeight="60px"
        >
          <ConditionalRenderer when={!flags.hasAssignments}>
            <ConditionalRenderer
              when={true}
              wrapper={centeredBox({
                border: `1px dashed ${token.colorBorder}`,
                borderRadius: token.borderRadius,
                background: token.colorBgContainer,
                marginBottom: 16,
                padding: "12px 14px",
              })}
            >
              <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                No roles assigned yet.
              </Typography.Text>
            </ConditionalRenderer>
          </ConditionalRenderer>

          <ConditionalRenderer when={flags.hasAssignments}>
            <div style={{ marginBottom: 16 }}>
              {state.assignments.map((assignment) => (
                <AssignmentRow
                  key={`${assignment.roleId}-${assignment.scopeReferenceId ?? "global"}`}
                  assignment={assignment}
                  isRevoking={state.isRevoking}
                  onRevoke={actions.handleRevokeRole}
                />
              ))}
            </div>
          </ConditionalRenderer>
        </DataLoader>

        {/* Add role section */}
        <Typography.Text
          strong
          style={{ display: "block", marginBottom: 10, fontSize: token.fontSize }}
        >
          Add Role
        </Typography.Text>

        <Flex vertical gap={10}>
          {/* Role select */}
          <Select
            showSearch
            allowClear
            placeholder="Select a role"
            loading={state.isLoadingRoles}
            value={state.selectedRoleId}
            options={state.roleOptions}
            filterOption={(input, opt) =>
              String(opt?.label ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            onChange={(val) => actions.handleRoleSelect(val ?? null)}
            style={{ width: "100%" }}
          />

          {/* Scope reference select — shown only for non-GLOBAL roles */}
          <ConditionalRenderer when={state.needsScopeRef}>
            <Select
              showSearch
              allowClear
              placeholder={`Select ${(state.selectedRoleScope ?? "scope").toLowerCase()}`}
              loading={state.isScopeRefLoading}
              value={state.selectedScopeRefId}
              options={state.scopeRefOptions}
              filterOption={(input, opt) =>
                String(opt?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              onChange={(val) => actions.handleScopeRefSelect(val ?? null)}
              style={{ width: "100%" }}
            />
          </ConditionalRenderer>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            loading={state.isAssigning}
            disabled={!flags.canAdd}
            onClick={() => void actions.handleAddRole()}
            style={{ alignSelf: "flex-end" }}
          >
            Add Role
          </Button>
        </Flex>
      </div>
    </Modal>
  );
}
