import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Avatar, Descriptions, Drawer, Flex, Tag, Typography } from "antd";
import dayjs from "dayjs";
import type { useUserDrawer } from "../hooks/useUserDrawer";
import { resolveUserDisplayName, resolveUserInitials } from "../types/user-management";

type UserDrawerController = ReturnType<typeof useUserDrawer>;

type UserDrawerProps = {
  open: boolean;
  onClose: () => void;
  controller: UserDrawerController;
};

function displayValue(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed || "—";
}

export function UserDrawer({ open, onClose, controller }: UserDrawerProps) {
  const token = useToken();
  const { state, actions } = controller;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="right"
      width={480}
      destroyOnHidden={false}
      title="User Detail"
    >
      <ErrorAlert
        variant="section"
        error={state.sectionError}
        onRetry={actions.refetch}
      />

      <DataLoader loading={state.isLoading} minHeight="200px">
        <ConditionalRenderer when={state.user !== null}>
          <Flex
            vertical
            align="center"
            gap={8}
            style={{ marginBottom: 24 }}
          >
            <ConditionalRenderer when={!!state.user?.profilePictureUrl}>
              <Avatar
                size={64}
                src={state.user?.profilePictureUrl}
                alt={state.user ? resolveUserDisplayName(state.user) : "User"}
              />
            </ConditionalRenderer>

            <ConditionalRenderer when={!state.user?.profilePictureUrl}>
              <Avatar
                size={64}
                style={{
                  background: token.colorBgLayout,
                  color: token.colorTextSecondary,
                  fontSize: token.fontSizeLG,
                  fontWeight: 600,
                  border: `1px solid ${token.colorBorder}`,
                }}
              >
                {state.user ? resolveUserInitials(state.user) : "?"}
              </Avatar>
            </ConditionalRenderer>

            <Typography.Text strong style={{ fontSize: token.fontSize }}>
              {state.user ? resolveUserDisplayName(state.user) : "—"}
            </Typography.Text>
          </Flex>

          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Email">
              {displayValue(state.user?.email)}
            </Descriptions.Item>

            <Descriptions.Item label="First Name">
              {displayValue(state.user?.firstName)}
            </Descriptions.Item>

            <Descriptions.Item label="Last Name">
              {displayValue(state.user?.lastName)}
            </Descriptions.Item>

            <Descriptions.Item label="Phone">
              {displayValue(state.user?.phoneNumber)}
            </Descriptions.Item>

            <Descriptions.Item label="Date of Birth">
              {state.user?.dateOfBirth
                ? dayjs(state.user.dateOfBirth).format("MMM D, YYYY")
                : "—"}
            </Descriptions.Item>

            <Descriptions.Item label="Tenant Roles">
              <Flex gap={4} wrap="wrap">
                {(state.user?.userRoles ?? []).length === 0 ? (
                  <Typography.Text type="secondary">No roles assigned</Typography.Text>
                ) : (
                  (state.user?.userRoles ?? []).map((ur, i) => (
                    <Tag key={`${ur.roleId}-${i}`} style={{ margin: 0 }}>
                      {ur.roleName}
                    </Tag>
                  ))
                )}
              </Flex>
            </Descriptions.Item>

            <Descriptions.Item label="Platform Roles">
              <Flex gap={4} wrap="wrap">
                {(state.user?.roles ?? []).map((role) => (
                  <Tag key={role} style={{ margin: 0 }}>
                    {role}
                  </Tag>
                ))}
              </Flex>
            </Descriptions.Item>

            <Descriptions.Item label="Profile ID">
              {state.user?.profileId ?? "—"}
            </Descriptions.Item>
          </Descriptions>
        </ConditionalRenderer>
      </DataLoader>
    </Drawer>
  );
}
