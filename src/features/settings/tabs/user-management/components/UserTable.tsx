import { useToken } from "@/shared/hooks/useToken";
import {
  EditOutlined,
  KeyOutlined,
  MoreOutlined,
  SwapOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Dropdown,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { useUserManagementTab } from "../hooks/useUserManagementTab";
import type { TenantUser } from "../types/user-management";
import { resolveUserDisplayName, resolveUserInitials } from "../types/user-management";

type TabController = ReturnType<typeof useUserManagementTab>;

type UserTableProps = {
  users: TenantUser[];
  totalItems: number;
  page: number;
  isLoading: boolean;
  actions: TabController["actions"];
};

const PAGE_SIZE = 30;

export function UserTable({
  users,
  totalItems,
  page,
  isLoading,
  actions,
}: UserTableProps) {
  const token = useToken();

  const columns: ColumnsType<TenantUser> = [
    {
      key: "avatar",
      width: 48,
      render: (_, user) =>
        user.profilePictureUrl ? (
          <Avatar src={user.profilePictureUrl} size={36} />
        ) : (
          <Avatar
            size={36}
            style={{
              background: token.colorBgLayout,
              color: token.colorTextSecondary,
              border: `1px solid ${token.colorBorder}`,
              fontWeight: 600,
              fontSize: `${token.fontSizeSM}px`
            }}
          >
            {resolveUserInitials(user)}
          </Avatar>
        ),
    },
    {
      title: "Name",
      key: "name",
      render: (_, user) => {
        const name = resolveUserDisplayName(user);
        const hasName = !!(user.firstName?.trim() || user.lastName?.trim());
        return (
          <div>
            <Typography.Text strong style={{ display: "block" }}>
              {hasName ? name : <Typography.Text type="secondary">—</Typography.Text>}
            </Typography.Text>
            <Typography.Text
              type="secondary"
              style={{ fontSize: token.fontSizeSM }}
            >
              {user.email}
            </Typography.Text>
          </div>
        );
      },
    },
    {
      title: "Phone",
      key: "phone",
      dataIndex: "phoneNumber",
      render: (phone: string | null) => (
        <Typography.Text type={phone ? undefined : "secondary"}>
          {phone || "—"}
        </Typography.Text>
      ),
    },
    {
      title: "Roles",
      key: "roles",
      render: (_, user) =>
        user.userRoles.length === 0 ? (
          <Typography.Text type="secondary">—</Typography.Text>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {user.userRoles.map((ur, i) => (
              <Tag
                key={`${ur.roleId}-${i}`}
                style={{ margin: 0, fontSize: token.fontSizeSM }}
              >
                {ur.roleName}
              </Tag>
            ))}
          </div>
        ),
    },
    {
      key: "actions",
      width: 48,
      align: "right",
      render: (_, user) => (
        <Dropdown
          trigger={["click"]}
          placement="bottomRight"
          menu={{
            items: [
              {
                key: "view",
                label: "View",
                icon: <UserOutlined />,
                onClick: () => actions.handleOpenDrawer(user),
              },
              {
                key: "edit",
                label: "Edit Profile",
                icon: <EditOutlined />,
                onClick: () => actions.handleOpenEdit(user),
              },
              {
                key: "change-role",
                label: "Manage Roles",
                icon: <SwapOutlined />,
                onClick: () => actions.handleOpenRoleModal(user),
              },
              { type: "divider" },
              {
                key: "resend",
                label: "Resend Password Reset",
                icon: <KeyOutlined />,
                onClick: () => actions.handleOpenResend(user),
              },
            ],
          }}
        >
          <Tooltip title="Actions">
            <Button
              type="text"
              size="small"
              icon={
                <MoreOutlined
                  style={{ fontSize: 16, color: token.colorTextTertiary }}
                />
              }
              onClick={(e) => e.stopPropagation()}
            />
          </Tooltip>
        </Dropdown>
      ),
    },
  ];

  return (
    <Table<TenantUser>
      rowKey="id"
      columns={columns}
      dataSource={users}
      loading={isLoading}
      scroll={{ x: 680 }}
      pagination={{
        current: page,
        pageSize: PAGE_SIZE,
        total: totalItems,
        showSizeChanger: false,
        showTotal: (total) => `${total} users`,
        onChange: actions.handlePageChange,
      }}
      size="middle"
    />
  );
}
